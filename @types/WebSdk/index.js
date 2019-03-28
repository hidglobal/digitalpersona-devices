/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
;(function () {

    var async = {};
    function noop() {}
    function identity(v) {
        return v;
    }
    function toBool(v) {
        return !!v;
    }
    function notId(v) {
        return !v;
    }

    // global on the server, window in the browser
    var previous_async;

    // Establish the root object, `window` (`self`) in the browser, `global`
    // on the server, or `this` in some virtual machines. We use `self`
    // instead of `window` for `WebWorker` support.
    var root = typeof self === 'object' && self.self === self && self ||
            typeof global === 'object' && global.global === global && global ||
            this;

    if (root != null) {
        previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        return function() {
            if (fn === null) throw new Error("Callback was already called.");
            fn.apply(this, arguments);
            fn = null;
        };
    }

    function _once(fn) {
        return function() {
            if (fn === null) return;
            fn.apply(this, arguments);
            fn = null;
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    // Ported from underscore.js isObject
    var _isObject = function(obj) {
        var type = typeof obj;
        return type === 'function' || type === 'object' && !!obj;
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _arrayEach(arr, iterator) {
        var index = -1,
            length = arr.length;

        while (++index < length) {
            iterator(arr[index], index, arr);
        }
    }

    function _map(arr, iterator) {
        var index = -1,
            length = arr.length,
            result = Array(length);

        while (++index < length) {
            result[index] = iterator(arr[index], index, arr);
        }
        return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    function _indexOf(arr, item) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === item) return i;
        }
        return -1;
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    // Similar to ES6's rest param (http://ariya.ofilabs.com/2013/03/es6-and-rest-parameter.html)
    // This accumulates the arguments passed into an array, after a given index.
    // From underscore.js (https://github.com/jashkenas/underscore/pull/2140).
    function _restParam(func, startIndex) {
        startIndex = startIndex == null ? func.length - 1 : +startIndex;
        return function() {
            var length = Math.max(arguments.length - startIndex, 0);
            var rest = Array(length);
            for (var index = 0; index < length; index++) {
                rest[index] = arguments[index + startIndex];
            }
            switch (startIndex) {
                case 0: return func.call(this, rest);
                case 1: return func.call(this, arguments[0], rest);
            }
            // Currently unused but handle cases outside of the switch statement:
            // var args = Array(startIndex + 1);
            // for (index = 0; index < startIndex; index++) {
            //     args[index] = arguments[index];
            // }
            // args[startIndex] = rest;
            // return func.apply(this, args);
        };
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate = typeof setImmediate === 'function' && setImmediate;

    var _delay = _setImmediate ? function(fn) {
        // not a direct alias for IE10 compatibility
        _setImmediate(fn);
    } : function(fn) {
        setTimeout(function() {
            fn();
        }, 0);
    };

    if (typeof process === 'object' && typeof process.nextTick === 'function') {
        async.nextTick = process.nextTick;
    } else {
        async.nextTick = _delay;
    }
    async.setImmediate = _setImmediate ? _delay : async.nextTick;


    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];

        var iter = _keyIterator(object);
        var key, completed = 0;

        while ((key = iter()) != null) {
            completed += 1;
            iterator(object[key], key, only_once(done));
        }

        if (completed === 0) callback(null);

        function done(err) {
            completed--;
            if (err) {
                callback(err);
            }
            // Check key is null in case iterator isn't exhausted
            // and done resolved synchronously.
            else if (key === null && completed <= 0) {
                callback(null);
            }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        var key = nextKey();
        function iterate() {
            var sync = true;
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, only_once(function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    key = nextKey();
                    if (key === null) {
                        return callback(null);
                    } else {
                        if (sync) {
                            async.setImmediate(iterate);
                        } else {
                            iterate();
                        }
                    }
                }
            }));
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, only_once(function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    }));
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(fn) {
        return function (obj, limit, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        arr = arr || [];
        var results = _isArrayLike(arr) ? [] : {};
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = doParallelLimit(_asyncMap);

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, identity).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    async.transform = function (arr, memo, iterator, callback) {
        if (arguments.length === 3) {
            callback = iterator;
            iterator = memo;
            memo = _isArray(arr) ? [] : {};
        }

        async.eachOf(arr, function(v, k, cb) {
            iterator(memo, v, k, cb);
        }, function(err) {
            callback(err, memo);
        });
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (v) {
                if (v) {
                    results.push({index: index, value: x});
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectLimit =
    async.filterLimit = doParallelLimit(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        _filter(eachfn, arr, function(value, cb) {
            iterator(value, function(v) {
                cb(!v);
            });
        }, callback);
    }
    async.reject = doParallel(_reject);
    async.rejectLimit = doParallelLimit(_reject);
    async.rejectSeries = doSeries(_reject);

    function _createTester(eachfn, check, getResult) {
        return function(arr, limit, iterator, cb) {
            function done() {
                if (cb) cb(getResult(false, void 0));
            }
            function iteratee(x, _, callback) {
                if (!cb) return callback();
                iterator(x, function (v) {
                    if (cb && check(v)) {
                        cb(getResult(true, x));
                        cb = iterator = false;
                    }
                    callback();
                });
            }
            if (arguments.length > 3) {
                eachfn(arr, limit, iteratee, done);
            } else {
                cb = iterator;
                iterator = limit;
                eachfn(arr, iteratee, done);
            }
        };
    }

    async.any =
    async.some = _createTester(async.eachOf, toBool, identity);

    async.someLimit = _createTester(async.eachOfLimit, toBool, identity);

    async.all =
    async.every = _createTester(async.eachOf, notId, notId);

    async.everyLimit = _createTester(async.eachOfLimit, notId, notId);

    function _findGetResult(v, x) {
        return x;
    }
    async.detect = _createTester(async.eachOf, identity, _findGetResult);
    async.detectSeries = _createTester(async.eachOfSeries, identity, _findGetResult);
    async.detectLimit = _createTester(async.eachOfLimit, identity, _findGetResult);

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, concurrency, callback) {
        if (!callback) {
            // concurrency is optional, shift the args.
            callback = concurrency;
            concurrency = null;
        }
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }
        if (!concurrency) {
            concurrency = remainingTasks;
        }

        var results = {};
        var runningTasks = 0;

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            var idx = _indexOf(listeners, fn);
            if (idx >= 0) listeners.splice(idx, 1);
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = _restParam(function(err, args) {
                runningTasks--;
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _forEachOf(results, function(val, rkey) {
                        safeResults[rkey] = val;
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            });
            var requires = task.slice(0, task.length - 1);
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && _indexOf(dep, k) >= 0) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return runningTasks < concurrency && _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                runningTasks++;
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    runningTasks++;
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };



    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var DEFAULT_INTERVAL = 0;

        var attempts = [];

        var opts = {
            times: DEFAULT_TIMES,
            interval: DEFAULT_INTERVAL
        };

        function parseTimes(acc, t){
            if(typeof t === 'number'){
                acc.times = parseInt(t, 10) || DEFAULT_TIMES;
            } else if(typeof t === 'object'){
                acc.times = parseInt(t.times, 10) || DEFAULT_TIMES;
                acc.interval = parseInt(t.interval, 10) || DEFAULT_INTERVAL;
            } else {
                throw new Error('Unsupported argument type for \'times\': ' + typeof t);
            }
        }

        var length = arguments.length;
        if (length < 1 || length > 3) {
            throw new Error('Invalid arguments - must be either (task), (task, callback), (times, task) or (times, task, callback)');
        } else if (length <= 2 && typeof times === 'function') {
            callback = task;
            task = times;
        }
        if (typeof times !== 'function') {
            parseTimes(opts, times);
        }
        opts.callback = callback;
        opts.task = task;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            function retryInterval(interval){
                return function(seriesCallback){
                    setTimeout(function(){
                        seriesCallback(null);
                    }, interval);
                };
            }

            while (opts.times) {

                var finalAttempt = !(opts.times-=1);
                attempts.push(retryAttempt(opts.task, finalAttempt));
                if(!finalAttempt && opts.interval > 0){
                    attempts.push(retryInterval(opts.interval));
                }
            }

            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || opts.callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return opts.callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
            var err = new Error('First argument to waterfall must be an array of functions');
            return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return _restParam(function (err, args) {
                if (err) {
                    callback.apply(null, [err].concat(args));
                }
                else {
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            });
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(_restParam(function (err, args) {
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            }));
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function(tasks, callback) {
        _parallel(async.eachOfSeries, tasks, callback);
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = _restParam(function (fn, args) {
        return _restParam(function (callArgs) {
            return fn.apply(
                null, args.concat(callArgs)
            );
        });
    });

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        callback = callback || noop;
        if (test()) {
            var next = _restParam(function(err, args) {
                if (err) {
                    callback(err);
                } else if (test.apply(this, args)) {
                    iterator(next);
                } else {
                    callback(null);
                }
            });
            iterator(next);
        } else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        var calls = 0;
        return async.whilst(function() {
            return ++calls <= 1 || test.apply(this, arguments);
        }, iterator, callback);
    };

    async.until = function (test, iterator, callback) {
        return async.whilst(function() {
            return !test.apply(this, arguments);
        }, iterator, callback);
    };

    async.doUntil = function (iterator, test, callback) {
        return async.doWhilst(iterator, function() {
            return !test.apply(this, arguments);
        }, callback);
    };

    async.during = function (test, iterator, callback) {
        callback = callback || noop;

        var next = _restParam(function(err, args) {
            if (err) {
                callback(err);
            } else {
                args.push(check);
                test.apply(this, args);
            }
        });

        var check = function(err, truth) {
            if (err) {
                callback(err);
            } else if (truth) {
                iterator(next);
            } else {
                callback(null);
            }
        };

        test(check);
    };

    async.doDuring = function (iterator, test, callback) {
        var calls = 0;
        async.during(function(next) {
            if (calls++ < 1) {
                next(null, true);
            } else {
                test.apply(this, arguments);
            }
        }, iterator, callback);
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                    q.tasks.unshift(item);
                } else {
                    q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;

                var removed = false;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    _arrayEach(workersList, function (worker, index) {
                        if (worker === task && !removed) {
                            workersList.splice(index, 1);
                            removed = true;
                        }
                    });

                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var workersList = [];
        var q = {
            tasks: [],
            concurrency: concurrency,
            payload: payload,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = q.payload ?
                            q.tasks.splice(0, q.payload) :
                            q.tasks.splice(0, q.tasks.length);

                        var data = _map(tasks, function (task) {
                            return task.data;
                        });

                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        workersList.push(tasks[0]);
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            workersList: function () {
                return workersList;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
            var beg = -1,
                end = sequence.length - 1;
            while (beg < end) {
                var mid = beg + ((end - beg + 1) >>> 1);
                if (compare(item, sequence[mid]) >= 0) {
                    beg = mid;
                } else {
                    end = mid - 1;
                }
            }
            return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return _restParam(function (fn, args) {
            fn.apply(null, args.concat([_restParam(function (err, args) {
                if (typeof console === 'object') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            })]));
        });
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || identity;
        var memoized = _restParam(function memoized(args) {
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.setImmediate(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([_restParam(function (args) {
                    memo[key] = args;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                        q[i].apply(null, args);
                    }
                })]));
            }
        });
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
        return function () {
            return (fn.unmemoized || fn).apply(null, arguments);
        };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return _restParam(function (args) {
            var that = this;

            var callback = args[args.length - 1];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([_restParam(function (err, nextargs) {
                    cb(err, nextargs);
                })]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        });
    };

    async.compose = function (/* functions... */) {
        return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn) {
        return _restParam(function(fns, args) {
            var go = _restParam(function(args) {
                var that = this;
                var callback = args.pop();
                return eachfn(fns, function (fn, _, cb) {
                    fn.apply(that, args.concat([cb]));
                },
                callback);
            });
            if (args.length) {
                return go.apply(this, args);
            }
            else {
                return go;
            }
        });
    }

    async.applyEach = _applyEach(async.eachOf);
    async.applyEachSeries = _applyEach(async.eachOfSeries);


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return _restParam(function (args) {
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        });
    }

    async.ensureAsync = ensureAsync;

    async.constant = _restParam(function(values) {
        var args = [null].concat(values);
        return function (callback) {
            return callback.apply(this, args);
        };
    });

    async.wrapSync =
    async.asyncify = function asyncify(func) {
        return _restParam(function (args) {
            var callback = args.pop();
            var result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            // if result is Promise object
            if (_isObject(result) && typeof result.then === "function") {
                result.then(function(value) {
                    callback(null, value);
                })["catch"](function(err) {
                    callback(err.message ? err : new Error(err));
                });
            } else {
                callback(null, result);
            }
        });
    };

    // Node.js
    if (typeof module === 'object' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define === 'function' && define.amd) {
        define('async', function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('sha1',[], factory);
    } else {
        window.sha1 = factory();
    }
})(function () {

    /* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
     * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
     * in FIPS PUB 180-1
     * Copyright (C) Paul Johnston 2000.
     * See http://pajhome.org.uk/site/legal.html for details.
     *
     * Modified by Tom Wu (tjw@cs.stanford.edu) for the
     * SRP JavaScript implementation.
     */
    var sha1 = function() {
        /*
        * Convert a 32-bit number to a hex string with ms-byte first
        */
        var hex_chr = "0123456789abcdef";

        function hex(num) {
            var str = "";
            for (var j = 7; j >= 0; j--)
                str += hex_chr.charAt((num >> (j * 4)) & 0x0F);
            return str;
        }

        /*
             * Convert a string to a sequence of 16-word blocks, stored as an array.
             * Append padding bits and the length, as described in the SHA1 standard.
             */
        function str2blks_SHA1(str) {
            var nblk = ((str.length + 8) >> 6) + 1;
            var blks = new Array(nblk * 16);
            for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
            for (i = 0; i < str.length; i++)
                blks[i >> 2] |= str.charCodeAt(i) << (24 - (i % 4) * 8);
            blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
            blks[nblk * 16 - 1] = str.length * 8;
            return blks;
        }

        /*
             * Input is in hex format - trailing odd nibble gets a zero appended.
             */
        function hex2blks_SHA1(hex) {
            var len = (hex.length + 1) >> 1;
            var nblk = ((len + 8) >> 6) + 1;
            var blks = new Array(nblk * 16);
            for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
            for (i = 0; i < len; i++)
                blks[i >> 2] |= parseInt(hex.substr(2 * i, 2), 16) << (24 - (i % 4) * 8);
            blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
            blks[nblk * 16 - 1] = len * 8;
            return blks;
        }

        function ba2blks_SHA1(ba, off, len) {
            var nblk = ((len + 8) >> 6) + 1;
            var blks = new Array(nblk * 16);
            for (var i = 0; i < nblk * 16; i++) blks[i] = 0;
            for (i = 0; i < len; i++)
                blks[i >> 2] |= (ba[off + i] & 0xFF) << (24 - (i % 4) * 8);
            blks[i >> 2] |= 0x80 << (24 - (i % 4) * 8);
            blks[nblk * 16 - 1] = len * 8;
            return blks;
        }

        /*
             * Add integers, wrapping at 2^32. This uses 16-bit operations internally 
             * to work around bugs in some JS interpreters.
             */
        function add(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF);
            var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }

        /*
             * Bitwise rotate a 32-bit number to the left
             */
        function rol(num, cnt) {
            return (num << cnt) | (num >>> (32 - cnt));
        }

        /*
             * Perform the appropriate triplet combination function for the current
             * iteration
             */
        function ft(t, b, c, d) {
            if (t < 20) return (b & c) | ((~b) & d);
            if (t < 40) return b ^ c ^ d;
            if (t < 60) return (b & c) | (b & d) | (c & d);
            return b ^ c ^ d;
        }

        /*
             * Determine the appropriate additive constant for the current iteration
             */
        function kt(t) {
            return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 :
            (t < 60) ? -1894007588 : -899497514;
        }

        /*
             * Take a string and return the hex representation of its SHA-1.
             */
        function calcSHA1(str) {
            return calcSHA1Blks(str2blks_SHA1(str));
        }

        function calcSHA1Hex(str) {
            return calcSHA1Blks(hex2blks_SHA1(str));
        }

        function calcSHA1BA(ba) {
            return calcSHA1Blks(ba2blks_SHA1(ba, 0, ba.length));
        }

        function calcSHA1BAEx(ba, off, len) {
            return calcSHA1Blks(ba2blks_SHA1(ba, off, len));
        }

        function calcSHA1Blks(x) {
            var s = calcSHA1Raw(x);
            return hex(s[0]) + hex(s[1]) + hex(s[2]) + hex(s[3]) + hex(s[4]);
        }

        function calcSHA1Raw(x) {
            var w = new Array(80);

            var a = 1732584193;
            var b = -271733879;
            var c = -1732584194;
            var d = 271733878;
            var e = -1009589776;

            for (var i = 0; i < x.length; i += 16) {
                var olda = a;
                var oldb = b;
                var oldc = c;
                var oldd = d;
                var olde = e;

                for (var j = 0; j < 80; j++) {
                    var t;
                    if (j < 16) w[j] = x[i + j];
                    else w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
                    t = add(add(rol(a, 5), ft(j, b, c, d)), add(add(e, w[j]), kt(j)));
                    e = d;
                    d = c;
                    c = rol(b, 30);
                    b = a;
                    a = t;
                }

                a = add(a, olda);
                b = add(b, oldb);
                c = add(c, oldc);
                d = add(d, oldd);
                e = add(e, olde);
            }
            return new Array(a, b, c, d, e);
        }

        function core_sha1(x, len) {
            x[len >> 5] |= 0x80 << (24 - len % 32);
            x[((len + 64 >> 9) << 4) + 15] = len;
            return calcSHA1Raw(x);
        }

        return {
            calcSHA1: calcSHA1,
            calcSHA1Hex: calcSHA1Hex,
            calcSHA1BA: calcSHA1BA,
            calcSHA1BAEx: calcSHA1BAEx
        }
    }

    return sha1();
});


;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('sjcl', [], factory);
    } else {
        window.sjcl = factory();
    }
})(function () {

    // SJCL configured with:
    // --without-all --with-sha256 --with-aes --with-random --with-bitArray --with-codecHex --with-codecBase64 --compress=none

    /** @fileOverview Javascript cryptography implementation.
     *
     * Crush to remove comments, shorten variable names and
     * generally reduce transmission size.
     *
     * @author Emily Stark
     * @author Mike Hamburg
     * @author Dan Boneh
     */

    "use strict";
    /*jslint indent: 2, bitwise: false, nomen: false, plusplus: false, white: false, regexp: false */
    /*global document, window, escape, unescape, module, require, Uint32Array */

    /** @namespace The Stanford Javascript Crypto Library, top-level namespace. */
    var sjcl = {
        /** @namespace Symmetric ciphers. */
        cipher: {},

        /** @namespace Hash functions.  Right now only SHA256 is implemented. */
        hash: {},

        /** @namespace Key exchange functions.  Right now only SRP is implemented. */
        keyexchange: {},

        /** @namespace Block cipher modes of operation. */
        mode: {},

        /** @namespace Miscellaneous.  HMAC and PBKDF2. */
        misc: {},

        /**
         * @namespace Bit array encoders and decoders.
         *
         * @description
         * The members of this namespace are functions which translate between
         * SJCL's bitArrays and other objects (usually strings).  Because it
         * isn't always clear which direction is encoding and which is decoding,
         * the method names are "fromBits" and "toBits".
         */
        codec: {},

        /** @namespace Exceptions. */
        exception: {
            /** @constructor Ciphertext is corrupt. */
            corrupt: function (message) {
                this.toString = function () { return "CORRUPT: " + this.message; };
                this.message = message;
            },

            /** @constructor Invalid parameter. */
            invalid: function (message) {
                this.toString = function () { return "INVALID: " + this.message; };
                this.message = message;
            },

            /** @constructor Bug or missing feature in SJCL. @constructor */
            bug: function (message) {
                this.toString = function () { return "BUG: " + this.message; };
                this.message = message;
            },

            /** @constructor Something isn't ready. */
            notReady: function (message) {
                this.toString = function () { return "NOT READY: " + this.message; };
                this.message = message;
            }
        }
    };

    /** @fileOverview Arrays of bits, encoded as arrays of Numbers.
  *
  * @author Emily Stark
  * @author Mike Hamburg
  * @author Dan Boneh
  */

    /** @namespace Arrays of bits, encoded as arrays of Numbers.
     *
     * @description
     * <p>
     * These objects are the currency accepted by SJCL's crypto functions.
     * </p>
     *
     * <p>
     * Most of our crypto primitives operate on arrays of 4-byte words internally,
     * but many of them can take arguments that are not a multiple of 4 bytes.
     * This library encodes arrays of bits (whose size need not be a multiple of 8
     * bits) as arrays of 32-bit words.  The bits are packed, big-endian, into an
     * array of words, 32 bits at a time.  Since the words are double-precision
     * floating point numbers, they fit some extra data.  We use this (in a private,
     * possibly-changing manner) to encode the number of bits actually  present
     * in the last word of the array.
     * </p>
     *
     * <p>
     * Because bitwise ops clear this out-of-band data, these arrays can be passed
     * to ciphers like AES which want arrays of words.
     * </p>
     */
    sjcl.bitArray = {
        /**
         * Array slices in units of bits.
         * @param {bitArray} a The array to slice.
         * @param {Number} bstart The offset to the start of the slice, in bits.
         * @param {Number} bend The offset to the end of the slice, in bits.  If this is undefined,
         * slice until the end of the array.
         * @return {bitArray} The requested slice.
         */
        bitSlice: function (a, bstart, bend) {
            a = sjcl.bitArray._shiftRight(a.slice(bstart / 32), 32 - (bstart & 31)).slice(1);
            return (bend === undefined) ? a : sjcl.bitArray.clamp(a, bend - bstart);
        },

        /**
         * Extract a number packed into a bit array.
         * @param {bitArray} a The array to slice.
         * @param {Number} bstart The offset to the start of the slice, in bits.
         * @param {Number} length The length of the number to extract.
         * @return {Number} The requested slice.
         */
        extract: function (a, bstart, blength) {
            // FIXME: this Math.floor is not necessary at all, but for some reason
            // seems to suppress a bug in the Chromium JIT.
            var x, sh = Math.floor((-bstart - blength) & 31);
            if ((bstart + blength - 1 ^ bstart) & -32) {
                // it crosses a boundary
                x = (a[bstart / 32 | 0] << (32 - sh)) ^ (a[bstart / 32 + 1 | 0] >>> sh);
            } else {
                // within a single word
                x = a[bstart / 32 | 0] >>> sh;
            }
            return x & ((1 << blength) - 1);
        },

        /**
         * Concatenate two bit arrays.
         * @param {bitArray} a1 The first array.
         * @param {bitArray} a2 The second array.
         * @return {bitArray} The concatenation of a1 and a2.
         */
        concat: function (a1, a2) {
            if (a1.length === 0 || a2.length === 0) {
                return a1.concat(a2);
            }

            var last = a1[a1.length - 1], shift = sjcl.bitArray.getPartial(last);
            if (shift === 32) {
                return a1.concat(a2);
            } else {
                return sjcl.bitArray._shiftRight(a2, shift, last | 0, a1.slice(0, a1.length - 1));
            }
        },

        /**
         * Find the length of an array of bits.
         * @param {bitArray} a The array.
         * @return {Number} The length of a, in bits.
         */
        bitLength: function (a) {
            var l = a.length, x;
            if (l === 0) { return 0; }
            x = a[l - 1];
            return (l - 1) * 32 + sjcl.bitArray.getPartial(x);
        },

        /**
         * Truncate an array.
         * @param {bitArray} a The array.
         * @param {Number} len The length to truncate to, in bits.
         * @return {bitArray} A new array, truncated to len bits.
         */
        clamp: function (a, len) {
            if (a.length * 32 < len) { return a; }
            a = a.slice(0, Math.ceil(len / 32));
            var l = a.length;
            len = len & 31;
            if (l > 0 && len) {
                a[l - 1] = sjcl.bitArray.partial(len, a[l - 1] & 0x80000000 >> (len - 1), 1);
            }
            return a;
        },

        /**
         * Make a partial word for a bit array.
         * @param {Number} len The number of bits in the word.
         * @param {Number} x The bits.
         * @param {Number} [0] _end Pass 1 if x has already been shifted to the high side.
         * @return {Number} The partial word.
         */
        partial: function (len, x, _end) {
            if (len === 32) { return x; }
            return (_end ? x | 0 : x << (32 - len)) + len * 0x10000000000;
        },

        /**
         * Get the number of bits used by a partial word.
         * @param {Number} x The partial word.
         * @return {Number} The number of bits used by the partial word.
         */
        getPartial: function (x) {
            return Math.round(x / 0x10000000000) || 32;
        },

        /**
         * Compare two arrays for equality in a predictable amount of time.
         * @param {bitArray} a The first array.
         * @param {bitArray} b The second array.
         * @return {boolean} true if a == b; false otherwise.
         */
        equal: function (a, b) {
            if (sjcl.bitArray.bitLength(a) !== sjcl.bitArray.bitLength(b)) {
                return false;
            }
            var x = 0, i;
            for (i = 0; i < a.length; i++) {
                x |= a[i] ^ b[i];
            }
            return (x === 0);
        },

        /** Shift an array right.
         * @param {bitArray} a The array to shift.
         * @param {Number} shift The number of bits to shift.
         * @param {Number} [carry=0] A byte to carry in
         * @param {bitArray} [out=[]] An array to prepend to the output.
         * @private
         */
        _shiftRight: function (a, shift, carry, out) {
            var i, last2 = 0, shift2;
            if (out === undefined) { out = []; }

            for (; shift >= 32; shift -= 32) {
                out.push(carry);
                carry = 0;
            }
            if (shift === 0) {
                return out.concat(a);
            }

            for (i = 0; i < a.length; i++) {
                out.push(carry | a[i] >>> shift);
                carry = a[i] << (32 - shift);
            }
            last2 = a.length ? a[a.length - 1] : 0;
            shift2 = sjcl.bitArray.getPartial(last2);
            out.push(sjcl.bitArray.partial(shift + shift2 & 31, (shift + shift2 > 32) ? carry : out.pop(), 1));
            return out;
        },

        /** xor a block of 4 words together.
         * @private
         */
        _xor4: function (x, y) {
            return [x[0] ^ y[0], x[1] ^ y[1], x[2] ^ y[2], x[3] ^ y[3]];
        },

        /** byteswap a word array inplace.
         * (does not handle partial words)
         * @param {sjcl.bitArray} a word array
         * @return {sjcl.bitArray} byteswapped array
         */
        byteswapM: function (a) {
            var i, v, m = 0xff00;
            for (i = 0; i < a.length; ++i) {
                v = a[i];
                a[i] = (v >>> 24) | ((v >>> 8) & m) | ((v & m) << 8) | (v << 24);
            }
            return a;
        }
    };

    /** @fileOverview Javascript SHA-256 implementation.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * Special thanks to Aldo Cortesi for pointing out several bugs in
 * this code.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

    /**
     * Context for a SHA-256 operation in progress.
     * @constructor
     * @class Secure Hash Algorithm, 256 bits.
     */
    sjcl.hash.sha256 = function (hash) {
        if (!this._key[0]) { this._precompute(); }
        if (hash) {
            this._h = hash._h.slice(0);
            this._buffer = hash._buffer.slice(0);
            this._length = hash._length;
        } else {
            this.reset();
        }
    };

    /**
     * Hash a string or an array of words.
     * @static
     * @param {bitArray|String} data the data to hash.
     * @return {bitArray} The hash value, an array of 16 big-endian words.
     */
    sjcl.hash.sha256.hash = function (data) {
        return (new sjcl.hash.sha256()).update(data).finalize();
    };

    sjcl.hash.sha256.prototype = {
        /**
         * The hash's block size, in bits.
         * @constant
         */
        blockSize: 512,

        /**
         * Reset the hash state.
         * @return this
         */
        reset: function () {
            this._h = this._init.slice(0);
            this._buffer = [];
            this._length = 0;
            return this;
        },

        /**
         * Input several words to the hash.
         * @param {bitArray|String} data the data to hash.
         * @return this
         */
        update: function (data) {
            if (typeof data === "string") {
                data = sjcl.codec.utf8String.toBits(data);
            }
            var i, b = this._buffer = sjcl.bitArray.concat(this._buffer, data),
                ol = this._length,
                nl = this._length = ol + sjcl.bitArray.bitLength(data);
            for (i = 512 + ol & -512; i <= nl; i += 512) {
                this._block(b.splice(0, 16));
            }
            return this;
        },

        /**
         * Complete hashing and output the hash value.
         * @return {bitArray} The hash value, an array of 8 big-endian words.
         */
        finalize: function () {
            var i, b = this._buffer, h = this._h;

            // Round out and push the buffer
            b = sjcl.bitArray.concat(b, [sjcl.bitArray.partial(1, 1)]);

            // Round out the buffer to a multiple of 16 words, less the 2 length words.
            for (i = b.length + 2; i & 15; i++) {
                b.push(0);
            }

            // append the length
            b.push(Math.floor(this._length / 0x100000000));
            b.push(this._length | 0);

            while (b.length) {
                this._block(b.splice(0, 16));
            }

            this.reset();
            return h;
        },

        /**
         * The SHA-256 initialization vector, to be precomputed.
         * @private
         */
        _init: [],
        /*
        _init:[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],
        */

        /**
         * The SHA-256 hash key, to be precomputed.
         * @private
         */
        _key: [],
        /*
        _key:
          [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
           0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
           0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
           0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
           0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
           0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
           0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
           0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
        */


        /**
         * Function to precompute _init and _key.
         * @private
         */
        _precompute: function () {
            var i = 0, prime = 2, factor;

            function frac(x) { return (x - Math.floor(x)) * 0x100000000 | 0; }

            outer: for (; i < 64; prime++) {
                for (factor = 2; factor * factor <= prime; factor++) {
                    if (prime % factor === 0) {
                        // not a prime
                        continue outer;
                    }
                }

                if (i < 8) {
                    this._init[i] = frac(Math.pow(prime, 1 / 2));
                }
                this._key[i] = frac(Math.pow(prime, 1 / 3));
                i++;
            }
        },

        /**
         * Perform one cycle of SHA-256.
         * @param {bitArray} words one block of words.
         * @private
         */
        _block: function (words) {
            var i, tmp, a, b,
              w = words.slice(0),
              h = this._h,
              k = this._key,
              h0 = h[0], h1 = h[1], h2 = h[2], h3 = h[3],
              h4 = h[4], h5 = h[5], h6 = h[6], h7 = h[7];

            /* Rationale for placement of |0 :
             * If a value can overflow is original 32 bits by a factor of more than a few
             * million (2^23 ish), there is a possibility that it might overflow the
             * 53-bit mantissa and lose precision.
             *
             * To avoid this, we clamp back to 32 bits by |'ing with 0 on any value that
             * propagates around the loop, and on the hash state h[].  I don't believe
             * that the clamps on h4 and on h0 are strictly necessary, but it's close
             * (for h4 anyway), and better safe than sorry.
             *
             * The clamps on h[] are necessary for the output to be correct even in the
             * common case and for short inputs.
             */
            for (i = 0; i < 64; i++) {
                // load up the input word for this round
                if (i < 16) {
                    tmp = w[i];
                } else {
                    a = w[(i + 1) & 15];
                    b = w[(i + 14) & 15];
                    tmp = w[i & 15] = ((a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) +
                                     (b >>> 17 ^ b >>> 19 ^ b >>> 10 ^ b << 15 ^ b << 13) +
                                     w[i & 15] + w[(i + 9) & 15]) | 0;
                }

                tmp = (tmp + h7 + (h4 >>> 6 ^ h4 >>> 11 ^ h4 >>> 25 ^ h4 << 26 ^ h4 << 21 ^ h4 << 7) + (h6 ^ h4 & (h5 ^ h6)) + k[i]); // | 0;

                // shift register
                h7 = h6; h6 = h5; h5 = h4;
                h4 = h3 + tmp | 0;
                h3 = h2; h2 = h1; h1 = h0;

                h0 = (tmp + ((h1 & h2) ^ (h3 & (h1 ^ h2))) + (h1 >>> 2 ^ h1 >>> 13 ^ h1 >>> 22 ^ h1 << 30 ^ h1 << 19 ^ h1 << 10)) | 0;
            }

            h[0] = h[0] + h0 | 0;
            h[1] = h[1] + h1 | 0;
            h[2] = h[2] + h2 | 0;
            h[3] = h[3] + h3 | 0;
            h[4] = h[4] + h4 | 0;
            h[5] = h[5] + h5 | 0;
            h[6] = h[6] + h6 | 0;
            h[7] = h[7] + h7 | 0;
        }
    };

    /** @fileOverview Low-level AES implementation.
 *
 * This file contains a low-level implementation of AES, optimized for
 * size and for efficiency on several browsers.  It is based on
 * OpenSSL's aes_core.c, a public-domain implementation by Vincent
 * Rijmen, Antoon Bosselaers and Paulo Barreto.
 *
 * An older version of this implementation is available in the public
 * domain, but this one is (c) Emily Stark, Mike Hamburg, Dan Boneh,
 * Stanford University 2008-2010 and BSD-licensed for liability
 * reasons.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

    /**
     * Schedule out an AES key for both encryption and decryption.  This
     * is a low-level class.  Use a cipher mode to do bulk encryption.
     *
     * @constructor
     * @param {Array} key The key as an array of 4, 6 or 8 words.
     *
     * @class Advanced Encryption Standard (low-level interface)
     */
    sjcl.cipher.aes = function (key) {
        if (!this._tables[0][0][0]) {
            this._precompute();
        }

        var i, j, tmp,
          encKey, decKey,
          sbox = this._tables[0][4], decTable = this._tables[1],
          keyLen = key.length, rcon = 1;

        if (keyLen !== 4 && keyLen !== 6 && keyLen !== 8) {
            throw new sjcl.exception.invalid("invalid aes key size");
        }

        this._key = [encKey = key.slice(0), decKey = []];

        // schedule encryption keys
        for (i = keyLen; i < 4 * keyLen + 28; i++) {
            tmp = encKey[i - 1];

            // apply sbox
            if (i % keyLen === 0 || (keyLen === 8 && i % keyLen === 4)) {
                tmp = sbox[tmp >>> 24] << 24 ^ sbox[tmp >> 16 & 255] << 16 ^ sbox[tmp >> 8 & 255] << 8 ^ sbox[tmp & 255];

                // shift rows and add rcon
                if (i % keyLen === 0) {
                    tmp = tmp << 8 ^ tmp >>> 24 ^ rcon << 24;
                    rcon = rcon << 1 ^ (rcon >> 7) * 283;
                }
            }

            encKey[i] = encKey[i - keyLen] ^ tmp;
        }

        // schedule decryption keys
        for (j = 0; i; j++, i--) {
            tmp = encKey[j & 3 ? i : i - 4];
            if (i <= 4 || j < 4) {
                decKey[j] = tmp;
            } else {
                decKey[j] = decTable[0][sbox[tmp >>> 24]] ^
                            decTable[1][sbox[tmp >> 16 & 255]] ^
                            decTable[2][sbox[tmp >> 8 & 255]] ^
                            decTable[3][sbox[tmp & 255]];
            }
        }
    };

    sjcl.cipher.aes.prototype = {
        // public
        /* Something like this might appear here eventually
        name: "AES",
        blockSize: 4,
        keySizes: [4,6,8],
        */

        /**
         * Encrypt an array of 4 big-endian words.
         * @param {Array} data The plaintext.
         * @return {Array} The ciphertext.
         */
        encrypt: function (data) { return this._crypt(data, 0); },

        /**
         * Decrypt an array of 4 big-endian words.
         * @param {Array} data The ciphertext.
         * @return {Array} The plaintext.
         */
        decrypt: function (data) { return this._crypt(data, 1); },

        /**
         * The expanded S-box and inverse S-box tables.  These will be computed
         * on the client so that we don't have to send them down the wire.
         *
         * There are two tables, _tables[0] is for encryption and
         * _tables[1] is for decryption.
         *
         * The first 4 sub-tables are the expanded S-box with MixColumns.  The
         * last (_tables[01][4]) is the S-box itself.
         *
         * @private
         */
        _tables: [[[], [], [], [], []], [[], [], [], [], []]],

        /**
         * Expand the S-box tables.
         *
         * @private
         */
        _precompute: function () {
            var encTable = this._tables[0], decTable = this._tables[1],
                sbox = encTable[4], sboxInv = decTable[4],
                i, x, xInv, d = [], th = [], x2, x4, x8, s, tEnc, tDec;

            // Compute double and third tables
            for (i = 0; i < 256; i++) {
                th[(d[i] = i << 1 ^ (i >> 7) * 283) ^ i] = i;
            }

            for (x = xInv = 0; !sbox[x]; x ^= x2 || 1, xInv = th[xInv] || 1) {
                // Compute sbox
                s = xInv ^ xInv << 1 ^ xInv << 2 ^ xInv << 3 ^ xInv << 4;
                s = s >> 8 ^ s & 255 ^ 99;
                sbox[x] = s;
                sboxInv[s] = x;

                // Compute MixColumns
                x8 = d[x4 = d[x2 = d[x]]];
                tDec = x8 * 0x1010101 ^ x4 * 0x10001 ^ x2 * 0x101 ^ x * 0x1010100;
                tEnc = d[s] * 0x101 ^ s * 0x1010100;

                for (i = 0; i < 4; i++) {
                    encTable[i][x] = tEnc = tEnc << 24 ^ tEnc >>> 8;
                    decTable[i][s] = tDec = tDec << 24 ^ tDec >>> 8;
                }
            }

            // Compactify.  Considerable speedup on Firefox.
            for (i = 0; i < 5; i++) {
                encTable[i] = encTable[i].slice(0);
                decTable[i] = decTable[i].slice(0);
            }
        },

        /**
         * Encryption and decryption core.
         * @param {Array} input Four words to be encrypted or decrypted.
         * @param dir The direction, 0 for encrypt and 1 for decrypt.
         * @return {Array} The four encrypted or decrypted words.
         * @private
         */
        _crypt: function (input, dir) {
            if (input.length !== 4) {
                throw new sjcl.exception.invalid("invalid aes block size");
            }

            var key = this._key[dir],
                // state variables a,b,c,d are loaded with pre-whitened data
                a = input[0] ^ key[0],
                b = input[dir ? 3 : 1] ^ key[1],
                c = input[2] ^ key[2],
                d = input[dir ? 1 : 3] ^ key[3],
                a2, b2, c2,

                nInnerRounds = key.length / 4 - 2,
                i,
                kIndex = 4,
                out = [0, 0, 0, 0],
                table = this._tables[dir],

                // load up the tables
                t0 = table[0],
                t1 = table[1],
                t2 = table[2],
                t3 = table[3],
                sbox = table[4];

            // Inner rounds.  Cribbed from OpenSSL.
            for (i = 0; i < nInnerRounds; i++) {
                a2 = t0[a >>> 24] ^ t1[b >> 16 & 255] ^ t2[c >> 8 & 255] ^ t3[d & 255] ^ key[kIndex];
                b2 = t0[b >>> 24] ^ t1[c >> 16 & 255] ^ t2[d >> 8 & 255] ^ t3[a & 255] ^ key[kIndex + 1];
                c2 = t0[c >>> 24] ^ t1[d >> 16 & 255] ^ t2[a >> 8 & 255] ^ t3[b & 255] ^ key[kIndex + 2];
                d = t0[d >>> 24] ^ t1[a >> 16 & 255] ^ t2[b >> 8 & 255] ^ t3[c & 255] ^ key[kIndex + 3];
                kIndex += 4;
                a = a2; b = b2; c = c2;
            }

            // Last round.
            for (i = 0; i < 4; i++) {
                out[dir ? 3 & -i : i] =
                  sbox[a >>> 24] << 24 ^
                  sbox[b >> 16 & 255] << 16 ^
                  sbox[c >> 8 & 255] << 8 ^
                  sbox[d & 255] ^
                  key[kIndex++];
                a2 = a; a = b; b = c; c = d; d = a2;
            }

            return out;
        }
    };
    

    /** @fileOverview Random number generator.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 * @author Michael Brooks
 */

    /** @constructor
     * @class Random number generator
     * @description
     * <b>Use sjcl.random as a singleton for this class!</b>
     * <p>
     * This random number generator is a derivative of Ferguson and Schneier's
     * generator Fortuna.  It collects entropy from various events into several
     * pools, implemented by streaming SHA-256 instances.  It differs from
     * ordinary Fortuna in a few ways, though.
     * </p>
     *
     * <p>
     * Most importantly, it has an entropy estimator.  This is present because
     * there is a strong conflict here between making the generator available
     * as soon as possible, and making sure that it doesn't "run on empty".
     * In Fortuna, there is a saved state file, and the system is likely to have
     * time to warm up.
     * </p>
     *
     * <p>
     * Second, because users are unlikely to stay on the page for very long,
     * and to speed startup time, the number of pools increases logarithmically:
     * a new pool is created when the previous one is actually used for a reseed.
     * This gives the same asymptotic guarantees as Fortuna, but gives more
     * entropy to early reseeds.
     * </p>
     *
     * <p>
     * The entire mechanism here feels pretty klunky.  Furthermore, there are
     * several improvements that should be made, including support for
     * dedicated cryptographic functions that may be present in some browsers;
     * state files in local storage; cookies containing randomness; etc.  So
     * look for improvements in future versions.
     * </p>
     */
    sjcl.prng = function (defaultParanoia) {

        /* private */
        this._pools = [new sjcl.hash.sha256()];
        this._poolEntropy = [0];
        this._reseedCount = 0;
        this._robins = {};
        this._eventId = 0;

        this._collectorIds = {};
        this._collectorIdNext = 0;

        this._strength = 0;
        this._poolStrength = 0;
        this._nextReseed = 0;
        this._key = [0, 0, 0, 0, 0, 0, 0, 0];
        this._counter = [0, 0, 0, 0];
        this._cipher = undefined;
        this._defaultParanoia = defaultParanoia;

        /* event listener stuff */
        this._collectorsStarted = false;
        this._callbacks = { progress: {}, seeded: {} };
        this._callbackI = 0;

        /* constants */
        this._NOT_READY = 0;
        this._READY = 1;
        this._REQUIRES_RESEED = 2;

        this._MAX_WORDS_PER_BURST = 65536;
        this._PARANOIA_LEVELS = [0, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024];
        this._MILLISECONDS_PER_RESEED = 30000;
        this._BITS_PER_RESEED = 80;
    };

    sjcl.prng.prototype = {
        /** Generate several random words, and return them in an array.
         * A word consists of 32 bits (4 bytes)
         * @param {Number} nwords The number of words to generate.
         */
        randomWords: function (nwords, paranoia) {
            var out = [], i, readiness = this.isReady(paranoia), g;

            if (readiness === this._NOT_READY) {
                throw new sjcl.exception.notReady("generator isn't seeded");
            } else if (readiness & this._REQUIRES_RESEED) {
                this._reseedFromPools(!(readiness & this._READY));
            }

            for (i = 0; i < nwords; i += 4) {
                if ((i + 1) % this._MAX_WORDS_PER_BURST === 0) {
                    this._gate();
                }

                g = this._gen4words();
                out.push(g[0], g[1], g[2], g[3]);
            }
            this._gate();

            return out.slice(0, nwords);
        },

        setDefaultParanoia: function (paranoia, allowZeroParanoia) {
            if (paranoia === 0 && allowZeroParanoia !== "Setting paranoia=0 will ruin your security; use it only for testing") {
                throw "Setting paranoia=0 will ruin your security; use it only for testing";
            }

            this._defaultParanoia = paranoia;
        },

        /**
         * Add entropy to the pools.
         * @param data The entropic value.  Should be a 32-bit integer, array of 32-bit integers, or string
         * @param {Number} estimatedEntropy The estimated entropy of data, in bits
         * @param {String} source The source of the entropy, eg "mouse"
         */
        addEntropy: function (data, estimatedEntropy, source) {
            source = source || "user";

            var id,
              i, tmp,
              t = (new Date()).valueOf(),
              robin = this._robins[source],
              oldReady = this.isReady(), err = 0, objName;

            id = this._collectorIds[source];
            if (id === undefined) { id = this._collectorIds[source] = this._collectorIdNext++; }

            if (robin === undefined) { robin = this._robins[source] = 0; }
            this._robins[source] = (this._robins[source] + 1) % this._pools.length;

            switch (typeof (data)) {

                case "number":
                    if (estimatedEntropy === undefined) {
                        estimatedEntropy = 1;
                    }
                    this._pools[robin].update([id, this._eventId++, 1, estimatedEntropy, t, 1, data | 0]);
                    break;

                case "object":
                    objName = Object.prototype.toString.call(data);
                    if (objName === "[object Uint32Array]") {
                        tmp = [];
                        for (i = 0; i < data.length; i++) {
                            tmp.push(data[i]);
                        }
                        data = tmp;
                    } else {
                        if (objName !== "[object Array]") {
                            err = 1;
                        }
                        for (i = 0; i < data.length && !err; i++) {
                            if (typeof (data[i]) !== "number") {
                                err = 1;
                            }
                        }
                    }
                    if (!err) {
                        if (estimatedEntropy === undefined) {
                            /* horrible entropy estimator */
                            estimatedEntropy = 0;
                            for (i = 0; i < data.length; i++) {
                                tmp = data[i];
                                while (tmp > 0) {
                                    estimatedEntropy++;
                                    tmp = tmp >>> 1;
                                }
                            }
                        }
                        this._pools[robin].update([id, this._eventId++, 2, estimatedEntropy, t, data.length].concat(data));
                    }
                    break;

                case "string":
                    if (estimatedEntropy === undefined) {
                        /* English text has just over 1 bit per character of entropy.
                         * But this might be HTML or something, and have far less
                         * entropy than English...  Oh well, let's just say one bit.
                         */
                        estimatedEntropy = data.length;
                    }
                    this._pools[robin].update([id, this._eventId++, 3, estimatedEntropy, t, data.length]);
                    this._pools[robin].update(data);
                    break;

                default:
                    err = 1;
            }
            if (err) {
                throw new sjcl.exception.bug("random: addEntropy only supports number, array of numbers or string");
            }

            /* record the new strength */
            this._poolEntropy[robin] += estimatedEntropy;
            this._poolStrength += estimatedEntropy;

            /* fire off events */
            if (oldReady === this._NOT_READY) {
                if (this.isReady() !== this._NOT_READY) {
                    this._fireEvent("seeded", Math.max(this._strength, this._poolStrength));
                }
                this._fireEvent("progress", this.getProgress());
            }
        },

        /** Is the generator ready? */
        isReady: function (paranoia) {
            var entropyRequired = this._PARANOIA_LEVELS[(paranoia !== undefined) ? paranoia : this._defaultParanoia];

            if (this._strength && this._strength >= entropyRequired) {
                return (this._poolEntropy[0] > this._BITS_PER_RESEED && (new Date()).valueOf() > this._nextReseed) ?
                  this._REQUIRES_RESEED | this._READY :
                  this._READY;
            } else {
                return (this._poolStrength >= entropyRequired) ?
                  this._REQUIRES_RESEED | this._NOT_READY :
                  this._NOT_READY;
            }
        },

        /** Get the generator's progress toward readiness, as a fraction */
        getProgress: function (paranoia) {
            var entropyRequired = this._PARANOIA_LEVELS[paranoia ? paranoia : this._defaultParanoia];

            if (this._strength >= entropyRequired) {
                return 1.0;
            } else {
                return (this._poolStrength > entropyRequired) ?
                  1.0 :
                  this._poolStrength / entropyRequired;
            }
        },

        /** start the built-in entropy collectors */
        startCollectors: function () {
            if (this._collectorsStarted) { return; }

            this._eventListener = {
                loadTimeCollector: this._bind(this._loadTimeCollector),
                mouseCollector: this._bind(this._mouseCollector),
                keyboardCollector: this._bind(this._keyboardCollector),
                accelerometerCollector: this._bind(this._accelerometerCollector),
                touchCollector: this._bind(this._touchCollector)
            };

            if (window.addEventListener) {
                window.addEventListener("load", this._eventListener.loadTimeCollector, false);
                window.addEventListener("keypress", this._eventListener.keyboardCollector, false);
            } else if (document.attachEvent) {
                document.attachEvent("onload", this._eventListener.loadTimeCollector);
                document.attachEvent("keypress", this._eventListener.keyboardCollector);
            } else {
                throw new sjcl.exception.bug("can't attach event");
            }

            this._collectorsStarted = true;
        },

        /** stop the built-in entropy collectors */
        stopCollectors: function () {
            if (!this._collectorsStarted) { return; }

            if (window.removeEventListener) {
                window.removeEventListener("load", this._eventListener.loadTimeCollector, false);
                window.removeEventListener("keypress", this._eventListener.keyboardCollector, false);
            } else if (document.detachEvent) {
                document.detachEvent("onload", this._eventListener.loadTimeCollector);
                document.detachEvent("keypress", this._eventListener.keyboardCollector);
            }

            this._collectorsStarted = false;
        },

        /* use a cookie to store entropy.
        useCookie: function (all_cookies) {
            throw new sjcl.exception.bug("random: useCookie is unimplemented");
        },*/

        /** add an event listener for progress or seeded-ness. */
        addEventListener: function (name, callback) {
            this._callbacks[name][this._callbackI++] = callback;
        },

        /** remove an event listener for progress or seeded-ness */
        removeEventListener: function (name, cb) {
            var i, j, cbs = this._callbacks[name], jsTemp = [];

            /* I'm not sure if this is necessary; in C++, iterating over a
             * collection and modifying it at the same time is a no-no.
             */

            for (j in cbs) {
                if (cbs.hasOwnProperty(j) && cbs[j] === cb) {
                    jsTemp.push(j);
                }
            }

            for (i = 0; i < jsTemp.length; i++) {
                j = jsTemp[i];
                delete cbs[j];
            }
        },

        _bind: function (func) {
            var that = this;
            return function () {
                func.apply(that, arguments);
            };
        },

        /** Generate 4 random words, no reseed, no gate.
         * @private
         */
        _gen4words: function () {
            for (var i = 0; i < 4; i++) {
                this._counter[i] = this._counter[i] + 1 | 0;
                if (this._counter[i]) { break; }
            }
            return this._cipher.encrypt(this._counter);
        },

        /* Rekey the AES instance with itself after a request, or every _MAX_WORDS_PER_BURST words.
         * @private
         */
        _gate: function () {
            this._key = this._gen4words().concat(this._gen4words());
            this._cipher = new sjcl.cipher.aes(this._key);
        },

        /** Reseed the generator with the given words
         * @private
         */
        _reseed: function (seedWords) {
            this._key = sjcl.hash.sha256.hash(this._key.concat(seedWords));
            this._cipher = new sjcl.cipher.aes(this._key);
            for (var i = 0; i < 4; i++) {
                this._counter[i] = this._counter[i] + 1 | 0;
                if (this._counter[i]) { break; }
            }
        },

        /** reseed the data from the entropy pools
         * @param full If set, use all the entropy pools in the reseed.
         */
        _reseedFromPools: function (full) {
            var reseedData = [], strength = 0, i;

            this._nextReseed = reseedData[0] =
              (new Date()).valueOf() + this._MILLISECONDS_PER_RESEED;

            for (i = 0; i < 16; i++) {
                /* On some browsers, this is cryptographically random.  So we might
                 * as well toss it in the pot and stir...
                 */
                reseedData.push(Math.random() * 0x100000000 | 0);
            }

            for (i = 0; i < this._pools.length; i++) {
                reseedData = reseedData.concat(this._pools[i].finalize());
                strength += this._poolEntropy[i];
                this._poolEntropy[i] = 0;

                if (!full && (this._reseedCount & (1 << i))) { break; }
            }

            /* if we used the last pool, push a new one onto the stack */
            if (this._reseedCount >= 1 << this._pools.length) {
                this._pools.push(new sjcl.hash.sha256());
                this._poolEntropy.push(0);
            }

            /* how strong was this reseed? */
            this._poolStrength -= strength;
            if (strength > this._strength) {
                this._strength = strength;
            }

            this._reseedCount++;
            this._reseed(reseedData);
        },

        _keyboardCollector: function () {
            this._addCurrentTimeToEntropy(1);
        },

        _mouseCollector: function (ev) {
            var x, y;

            try {
                x = ev.x || ev.clientX || ev.offsetX || 0;
                y = ev.y || ev.clientY || ev.offsetY || 0;
            } catch (err) {
                // Event originated from a secure element. No mouse position available.
                x = 0;
                y = 0;
            }

            if (x != 0 && y != 0) {
                sjcl.random.addEntropy([x, y], 2, "mouse");
            }

            this._addCurrentTimeToEntropy(0);
        },

        _touchCollector: function (ev) {
            var touch = ev.touches[0] || ev.changedTouches[0];
            var x = touch.pageX || touch.clientX,
                y = touch.pageY || touch.clientY;

            sjcl.random.addEntropy([x, y], 1, "touch");

            this._addCurrentTimeToEntropy(0);
        },

        _loadTimeCollector: function () {
            this._addCurrentTimeToEntropy(2);
        },

        _addCurrentTimeToEntropy: function (estimatedEntropy) {
            if (typeof window !== 'undefined' && window.performance && typeof window.performance.now === "function") {
                //how much entropy do we want to add here?
                sjcl.random.addEntropy(window.performance.now(), estimatedEntropy, "loadtime");
            } else {
                sjcl.random.addEntropy((new Date()).valueOf(), estimatedEntropy, "loadtime");
            }
        },
        _accelerometerCollector: function (ev) {
            var ac = ev.accelerationIncludingGravity.x || ev.accelerationIncludingGravity.y || ev.accelerationIncludingGravity.z;
            if (window.orientation) {
                var or = window.orientation;
                if (typeof or === "number") {
                    sjcl.random.addEntropy(or, 1, "accelerometer");
                }
            }
            if (ac) {
                sjcl.random.addEntropy(ac, 2, "accelerometer");
            }
            this._addCurrentTimeToEntropy(0);
        },

        _fireEvent: function (name, arg) {
            var j, cbs = sjcl.random._callbacks[name], cbsTemp = [];
            /* TODO: there is a race condition between removing collectors and firing them */

            /* I'm not sure if this is necessary; in C++, iterating over a
             * collection and modifying it at the same time is a no-no.
             */

            for (j in cbs) {
                if (cbs.hasOwnProperty(j)) {
                    cbsTemp.push(cbs[j]);
                }
            }

            for (j = 0; j < cbsTemp.length; j++) {
                cbsTemp[j](arg);
            }
        }
    };

    /** an instance for the prng.
    * @see sjcl.prng
    */
    sjcl.random = new sjcl.prng(6);

    (function () {
        // function for getting nodejs crypto module. catches and ignores errors.
        function getCryptoModule() {
            try {
                return require('crypto');
            }
            catch (e) {
                return null;
            }
        }

        try {
            var buf, crypt, ab;

            // get cryptographically strong entropy depending on runtime environment
            if (typeof module !== 'undefined' && module.exports && (crypt = getCryptoModule()) && crypt.randomBytes) {
                buf = crypt.randomBytes(1024 / 8);
                buf = new Uint32Array(new Uint8Array(buf).buffer);
                sjcl.random.addEntropy(buf, 1024, "crypto.randomBytes");

            } else if (typeof window !== 'undefined' && typeof Uint32Array !== 'undefined') {
                ab = new Uint32Array(32);
                if (window.crypto && window.crypto.getRandomValues) {
                    window.crypto.getRandomValues(ab);
                } else if (window.msCrypto && window.msCrypto.getRandomValues) {
                    window.msCrypto.getRandomValues(ab);
                } else {
                    return;
                }

                // get cryptographically strong entropy in Webkit
                sjcl.random.addEntropy(ab, 1024, "crypto.getRandomValues");

            } else {
                // no getRandomValues :-(
            }
        } catch (e) {
            if (typeof window !== 'undefined' && window.console) {
                console.log("There was an error collecting entropy from the browser:");
                console.log(e);
                //we do not want the library to fail due to randomness not being maintained.
            }
        }
    }());

 

    /** @fileOverview Bit array codec implementations.
     *
     * @author Emily Stark
     * @author Mike Hamburg
     * @author Dan Boneh
     */

    /** @namespace Hexadecimal */
    sjcl.codec.hex = {
        /** Convert from a bitArray to a hex string. */
        fromBits: function (arr) {
            var out = "", i;
            for (i = 0; i < arr.length; i++) {
                out += ((arr[i] | 0) + 0xF00000000000).toString(16).substr(4);
            }
            return out.substr(0, sjcl.bitArray.bitLength(arr) / 4);//.replace(/(.{8})/g, "$1 ");
        },
        /** Convert from a hex string to a bitArray. */
        toBits: function (str) {
            var i, out = [], len;
            str = str.replace(/\s|0x/g, "");
            len = str.length;
            str = str + "00000000";
            for (i = 0; i < str.length; i += 8) {
                out.push(parseInt(str.substr(i, 8), 16) ^ 0);
            }
            return sjcl.bitArray.clamp(out, len * 4);
        }
    };

    /** @fileOverview Bit array codec implementations.
 *
 * @author Emily Stark
 * @author Mike Hamburg
 * @author Dan Boneh
 */

    /**
     * UTF-8 strings
     * @namespace
     */
    sjcl.codec.utf8String = {
        /** Convert from a bitArray to a UTF-8 string. */
        fromBits: function (arr) {
            var out = "", bl = sjcl.bitArray.bitLength(arr), i, tmp;
            for (i = 0; i < bl / 8; i++) {
                if ((i & 3) === 0) {
                    tmp = arr[i / 4];
                }
                out += String.fromCharCode(tmp >>> 24);
                tmp <<= 8;
            }
            return decodeURIComponent(escape(out));
        },

        /** Convert from a UTF-8 string to a bitArray. */
        toBits: function (str) {
            str = unescape(encodeURIComponent(str));
            var out = [], i, tmp = 0;
            for (i = 0; i < str.length; i++) {
                tmp = tmp << 8 | str.charCodeAt(i);
                if ((i & 3) === 3) {
                    out.push(tmp);
                    tmp = 0;
                }
            }
            if (i & 3) {
                out.push(sjcl.bitArray.partial(8 * (i & 3), tmp));
            }
            return out;
        }
    };

    /** @fileOverview Bit array codec implementations.
     *
     * @author Emily Stark
     * @author Mike Hamburg
     * @author Dan Boneh
     */

    /**
     * Base64 encoding/decoding 
     * @namespace
     */
    sjcl.codec.base64 = {
        /** The base64 alphabet.
         * @private
         */
        _chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",

        /** Convert from a bitArray to a base64 string. */
        fromBits: function (arr, _noEquals, _url) {
            var out = "", i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, bl = sjcl.bitArray.bitLength(arr);
            if (_url) {
                c = c.substr(0, 62) + '-_';
            }
            for (i = 0; out.length * 6 < bl;) {
                out += c.charAt((ta ^ arr[i] >>> bits) >>> 26);
                if (bits < 6) {
                    ta = arr[i] << (6 - bits);
                    bits += 26;
                    i++;
                } else {
                    ta <<= 6;
                    bits -= 6;
                }
            }
            while ((out.length & 3) && !_noEquals) { out += "="; }
            return out;
        },

        /** Convert from a base64 string to a bitArray */
        toBits: function (str, _url) {
            str = str.replace(/\s|=/g, '');
            var out = [], i, bits = 0, c = sjcl.codec.base64._chars, ta = 0, x;
            if (_url) {
                c = c.substr(0, 62) + '-_';
            }
            for (i = 0; i < str.length; i++) {
                x = c.indexOf(str.charAt(i));
                if (x < 0) {
                    throw new sjcl.exception.invalid("this isn't base64!");
                }
                if (bits > 26) {
                    bits -= 26;
                    out.push(ta ^ x >>> bits);
                    ta = x << (32 - bits);
                } else {
                    bits += 6;
                    ta ^= x << (32 - bits);
                }
            }
            if (bits & 56) {
                out.push(sjcl.bitArray.partial(bits & 56, ta, 1));
            }
            return out;
        }
    };

    sjcl.codec.base64url = {
        fromBits: function (arr) { return sjcl.codec.base64.fromBits(arr, 1, 1); },
        toBits: function (str) { return sjcl.codec.base64.toBits(str, 1); }
    };
    return sjcl;
});

;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('BigInteger', [], factory);
    } else {
        window.BigInteger = factory();
    }
})(function() {

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Basic JavaScript BN library - subset useful for RSA encryption. 
 * Copyright (c) 2005  Tom Wu 
 * All Rights Reserved. 
 * See "LICENSE" for details.
 */

// Bits per digit
    ;
    var dbits;

// JavaScript engine analysis
    var canary = 0xdeadbeefcafe;
    var j_lm = ((canary & 0xffffff) == 0xefcafe);

// (public) Constructor
    function BigInteger(a, b, c) {
        if (a != null)
            if ("number" == typeof a) this.fromNumber(a, b, c);
            else if (b == null && "string" != typeof a) this.fromString(a, 256);
            else this.fromString(a, b);
    }

// return new, unset BigInteger
    function nbi() { return new BigInteger(null); }

// am: Compute w_j += (x*this_i), propagate carries,
// c is initial carry, returns final carry.
// c < 3*dvalue, x < 2*dvalue, this_i < dvalue
// We need to select the fastest one that works in this environment.

// am1: use a single mult and divide to get the high bits,
// max digit bits should be 26 because
// max internal value = 2*dvalue^2-2*dvalue (< 2^53)
    function am1(i, x, w, j, c, n) {
        while (--n >= 0) {
            var v = x * this[i++] + w[j] + c;
            c = Math.floor(v / 0x4000000);
            w[j++] = v & 0x3ffffff;
        }
        return c;
    }

// am2 avoids a big mult-and-extract completely.
// Max digit bits should be <= 30 because we do bitwise ops
// on values up to 2*hdvalue^2-hdvalue-1 (< 2^31)
    function am2(i, x, w, j, c, n) {
        var xl = x & 0x7fff, xh = x >> 15;
        while (--n >= 0) {
            var l = this[i] & 0x7fff;
            var h = this[i++] >> 15;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x7fff) << 15) + w[j] + (c & 0x3fffffff);
            c = (l >>> 30) + (m >>> 15) + xh * h + (c >>> 30);
            w[j++] = l & 0x3fffffff;
        }
        return c;
    }

// Alternately, set max digit bits to 28 since some
// browsers slow down when dealing with 32-bit numbers.
    function am3(i, x, w, j, c, n) {
        var xl = x & 0x3fff, xh = x >> 14;
        while (--n >= 0) {
            var l = this[i] & 0x3fff;
            var h = this[i++] >> 14;
            var m = xh * l + h * xl;
            l = xl * l + ((m & 0x3fff) << 14) + w[j] + c;
            c = (l >> 28) + (m >> 14) + xh * h;
            w[j++] = l & 0xfffffff;
        }
        return c;
    }

    if (j_lm && (navigator.appName == "Microsoft Internet Explorer")) {
        BigInteger.prototype.am = am2;
        dbits = 30;
    } else if (j_lm && (navigator.appName != "Netscape")) {
        BigInteger.prototype.am = am1;
        dbits = 26;
    } else { // Mozilla/Netscape seems to prefer am3
        BigInteger.prototype.am = am3;
        dbits = 28;
    }

    BigInteger.prototype.DB = dbits;
    BigInteger.prototype.DM = ((1 << dbits) - 1);
    BigInteger.prototype.DV = (1 << dbits);

    var BI_FP = 52;
    BigInteger.prototype.FV = Math.pow(2, BI_FP);
    BigInteger.prototype.F1 = BI_FP - dbits;
    BigInteger.prototype.F2 = 2 * dbits - BI_FP;

// Digit conversions
    var BI_RM = "0123456789abcdefghijklmnopqrstuvwxyz";
    var BI_RC = new Array();
    var rr, vv;
    rr = "0".charCodeAt(0);
    for (vv = 0; vv <= 9; ++vv) BI_RC[rr++] = vv;
    rr = "a".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;
    rr = "A".charCodeAt(0);
    for (vv = 10; vv < 36; ++vv) BI_RC[rr++] = vv;

    function int2char(n) { return BI_RM.charAt(n); }

    function intAt(s, i) {
        var c = BI_RC[s.charCodeAt(i)];
        return (c == null) ? -1 : c;
    }

// (protected) copy this to r
    function bnpCopyTo(r) {
        for (var i = this.t - 1; i >= 0; --i) r[i] = this[i];
        r.t = this.t;
        r.s = this.s;
    }

// (protected) set from integer value x, -DV <= x < DV
    function bnpFromInt(x) {
        this.t = 1;
        this.s = (x < 0) ? -1 : 0;
        if (x > 0) this[0] = x;
        else if (x < -1) this[0] = x + DV;
        else this.t = 0;
    }

// return bigint initialized to value
    function nbv(i) {
        var r = nbi();
        r.fromInt(i);
        return r;
    }

// (protected) set from string and radix
    function bnpFromString(s, b) {
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 256) k = 8; // byte array
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else {
            this.fromRadix(s, b);
            return;
        }
        this.t = 0;
        this.s = 0;
        var i = s.length, mi = false, sh = 0;
        while (--i >= 0) {
            var x = (k == 8) ? s[i] & 0xff : intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-") mi = true;
                continue;
            }
            mi = false;
            if (sh == 0)
                this[this.t++] = x;
            else if (sh + k > this.DB) {
                this[this.t - 1] |= (x & ((1 << (this.DB - sh)) - 1)) << sh;
                this[this.t++] = (x >> (this.DB - sh));
            } else
                this[this.t - 1] |= x << sh;
            sh += k;
            if (sh >= this.DB) sh -= this.DB;
        }
        if (k == 8 && (s[0] & 0x80) != 0) {
            this.s = -1;
            if (sh > 0) this[this.t - 1] |= ((1 << (this.DB - sh)) - 1) << sh;
        }
        this.clamp();
        if (mi) BigInteger.ZERO.subTo(this, this);
    }

// (protected) clamp off excess high words
    function bnpClamp() {
        var c = this.s & this.DM;
        while (this.t > 0 && this[this.t - 1] == c)--this.t;
    }

// (public) return string representation in given radix
    function bnToString(b) {
        if (this.s < 0) return "-" + this.negate().toString(b);
        var k;
        if (b == 16) k = 4;
        else if (b == 8) k = 3;
        else if (b == 2) k = 1;
        else if (b == 32) k = 5;
        else if (b == 4) k = 2;
        else return this.toRadix(b);
        var km = (1 << k) - 1, d, m = false, r = "", i = this.t;
        var p = this.DB - (i * this.DB) % k;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) > 0) {
                m = true;
                r = int2char(d);
            }
            while (i >= 0) {
                if (p < k) {
                    d = (this[i] & ((1 << p) - 1)) << (k - p);
                    d |= this[--i] >> (p += this.DB - k);
                } else {
                    d = (this[i] >> (p -= k)) & km;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if (d > 0) m = true;
                if (m) r += int2char(d);
            }
        }
        return m ? r : "0";
    }

// (public) -this
    function bnNegate() {
        var r = nbi();
        BigInteger.ZERO.subTo(this, r);
        return r;
    }

// (public) |this|
    function bnAbs() { return (this.s < 0) ? this.negate() : this; }

// (public) return + if this > a, - if this < a, 0 if equal
    function bnCompareTo(a) {
        var r = this.s - a.s;
        if (r != 0) return r;
        var i = this.t;
        r = i - a.t;
        if (r != 0) return (this.s < 0) ? -r : r;
        while (--i >= 0) if ((r = this[i] - a[i]) != 0) return r;
        return 0;
    }

// returns bit length of the integer x
    function nbits(x) {
        var r = 1, t;
        if ((t = x >>> 16) != 0) {
            x = t;
            r += 16;
        }
        if ((t = x >> 8) != 0) {
            x = t;
            r += 8;
        }
        if ((t = x >> 4) != 0) {
            x = t;
            r += 4;
        }
        if ((t = x >> 2) != 0) {
            x = t;
            r += 2;
        }
        if ((t = x >> 1) != 0) {
            x = t;
            r += 1;
        }
        return r;
    }

// (public) return the number of bits in "this"
    function bnBitLength() {
        if (this.t <= 0) return 0;
        return this.DB * (this.t - 1) + nbits(this[this.t - 1] ^ (this.s & this.DM));
    }

// (protected) r = this << n*DB
    function bnpDLShiftTo(n, r) {
        var i;
        for (i = this.t - 1; i >= 0; --i) r[i + n] = this[i];
        for (i = n - 1; i >= 0; --i) r[i] = 0;
        r.t = this.t + n;
        r.s = this.s;
    }

// (protected) r = this >> n*DB
    function bnpDRShiftTo(n, r) {
        for (var i = n; i < this.t; ++i) r[i - n] = this[i];
        r.t = Math.max(this.t - n, 0);
        r.s = this.s;
    }

// (protected) r = this << n
    function bnpLShiftTo(n, r) {
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << cbs) - 1;
        var ds = Math.floor(n / this.DB), c = (this.s << bs) & this.DM, i;
        for (i = this.t - 1; i >= 0; --i) {
            r[i + ds + 1] = (this[i] >> cbs) | c;
            c = (this[i] & bm) << bs;
        }
        for (i = ds - 1; i >= 0; --i) r[i] = 0;
        r[ds] = c;
        r.t = this.t + ds + 1;
        r.s = this.s;
        r.clamp();
    }

// (protected) r = this >> n
    function bnpRShiftTo(n, r) {
        r.s = this.s;
        var ds = Math.floor(n / this.DB);
        if (ds >= this.t) {
            r.t = 0;
            return;
        }
        var bs = n % this.DB;
        var cbs = this.DB - bs;
        var bm = (1 << bs) - 1;
        r[0] = this[ds] >> bs;
        for (var i = ds + 1; i < this.t; ++i) {
            r[i - ds - 1] |= (this[i] & bm) << cbs;
            r[i - ds] = this[i] >> bs;
        }
        if (bs > 0) r[this.t - ds - 1] |= (this.s & bm) << cbs;
        r.t = this.t - ds;
        r.clamp();
    }

// (protected) r = this - a
    function bnpSubTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] - a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c -= a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c -= a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c -= a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c < -1) r[i++] = this.DV + c;
        else if (c > 0) r[i++] = c;
        r.t = i;
        r.clamp();
    }

// (protected) r = this * a, r != this,a (HAC 14.12)
// "this" should be the larger one if appropriate.
    function bnpMultiplyTo(a, r) {
        var x = this.abs(), y = a.abs();
        var i = x.t;
        r.t = i + y.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < y.t; ++i) r[i + x.t] = x.am(0, y[i], r, i, 0, x.t);
        r.s = 0;
        r.clamp();
        if (this.s != a.s) BigInteger.ZERO.subTo(r, r);
    }

// (protected) r = this^2, r != this (HAC 14.16)
    function bnpSquareTo(r) {
        var x = this.abs();
        var i = r.t = 2 * x.t;
        while (--i >= 0) r[i] = 0;
        for (i = 0; i < x.t - 1; ++i) {
            var c = x.am(i, x[i], r, 2 * i, 0, 1);
            if ((r[i + x.t] += x.am(i + 1, 2 * x[i], r, 2 * i + 1, c, x.t - i - 1)) >= x.DV) {
                r[i + x.t] -= x.DV;
                r[i + x.t + 1] = 1;
            }
        }
        if (r.t > 0) r[r.t - 1] += x.am(i, x[i], r, 2 * i, 0, 1);
        r.s = 0;
        r.clamp();
    }

// (protected) divide this by m, quotient and remainder to q, r (HAC 14.20)
// r != q, this != m.  q or r may be null.
    function bnpDivRemTo(m, q, r) {
        var pm = m.abs();
        if (pm.t <= 0) return;
        var pt = this.abs();
        if (pt.t < pm.t) {
            if (q != null) q.fromInt(0);
            if (r != null) this.copyTo(r);
            return;
        }
        if (r == null) r = nbi();
        var y = nbi(), ts = this.s, ms = m.s;
        var nsh = this.DB - nbits(pm[pm.t - 1]); // normalize modulus
        if (nsh > 0) {
            pm.lShiftTo(nsh, y);
            pt.lShiftTo(nsh, r);
        } else {
            pm.copyTo(y);
            pt.copyTo(r);
        }
        var ys = y.t;
        var y0 = y[ys - 1];
        if (y0 == 0) return;
        var yt = y0 * (1 << this.F1) + ((ys > 1) ? y[ys - 2] >> this.F2 : 0);
        var d1 = this.FV / yt, d2 = (1 << this.F1) / yt, e = 1 << this.F2;
        var i = r.t, j = i - ys, t = (q == null) ? nbi() : q;
        y.dlShiftTo(j, t);
        if (r.compareTo(t) >= 0) {
            r[r.t++] = 1;
            r.subTo(t, r);
        }
        BigInteger.ONE.dlShiftTo(ys, t);
        t.subTo(y, y); // "negative" y so we can replace sub with am later
        while (y.t < ys) y[y.t++] = 0;
        while (--j >= 0) {
            // Estimate quotient digit
            var qd = (r[--i] == y0) ? this.DM : Math.floor(r[i] * d1 + (r[i - 1] + e) * d2);
            if ((r[i] += y.am(0, qd, r, j, 0, ys)) < qd) { // Try it out
                y.dlShiftTo(j, t);
                r.subTo(t, r);
                while (r[i] < --qd) r.subTo(t, r);
            }
        }
        if (q != null) {
            r.drShiftTo(ys, q);
            if (ts != ms) BigInteger.ZERO.subTo(q, q);
        }
        r.t = ys;
        r.clamp();
        if (nsh > 0) r.rShiftTo(nsh, r); // Denormalize remainder
        if (ts < 0) BigInteger.ZERO.subTo(r, r);
    }

// (public) this mod a
    function bnMod(a) {
        var r = nbi();
        this.abs().divRemTo(a, null, r);
        if (this.s < 0 && r.compareTo(BigInteger.ZERO) > 0) a.subTo(r, r);
        return r;
    }

// Modular reduction using "classic" algorithm
    function Classic(m) { this.m = m; }

    function cConvert(x) {
        if (x.s < 0 || x.compareTo(this.m) >= 0) return x.mod(this.m);
        else return x;
    }

    function cRevert(x) { return x; }

    function cReduce(x) { x.divRemTo(this.m, null, x); }

    function cMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    function cSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

    Classic.prototype.convert = cConvert;
    Classic.prototype.revert = cRevert;
    Classic.prototype.reduce = cReduce;
    Classic.prototype.mulTo = cMulTo;
    Classic.prototype.sqrTo = cSqrTo;

// (protected) return "-1/this % 2^DB"; useful for Mont. reduction
// justification:
//         xy == 1 (mod m)
//         xy =  1+km
//   xy(2-xy) = (1+km)(1-km)
// x[y(2-xy)] = 1-k^2m^2
// x[y(2-xy)] == 1 (mod m^2)
// if y is 1/x mod m, then y(2-xy) is 1/x mod m^2
// should reduce x and y(2-xy) by m^2 at each step to keep size bounded.
// JS multiply "overflows" differently from C/C++, so care is needed here.
    function bnpInvDigit() {
        if (this.t < 1) return 0;
        var x = this[0];
        if ((x & 1) == 0) return 0;
        var y = x & 3; // y == 1/x mod 2^2
        y = (y * (2 - (x & 0xf) * y)) & 0xf; // y == 1/x mod 2^4
        y = (y * (2 - (x & 0xff) * y)) & 0xff; // y == 1/x mod 2^8
        y = (y * (2 - (((x & 0xffff) * y) & 0xffff))) & 0xffff; // y == 1/x mod 2^16
        // last step - calculate inverse mod DV directly;
        // assumes 16 < DB <= 32 and assumes ability to handle 48-bit ints
        y = (y * (2 - x * y % this.DV)) % this.DV; // y == 1/x mod 2^dbits
        // we really want the negative inverse, and -DV < y < DV
        return (y > 0) ? this.DV - y : -y;
    }

// Montgomery reduction
    function Montgomery(m) {
        this.m = m;
        this.mp = m.invDigit();
        this.mpl = this.mp & 0x7fff;
        this.mph = this.mp >> 15;
        this.um = (1 << (m.DB - 15)) - 1;
        this.mt2 = 2 * m.t;
    }

// xR mod m
    function montConvert(x) {
        var r = nbi();
        x.abs().dlShiftTo(this.m.t, r);
        r.divRemTo(this.m, null, r);
        if (x.s < 0 && r.compareTo(BigInteger.ZERO) > 0) this.m.subTo(r, r);
        return r;
    }

// x/R mod m
    function montRevert(x) {
        var r = nbi();
        x.copyTo(r);
        this.reduce(r);
        return r;
    }

// x = x/R mod m (HAC 14.32)
    function montReduce(x) {
        while (x.t <= this.mt2) // pad x so am has enough room later
            x[x.t++] = 0;
        for (var i = 0; i < this.m.t; ++i) {
            // faster way of calculating u0 = x[i]*mp mod DV
            var j = x[i] & 0x7fff;
            var u0 = (j * this.mpl + (((j * this.mph + (x[i] >> 15) * this.mpl) & this.um) << 15)) & x.DM;
            // use am to combine the multiply-shift-add into one call
            j = i + this.m.t;
            x[j] += this.m.am(0, u0, x, i, 0, this.m.t);
            // propagate carry
            while (x[j] >= x.DV) {
                x[j] -= x.DV;
                x[++j]++;
            }
        }
        x.clamp();
        x.drShiftTo(this.m.t, x);
        if (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

// r = "x^2/R mod m"; x != r
    function montSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

// r = "xy/R mod m"; x,y != r
    function montMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    Montgomery.prototype.convert = montConvert;
    Montgomery.prototype.revert = montRevert;
    Montgomery.prototype.reduce = montReduce;
    Montgomery.prototype.mulTo = montMulTo;
    Montgomery.prototype.sqrTo = montSqrTo;

// (protected) true iff this is even
    function bnpIsEven() { return ((this.t > 0) ? (this[0] & 1) : this.s) == 0; }

// (protected) this^e, e < 2^32, doing sqr and mul with "r" (HAC 14.79)
    function bnpExp(e, z) {
        if (e > 0xffffffff || e < 1) return BigInteger.ONE;
        var r = nbi(), r2 = nbi(), g = z.convert(this), i = nbits(e) - 1;
        g.copyTo(r);
        while (--i >= 0) {
            z.sqrTo(r, r2);
            if ((e & (1 << i)) > 0) z.mulTo(r2, g, r);
            else {
                var t = r;
                r = r2;
                r2 = t;
            }
        }
        return z.revert(r);
    }

// (public) this^e % m, 0 <= e < 2^32
    function bnModPowInt(e, m) {
        var z;
        if (e < 256 || m.isEven()) z = new Classic(m);
        else z = new Montgomery(m);
        return this.exp(e, z);
    }

// protected
    BigInteger.prototype.copyTo = bnpCopyTo;
    BigInteger.prototype.fromInt = bnpFromInt;
    BigInteger.prototype.fromString = bnpFromString;
    BigInteger.prototype.clamp = bnpClamp;
    BigInteger.prototype.dlShiftTo = bnpDLShiftTo;
    BigInteger.prototype.drShiftTo = bnpDRShiftTo;
    BigInteger.prototype.lShiftTo = bnpLShiftTo;
    BigInteger.prototype.rShiftTo = bnpRShiftTo;
    BigInteger.prototype.subTo = bnpSubTo;
    BigInteger.prototype.multiplyTo = bnpMultiplyTo;
    BigInteger.prototype.squareTo = bnpSquareTo;
    BigInteger.prototype.divRemTo = bnpDivRemTo;
    BigInteger.prototype.invDigit = bnpInvDigit;
    BigInteger.prototype.isEven = bnpIsEven;
    BigInteger.prototype.exp = bnpExp;

// public
    BigInteger.prototype.toString = bnToString;
    BigInteger.prototype.negate = bnNegate;
    BigInteger.prototype.abs = bnAbs;
    BigInteger.prototype.compareTo = bnCompareTo;
    BigInteger.prototype.bitLength = bnBitLength;
    BigInteger.prototype.mod = bnMod;
    BigInteger.prototype.modPowInt = bnModPowInt;

// "constants"
    BigInteger.ZERO = nbv(0);
    BigInteger.ONE = nbv(1);

// Copyright (c) 2005-2009  Tom Wu
// All Rights Reserved.
// See "LICENSE" for details.

// Extended JavaScript BN functions, required for RSA private ops.

// Version 1.1: new BigInteger("0", 10) returns "proper" zero
// Version 1.2: square() API, isProbablePrime fix

// (public)
    function bnClone() {
        var r = nbi();
        this.copyTo(r);
        return r;
    }

// (public) return value as integer
    function bnIntValue() {
        if (this.s < 0) {
            if (this.t == 1) return this[0] - this.DV;
            else if (this.t == 0) return -1;
        } else if (this.t == 1) return this[0];
        else if (this.t == 0) return 0;
        // assumes 16 < DB < 32
        return ((this[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) | this[0];
    }

// (public) return value as byte
    function bnByteValue() { return (this.t == 0) ? this.s : (this[0] << 24) >> 24; }

// (public) return value as short (assumes DB>=16)
    function bnShortValue() { return (this.t == 0) ? this.s : (this[0] << 16) >> 16; }

// (protected) return x s.t. r^x < DV
    function bnpChunkSize(r) { return Math.floor(Math.LN2 * this.DB / Math.log(r)); }

// (public) 0 if this == 0, 1 if this > 0
    function bnSigNum() {
        if (this.s < 0) return -1;
        else if (this.t <= 0 || (this.t == 1 && this[0] <= 0)) return 0;
        else return 1;
    }

// (protected) convert to radix string
    function bnpToRadix(b) {
        if (b == null) b = 10;
        if (this.signum() == 0 || b < 2 || b > 36) return "0";
        var cs = this.chunkSize(b);
        var a = Math.pow(b, cs);
        var d = nbv(a), y = nbi(), z = nbi(), r = "";
        this.divRemTo(d, y, z);
        while (y.signum() > 0) {
            r = (a + z.intValue()).toString(b).substr(1) + r;
            y.divRemTo(d, y, z);
        }
        return z.intValue().toString(b) + r;
    }

// (protected) convert from radix string
    function bnpFromRadix(s, b) {
        this.fromInt(0);
        if (b == null) b = 10;
        var cs = this.chunkSize(b);
        var d = Math.pow(b, cs), mi = false, j = 0, w = 0;
        for (var i = 0; i < s.length; ++i) {
            var x = intAt(s, i);
            if (x < 0) {
                if (s.charAt(i) == "-" && this.signum() == 0) mi = true;
                continue;
            }
            w = b * w + x;
            if (++j >= cs) {
                this.dMultiply(d);
                this.dAddOffset(w, 0);
                j = 0;
                w = 0;
            }
        }
        if (j > 0) {
            this.dMultiply(Math.pow(b, j));
            this.dAddOffset(w, 0);
        }
        if (mi) BigInteger.ZERO.subTo(this, this);
    }

// (protected) alternate constructor
    function bnpFromNumber(a, b, c) {
        if ("number" == typeof b) {
            // new BigInteger(int,int,RNG)
            if (a < 2) this.fromInt(1);
            else {
                this.fromNumber(a, c);
                if (!this.testBit(a - 1)) // force MSB set
                    this.bitwiseTo(BigInteger.ONE.shiftLeft(a - 1), op_or, this);
                if (this.isEven()) this.dAddOffset(1, 0); // force odd
                while (!this.isProbablePrime(b)) {
                    this.dAddOffset(2, 0);
                    if (this.bitLength() > a) this.subTo(BigInteger.ONE.shiftLeft(a - 1), this);
                }
            }
        } else {
            // new BigInteger(int,RNG)
            var x = new Array(), t = a & 7;
            x.length = (a >> 3) + 1;
            b.nextBytes(x);
            if (t > 0) x[0] &= ((1 << t) - 1);
            else x[0] = 0;
            this.fromString(x, 256);
        }
    }

// (public) convert to bigendian byte array
    function bnToByteArray() {
        var i = this.t, r = new Array();
        r[0] = this.s;
        var p = this.DB - (i * this.DB) % 8, d, k = 0;
        if (i-- > 0) {
            if (p < this.DB && (d = this[i] >> p) != (this.s & this.DM) >> p)
                r[k++] = d | (this.s << (this.DB - p));
            while (i >= 0) {
                if (p < 8) {
                    d = (this[i] & ((1 << p) - 1)) << (8 - p);
                    d |= this[--i] >> (p += this.DB - 8);
                } else {
                    d = (this[i] >> (p -= 8)) & 0xff;
                    if (p <= 0) {
                        p += this.DB;
                        --i;
                    }
                }
                if ((d & 0x80) != 0) d |= -256;
                if (k == 0 && (this.s & 0x80) != (d & 0x80))++k;
                if (k > 0 || d != this.s) r[k++] = d;
            }
        }
        return r;
    }

    function bnEquals(a) { return (this.compareTo(a) == 0); }

    function bnMin(a) { return (this.compareTo(a) < 0) ? this : a; }

    function bnMax(a) { return (this.compareTo(a) > 0) ? this : a; }

// (protected) r = this op a (bitwise)
    function bnpBitwiseTo(a, op, r) {
        var i, f, m = Math.min(a.t, this.t);
        for (i = 0; i < m; ++i) r[i] = op(this[i], a[i]);
        if (a.t < this.t) {
            f = a.s & this.DM;
            for (i = m; i < this.t; ++i) r[i] = op(this[i], f);
            r.t = this.t;
        } else {
            f = this.s & this.DM;
            for (i = m; i < a.t; ++i) r[i] = op(f, a[i]);
            r.t = a.t;
        }
        r.s = op(this.s, a.s);
        r.clamp();
    }

// (public) this & a
    function op_and(x, y) { return x & y; }

    function bnAnd(a) {
        var r = nbi();
        this.bitwiseTo(a, op_and, r);
        return r;
    }

// (public) this | a
    function op_or(x, y) { return x | y; }

    function bnOr(a) {
        var r = nbi();
        this.bitwiseTo(a, op_or, r);
        return r;
    }

// (public) this ^ a
    function op_xor(x, y) { return x ^ y; }

    function bnXor(a) {
        var r = nbi();
        this.bitwiseTo(a, op_xor, r);
        return r;
    }

// (public) this & ~a
    function op_andnot(x, y) { return x & ~y; }

    function bnAndNot(a) {
        var r = nbi();
        this.bitwiseTo(a, op_andnot, r);
        return r;
    }

// (public) ~this
    function bnNot() {
        var r = nbi();
        for (var i = 0; i < this.t; ++i) r[i] = this.DM & ~this[i];
        r.t = this.t;
        r.s = ~this.s;
        return r;
    }

// (public) this << n
    function bnShiftLeft(n) {
        var r = nbi();
        if (n < 0) this.rShiftTo(-n, r);
        else this.lShiftTo(n, r);
        return r;
    }

// (public) this >> n
    function bnShiftRight(n) {
        var r = nbi();
        if (n < 0) this.lShiftTo(-n, r);
        else this.rShiftTo(n, r);
        return r;
    }

// return index of lowest 1-bit in x, x < 2^31
    function lbit(x) {
        if (x == 0) return -1;
        var r = 0;
        if ((x & 0xffff) == 0) {
            x >>= 16;
            r += 16;
        }
        if ((x & 0xff) == 0) {
            x >>= 8;
            r += 8;
        }
        if ((x & 0xf) == 0) {
            x >>= 4;
            r += 4;
        }
        if ((x & 3) == 0) {
            x >>= 2;
            r += 2;
        }
        if ((x & 1) == 0)++r;
        return r;
    }

// (public) returns index of lowest 1-bit (or -1 if none)
    function bnGetLowestSetBit() {
        for (var i = 0; i < this.t; ++i)
            if (this[i] != 0) return i * this.DB + lbit(this[i]);
        if (this.s < 0) return this.t * this.DB;
        return -1;
    }

// return number of 1 bits in x
    function cbit(x) {
        var r = 0;
        while (x != 0) {
            x &= x - 1;
            ++r;
        }
        return r;
    }

// (public) return number of set bits
    function bnBitCount() {
        var r = 0, x = this.s & this.DM;
        for (var i = 0; i < this.t; ++i) r += cbit(this[i] ^ x);
        return r;
    }

// (public) true iff nth bit is set
    function bnTestBit(n) {
        var j = Math.floor(n / this.DB);
        if (j >= this.t) return (this.s != 0);
        return ((this[j] & (1 << (n % this.DB))) != 0);
    }

// (protected) this op (1<<n)
    function bnpChangeBit(n, op) {
        var r = BigInteger.ONE.shiftLeft(n);
        this.bitwiseTo(r, op, r);
        return r;
    }

// (public) this | (1<<n)
    function bnSetBit(n) { return this.changeBit(n, op_or); }

// (public) this & ~(1<<n)
    function bnClearBit(n) { return this.changeBit(n, op_andnot); }

// (public) this ^ (1<<n)
    function bnFlipBit(n) { return this.changeBit(n, op_xor); }

// (protected) r = this + a
    function bnpAddTo(a, r) {
        var i = 0, c = 0, m = Math.min(a.t, this.t);
        while (i < m) {
            c += this[i] + a[i];
            r[i++] = c & this.DM;
            c >>= this.DB;
        }
        if (a.t < this.t) {
            c += a.s;
            while (i < this.t) {
                c += this[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += this.s;
        } else {
            c += this.s;
            while (i < a.t) {
                c += a[i];
                r[i++] = c & this.DM;
                c >>= this.DB;
            }
            c += a.s;
        }
        r.s = (c < 0) ? -1 : 0;
        if (c > 0) r[i++] = c;
        else if (c < -1) r[i++] = this.DV + c;
        r.t = i;
        r.clamp();
    }

// (public) this + a
    function bnAdd(a) {
        var r = nbi();
        this.addTo(a, r);
        return r;
    }

// (public) this - a
    function bnSubtract(a) {
        var r = nbi();
        this.subTo(a, r);
        return r;
    }

// (public) this * a
    function bnMultiply(a) {
        var r = nbi();
        this.multiplyTo(a, r);
        return r;
    }

// (public) this^2
    function bnSquare() {
        var r = nbi();
        this.squareTo(r);
        return r;
    }

// (public) this / a
    function bnDivide(a) {
        var r = nbi();
        this.divRemTo(a, r, null);
        return r;
    }

// (public) this % a
    function bnRemainder(a) {
        var r = nbi();
        this.divRemTo(a, null, r);
        return r;
    }

// (public) [this/a,this%a]
    function bnDivideAndRemainder(a) {
        var q = nbi(), r = nbi();
        this.divRemTo(a, q, r);
        return new Array(q, r);
    }

// (protected) this *= n, this >= 0, 1 < n < DV
    function bnpDMultiply(n) {
        this[this.t] = this.am(0, n - 1, this, 0, 0, this.t);
        ++this.t;
        this.clamp();
    }

// (protected) this += n << w words, this >= 0
    function bnpDAddOffset(n, w) {
        if (n == 0) return;
        while (this.t <= w) this[this.t++] = 0;
        this[w] += n;
        while (this[w] >= this.DV) {
            this[w] -= this.DV;
            if (++w >= this.t) this[this.t++] = 0;
            ++this[w];
        }
    }

// A "null" reducer
    function NullExp() {}

    function nNop(x) { return x; }

    function nMulTo(x, y, r) { x.multiplyTo(y, r); }

    function nSqrTo(x, r) { x.squareTo(r); }

    NullExp.prototype.convert = nNop;
    NullExp.prototype.revert = nNop;
    NullExp.prototype.mulTo = nMulTo;
    NullExp.prototype.sqrTo = nSqrTo;

// (public) this^e
    function bnPow(e) { return this.exp(e, new NullExp()); }

// (protected) r = lower n words of "this * a", a.t <= n
// "this" should be the larger one if appropriate.
    function bnpMultiplyLowerTo(a, n, r) {
        var i = Math.min(this.t + a.t, n);
        r.s = 0; // assumes a,this >= 0
        r.t = i;
        while (i > 0) r[--i] = 0;
        var j;
        for (j = r.t - this.t; i < j; ++i) r[i + this.t] = this.am(0, a[i], r, i, 0, this.t);
        for (j = Math.min(a.t, n); i < j; ++i) this.am(0, a[i], r, i, 0, n - i);
        r.clamp();
    }

// (protected) r = "this * a" without lower n words, n > 0
// "this" should be the larger one if appropriate.
    function bnpMultiplyUpperTo(a, n, r) {
        --n;
        var i = r.t = this.t + a.t - n;
        r.s = 0; // assumes a,this >= 0
        while (--i >= 0) r[i] = 0;
        for (i = Math.max(n - this.t, 0); i < a.t; ++i)
            r[this.t + i - n] = this.am(n - i, a[i], r, 0, 0, this.t + i - n);
        r.clamp();
        r.drShiftTo(1, r);
    }

// Barrett modular reduction
    function Barrett(m) {
        // setup Barrett
        this.r2 = nbi();
        this.q3 = nbi();
        BigInteger.ONE.dlShiftTo(2 * m.t, this.r2);
        this.mu = this.r2.divide(m);
        this.m = m;
    }

    function barrettConvert(x) {
        if (x.s < 0 || x.t > 2 * this.m.t) return x.mod(this.m);
        else if (x.compareTo(this.m) < 0) return x;
        else {
            var r = nbi();
            x.copyTo(r);
            this.reduce(r);
            return r;
        }
    }

    function barrettRevert(x) { return x; }

// x = x mod m (HAC 14.42)
    function barrettReduce(x) {
        x.drShiftTo(this.m.t - 1, this.r2);
        if (x.t > this.m.t + 1) {
            x.t = this.m.t + 1;
            x.clamp();
        }
        this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3);
        this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
        while (x.compareTo(this.r2) < 0) x.dAddOffset(1, this.m.t + 1);
        x.subTo(this.r2, x);
        while (x.compareTo(this.m) >= 0) x.subTo(this.m, x);
    }

// r = x^2 mod m; x != r
    function barrettSqrTo(x, r) {
        x.squareTo(r);
        this.reduce(r);
    }

// r = x*y mod m; x,y != r
    function barrettMulTo(x, y, r) {
        x.multiplyTo(y, r);
        this.reduce(r);
    }

    Barrett.prototype.convert = barrettConvert;
    Barrett.prototype.revert = barrettRevert;
    Barrett.prototype.reduce = barrettReduce;
    Barrett.prototype.mulTo = barrettMulTo;
    Barrett.prototype.sqrTo = barrettSqrTo;

// (public) this^e % m (HAC 14.85)
    function bnModPow(e, m) {
        var i = e.bitLength(), k, r = nbv(1), z;
        if (i <= 0) return r;
        else if (i < 18) k = 1;
        else if (i < 48) k = 3;
        else if (i < 144) k = 4;
        else if (i < 768) k = 5;
        else k = 6;
        if (i < 8)
            z = new Classic(m);
        else if (m.isEven())
            z = new Barrett(m);
        else
            z = new Montgomery(m);

        // precomputation
        var g = new Array(), n = 3, k1 = k - 1, km = (1 << k) - 1;
        g[1] = z.convert(this);
        if (k > 1) {
            var g2 = nbi();
            z.sqrTo(g[1], g2);
            while (n <= km) {
                g[n] = nbi();
                z.mulTo(g2, g[n - 2], g[n]);
                n += 2;
            }
        }

        var j = e.t - 1, w, is1 = true, r2 = nbi(), t;
        i = nbits(e[j]) - 1;
        while (j >= 0) {
            if (i >= k1) w = (e[j] >> (i - k1)) & km;
            else {
                w = (e[j] & ((1 << (i + 1)) - 1)) << (k1 - i);
                if (j > 0) w |= e[j - 1] >> (this.DB + i - k1);
            }

            n = k;
            while ((w & 1) == 0) {
                w >>= 1;
                --n;
            }
            if ((i -= n) < 0) {
                i += this.DB;
                --j;
            }
            if (is1) { // ret == 1, don't bother squaring or multiplying it
                g[w].copyTo(r);
                is1 = false;
            } else {
                while (n > 1) {
                    z.sqrTo(r, r2);
                    z.sqrTo(r2, r);
                    n -= 2;
                }
                if (n > 0) z.sqrTo(r, r2);
                else {
                    t = r;
                    r = r2;
                    r2 = t;
                }
                z.mulTo(r2, g[w], r);
            }

            while (j >= 0 && (e[j] & (1 << i)) == 0) {
                z.sqrTo(r, r2);
                t = r;
                r = r2;
                r2 = t;
                if (--i < 0) {
                    i = this.DB - 1;
                    --j;
                }
            }
        }
        return z.revert(r);
    }

// (public) gcd(this,a) (HAC 14.54)
    function bnGCD(a) {
        var x = (this.s < 0) ? this.negate() : this.clone();
        var y = (a.s < 0) ? a.negate() : a.clone();
        if (x.compareTo(y) < 0) {
            var t = x;
            x = y;
            y = t;
        }
        var i = x.getLowestSetBit(), g = y.getLowestSetBit();
        if (g < 0) return x;
        if (i < g) g = i;
        if (g > 0) {
            x.rShiftTo(g, x);
            y.rShiftTo(g, y);
        }
        while (x.signum() > 0) {
            if ((i = x.getLowestSetBit()) > 0) x.rShiftTo(i, x);
            if ((i = y.getLowestSetBit()) > 0) y.rShiftTo(i, y);
            if (x.compareTo(y) >= 0) {
                x.subTo(y, x);
                x.rShiftTo(1, x);
            } else {
                y.subTo(x, y);
                y.rShiftTo(1, y);
            }
        }
        if (g > 0) y.lShiftTo(g, y);
        return y;
    }

// (protected) this % n, n < 2^26
    function bnpModInt(n) {
        if (n <= 0) return 0;
        var d = this.DV % n, r = (this.s < 0) ? n - 1 : 0;
        if (this.t > 0)
            if (d == 0) r = this[0] % n;
            else for (var i = this.t - 1; i >= 0; --i) r = (d * r + this[i]) % n;
        return r;
    }

// (public) 1/this % m (HAC 14.61)
    function bnModInverse(m) {
        var ac = m.isEven();
        if ((this.isEven() && ac) || m.signum() == 0) return BigInteger.ZERO;
        var u = m.clone(), v = this.clone();
        var a = nbv(1), b = nbv(0), c = nbv(0), d = nbv(1);
        while (u.signum() != 0) {
            while (u.isEven()) {
                u.rShiftTo(1, u);
                if (ac) {
                    if (!a.isEven() || !b.isEven()) {
                        a.addTo(this, a);
                        b.subTo(m, b);
                    }
                    a.rShiftTo(1, a);
                } else if (!b.isEven()) b.subTo(m, b);
                b.rShiftTo(1, b);
            }
            while (v.isEven()) {
                v.rShiftTo(1, v);
                if (ac) {
                    if (!c.isEven() || !d.isEven()) {
                        c.addTo(this, c);
                        d.subTo(m, d);
                    }
                    c.rShiftTo(1, c);
                } else if (!d.isEven()) d.subTo(m, d);
                d.rShiftTo(1, d);
            }
            if (u.compareTo(v) >= 0) {
                u.subTo(v, u);
                if (ac) a.subTo(c, a);
                b.subTo(d, b);
            } else {
                v.subTo(u, v);
                if (ac) c.subTo(a, c);
                d.subTo(b, d);
            }
        }
        if (v.compareTo(BigInteger.ONE) != 0) return BigInteger.ZERO;
        if (d.compareTo(m) >= 0) return d.subtract(m);
        if (d.signum() < 0) d.addTo(m, d);
        else return d;
        if (d.signum() < 0) return d.add(m);
        else return d;
    }

    var lowprimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509, 521, 523, 541, 547, 557, 563, 569, 571, 577, 587, 593, 599, 601, 607, 613, 617, 619, 631, 641, 643, 647, 653, 659, 661, 673, 677, 683, 691, 701, 709, 719, 727, 733, 739, 743, 751, 757, 761, 769, 773, 787, 797, 809, 811, 821, 823, 827, 829, 839, 853, 857, 859, 863, 877, 881, 883, 887, 907, 911, 919, 929, 937, 941, 947, 953, 967, 971, 977, 983, 991, 997];
    var lplim = (1 << 26) / lowprimes[lowprimes.length - 1];

// (public) test primality with certainty >= 1-.5^t
    function bnIsProbablePrime(t) {
        var i, x = this.abs();
        if (x.t == 1 && x[0] <= lowprimes[lowprimes.length - 1]) {
            for (i = 0; i < lowprimes.length; ++i)
                if (x[0] == lowprimes[i]) return true;
            return false;
        }
        if (x.isEven()) return false;
        i = 1;
        while (i < lowprimes.length) {
            var m = lowprimes[i], j = i + 1;
            while (j < lowprimes.length && m < lplim) m *= lowprimes[j++];
            m = x.modInt(m);
            while (i < j) if (m % lowprimes[i++] == 0) return false;
        }
        return x.millerRabin(t);
    }

// (protected) true if probably prime (HAC 4.24, Miller-Rabin)
    function bnpMillerRabin(t) {
        var n1 = this.subtract(BigInteger.ONE);
        var k = n1.getLowestSetBit();
        if (k <= 0) return false;
        var r = n1.shiftRight(k);
        t = (t + 1) >> 1;
        if (t > lowprimes.length) t = lowprimes.length;
        var a = nbi();
        for (var i = 0; i < t; ++i) {
            //Pick bases at random, instead of starting at 2
            a.fromInt(lowprimes[Math.floor(Math.random() * lowprimes.length)]);
            var y = a.modPow(r, this);
            if (y.compareTo(BigInteger.ONE) != 0 && y.compareTo(n1) != 0) {
                var j = 1;
                while (j++ < k && y.compareTo(n1) != 0) {
                    y = y.modPowInt(2, this);
                    if (y.compareTo(BigInteger.ONE) == 0) return false;
                }
                if (y.compareTo(n1) != 0) return false;
            }
        }
        return true;
    }

// protected
    BigInteger.prototype.chunkSize = bnpChunkSize;
    BigInteger.prototype.toRadix = bnpToRadix;
    BigInteger.prototype.fromRadix = bnpFromRadix;
    BigInteger.prototype.fromNumber = bnpFromNumber;
    BigInteger.prototype.bitwiseTo = bnpBitwiseTo;
    BigInteger.prototype.changeBit = bnpChangeBit;
    BigInteger.prototype.addTo = bnpAddTo;
    BigInteger.prototype.dMultiply = bnpDMultiply;
    BigInteger.prototype.dAddOffset = bnpDAddOffset;
    BigInteger.prototype.multiplyLowerTo = bnpMultiplyLowerTo;
    BigInteger.prototype.multiplyUpperTo = bnpMultiplyUpperTo;
    BigInteger.prototype.modInt = bnpModInt;
    BigInteger.prototype.millerRabin = bnpMillerRabin;

// public
    BigInteger.prototype.clone = bnClone;
    BigInteger.prototype.intValue = bnIntValue;
    BigInteger.prototype.byteValue = bnByteValue;
    BigInteger.prototype.shortValue = bnShortValue;
    BigInteger.prototype.signum = bnSigNum;
    BigInteger.prototype.toByteArray = bnToByteArray;
    BigInteger.prototype.equals = bnEquals;
    BigInteger.prototype.min = bnMin;
    BigInteger.prototype.max = bnMax;
    BigInteger.prototype.and = bnAnd;
    BigInteger.prototype.or = bnOr;
    BigInteger.prototype.xor = bnXor;
    BigInteger.prototype.andNot = bnAndNot;
    BigInteger.prototype.not = bnNot;
    BigInteger.prototype.shiftLeft = bnShiftLeft;
    BigInteger.prototype.shiftRight = bnShiftRight;
    BigInteger.prototype.getLowestSetBit = bnGetLowestSetBit;
    BigInteger.prototype.bitCount = bnBitCount;
    BigInteger.prototype.testBit = bnTestBit;
    BigInteger.prototype.setBit = bnSetBit;
    BigInteger.prototype.clearBit = bnClearBit;
    BigInteger.prototype.flipBit = bnFlipBit;
    BigInteger.prototype.add = bnAdd;
    BigInteger.prototype.subtract = bnSubtract;
    BigInteger.prototype.multiply = bnMultiply;
    BigInteger.prototype.divide = bnDivide;
    BigInteger.prototype.remainder = bnRemainder;
    BigInteger.prototype.divideAndRemainder = bnDivideAndRemainder;
    BigInteger.prototype.modPow = bnModPow;
    BigInteger.prototype.modInverse = bnModInverse;
    BigInteger.prototype.pow = bnPow;
    BigInteger.prototype.gcd = bnGCD;
    BigInteger.prototype.isProbablePrime = bnIsProbablePrime;

    // JSBN-specific extension
    BigInteger.prototype.square = bnSquare;

    return BigInteger;
});
;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('SRPClient', [
            'sha1',
            'sjcl',
            'BigInteger'
        ], factory);
    } else {
        window.SRPClient = factory(sha1, sjcl, BigInteger);
    }
})(function (sha1, sjcl, BigInteger) {
    
    /*
     * Construct an SRP object with a username,
     * password, and the bits identifying the 
     * group (1024 [default], 1536 or 2048 bits).
     */
    var SRPClient = function (username, password, group, hashFn) {

        // Verify presence of username.
        if (!username)
            throw 'Username cannot be empty.';

        // Store username/password.
        this.username = username;
        this.password = password;

        // Initialize hash function
        this.hashFn = hashFn || 'sha-1';

        // Retrieve initialization values.
        var group = group || 1024;
        var initVal = this.initVals[group];

        // Set N and g from initialization values.
        this.N = new BigInteger(initVal.N, 16);
        this.g = new BigInteger(initVal.g, 16);
        this.gBn = new BigInteger(initVal.g, 16);

        // Pre-compute k from N and g.
        this.k = this.k();

        // Convenience big integer objects for 1 and 2.
        this.one = new BigInteger("1", 16);
        this.two = new BigInteger("2", 16);

    };

    /*
     * Implementation of an SRP client conforming
     * to the SRP protocol 6A (see RFC5054).
    */
    SRPClient.prototype = {
        toHexString: function(bi) {
            var hex = bi.toString(16);
            if (hex.length % 2 === 1) {
                hex = "0" + hex;
            }
            return hex;
        },
        padLeft: function(orig, len) {
            if (orig.length > len) return orig;

            var arr = Array(len - orig.length + 1);
            return arr.join("0") + orig;
        },
        bytesToHex: function(bytes) {
            var self = this;
            var b = bytes.map(function(x) { return self.padLeft(self.toHexString(x), 2); });
            return b.join("");
        },
        hexToBytes: function(hex) {
            if (hex.length % 2 === 1) throw new Error("hexToBytes can't have a string with an odd number of characters.");
            if (hex.indexOf("0x") === 0) hex = hex.slice(2);
            return hex.match(/../g).map(function(x) { return parseInt(x, 16) });
        },
        stringToBytes: function(str) {
            var bytes = [];
            for (var i = 0; i < str.length; ++i) {
                bytes.push(str.charCodeAt(i));
            }
            return bytes;
        },
        bytesToString: function (byteArr) {
            var str = '';
            for (var i = 0; i < byteArr.length; i++)
                str += String.fromCharCode(byteArr[i]);

            return str;
        },

        /*
     * Calculate k = H(N || g), which is used
     * throughout various SRP calculations.
     */
        k: function() {

            // Convert to hex values.
            var toHash = [
                this.toHexString(this.N),
                this.toHexString(this.g)
            ];

            // Return hash as a BigInteger.
            return this.paddedHash(toHash);

        },

        /*
     * Calculate x = SHA1(s | SHA1(I | ":" | P))
     */
        calculateX: function(saltHex) {

            // Verify presence of parameters.
            if (!saltHex) throw 'Missing parameter.'

            if (!this.username || !this.password)
                throw 'Username and password cannot be empty.';

            var usernameBytes = this.stringToBytes(this.username);
            var passwordBytes = this.hexToBytes(this.password);

            var upBytes = usernameBytes.concat([58]).concat(passwordBytes);
            var upHash = this.hash(this.bytesToString(upBytes));
            var upHashBytes = this.hexToBytes(upHash);

            var saltBytes = this.hexToBytes(saltHex);
            var saltUpBytes = saltBytes.concat(upHashBytes);
            var saltUpHash = this.hash(this.bytesToString(saltUpBytes));

            var xtmp = new BigInteger(saltUpHash, 16);
            if (xtmp.compareTo(this.N) < 0) {
                return xtmp;
            }
            else {
                var one = new BigInteger(1,16);
                return xtmp.mod(this.N.subtract(one));
            }

        },

        /*
     * Calculate v = g^x % N
     */
        calculateV: function(salt) {

            // Verify presence of parameters.
            if (!salt) throw 'Missing parameter.';

            // Get X from the salt value.
            var x = this.calculateX(salt);

            // Calculate and return the verifier.
            return this.g.modPow(x, this.N);

        },

        /*
     * Calculate u = SHA1(PAD(A) | PAD(B)), which serves
     * to prevent an attacker who learns a user's verifier
     * from being able to authenticate as that user.
     */
        calculateU: function(A, B) {

            // Verify presence of parameters.
            if (!A || !B) throw 'Missing parameter(s).';

            // Verify value of A and B.
            if (A.mod(this.N).toString() == '0' ||
                B.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            // Convert A and B to hexadecimal.
            var toHash = [this.toHexString(A), this.toHexString(B)];

            // Return hash as a BigInteger.
            return this.paddedHash(toHash);

        },

        canCalculateA: function(a) {
            if (!a) throw 'Missing parameter.';

            return Math.ceil(a.bitLength() / 8) >= 256 / 8;

        },

        /*
     * 2.5.4 Calculate the client's public value A = g^a % N,
     * where a is a random number at least 256 bits in length.
     */
        calculateA: function(a) {

            // Verify presence of parameter.
            if (!a) throw 'Missing parameter.';

            if (!this.canCalculateA(a))
                throw 'Client key length is less than 256 bits.'

            // Return A as a BigInteger.
            var A = this.g.modPow(a, this.N);

            if (A.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            return A;

        },

        /*
    * Calculate match M = H(H(N) XOR H(g) | H(username) | s | A | B | K)
    */
        calculateM1: function(A, B, K, salt) {

            // Verify presence of parameters.
            if (!A || !B || !K || !salt)
                throw 'Missing parameter(s).';

            // Verify value of A and B.
            if (A.mod(this.N).toString() == '0' ||
                B.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            var hashN = this.hexHash(this.toHexString(this.N));
            var hashg = this.hexHash(this.toHexString(this.g));

            var hashUsername = this.hash(this.username);

            var xorNg_bytes = [],
                hashN_bytes = this.hexToBytes(hashN),
                hashg_bytes = this.hexToBytes(hashg);

            for (var i = 0; i < hashN_bytes.length; i++)
                xorNg_bytes[i] = hashN_bytes[i] ^ hashg_bytes[i];

            var xorNg = this.bytesToHex(xorNg_bytes);

            var aHex = this.toHexString(A);
            var bHex = this.toHexString(B);

            var toHash = [xorNg, hashUsername, salt, aHex, bHex, K];
            var toHash_str = '';

            for (var j = 0; j < toHash.length; j++) {
                toHash_str += toHash[j];
            }

            return new BigInteger(this.hexHash(toHash_str), 16);
        },

        /*
     * Calculate match M = H(H(N) XOR H(g) | H(username) | s | A | B | K) and return as hex string
     */
        calculateM: function (A, B, K, salt) {

            // Verify presence of parameters.
            if (!A || !B || !K || !salt)
                throw 'Missing parameter(s).';

            // Verify value of A and B.
            if (A.mod(this.N).toString() == '0' ||
                B.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            var hashN = this.hexHash(this.toHexString(this.N));
            var hashg = this.hexHash(this.toHexString(this.g));

            var hashUsername = this.hash(this.username);

            var xorNg_bytes = [],
                hashN_bytes = this.hexToBytes(hashN),
                hashg_bytes = this.hexToBytes(hashg);

            for (var i = 0; i < hashN_bytes.length; i++)
                xorNg_bytes[i] = hashN_bytes[i] ^ hashg_bytes[i];

            var xorNg = this.bytesToHex(xorNg_bytes);

            var aHex = this.toHexString(A);
            var bHex = this.toHexString(B);

            var toHash = [xorNg, hashUsername, salt, aHex, bHex, K];
            var toHash_str = '';

            for (var j = 0; j < toHash.length; j++) {
                toHash_str += toHash[j];
            }

            return this.hexHash(toHash_str);
        },
        /*
     * Calculate match M = H(A, B, K) or M = H(A, M, K)
     */
        calculateM2: function(A, B_or_M, K) {

            // Verify presence of parameters.
            if (!A || !B_or_M || !K)
                throw 'Missing parameter(s).';

            // Verify value of A and B.
            if (A.mod(this.N).toString() == '0' ||
                B_or_M.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            var aHex = this.toHexString(A);
            var bHex = this.toHexString(B_or_M);

            var toHash = [aHex, bHex, K];
            var toHash_str = '';

            for (var j = 0; j < toHash.length; j++) {
                toHash_str += toHash[j];
            }

            return new BigInteger(this.hexHash(toHash_str), 16);

        },

        /*
     * Calculate the client's premaster secret 
     * S = (B - (k * g^x)) ^ (a + (u * x)) % N
     */
        calculateS: function(B, salt, uu, aa) {

            // Verify presence of parameters.
            if (!B || !salt || !uu || !aa)
                throw 'Missing parameters.';

            // Verify value of B.
            if (B.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            // Calculate X from the salt.
            var x = this.calculateX(salt);

            // Calculate bx = g^x % N
            var bx = this.g.modPow(x, this.N);

            // Calculate ((B + N * k) - k * bx) % N
            var btmp = B.add(this.N.multiply(this.k))
                .subtract(bx.multiply(this.k)).mod(this.N);

            // Finish calculation of the premaster secret.
            return btmp.modPow(x.multiply(uu).add(aa), this.N);

        },

        calculateK: function(S) {
            return this.hexHash(this.toHexString(S));
        },

        /*
     * Helper functions for random number
     * generation and format conversion.
     */

        /* Generate a random big integer */
        srpRandom: function() {

            var words = sjcl.random.randomWords(8, 0);
            var hex = sjcl.codec.hex.fromBits(words);

            // Verify random number large enough.
            if (hex.length != 64)
                throw 'Invalid random number size.'

            var r = new BigInteger(hex, 16);

            if (r.compareTo(this.N) >= 0)
                r = a.mod(this.N.subtract(this.one));

            if (r.compareTo(this.two) < 0)
                r = two;

            return r;

        },

        /* Return a random hexadecimal salt */
        randomHexSalt: function() {

            var words = sjcl.random.randomWords(8, 0);
            var hex = sjcl.codec.hex.fromBits(words);

            return hex;

        },

        /*
     * Helper functions for hasing/padding.
     */

        /*
    * SHA1 hashing function with padding: input 
    * is prefixed with 0 to meet N hex width.
    */
        paddedHash: function(array) {

            var nlen = 2 * ((this.toHexString(this.N).length * 4 + 7) >> 3);

            var toHash = '';

            for (var i = 0; i < array.length; i++) {
                toHash += this.nZeros(nlen - array[i].length) + array[i];
            }

            var hash = new BigInteger(this.hexHash(toHash), 16);

            return hash.mod(this.N);

        },

        /* 
     * Generic hashing function.
     */
        hash: function(str) {

            switch (this.hashFn.toLowerCase()) {

            case 'sha-256':
                var s = sjcl.codec.hex.fromBits(
                    sjcl.hash.sha256.hash(str));
                return this.nZeros(64 - s.length) + s;

            case 'sha-1':
            default:
                return sha1.calcSHA1(str);

            }
        },

        /*
     * Hexadecimal hashing function.
     */
        hexHash: function(str) {
            switch (this.hashFn.toLowerCase()) {

            case 'sha-256':
                var s = sjcl.codec.hex.fromBits(
                    sjcl.hash.sha256.hash(
                        sjcl.codec.hex.toBits(str)));
                return this.nZeros(64 - s.length) + s;

            case 'sha-1':
            default:
                return this.hash(this.pack(str));

            }
        },

        /*
     * Hex to string conversion.
     */
        pack: function(hex) {

            // To prevent null byte termination bug
            if (hex.length % 2 != 0) hex = '0' + hex;

            i = 0;
            ascii = '';

            while (i < hex.length / 2) {
                ascii = ascii + String.fromCharCode(
                    parseInt(hex.substr(i * 2, 2), 16));
                i++;
            }

            return ascii;

        },

        /* Return a string with N zeros. */
        nZeros: function(n) {

            if (n < 1) return '';
            var t = this.nZeros(n >> 1);

            return ((n & 1) == 0) ?
                t + t : t + t + '0';

        },

        /*
     * SRP group parameters, composed of N (hexadecimal
     * prime value) and g (decimal group generator).
     * See http://tools.ietf.org/html/rfc5054#appendix-A
     */
        initVals: {
            1024: {
                N: 'EEAF0AB9ADB38DD69C33F80AFA8FC5E86072618775FF3C0B9EA2314C' +
                    '9C256576D674DF7496EA81D3383B4813D692C6E0E0D5D8E250B98BE4' +
                    '8E495C1D6089DAD15DC7D7B46154D6B6CE8EF4AD69B15D4982559B29' +
                    '7BCF1885C529F566660E57EC68EDBC3C05726CC02FD4CBF4976EAA9A' +
                    'FD5138FE8376435B9FC61D2FC0EB06E3',
                g: '2'

            },

            1536: {
                N: '9DEF3CAFB939277AB1F12A8617A47BBBDBA51DF499AC4C80BEEEA961' +
                    '4B19CC4D5F4F5F556E27CBDE51C6A94BE4607A291558903BA0D0F843' +
                    '80B655BB9A22E8DCDF028A7CEC67F0D08134B1C8B97989149B609E0B' +
                    'E3BAB63D47548381DBC5B1FC764E3F4B53DD9DA1158BFD3E2B9C8CF5' +
                    '6EDF019539349627DB2FD53D24B7C48665772E437D6C7F8CE442734A' +
                    'F7CCB7AE837C264AE3A9BEB87F8A2FE9B8B5292E5A021FFF5E91479E' +
                    '8CE7A28C2442C6F315180F93499A234DCF76E3FED135F9BB',
                g: '2'
            },

            2048: {
                N: 'AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC319294' +
                    '3DB56050A37329CBB4A099ED8193E0757767A13DD52312AB4B03310D' +
                    'CD7F48A9DA04FD50E8083969EDB767B0CF6095179A163AB3661A05FB' +
                    'D5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF74' +
                    '7359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A' +
                    '436C6481F1D2B9078717461A5B9D32E688F87748544523B524B0D57D' +
                    '5EA77A2775D2ECFA032CFBDBF52FB3786160279004E57AE6AF874E73' +
                    '03CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DBFBB6' +
                    '94B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F' +
                    '9E4AFF73',
                g: '2'
            },

            3072: {
                N: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08' +
                    '8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B' +
                    '302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9' +
                    'A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6' +
                    '49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8' +
                    'FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
                    '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C' +
                    '180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718' +
                    '3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D' +
                    '04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D' +
                    'B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226' +
                    '1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
                    'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC' +
                    'E0FD108E4B82D120A93AD2CAFFFFFFFFFFFFFFFF',
                g: '5'
            },

            4096: {
                N: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08' +
                    '8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B' +
                    '302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9' +
                    'A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6' +
                    '49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8' +
                    'FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
                    '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C' +
                    '180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718' +
                    '3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D' +
                    '04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D' +
                    'B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226' +
                    '1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
                    'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC' +
                    'E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26' +
                    '99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB' +
                    '04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2' +
                    '233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127' +
                    'D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934063199' +
                    'FFFFFFFFFFFFFFFF',
                g: '5'
            },

            6144: {
                N: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08' +
                    '8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B' +
                    '302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9' +
                    'A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6' +
                    '49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8' +
                    'FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
                    '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C' +
                    '180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718' +
                    '3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D' +
                    '04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D' +
                    'B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226' +
                    '1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
                    'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC' +
                    'E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26' +
                    '99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB' +
                    '04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2' +
                    '233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127' +
                    'D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934028492' +
                    '36C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406' +
                    'AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918' +
                    'DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B33205151' +
                    '2BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03' +
                    'F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97F' +
                    'BEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AA' +
                    'CC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58B' +
                    'B7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632' +
                    '387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E' +
                    '6DCC4024FFFFFFFFFFFFFFFF',
                g: '5'
            },

            8192: {
                N: 'FFFFFFFFFFFFFFFFC90FDAA22168C234C4C6628B80DC1CD129024E08' +
                    '8A67CC74020BBEA63B139B22514A08798E3404DDEF9519B3CD3A431B' +
                    '302B0A6DF25F14374FE1356D6D51C245E485B576625E7EC6F44C42E9' +
                    'A637ED6B0BFF5CB6F406B7EDEE386BFB5A899FA5AE9F24117C4B1FE6' +
                    '49286651ECE45B3DC2007CB8A163BF0598DA48361C55D39A69163FA8' +
                    'FD24CF5F83655D23DCA3AD961C62F356208552BB9ED529077096966D' +
                    '670C354E4ABC9804F1746C08CA18217C32905E462E36CE3BE39E772C' +
                    '180E86039B2783A2EC07A28FB5C55DF06F4C52C9DE2BCBF695581718' +
                    '3995497CEA956AE515D2261898FA051015728E5A8AAAC42DAD33170D' +
                    '04507A33A85521ABDF1CBA64ECFB850458DBEF0A8AEA71575D060C7D' +
                    'B3970F85A6E1E4C7ABF5AE8CDB0933D71E8C94E04A25619DCEE3D226' +
                    '1AD2EE6BF12FFA06D98A0864D87602733EC86A64521F2B18177B200C' +
                    'BBE117577A615D6C770988C0BAD946E208E24FA074E5AB3143DB5BFC' +
                    'E0FD108E4B82D120A92108011A723C12A787E6D788719A10BDBA5B26' +
                    '99C327186AF4E23C1A946834B6150BDA2583E9CA2AD44CE8DBBBC2DB' +
                    '04DE8EF92E8EFC141FBECAA6287C59474E6BC05D99B2964FA090C3A2' +
                    '233BA186515BE7ED1F612970CEE2D7AFB81BDD762170481CD0069127' +
                    'D5B05AA993B4EA988D8FDDC186FFB7DC90A6C08F4DF435C934028492' +
                    '36C3FAB4D27C7026C1D4DCB2602646DEC9751E763DBA37BDF8FF9406' +
                    'AD9E530EE5DB382F413001AEB06A53ED9027D831179727B0865A8918' +
                    'DA3EDBEBCF9B14ED44CE6CBACED4BB1BDB7F1447E6CC254B33205151' +
                    '2BD7AF426FB8F401378CD2BF5983CA01C64B92ECF032EA15D1721D03' +
                    'F482D7CE6E74FEF6D55E702F46980C82B5A84031900B1C9E59E7C97F' +
                    'BEC7E8F323A97A7E36CC88BE0F1D45B7FF585AC54BD407B22B4154AA' +
                    'CC8F6D7EBF48E1D814CC5ED20F8037E0A79715EEF29BE32806A1D58B' +
                    'B7C5DA76F550AA3D8A1FBFF0EB19CCB1A313D55CDA56C9EC2EF29632' +
                    '387FE8D76E3C0468043E8F663F4860EE12BF2D5B0B7474D6E694F91E' +
                    '6DBE115974A3926F12FEE5E438777CB6A932DF8CD8BEC4D073B931BA' +
                    '3BC832B68D9DD300741FA7BF8AFC47ED2576F6936BA424663AAB639C' +
                    '5AE4F5683423B4742BF1C978238F16CBE39D652DE3FDB8BEFC848AD9' +
                    '22222E04A4037C0713EB57A81A23F0C73473FC646CEA306B4BCBC886' +
                    '2F8385DDFA9D4B7FA2C087E879683303ED5BDD3A062B3CF5B3A278A6' +
                    '6D2A13F83F44F82DDF310EE074AB6A364597E899A0255DC164F31CC5' +
                    '0846851DF9AB48195DED7EA1B1D510BD7EE74D73FAF36BC31ECFA268' +
                    '359046F4EB879F924009438B481C6CD7889A002ED5EE382BC9190DA6' +
                    'FC026E479558E4475677E9AA9E3050E2765694DFC81F56E880B96E71' +
                    '60C980DD98EDD3DFFFFFFFFFFFFFFFFF',
                g: '19'
            }

        },

        /*
     * Server-side SRP functions. These should not
     * be used on the client except for debugging.
     */

        /* Calculate the server's public value B. */
        calculateB: function(b, v) {

            // Verify presence of parameters.
            if (!b || !v) throw 'Missing parameters.';

            var bb = this.g.modPow(b, this.N);
            var B = bb.add(v.multiply(this.k)).mod(this.N);

            return B;

        },

        /* Calculate the server's premaster secret */
        calculateServerS: function(A, v, u, B) {

            // Verify presence of parameters.
            if (!A || !v || !u || !B)
                throw 'Missing parameters.';

            // Verify value of A and B.
            if (A.mod(this.N).toString() == '0' ||
                B.mod(this.N).toString() == '0')
                throw 'ABORT: illegal_parameter';

            return v.modPow(u, this.N).multiply(A)
                .mod(this.N).modPow(B, this.N);
        }

    };

    return SRPClient;
});

/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.0.2
 */

;(function() {
    "use strict";
    function lib$es6$promise$utils$$objectOrFunction(x) {
      return typeof x === 'function' || (typeof x === 'object' && x !== null);
    }

    function lib$es6$promise$utils$$isFunction(x) {
      return typeof x === 'function';
    }

    function lib$es6$promise$utils$$isMaybeThenable(x) {
      return typeof x === 'object' && x !== null;
    }

    var lib$es6$promise$utils$$_isArray;
    if (!Array.isArray) {
      lib$es6$promise$utils$$_isArray = function (x) {
        return Object.prototype.toString.call(x) === '[object Array]';
      };
    } else {
      lib$es6$promise$utils$$_isArray = Array.isArray;
    }

    var lib$es6$promise$utils$$isArray = lib$es6$promise$utils$$_isArray;
    var lib$es6$promise$asap$$len = 0;
    var lib$es6$promise$asap$$toString = {}.toString;
    var lib$es6$promise$asap$$vertxNext;
    var lib$es6$promise$asap$$customSchedulerFn;

    var lib$es6$promise$asap$$asap = function asap(callback, arg) {
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len] = callback;
      lib$es6$promise$asap$$queue[lib$es6$promise$asap$$len + 1] = arg;
      lib$es6$promise$asap$$len += 2;
      if (lib$es6$promise$asap$$len === 2) {
        // If len is 2, that means that we need to schedule an async flush.
        // If additional callbacks are queued before the queue is flushed, they
        // will be processed by this flush that we are scheduling.
        if (lib$es6$promise$asap$$customSchedulerFn) {
          lib$es6$promise$asap$$customSchedulerFn(lib$es6$promise$asap$$flush);
        } else {
          lib$es6$promise$asap$$scheduleFlush();
        }
      }
    }

    function lib$es6$promise$asap$$setScheduler(scheduleFn) {
      lib$es6$promise$asap$$customSchedulerFn = scheduleFn;
    }

    function lib$es6$promise$asap$$setAsap(asapFn) {
      lib$es6$promise$asap$$asap = asapFn;
    }

    var lib$es6$promise$asap$$browserWindow = (typeof window !== 'undefined') ? window : undefined;
    var lib$es6$promise$asap$$browserGlobal = lib$es6$promise$asap$$browserWindow || {};
    var lib$es6$promise$asap$$BrowserMutationObserver = lib$es6$promise$asap$$browserGlobal.MutationObserver || lib$es6$promise$asap$$browserGlobal.WebKitMutationObserver;
    var lib$es6$promise$asap$$isNode = typeof process !== 'undefined' && {}.toString.call(process) === '[object process]';

    // test for web worker but not in IE10
    var lib$es6$promise$asap$$isWorker = typeof Uint8ClampedArray !== 'undefined' &&
      typeof importScripts !== 'undefined' &&
      typeof MessageChannel !== 'undefined';

    // node
    function lib$es6$promise$asap$$useNextTick() {
      // node version 0.10.x displays a deprecation warning when nextTick is used recursively
      // see https://github.com/cujojs/when/issues/410 for details
      return function() {
        process.nextTick(lib$es6$promise$asap$$flush);
      };
    }

    // vertx
    function lib$es6$promise$asap$$useVertxTimer() {
      return function() {
        lib$es6$promise$asap$$vertxNext(lib$es6$promise$asap$$flush);
      };
    }

    function lib$es6$promise$asap$$useMutationObserver() {
      var iterations = 0;
      var observer = new lib$es6$promise$asap$$BrowserMutationObserver(lib$es6$promise$asap$$flush);
      var node = document.createTextNode('');
      observer.observe(node, { characterData: true });

      return function() {
        node.data = (iterations = ++iterations % 2);
      };
    }

    // web worker
    function lib$es6$promise$asap$$useMessageChannel() {
      var channel = new MessageChannel();
      channel.port1.onmessage = lib$es6$promise$asap$$flush;
      return function () {
        channel.port2.postMessage(0);
      };
    }

    function lib$es6$promise$asap$$useSetTimeout() {
      return function() {
        setTimeout(lib$es6$promise$asap$$flush, 1);
      };
    }

    var lib$es6$promise$asap$$queue = new Array(1000);
    function lib$es6$promise$asap$$flush() {
      for (var i = 0; i < lib$es6$promise$asap$$len; i+=2) {
        var callback = lib$es6$promise$asap$$queue[i];
        var arg = lib$es6$promise$asap$$queue[i+1];

        callback(arg);

        lib$es6$promise$asap$$queue[i] = undefined;
        lib$es6$promise$asap$$queue[i+1] = undefined;
      }

      lib$es6$promise$asap$$len = 0;
    }

    function lib$es6$promise$asap$$attemptVertx() {
      try {
        var r = require;
        var vertx = r('vertx');
        lib$es6$promise$asap$$vertxNext = vertx.runOnLoop || vertx.runOnContext;
        return lib$es6$promise$asap$$useVertxTimer();
      } catch(e) {
        return lib$es6$promise$asap$$useSetTimeout();
      }
    }

    var lib$es6$promise$asap$$scheduleFlush;
    // Decide what async method to use to triggering processing of queued callbacks:
    if (lib$es6$promise$asap$$isNode) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useNextTick();
    } else if (lib$es6$promise$asap$$BrowserMutationObserver) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMutationObserver();
    } else if (lib$es6$promise$asap$$isWorker) {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useMessageChannel();
    } else if (lib$es6$promise$asap$$browserWindow === undefined && typeof require === 'function') {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$attemptVertx();
    } else {
      lib$es6$promise$asap$$scheduleFlush = lib$es6$promise$asap$$useSetTimeout();
    }

    function lib$es6$promise$$internal$$noop() {}

    var lib$es6$promise$$internal$$PENDING   = void 0;
    var lib$es6$promise$$internal$$FULFILLED = 1;
    var lib$es6$promise$$internal$$REJECTED  = 2;

    var lib$es6$promise$$internal$$GET_THEN_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$selfFulfillment() {
      return new TypeError("You cannot resolve a promise with itself");
    }

    function lib$es6$promise$$internal$$cannotReturnOwn() {
      return new TypeError('A promises callback cannot return that same promise.');
    }

    function lib$es6$promise$$internal$$getThen(promise) {
      try {
        return promise.then;
      } catch(error) {
        lib$es6$promise$$internal$$GET_THEN_ERROR.error = error;
        return lib$es6$promise$$internal$$GET_THEN_ERROR;
      }
    }

    function lib$es6$promise$$internal$$tryThen(then, value, fulfillmentHandler, rejectionHandler) {
      try {
        then.call(value, fulfillmentHandler, rejectionHandler);
      } catch(e) {
        return e;
      }
    }

    function lib$es6$promise$$internal$$handleForeignThenable(promise, thenable, then) {
       lib$es6$promise$asap$$asap(function(promise) {
        var sealed = false;
        var error = lib$es6$promise$$internal$$tryThen(then, thenable, function(value) {
          if (sealed) { return; }
          sealed = true;
          if (thenable !== value) {
            lib$es6$promise$$internal$$resolve(promise, value);
          } else {
            lib$es6$promise$$internal$$fulfill(promise, value);
          }
        }, function(reason) {
          if (sealed) { return; }
          sealed = true;

          lib$es6$promise$$internal$$reject(promise, reason);
        }, 'Settle: ' + (promise._label || ' unknown promise'));

        if (!sealed && error) {
          sealed = true;
          lib$es6$promise$$internal$$reject(promise, error);
        }
      }, promise);
    }

    function lib$es6$promise$$internal$$handleOwnThenable(promise, thenable) {
      if (thenable._state === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, thenable._result);
      } else if (thenable._state === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, thenable._result);
      } else {
        lib$es6$promise$$internal$$subscribe(thenable, undefined, function(value) {
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      }
    }

    function lib$es6$promise$$internal$$handleMaybeThenable(promise, maybeThenable) {
      if (maybeThenable.constructor === promise.constructor) {
        lib$es6$promise$$internal$$handleOwnThenable(promise, maybeThenable);
      } else {
        var then = lib$es6$promise$$internal$$getThen(maybeThenable);

        if (then === lib$es6$promise$$internal$$GET_THEN_ERROR) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$GET_THEN_ERROR.error);
        } else if (then === undefined) {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        } else if (lib$es6$promise$utils$$isFunction(then)) {
          lib$es6$promise$$internal$$handleForeignThenable(promise, maybeThenable, then);
        } else {
          lib$es6$promise$$internal$$fulfill(promise, maybeThenable);
        }
      }
    }

    function lib$es6$promise$$internal$$resolve(promise, value) {
      if (promise === value) {
        lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$selfFulfillment());
      } else if (lib$es6$promise$utils$$objectOrFunction(value)) {
        lib$es6$promise$$internal$$handleMaybeThenable(promise, value);
      } else {
        lib$es6$promise$$internal$$fulfill(promise, value);
      }
    }

    function lib$es6$promise$$internal$$publishRejection(promise) {
      if (promise._onerror) {
        promise._onerror(promise._result);
      }

      lib$es6$promise$$internal$$publish(promise);
    }

    function lib$es6$promise$$internal$$fulfill(promise, value) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }

      promise._result = value;
      promise._state = lib$es6$promise$$internal$$FULFILLED;

      if (promise._subscribers.length !== 0) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, promise);
      }
    }

    function lib$es6$promise$$internal$$reject(promise, reason) {
      if (promise._state !== lib$es6$promise$$internal$$PENDING) { return; }
      promise._state = lib$es6$promise$$internal$$REJECTED;
      promise._result = reason;

      lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publishRejection, promise);
    }

    function lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection) {
      var subscribers = parent._subscribers;
      var length = subscribers.length;

      parent._onerror = null;

      subscribers[length] = child;
      subscribers[length + lib$es6$promise$$internal$$FULFILLED] = onFulfillment;
      subscribers[length + lib$es6$promise$$internal$$REJECTED]  = onRejection;

      if (length === 0 && parent._state) {
        lib$es6$promise$asap$$asap(lib$es6$promise$$internal$$publish, parent);
      }
    }

    function lib$es6$promise$$internal$$publish(promise) {
      var subscribers = promise._subscribers;
      var settled = promise._state;

      if (subscribers.length === 0) { return; }

      var child, callback, detail = promise._result;

      for (var i = 0; i < subscribers.length; i += 3) {
        child = subscribers[i];
        callback = subscribers[i + settled];

        if (child) {
          lib$es6$promise$$internal$$invokeCallback(settled, child, callback, detail);
        } else {
          callback(detail);
        }
      }

      promise._subscribers.length = 0;
    }

    function lib$es6$promise$$internal$$ErrorObject() {
      this.error = null;
    }

    var lib$es6$promise$$internal$$TRY_CATCH_ERROR = new lib$es6$promise$$internal$$ErrorObject();

    function lib$es6$promise$$internal$$tryCatch(callback, detail) {
      try {
        return callback(detail);
      } catch(e) {
        lib$es6$promise$$internal$$TRY_CATCH_ERROR.error = e;
        return lib$es6$promise$$internal$$TRY_CATCH_ERROR;
      }
    }

    function lib$es6$promise$$internal$$invokeCallback(settled, promise, callback, detail) {
      var hasCallback = lib$es6$promise$utils$$isFunction(callback),
          value, error, succeeded, failed;

      if (hasCallback) {
        value = lib$es6$promise$$internal$$tryCatch(callback, detail);

        if (value === lib$es6$promise$$internal$$TRY_CATCH_ERROR) {
          failed = true;
          error = value.error;
          value = null;
        } else {
          succeeded = true;
        }

        if (promise === value) {
          lib$es6$promise$$internal$$reject(promise, lib$es6$promise$$internal$$cannotReturnOwn());
          return;
        }

      } else {
        value = detail;
        succeeded = true;
      }

      if (promise._state !== lib$es6$promise$$internal$$PENDING) {
        // noop
      } else if (hasCallback && succeeded) {
        lib$es6$promise$$internal$$resolve(promise, value);
      } else if (failed) {
        lib$es6$promise$$internal$$reject(promise, error);
      } else if (settled === lib$es6$promise$$internal$$FULFILLED) {
        lib$es6$promise$$internal$$fulfill(promise, value);
      } else if (settled === lib$es6$promise$$internal$$REJECTED) {
        lib$es6$promise$$internal$$reject(promise, value);
      }
    }

    function lib$es6$promise$$internal$$initializePromise(promise, resolver) {
      try {
        resolver(function resolvePromise(value){
          lib$es6$promise$$internal$$resolve(promise, value);
        }, function rejectPromise(reason) {
          lib$es6$promise$$internal$$reject(promise, reason);
        });
      } catch(e) {
        lib$es6$promise$$internal$$reject(promise, e);
      }
    }

    function lib$es6$promise$enumerator$$Enumerator(Constructor, input) {
      var enumerator = this;

      enumerator._instanceConstructor = Constructor;
      enumerator.promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (enumerator._validateInput(input)) {
        enumerator._input     = input;
        enumerator.length     = input.length;
        enumerator._remaining = input.length;

        enumerator._init();

        if (enumerator.length === 0) {
          lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
        } else {
          enumerator.length = enumerator.length || 0;
          enumerator._enumerate();
          if (enumerator._remaining === 0) {
            lib$es6$promise$$internal$$fulfill(enumerator.promise, enumerator._result);
          }
        }
      } else {
        lib$es6$promise$$internal$$reject(enumerator.promise, enumerator._validationError());
      }
    }

    lib$es6$promise$enumerator$$Enumerator.prototype._validateInput = function(input) {
      return lib$es6$promise$utils$$isArray(input);
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._validationError = function() {
      return new Error('Array Methods must be provided an Array');
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._init = function() {
      this._result = new Array(this.length);
    };

    var lib$es6$promise$enumerator$$default = lib$es6$promise$enumerator$$Enumerator;

    lib$es6$promise$enumerator$$Enumerator.prototype._enumerate = function() {
      var enumerator = this;

      var length  = enumerator.length;
      var promise = enumerator.promise;
      var input   = enumerator._input;

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        enumerator._eachEntry(input[i], i);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._eachEntry = function(entry, i) {
      var enumerator = this;
      var c = enumerator._instanceConstructor;

      if (lib$es6$promise$utils$$isMaybeThenable(entry)) {
        if (entry.constructor === c && entry._state !== lib$es6$promise$$internal$$PENDING) {
          entry._onerror = null;
          enumerator._settledAt(entry._state, i, entry._result);
        } else {
          enumerator._willSettleAt(c.resolve(entry), i);
        }
      } else {
        enumerator._remaining--;
        enumerator._result[i] = entry;
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._settledAt = function(state, i, value) {
      var enumerator = this;
      var promise = enumerator.promise;

      if (promise._state === lib$es6$promise$$internal$$PENDING) {
        enumerator._remaining--;

        if (state === lib$es6$promise$$internal$$REJECTED) {
          lib$es6$promise$$internal$$reject(promise, value);
        } else {
          enumerator._result[i] = value;
        }
      }

      if (enumerator._remaining === 0) {
        lib$es6$promise$$internal$$fulfill(promise, enumerator._result);
      }
    };

    lib$es6$promise$enumerator$$Enumerator.prototype._willSettleAt = function(promise, i) {
      var enumerator = this;

      lib$es6$promise$$internal$$subscribe(promise, undefined, function(value) {
        enumerator._settledAt(lib$es6$promise$$internal$$FULFILLED, i, value);
      }, function(reason) {
        enumerator._settledAt(lib$es6$promise$$internal$$REJECTED, i, reason);
      });
    };
    function lib$es6$promise$promise$all$$all(entries) {
      return new lib$es6$promise$enumerator$$default(this, entries).promise;
    }
    var lib$es6$promise$promise$all$$default = lib$es6$promise$promise$all$$all;
    function lib$es6$promise$promise$race$$race(entries) {
      /*jshint validthis:true */
      var Constructor = this;

      var promise = new Constructor(lib$es6$promise$$internal$$noop);

      if (!lib$es6$promise$utils$$isArray(entries)) {
        lib$es6$promise$$internal$$reject(promise, new TypeError('You must pass an array to race.'));
        return promise;
      }

      var length = entries.length;

      function onFulfillment(value) {
        lib$es6$promise$$internal$$resolve(promise, value);
      }

      function onRejection(reason) {
        lib$es6$promise$$internal$$reject(promise, reason);
      }

      for (var i = 0; promise._state === lib$es6$promise$$internal$$PENDING && i < length; i++) {
        lib$es6$promise$$internal$$subscribe(Constructor.resolve(entries[i]), undefined, onFulfillment, onRejection);
      }

      return promise;
    }
    var lib$es6$promise$promise$race$$default = lib$es6$promise$promise$race$$race;
    function lib$es6$promise$promise$resolve$$resolve(object) {
      /*jshint validthis:true */
      var Constructor = this;

      if (object && typeof object === 'object' && object.constructor === Constructor) {
        return object;
      }

      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$resolve(promise, object);
      return promise;
    }
    var lib$es6$promise$promise$resolve$$default = lib$es6$promise$promise$resolve$$resolve;
    function lib$es6$promise$promise$reject$$reject(reason) {
      /*jshint validthis:true */
      var Constructor = this;
      var promise = new Constructor(lib$es6$promise$$internal$$noop);
      lib$es6$promise$$internal$$reject(promise, reason);
      return promise;
    }
    var lib$es6$promise$promise$reject$$default = lib$es6$promise$promise$reject$$reject;

    var lib$es6$promise$promise$$counter = 0;

    function lib$es6$promise$promise$$needsResolver() {
      throw new TypeError('You must pass a resolver function as the first argument to the promise constructor');
    }

    function lib$es6$promise$promise$$needsNew() {
      throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
    }

    var lib$es6$promise$promise$$default = lib$es6$promise$promise$$Promise;
    /**
      Promise objects represent the eventual result of an asynchronous operation. The
      primary way of interacting with a promise is through its `then` method, which
      registers callbacks to receive either a promise's eventual value or the reason
      why the promise cannot be fulfilled.

      Terminology
      -----------

      - `promise` is an object or function with a `then` method whose behavior conforms to this specification.
      - `thenable` is an object or function that defines a `then` method.
      - `value` is any legal JavaScript value (including undefined, a thenable, or a promise).
      - `exception` is a value that is thrown using the throw statement.
      - `reason` is a value that indicates why a promise was rejected.
      - `settled` the final resting state of a promise, fulfilled or rejected.

      A promise can be in one of three states: pending, fulfilled, or rejected.

      Promises that are fulfilled have a fulfillment value and are in the fulfilled
      state.  Promises that are rejected have a rejection reason and are in the
      rejected state.  A fulfillment value is never a thenable.

      Promises can also be said to *resolve* a value.  If this value is also a
      promise, then the original promise's settled state will match the value's
      settled state.  So a promise that *resolves* a promise that rejects will
      itself reject, and a promise that *resolves* a promise that fulfills will
      itself fulfill.


      Basic Usage:
      ------------

      ```js
      var promise = new Promise(function(resolve, reject) {
        // on success
        resolve(value);

        // on failure
        reject(reason);
      });

      promise.then(function(value) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Advanced Usage:
      ---------------

      Promises shine when abstracting away asynchronous interactions such as
      `XMLHttpRequest`s.

      ```js
      function getJSON(url) {
        return new Promise(function(resolve, reject){
          var xhr = new XMLHttpRequest();

          xhr.open('GET', url);
          xhr.onreadystatechange = handler;
          xhr.responseType = 'json';
          xhr.setRequestHeader('Accept', 'application/json');
          xhr.send();

          function handler() {
            if (this.readyState === this.DONE) {
              if (this.status === 200) {
                resolve(this.response);
              } else {
                reject(new Error('getJSON: `' + url + '` failed with status: [' + this.status + ']'));
              }
            }
          };
        });
      }

      getJSON('/posts.json').then(function(json) {
        // on fulfillment
      }, function(reason) {
        // on rejection
      });
      ```

      Unlike callbacks, promises are great composable primitives.

      ```js
      Promise.all([
        getJSON('/posts'),
        getJSON('/comments')
      ]).then(function(values){
        values[0] // => postsJSON
        values[1] // => commentsJSON

        return values;
      });
      ```

      @class Promise
      @param {function} resolver
      Useful for tooling.
      @constructor
    */
    function lib$es6$promise$promise$$Promise(resolver) {
      this._id = lib$es6$promise$promise$$counter++;
      this._state = undefined;
      this._result = undefined;
      this._subscribers = [];

      if (lib$es6$promise$$internal$$noop !== resolver) {
        if (!lib$es6$promise$utils$$isFunction(resolver)) {
          lib$es6$promise$promise$$needsResolver();
        }

        if (!(this instanceof lib$es6$promise$promise$$Promise)) {
          lib$es6$promise$promise$$needsNew();
        }

        lib$es6$promise$$internal$$initializePromise(this, resolver);
      }
    }

    lib$es6$promise$promise$$Promise.all = lib$es6$promise$promise$all$$default;
    lib$es6$promise$promise$$Promise.race = lib$es6$promise$promise$race$$default;
    lib$es6$promise$promise$$Promise.resolve = lib$es6$promise$promise$resolve$$default;
    lib$es6$promise$promise$$Promise.reject = lib$es6$promise$promise$reject$$default;
    lib$es6$promise$promise$$Promise._setScheduler = lib$es6$promise$asap$$setScheduler;
    lib$es6$promise$promise$$Promise._setAsap = lib$es6$promise$asap$$setAsap;
    lib$es6$promise$promise$$Promise._asap = lib$es6$promise$asap$$asap;

    lib$es6$promise$promise$$Promise.prototype = {
      constructor: lib$es6$promise$promise$$Promise,

    /**
      The primary way of interacting with a promise is through its `then` method,
      which registers callbacks to receive either a promise's eventual value or the
      reason why the promise cannot be fulfilled.

      ```js
      findUser().then(function(user){
        // user is available
      }, function(reason){
        // user is unavailable, and you are given the reason why
      });
      ```

      Chaining
      --------

      The return value of `then` is itself a promise.  This second, 'downstream'
      promise is resolved with the return value of the first promise's fulfillment
      or rejection handler, or rejected if the handler throws an exception.

      ```js
      findUser().then(function (user) {
        return user.name;
      }, function (reason) {
        return 'default name';
      }).then(function (userName) {
        // If `findUser` fulfilled, `userName` will be the user's name, otherwise it
        // will be `'default name'`
      });

      findUser().then(function (user) {
        throw new Error('Found user, but still unhappy');
      }, function (reason) {
        throw new Error('`findUser` rejected and we're unhappy');
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // if `findUser` fulfilled, `reason` will be 'Found user, but still unhappy'.
        // If `findUser` rejected, `reason` will be '`findUser` rejected and we're unhappy'.
      });
      ```
      If the downstream promise does not specify a rejection handler, rejection reasons will be propagated further downstream.

      ```js
      findUser().then(function (user) {
        throw new PedagogicalException('Upstream error');
      }).then(function (value) {
        // never reached
      }).then(function (value) {
        // never reached
      }, function (reason) {
        // The `PedgagocialException` is propagated all the way down to here
      });
      ```

      Assimilation
      ------------

      Sometimes the value you want to propagate to a downstream promise can only be
      retrieved asynchronously. This can be achieved by returning a promise in the
      fulfillment or rejection handler. The downstream promise will then be pending
      until the returned promise is settled. This is called *assimilation*.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // The user's comments are now available
      });
      ```

      If the assimliated promise rejects, then the downstream promise will also reject.

      ```js
      findUser().then(function (user) {
        return findCommentsByAuthor(user);
      }).then(function (comments) {
        // If `findCommentsByAuthor` fulfills, we'll have the value here
      }, function (reason) {
        // If `findCommentsByAuthor` rejects, we'll have the reason here
      });
      ```

      Simple Example
      --------------

      Synchronous Example

      ```javascript
      var result;

      try {
        result = findResult();
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js
      findResult(function(result, err){
        if (err) {
          // failure
        } else {
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findResult().then(function(result){
        // success
      }, function(reason){
        // failure
      });
      ```

      Advanced Example
      --------------

      Synchronous Example

      ```javascript
      var author, books;

      try {
        author = findAuthor();
        books  = findBooksByAuthor(author);
        // success
      } catch(reason) {
        // failure
      }
      ```

      Errback Example

      ```js

      function foundBooks(books) {

      }

      function failure(reason) {

      }

      findAuthor(function(author, err){
        if (err) {
          failure(err);
          // failure
        } else {
          try {
            findBoooksByAuthor(author, function(books, err) {
              if (err) {
                failure(err);
              } else {
                try {
                  foundBooks(books);
                } catch(reason) {
                  failure(reason);
                }
              }
            });
          } catch(error) {
            failure(err);
          }
          // success
        }
      });
      ```

      Promise Example;

      ```javascript
      findAuthor().
        then(findBooksByAuthor).
        then(function(books){
          // found books
      }).catch(function(reason){
        // something went wrong
      });
      ```

      @method then
      @param {Function} onFulfilled
      @param {Function} onRejected
      Useful for tooling.
      @return {Promise}
    */
      then: function(onFulfillment, onRejection) {
        var parent = this;
        var state = parent._state;

        if (state === lib$es6$promise$$internal$$FULFILLED && !onFulfillment || state === lib$es6$promise$$internal$$REJECTED && !onRejection) {
          return this;
        }

        var child = new this.constructor(lib$es6$promise$$internal$$noop);
        var result = parent._result;

        if (state) {
          var callback = arguments[state - 1];
          lib$es6$promise$asap$$asap(function(){
            lib$es6$promise$$internal$$invokeCallback(state, child, callback, result);
          });
        } else {
          lib$es6$promise$$internal$$subscribe(parent, child, onFulfillment, onRejection);
        }

        return child;
      },

    /**
      `catch` is simply sugar for `then(undefined, onRejection)` which makes it the same
      as the catch block of a try/catch statement.

      ```js
      function findAuthor(){
        throw new Error('couldn't find that author');
      }

      // synchronous
      try {
        findAuthor();
      } catch(reason) {
        // something went wrong
      }

      // async with promises
      findAuthor().catch(function(reason){
        // something went wrong
      });
      ```

      @method catch
      @param {Function} onRejection
      Useful for tooling.
      @return {Promise}
    */
      'catch': function(onRejection) {
        return this.then(null, onRejection);
      }
    };
    function lib$es6$promise$polyfill$$polyfill() {
      var local;

      if (typeof global !== 'undefined') {
          local = global;
      } else if (typeof self !== 'undefined') {
          local = self;
      } else {
          try {
              local = Function('return this')();
          } catch (e) {
              throw new Error('polyfill failed because global object is unavailable in this environment');
          }
      }

      var P = local.Promise;

      if (P && Object.prototype.toString.call(P.resolve()) === '[object Promise]' && !P.cast) {
        return;
      }

      local.Promise = lib$es6$promise$promise$$default;
    }
    var lib$es6$promise$polyfill$$default = lib$es6$promise$polyfill$$polyfill;

    var lib$es6$promise$umd$$ES6Promise = {
      'Promise': lib$es6$promise$promise$$default,
      'polyfill': lib$es6$promise$polyfill$$default
    };

    /* global define:true module:true window: true */
    if (typeof define === 'function' && define['amd']) {
        define('ES6Promise',function() { return lib$es6$promise$umd$$ES6Promise; });
    } else if (typeof module !== 'undefined' && module['exports']) {
      module['exports'] = lib$es6$promise$umd$$ES6Promise;
    } else if (typeof this !== 'undefined') {
      this['ES6Promise'] = lib$es6$promise$umd$$ES6Promise;
    }

    lib$es6$promise$polyfill$$default();
}).call(this);


; (function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore', [], factory);
    } else {
        window.WebSdkCore = factory();
    }
})(function () {
    var WebSdk = {
        Promise: null,      // allows passing custom implementation of promises,
        debug: false,       // if true browser console will be used to output debug messages
        version: 4
    };

    var WebSdkEncryptionSupport = {
        None: 1,
        Encoding: 2,
        Encryption: 3,
        AESEncryption: 4
    };

    var WebSdkDataSupport = {
        Binary: 1,
        String: 2
    };

    var core = {
        WebSdk: WebSdk,
        WebSdkEncryptionSupport: WebSdkEncryptionSupport,
        WebSdkDataSupport: WebSdkDataSupport
    };

    core.log = function () {
        if (!core.WebSdk.debug) return;

        if (console.log.apply)
            console.log.apply(console, [].slice.call(arguments));
        else
            console.log(arguments[0]);
    }

    return core;
});
;
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore.utils', [
            'WebSdkCore'
        ], factory);
    } else {
        if (!window.WebSdkCore)
            throw new Error("WebSdkCore is not loaded.");

      window.WebSdkCore.utils = factory(window.WebSdkCore);
    }
})(function (core) {

    function getQueryParam(url, name) {
        var match = RegExp('[?&]' + name + '=([^&]*)').exec(url);
        return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
    }

    function ajax(method, url, data) {
        var promise = new window.Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(method, url, true);
            xhr.responseType = "json";
            xhr.setRequestHeader("Accept", "application/json");
            xhr.onreadystatechange = function onreadystatechange() {
                if (this.readyState === XMLHttpRequest.DONE) {
                    if (this.status === 200) {
                        var data;
                        if (this.responseType === '' && typeof this.responseText === "string")
                            data = JSON.parse(this.responseText);
                        else
                            data = this.response;
                        resolve(data);
                    } else {
                        reject(this);
                    }
                }
            };

            if (method.toLowerCase() === "post" && data) {
                var urlEncodedData = "";
                var urlEncodedDataPairs = [];
                var name;
                for (name in data) {
                    urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
                }
                urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');
                xhr.send(urlEncodedData);
            } else {
                xhr.send();
            }
        });

        return promise;
    }

    function defer(deferred) {
        deferred.promise = new window.Promise(function (resolve, reject) {
            deferred.resolve = resolve;
            deferred.reject = reject;
        });
        return deferred;
    }

    function Deferred() {
        if (this instanceof Deferred) return defer(this);
        else return defer(Object.create(Deferred.prototype));
    }

    function tryParseJson(str) {
        if (!str)
            return null;

        var obj;
        try {
            obj = JSON.parse(str);
        } catch (e) {
            obj = null;
        }
        return obj;
    }

    var FixedQueue = (function () {
        function FixedQueue(maxSize) {
            this.m_items = [];
            this.m_maxSize = maxSize;
        }

        Object.defineProperty(FixedQueue.prototype, "length", {
            get: function () {
                return this.m_items.length;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(FixedQueue.prototype, "items", {
            get: function () {
                return this.m_items;
            },
            enumerable: true,
            configurable: true
        });

        FixedQueue.prototype.trimHead = function () {
            if (this.m_items.length <= this.m_maxSize)
                return;
            Array.prototype.splice.call(this.m_items, 0, this.m_items.length - this.m_maxSize);
        };

        FixedQueue.prototype.trimTail = function () {
            if (this.m_items.length <= this.m_maxSize)
                return;
            Array.prototype.splice.call(this.m_items, this.m_maxSize, this.m_items.length - this.m_maxSize);
        };

        FixedQueue.prototype.push = function () {
            var result = Array.prototype.push.apply(this.m_items, arguments);
            this.trimHead();
            return result;
        };

        FixedQueue.prototype.splice = function () {

            var result = Array.prototype.splice.apply(this.m_items, arguments);
            this.trimTail();
            return result;
        };

        FixedQueue.prototype.unshift = function () {

            var result = Array.prototype.unshift.apply(this.m_items, arguments);
            this.trimTail();
            return result;
        };
        return FixedQueue;
    })();

    return {
        getQueryParam: getQueryParam,
        ajax: ajax,
        tryParseJson: tryParseJson,

        Deferred: Deferred,
        FixedQueue: FixedQueue
    };
});
;(function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore.configurator', [
            'WebSdkCore',
            'WebSdkCore.utils'
        ], factory);
    } else {
        if (!window.WebSdkCore)
            throw new Error("WebSdkCore is not loaded.");

        window.WebSdkCore.configurator = factory(window.WebSdkCore, window.WebSdkCore.utils);
    }
})(function (core, utils) {

    /**
    * Loads configuration parameters from configuration server and saves it in session storage.
    */
    function Configurator() {
        this.m_key = "websdk";

        var sessionData = utils.tryParseJson(sessionStorage.getItem(this.m_key));
        if (sessionData) {
            this.m_port = parseInt(sessionData.port);
            this.m_host = sessionData.host || "127.0.0.1";
            this.m_isSecure = sessionData.isSecure;
            this.m_srp = sessionData.srp;
        }
    }

    Object.defineProperty(Configurator.prototype, "url", {
        get: function () {
            if (!this.m_port || !this.m_host) return null;

            var protocol = this.m_isSecure ? "https" : "http";
            return protocol + "://" + this.m_host + ":" + this.m_port.toString();
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Configurator.prototype, "srp", {
        get: function () {
            return this.m_srp;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(Configurator.prototype, "sessionId", {
        get: function () {
            return sessionStorage.getItem("websdk.sessionId");
        },
        set: function (value) {
            return sessionStorage.setItem("websdk.sessionId", value);
        },
        enumerable: true,
        configurable: true
    });

    Configurator.prototype.ensureLoaded = function (callback) {
        core.log("Configurator: ensureLoaded");

        if (!!this.url && !!this.srp) return callback(null);

        var self = this,
            uri = "https://127.0.0.1:52181/get_connection";

        utils.ajax('get', uri)
            .then(function (response) {
                core.log("Configurator: findConfiguration -> ", response);
                if (response && response.endpoint && self.tryParse(response.endpoint)) {
                    callback(null);
                } else {
                    callback(new Error("Cannot load configuration"));
                }
            })
            .catch(function (err) {
                core.log("Configurator: findConfiguration -> ERROR ", err);
                callback(err);
            });
    };

    Configurator.prototype.tryParse = function (connectionString) {
        core.log("Configurator: tryParse " + connectionString);

        var urlEl = document.createElement("a");
        urlEl.href = connectionString;

        var port = parseInt(utils.getQueryParam(urlEl.search, "web_sdk_port") || ""),
            isSecure = utils.getQueryParam(urlEl.search, "web_sdk_secure") == "true",
            host = urlEl.hostname;

        var p1 = utils.getQueryParam(urlEl.search, "web_sdk_username"),
            p2 = utils.getQueryParam(urlEl.search, "web_sdk_password"),
            salt = utils.getQueryParam(urlEl.search, "web_sdk_salt");

        if (!port || !host || !p1 || !p2 || !salt) return false;

        this.m_port = port;
        this.m_host = host;
        this.m_isSecure = isSecure;
        this.m_srp = {
            p1: p1,
            p2: p2,
            salt: salt
        };

        sessionStorage.setItem(this.m_key, JSON.stringify({
            port: this.m_port,
            host: this.m_host,
            isSecure: this.m_isSecure,
            srp: this.m_srp
        }));

        return true;
    };

    return new Configurator();
});
; (function (factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore.cipher', [
            'WebSdkCore'
        ], factory);
    } else {
        if (!window.WebSdkCore)
            throw new Error("WebSdkCore is not loaded.");

        window.WebSdkCore.cipher = factory(window.WebSdkCore);
    }
})(function (core) {

    var WebSdkAESVersion = 1;

    var WebSdkAESDataType = {
        Binary: 1,
        UnicodeString: 2,
        UTF8String: 3
    };

    var crypt = window.crypto || window.msCrypto;

    function utf8ToBase64(str) {
        var binstr = utf8ToBinaryString(str);
        return btoa(binstr);
    }

    function base64ToUtf8(b64) {
        var binstr = atob(b64);

        return binaryStringToUtf8(binstr);
    }

    function utf8ToBinaryString(str) {
        var escstr = encodeURIComponent(str);
        var binstr = escstr.replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        });

        return binstr;
    }

    function binaryStringToUtf8(binstr) {
        var escstr = binstr.replace(/(.)/g, function (m, p) {
            var code = p.charCodeAt(0).toString(16).toUpperCase();
            if (code.length < 2) {
                code = '0' + code;
            }
            return '%' + code;
        });

        return decodeURIComponent(escstr);
    }

    function keyCharAt(key, i) {
        return key.charCodeAt(Math.floor(i % key.length));
    }

    function xor(key, data) {
        var strArr = Array.prototype.map.call(data, function (x) { return x });
        return strArr.map(function (c, i) {
            return String.fromCharCode(c.charCodeAt(0) ^ keyCharAt(key, i));
        }).join("");
    }

    function getHdr(buf) {
        var dv = new DataView(buf);
        var version = dv.getUint8(0);
        var type = dv.getUint8(1);
        var length = dv.getUint32(2, true);
        var offset = dv.getUint16(6, true);
        return { version: version, type: type, length: length, offset: offset };
    }

    function setHdr(buf, type)
    {
        var dv = new DataView(buf);
        // set version
        dv.setUint8(0, WebSdkAESVersion);
        // set type
        dv.setUint8(1, type);
        // set length
        dv.setUint32(2, buf.byteLength - 8, true);
        // set offset
        dv.setUint16(6, 8, true);
    }

    function ab2str(buf) {

        return new window.Promise(function (resolve, reject) {
            var blob = new Blob([new Uint8Array(buf)]);
            var fileReader = new FileReader();
            fileReader.onload = function (event) {
                return resolve(event.target.result);
            };
            fileReader.onerror = function (event) {
                return reject(event.target.error);
            };
            fileReader.readAsText(blob, 'utf-16');
        });
    }
    function str2ab(str) {
        var buf = new ArrayBuffer(str.length * 2 + 8); // 2 bytes for each char
        setHdr(buf, WebSdkAESDataType.UnicodeString); // unicode string
        var bufView = new Uint16Array(buf, 8);
        for (var i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }
    function binary2ab(bin) {
        var buf = new ArrayBuffer(bin.length + 8); 
        setHdr(buf, WebSdkAESDataType.Binary); // binary string
        var bufSrc = new Uint8Array(bin);
        var bufDest = new Uint8Array(buf, 8);
        bufDest.set(bufSrc);
        return buf;
    }

    // AES encryption wrappers
    // So far we will use AES-CBC 256bit encryption with 128bit IV vector.

    // You can use crypto.generateKey or crypto.importKey,
    // but since I'm always either going to share, store, or receive a key
    // I don't see the point of using 'generateKey' directly
    function generateKey(rawKey) {
        var usages = ['encrypt', 'decrypt'];
        var extractable = false;

        return crypt.subtle.importKey(
          'raw'
        , rawKey
        , { name: 'AES-CBC' }
        , extractable
        , usages
        );
    }

    function encrypt(data, key, iv) {
        // a public value that should be generated for changes each time
        return crypt.subtle.encrypt(
          { name: 'AES-CBC', iv: iv }
        , key
        , data
        );
    };

    function decrypt(data, key, iv) {
        // a public value that should be generated for changes each time
        return crypt.subtle.decrypt(
          { name: 'AES-CBC', iv: iv }
        , key
        , data
        );
    };

    function msGenerateKey(rawKey) {
        var usages = ['encrypt', 'decrypt'];
        var extractable = false;
        return new window.Promise(function (resolve, reject) {

            var keyOpp = crypt.subtle.importKey(
              'raw'
            , rawKey
            , { name: 'AES-CBC' }
            , extractable
            , usages
            );
            keyOpp.oncomplete = function (e) {
                resolve(keyOpp.result);
            }

            keyOpp.onerror = function (e) {
                reject(new Error("Cannot create a key..."));
            }

        });
    }

    function msEncrypt(data, key, iv) {
        return new window.Promise(function (resolve, reject) {
            // a public value that should be generated for changes each time
            var encOpp = crypt.subtle.encrypt(
              { name: 'AES-CBC', iv: iv }
            , key
            , data
            );
            encOpp.oncomplete = function (e) {
                resolve(encOpp.result);
            };
            encOpp.onerror = function (e) {
                reject(new Error("Fail to encrypt data..."));
            }
        });
    }

    function msDecrypt(data, key, iv) {
        return new window.Promise(function (resolve, reject) {
            // a public value that should be generated for changes each time
            var decOpp = crypt.subtle.decrypt(
              { name: 'AES-CBC', iv: iv }
            , key
            , data
            );
            decOpp.oncomplete = function (e) {
                resolve(decOpp.result);
            };
            decOpp.onerror = function (e) {
                reject(new Error("Fail to encrypt data..."));
            }
        });
    }

    function encryptAES(data, key, iv) {
        if (typeof window.crypto !== 'undefined') {
            return generateKey(key).then(function (key) {
                return encrypt(data, key, iv);
            });
        } else { // Microsoft IE
            return msGenerateKey(key).then(function (key) {
                return msEncrypt(data, key, iv);
            });
        }
    };

    function decryptAES(data, key, iv) {
        if (typeof window.crypto !== 'undefined') {
            return generateKey(key).then(function (key) {
                return decrypt(data, key, iv);
            });
        } else {
            return msGenerateKey(key).then(function (key) {
                return msDecrypt(data, key, iv);
            });
        }
    };

    /////////////////////////////////////////////

    function hexToArray(hex) {
        if (hex.length % 2 === 1) throw new Error("hexToBytes can't have a string with an odd number of characters.");
        if (hex.indexOf("0x") === 0) hex = hex.slice(2);
        return new Uint8Array(hex.match(/../g).map(function (x) { return parseInt(x, 16) }));
    };

    function promisefy(data) {
        return new window.Promise(function (resolve, reject) {
            setTimeout(function () {
                resolve(data);
            });
        });
    }

    function AESEncryption(key, M1, data) {
        var iv = new Uint8Array(hexToArray(M1).buffer, 0, 16);
        var buff;
        if (typeof data === 'string')
            buff = str2ab(data);
        else
            buff = binary2ab(data);
        return encryptAES(buff, key, iv);
    }
    function AESDecryption(key, M1, data) {
        var iv = new Uint8Array(hexToArray(M1).buffer, 0, 16);
        return decryptAES(data, key, iv).then(function (data) {
            var hdr = getHdr(data);
            if (hdr.version !== WebSdkAESVersion)
                throw new Error("Invalid data version!");
            switch (hdr.type) {
                case WebSdkAESDataType.Binary:
                    return data.slice(hdr.offset);
                case WebSdkAESDataType.UnicodeString:
                    return ab2str(data.slice(hdr.offset));
                default:
                    throw new Error("Invalid data type!");
            }
            return ab2str(data);
        });
    }

    return {
        encode: function (key, M1, data) {
            switch (core.WebSdk.version) {
                case core.WebSdkEncryptionSupport.AESEncryption:
                    return AESEncryption(key, M1, data);
                case core.WebSdkEncryptionSupport.Encryption:
                    return promisefy(utf8ToBase64(xor(M1, data)));
                case core.WebSdkEncryptionSupport.Encoding:
                    return promisefy(utf8ToBase64(data));
                default:
                    return promisefy(data);
            }
        },
        decode: function (key, M1, data) {
            switch (core.WebSdk.version) {
                case core.WebSdkEncryptionSupport.AESEncryption:
                    return AESDecryption(key, M1, data);
                case core.WebSdkEncryptionSupport.Encryption:
                    return promisefy(xor(M1, base64ToUtf8(data)));
                case core.WebSdkEncryptionSupport.Encoding:
                    return promisefy(base64ToUtf8(data));
                default:
                    return promisefy(data);
            }
        },
        isCryptoSupported: function () {
            return ((typeof crypt !== 'undefined') && crypt.subtle && crypt.subtle.importKey && crypt.subtle.encrypt);
        },
        hexToBytes: function(hex) {
            return hexToArray(hex);
        }
    };
});
; (function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore.channelOptions', [
            'WebSdkCore'
        ], factory);
    } else {
        var core = window.WebSdkCore;
        if (!core)
            throw new Error("WebSdkCore is not loaded.");

        window.WebSdkCore.channelOptions = factory(core);
    }
})(function (core) {

    function WebChannelOptions(options) {
        if (!options) options = {};

        var version = core.WebSdkEncryptionSupport.AESEncryption,
            debug = options.debug === true;

        if (!!options.version) {
            validateVersion(options.version);
            version = options.version;
        }

        Object.defineProperties(this, {
            "version": {
                get: function () { return version; },
                set: function (value) {
                    validateVersion(value);
                    version = value;
                },
                enumerable: true
            },
            "debug": {
                get: function () { return debug; },
                set: function () { debug = value; },
                enumerable: true
            }
        });

        function validateVersion(v) {
            for (var supportedVersion in core.WebSdkEncryptionSupport) {
                if (core.WebSdkEncryptionSupport.hasOwnProperty(supportedVersion) &&
                    core.WebSdkEncryptionSupport[supportedVersion] === v)
                    return;
            }
            throw new Error("invalid WebSdk version requested");
        }
    }
    return WebChannelOptions;
 
});

; (function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define('WebSdkCore.channelClientImplementation', [
            'async',
            'sjcl',
            'BigInteger',
            'SRPClient',
            'ES6Promise',
            'WebSdkCore',
            'WebSdkCore.utils',
            'WebSdkCore.configurator',
            'WebSdkCore.cipher'
        ], factory);
    } else {
        var core = window.WebSdkCore;
        if (!core)
            throw new Error("WebSdkCore is not loaded.");

        window.WebSdkCore.channelClientImplementation = factory(async, sjcl, BigInteger, SRPClient, ES6Promise, core, core.utils, core.configurator, core.cipher);
    }
})(function (async, sjcl, BigInteger, SRPClient, ES6Promise, core, utils, configurator, cipher) {

    if (!window.Promise)
        window.Promise = ES6Promise.Promise;

    function WebChannelClientImpl(clientPath) {

        if (!clientPath)
            throw new Error("clientPath cannot be empty");

        core.log("WebSdkVersion: ", core.WebSdk.version, "clientPath: ", clientPath);

        this.clientPath = clientPath;

        this.wsThreshold = 10240; // max number of buffered bytes (10k)
        this.wsQueueInterval = 1000; // interval to process message queue and send data over web-socket if buffer size is less then the threshold
        this.wsQueueLimit = 100; // maximum queue size, when reaching this limit the oldest messages will be removed from the queue.
        this.wsReconnectInterval = 5000;

        this.queue = new utils.FixedQueue(this.wsQueueLimit);
        this.queueInterval = null;
        this.webSocket = null;

        this.sessionKey = null;
        this.M1 = null;

        this.reconnectTimer = null;

        this.onConnectionFailed = null;
        this.onConnectionSucceed = null;
        this.onDataReceivedBin = null;
        this.onDataReceivedTxt = null;

        var self = this;

        window.parent.parent.addEventListener("blur", function () {
            self.resetReconnectTimer();
            self.notifyFocusChanged(false);
        });
        window.parent.parent.addEventListener("focus", function () {
            self.notifyFocusChanged(true);
        });

    }

    WebChannelClientImpl.prototype.notifyFocusChanged = function(isFocused) {
        if (!this.isConnected()) return;

        core.log('WebChannelClientImpl: notifyFocusChanged ->', isFocused);

        var data = {
            type: 'sdk.focusChanged',
            data: isFocused
        }

        this.sendData(JSON.stringify(data));
    }
    WebChannelClientImpl.prototype.fireConnectionFailed = function() {
        if (window.parent.parent.document.hasFocus()) {
            this.setReconnectTimer();
        }

        if (this.onConnectionFailed) {
            this.onConnectionFailed();
        }
    };

    WebChannelClientImpl.prototype.fireConnectionSucceed = function() {
        if (this.onConnectionSucceed) {
            this.onConnectionSucceed();
        }
    };

    WebChannelClientImpl.prototype.resetReconnectTimer = function() {
        if (this.reconnectTimer) {
            clearInterval(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    WebChannelClientImpl.prototype.setReconnectTimer = function() {
        this.resetReconnectTimer();

        var self = this;
        this.reconnectTimer = setInterval(function() {
            self.connectInternal(false);
        }, this.wsReconnectInterval);
    }

    /**
    * Connects to web socket server and setups all event listeners
    */
    WebChannelClientImpl.prototype.wsconnect = function(url) {
        core.log("WebChannelClientImpl: wsconnect " + url);
        var self = this;

        var $q = utils.Deferred();
        if (this.webSocket && this.webSocket.readyState !== WebSocket.CLOSED)
            throw new Error("wsdisconnect has not been called");

        this.webSocket = new WebSocket(url);
        // we need binary type 'arraybuffer' because default type 'blob' is not working
        this.webSocket.binaryType = 'arraybuffer';


        this.webSocket.onclose = function(event) {
            core.log("WebChannelClientImpl: wsonclose");
            return self.wsonclose(true);
        };
        this.webSocket.onopen = function(event) {
            core.log("WebChannelClientImpl: wsonopen");
            $q.resolve();

            if (window.parent.parent.document.hasFocus()) {
                self.notifyFocusChanged(true);
            }else{
                self.notifyFocusChanged(false);
            }
        };
        this.webSocket.onerror = function(event) {
            core.log("WebChannelClientImpl: wsonerror " + arguments);
            return $q.reject(new Error("WebSocket connection failed."));
        };
        this.webSocket.onmessage = function(event) {
            return self.wsonmessage(event);
        };

        return $q.promise;
    };

    /**
    * Closes web socket connection and cleans up all event listeners
    */
    WebChannelClientImpl.prototype.wsdisconnect = function() {
        var self = this;
        var $q = utils.Deferred();

        if (!this.webSocket || this.webSocket.readyState !== WebSocket.OPEN) {
            $q.resolve();
        } else {
            this.webSocket.onclose = function(event) {
                self.wsonclose(false);
                $q.resolve();
            };
            this.webSocket.close();
        }

        return $q.promise;
    };

    WebChannelClientImpl.prototype.wsonclose = function(isFailed) {
        core.log("WebChannelClientImpl: connection closed");

        this.webSocket.onclose = null;
        this.webSocket.onopen = null;
        this.webSocket.onmessage = null;
        this.webSocket.onerror = null;

        this.deactivateBufferCheck();

        if (isFailed) {
            this.fireConnectionFailed();
        }
    };

    WebChannelClientImpl.prototype.wsonmessage = function(event) {
        var self = this;
        cipher.decode(this.sessionKey, this.M1, event.data).then(function (data) {
            if (typeof data === 'string') {
                if (self.onDataReceivedTxt) {
                    self.onDataReceivedTxt(data);
                }
            } else {
                if (self.onDataReceivedBin) {
                    self.onDataReceivedBin(data);
                }
            }
        });
    };

    /**
    * Sends data over web socket
    */
    WebChannelClientImpl.prototype.wssend = function(data) {
        if (!this.isConnected())
            return false;

        if (this.webSocket.bufferedAmount >= this.wsThreshold) {
            this.activateBufferCheck();
            return false;
        }

        this.webSocket.send(data);
        return true;
    };

    WebChannelClientImpl.prototype.generateSessionKey = function(callback) {
        var srpData = configurator.srp;
        if (!srpData.p1 || !srpData.p2 || !srpData.salt)
            return callback(new Error("No data available for authentication"));

        var self = this;

        var srp = new SRPClient(srpData.p1, srpData.p2);
        var a;
        do {
            a = srp.srpRandom();
        } while (!srp.canCalculateA(a));

        var A = srp.calculateA(a);

        if (core.WebSdk.version >= core.WebSdkEncryptionSupport.AESEncryption && !cipher.isCryptoSupported())
            core.WebSdk.version = core.WebSdkEncryptionSupport.Encryption; // if AES encryption is not supported by Browser, set data encryption to old one.

        utils.ajax('post', configurator.url + '/connect', {
            username: srpData.p1,
            A: srp.toHexString(A),
            version: core.WebSdk.version.toString()
        }).then(function (response) {

            if (response.version === undefined) // old client
                core.WebSdk.version = Math.min(core.WebSdk.version, core.WebSdkEncryptionSupport.Encryption);
            else core.WebSdk.version = response.version;

            var B = new BigInteger(response.B, 16),
                u = srp.calculateU(A, B),
                S = srp.calculateS(B, srpData.salt, u, a),
                K = srp.calculateK(S),
                M1 = srp.calculateM(A, B, K, srpData.salt);

            // we will use SHA256 from K as AES 256bit session key
            self.sessionKey = cipher.hexToBytes(sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(sjcl.codec.hex.toBits(K))));
            self.M1 = M1;

            callback(null, M1);
        }).catch(callback);
    }

    /**
    * Sets up connection with parameters from configurator (generates session key and connects to websocket server).
    */
    WebChannelClientImpl.prototype.setupSecureChannel = function(callback) {
        core.log('WebChannelClientImpl.setupSecureChannel');

        var self = this;
        async.waterfall([
            function(callback) {
                self.generateSessionKey(callback);
            },
            function(sessionKey, callback) {
               // self.sessionKey = sessionKey;

                var connectionUrl = configurator.url.replace('http', 'ws') +
                    '/' + self.clientPath +
                    '?username=' + configurator.srp.p1 +
                    '&M1=' + self.M1;

                //adding sessionId to url
                if (!configurator.sessionId) {
                    configurator.sessionId = sjcl.codec.hex.fromBits(sjcl.random.randomWords(2, 0));
                }
                connectionUrl += "&sessionId=" + configurator.sessionId;

                //adding version to url
                connectionUrl += "&version=" + core.WebSdk.version.toString();

                self.wsconnect(connectionUrl)
                    .then(function() {
                        callback(null);
                    })
                    .catch(function(err) {
                        core.log(err);
                        callback(err);
                    });
            }
        ], callback);
    };

    /**
    * @result {boolean} True if web socket is ready for transferring data
    */
    WebChannelClientImpl.prototype.isConnected = function() {
        return !!this.webSocket && this.webSocket.readyState === WebSocket.OPEN;
    };

    /**
    * Sends message if channel is ready
    * Otherwise, adds message to the queue.
    */
    WebChannelClientImpl.prototype.sendData = function(data) {
        if (!this.wssend(data)) {
            this.queue.push(data);
        }
    };
    WebChannelClientImpl.prototype.deactivateBufferCheck = function() {
        if (!this.queueInterval) return;

        clearInterval(this.queueInterval);
        this.queueInterval = null;
    };

    WebChannelClientImpl.prototype.activateBufferCheck = function() {
        if (this.queueInterval) return;

        var self = this;
        this.queueInterval = setInterval(function() {
            self.processMessageQueue();

            if (self.queue.length === 0) {
                self.deactivateBufferCheck();
            }
        }, this.wsQueueInterval);
    }

    /**
    * Sends messages from a queue if any. Initiates secure connection if needed and has not been yet initiated.
    */
    WebChannelClientImpl.prototype.processMessageQueue = function() {
        core.log("WebChannelClientImpl: processMessageQueue " + this.queue.length);
        if (this.queue.length === 0)
            return;

        for (var i = 0; i < this.queue.length;) {
            if (!this.wssend(this.queue.items[i])) break;
            this.queue.splice(i, 1);
        }
    };

    WebChannelClientImpl.prototype.connectInternal = function(multipleAttempts) {
        core.log('WebChannelClientImpl.connectInternal');

        this.resetReconnectTimer();

        var self = this;
        async.waterfall([
            function(callback) {
                configurator.ensureLoaded(callback);
            },
            function(callback) {
                async.retry(multipleAttempts ? 3 : 1, function() {
                    self.setupSecureChannel(callback);
                }, callback);
            }
        ], function(err) {
            if (err) return self.fireConnectionFailed();

            self.fireConnectionSucceed();
            self.processMessageQueue();
        });
    };

    WebChannelClientImpl.prototype.connect = function() {
        this.connectInternal(true);
    };

    WebChannelClientImpl.prototype.disconnect = function() {
        this.wsdisconnect();
    };

    WebChannelClientImpl.prototype.sendDataBin = function (data) {
        var self = this;
        cipher.encode(this.sessionKey, this.M1, data).then(function (data) {
            self.sendData(data);
        });
    };

    WebChannelClientImpl.prototype.sendDataTxt = function(data) {
        var self = this;
        cipher.encode(this.sessionKey, this.M1, data).then(function (data) {
            self.sendData(data);
        });
    };

    return WebChannelClientImpl;
});

; (function (factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		define('WebSdkCore.channelClient', [
            'WebSdkCore',
            'WebSdkCore.channelOptions',
            'WebSdkCore.channelClientImplementation'
		], factory);
	} else {
		var core = window.WebSdkCore;
		if (!core)
			throw new Error("WebSdkCore is not loaded.");

		window.WebSdkCore.channelClient = factory(core, core.channelOptions, core.channelClientImplementation);
    }
})(function (core, WebChannelOptions, WebChannelClientImpl) {

    function WebChannelClient(clientPath, options) {
        if (options) {
            core.log(options);

            var webChannelOptions = new WebChannelOptions(options);

            core.WebSdk.debug = webChannelOptions.debug;
            core.WebSdk.version = webChannelOptions.version;
        }

        var client = new WebChannelClientImpl(clientPath);

        Object.defineProperties(this, {
            "path": {
                get: function () { return clientPath; },
                enumerable: true
            },
            "onConnectionFailed": {
                get: function () { return client.onConnectionFailed; },
                set: function (value) { client.onConnectionFailed = value; },
                enumerable: true
            },
            "onConnectionSucceed": {
                get: function () { return client.onConnectionSucceed; },
                set: function (value) { client.onConnectionSucceed = value; },
                enumerable: true
            },
            "onDataReceivedBin": {
                get: function () { return client.onDataReceivedBin; },
                set: function (value) { client.onDataReceivedBin = value; },
                enumerable: true
            },
            "onDataReceivedTxt": {
                get: function () { return client.onDataReceivedTxt; },
                set: function (value) { client.onDataReceivedTxt = value; },
                enumerable: true
            }
        });

        this.connect = function () {
            client.connect();
        }

        this.disconnect = function () {
            client.disconnect();
        }

        this.isConnected = function () {
            return client.isConnected();
        }

        this.sendDataBin = function (data) {
            client.sendDataBin(data);
        }

        this.sendDataTxt = function (data) {
            client.sendDataTxt(data);
        }

        this.resetReconnectTimer = function () {
            client.resetReconnectTimer();
        }
    }

    return WebChannelClient;
});

; (function (factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define('WebSdk', [
            'WebSdkCore',
            'WebSdkCore.channelOptions',
            'WebSdkCore.channelClient'
        ], factory);
    } else {
        var core = window.WebSdkCore;
        if (!core)
            throw new Error("WebSdkCore is not loaded.");

        window.WebSdk = factory(core, core.channelOptions, core.channelClient);
    }
})(function (core, WebChannelOptions, WebChannelClient) {
    core.log('loaded websdk.client');

    return {
        WebChannelOptions: WebChannelOptions,
        WebChannelClient: WebChannelClient
    };
});
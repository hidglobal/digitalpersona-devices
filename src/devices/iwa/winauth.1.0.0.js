function WinAuthController($scope) {
    $scope.initializePlugin(function (e) {
        console.log("iwa_form.set_active");
    }, function (e) {
        console.log("iwa_form.kill_active");
    });
}
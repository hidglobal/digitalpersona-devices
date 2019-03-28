
declare module WebSdk {

    interface IWebChannelClient {
        /**
        * Callback invoked when client cannot connect to the server (because has no data in local storage or this data is obsolete).
        */
        onConnectionFailed: () => void;

        /**
        * Callback invoked when client successfully connected to the server.
        */
        onConnectionSucceed: () => void;

        /**
        * Callback invoked when binary data  is received from the server.
        * 
        * @param {ArrayBuffer} data
        */
        onDataReceivedBin: (data: ArrayBuffer) => void;

        /**
        * Callback invoked when binary data  is received from the server.
        * 
        * @param {string} data
        */
        onDataReceivedTxt: (data: string) => void;

        /**
        * Connects to the server with available configuration. If connection failed, onConnectionFailed callback will be called.
        */
        connect: () => void;
        
        /**
        * Dicconnects from the server or stops attempts to restore lost connection.
        */
        disconnect: () => void;

        /**
        * Sends binary data to the server.
        * 
        * @param {ArrayBuffer} data
        */
        sendDataBin: (data: ArrayBuffer) => void;

        /**
        * Sends text data to the server.
        * 
        * @param {string} data
        */
        sendDataTxt: (data: string) => void;

        /**
        * Returns current connection state of the client.
        */
        isConnected(): boolean;
    }

    class WebChannelOptions {
        constructor(options: Object);

        /*
        * If true debug logs are outputted to browser Console
        */
        debug(): boolean;
        debug(value: boolean): void;

        /*
        * Version of WebSdk channel (1,2,3,etc.)
        */
        version(): number;
        version(value: number): void;

        /*
        * If true the client continuously attempts to restore connection (if false - only when the web page is active)
        */
        reconnectAlways(): boolean;
        reconnectAlways(value: boolean): void;
    }

    class WebChannelClient implements IWebChannelClient {
        /**
        * Creates WebChannelClient
        * 
        * @param {string} path - the path that identifies registered WebSdk plugin
        */
        constructor(path: string, options?: WebChannelOptions);

        onConnectionFailed(): void;

        onConnectionSucceed(): void;

        onDataReceivedBin(data: ArrayBuffer): void;

        onDataReceivedTxt(data: string): void;

        connect(): void;
        
        disconnect(): void;

        sendDataBin(data: ArrayBuffer): void;

        sendDataTxt(data: string): void;

        isConnected(): boolean;
    }
}
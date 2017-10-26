export function Posterior<T>(config?: Posterior.InputConfig, name?: string): Posterior.Requester;
export namespace Posterior {
    type XHREventHandler = (this: XHR, event: Event) => any;
    type T = any;
    type U = any;

    interface XHR extends XMLHttpRequest {
        readonly cfg: RequesterConfig;
        readonly responseObject: {};
        readonly responseHeaders: {
            [header: string]: string;
        }
    }
    interface XHRPromise extends Promise<T> {
        readonly xhr: XHR;
    }

    // one per call to Posterior()
    interface InputConfigBase {
        // basic HTTP
        name?: string;
        url?: string;// must have follows, if no url
        method?: string;// default is GET
        mimeType?: string;
        headers?: {
            [header: string]: string;
        };
        username?: string;
        password?: string;
        
        // behavior configuration
        auto?: boolean;
        cache?: boolean;
        debug?: boolean;
        retry?: boolean | {
            wait?: number;
            limit?: number;
        };
        throttle?: {
            key: string,
            ms: number
        };
        json?: boolean;
        requires?: [Requirement];
        follows?: string | {
            source: Requester | Promiser;
            path: string;
        };
        consumeData?: boolean;

        // handlers
        configure?(this: ActiveConfig, cfg: ActiveConfig): void;
        then?(this: ActiveConfig, then: (value: T) => U): Promise<U>;
        catch?(handler: (this: ActiveConfig, error: any) => U | Promise<U>): Promise<U>;
        catch?(handler: (this: ActiveConfig, error: any, xhr?: XHR) => void): Promise<U>;

        // XHR specific configuration
        async?: boolean;
        responseType?: XMLHttpRequestResponseType;
        timeout?: number | XHREventHandler;
        withCredentials?: boolean;
        msCaching?: string;
        requestedWith?: string;

        // request handlers
        requestData?: (data: any) => undefined | any;
        onreadystatechange?: XHREventHandler;
        error?: XHREventHandler;
        //timeout?: XHREventHandler;
        loadstart?: XHREventHandler;
        loadend?: XHREventHandler;
        load?: XHREventHandler;
 
        // response handlers and status code mapping
        responseData?: (this: XHR, data: any) => T | XHR;
        failure?: (this: ActiveConfig, status: number, xhr: XHR) => any;
    }
    type InputConfig = InputConfigBase & {
        // status code mapping and mapping handlers
        [statusCode: number]: number | ((xhr: XHR) => number);
    };

    // one per Requester (structured)
    interface RequesterConfigBase {
        name: string;

        // internals
        _fn: Requester;
        _parent: RequesterConfig | null;
        _private: InputConfig;
    }
    type RequesterConfig = RequesterConfigBase & InputConfig;
    
    // one per call (flattened, filled, and called)
    interface ActiveConfigBase {
        _args: [any];
        data: [any] | {};
        _singletonResult?: T;
    }
    type ActiveConfig = ActiveConfigBase & RequesterConfig;

    const version: string;

    function xhr(cfg: ActiveConfig): XHRPromise;
    namespace xhr {
        // utilities
        function isData(data: any): boolean;
        function safeCopy<O>(object: O, copied: undefined | [string]): O;
        
        // manual configuration
        const methodMap: {
            [METHOD: string]: string;
        };
        let activeClass: undefined | string;
        
        // extension possibilites
        let ctor: XHR;
        let active: number;
        function notify(isActive: boolean): void;
        function method(cfg: ActiveConfig): string;
        function url(cfg: ActiveConfig): string;
        function key(cfg: ActiveConfig): string;
        function cache(xhr: XHR): XHR;

        // override at your own risk
        function promise(xhr: XHR, cfg: ActiveConfig): Promise<T>;
        function main(cfg: ActiveConfig): XHRPromise;
        function config(xhr: XHR, cfg: ActiveConfig): void;
        function retry(cfg: ActiveConfig, retry: boolean | {}, events: {}, fail: (e: Event) => void): void;
        function throttle(xhr: XHR, cfg: ActiveConfig, events: {}, fail: (e: Event) => void): void;
        const throttles: {
            [key: string]: {
                queue: number;
                lastRun: number;
            }
        };
        function run(xhr: XHR, cfg: ActiveConfig, events: {}, fail: (e: Event) => void): void;
        function load(cfg: ActiveConfig, resolve: (value: T) => void, reject: (error: any) => void): () => void;
        function forceJSONResponse(xhr: XHR): void;
        function data(cfg: ActiveConfig): any;
        function start(): void;
        function end(): void;
    }

    type Promiser = (...input: any[]) => Promise<T>;
    interface RequesterBase extends InputConfigBase {
        cfg: RequesterConfig;
        config(name: string, value: any): any;
        extend(config: InputConfig, name: string): Requester;
    }
    type RequesterFn = (...requestData: any[]) => XHRPromise;
    type Requester = RequesterFn & RequesterBase;
    type Requirement = string | Requester | Promiser;
    
    function api(config: InputConfig, name?: string): Requester;
    namespace api {
        // building
        function build(config: InputConfig, parent: RequesterConfig, name: string): Requester;
        function debug(name: string, fn: Requester): Requester;
        function set(cfg: RequesterConfig, prop: string, value: any, parentName: string): void;
        function getter(fn: Requester, name: string): void;

        // utility
        function get(cfg: RequesterConfig, name: string, inheriting?: boolean): any;        
        
        // user-facing (on all Requesters)
        function config(name: string, value: any): any;
        function extend(config: InputConfig, name: string): Requester;

        // requesting
        function main(fn: Requester, args: [any]): XHRPromise | Promise<T>;
        function getAll(cfg: RequesterConfig, inheriting?: boolean): ActiveConfig;
        function process(cfg: ActiveConfig): void;
        function promise(cfg: ActiveConfig, fn: Requester): XHRPromise | Promise<T>;
        function require(req: Requirement): Promise<T>;
        function follow(cfg: ActiveConfig, fn: Requester): XHRPromise | Promise<T>;

        // resolving/combining config values
        function resolve(string: string, data: [any] | {}, cfg: ActiveConfig, consume: boolean | undefined): string;
        function copy(to: ActiveConfig, from: RequesterConfig): void;
        function log(args: [any], level: string): void;
        function combine(pval: any, val: any, cfg: ActiveConfig): any;
        function combineFn(pfn: Function, fn: Function): Function;
        function combineObject(pobj: {}, obj: {}): {};
        function type(val: any): string;
    }
}

export default Posterior;
import Rx = require("rxjs");

/**
 * Request object
 */
export class RestRequest {

    private headers: any = {};
    private body: any = null;

    /**
     * Constructor
     * @param path Relative path
     * @param headers Header fields
     */
    constructor(private url: string) {}

    /**
     * Set the basic auth header for the request
     * @param authString Base64 encoded authentication information
     * @returns {SoncosoRestRequest} -
     */
    public withAuthentication(authString: string): RestRequest {
        return this.withHeader("Authorization", authString);
    }

    /**
     * Append a header field
     * @param key Key
     * @param value Value
     * @returns {SoncosoRestRequest} -
     */
    public withHeader(key: string, value: string): RestRequest {
        this.headers[key] = value;
        return this;
    }

    /**
     * Set the request body
     * @param body Body
     * @return {SoncosoRestRequest} -
     */
    public withBody(body: any): RestRequest {
        this.body = body;
        return this;
    }

    /**
     * Executes the current request with the given method
     * @returns {Rx.Observable<any>} -
     */
    private request(method: string): Rx.Observable<any> {
        const self = this;
        return Rx.Observable.create((observer: Rx.Observer<any>) => {
            const xmlRequest = new XMLHttpRequest();
            xmlRequest.open(method, self.url, true);
            for (const key of Object.keys(self.headers)) {
                xmlRequest.setRequestHeader(key, self.headers[key]);
            }

            xmlRequest.addEventListener("load", (event) => {
                if (xmlRequest.status < 200 || xmlRequest.status >= 300) {
                    if (xmlRequest.status === 401) {
                        console.warn("Invalid credentials for request");
                        observer.error(new Error("unauthorized"));
                        return;
                    }
                    if (xmlRequest.status >= 500) {
                        console.warn("Internal server error");
                        observer.error(new Error("server_error"));
                        return;
                    }

                    console.warn(new Error(`Failed to load request (${xmlRequest.status}, ${xmlRequest.statusText})`));
                    observer.error(new Error("unknown"));
                    return;
                }

                observer.next(JSON.parse(xmlRequest.responseText));
                observer.complete();
            });

            xmlRequest.send(this.body);
        });

        /*return Rx.Observable.fromPromise($.ajax(this.url,
                {
                data: this.body,
                dataType: "jsonp",
                headers: this.headers,
                method,
                url: this.url,
            }).promise());*/

        /*return Rx.Observable.create((observer: Rx.Observer<any>) => {
            return $.ajax(this.url,
                {
                data: this.body,
                dataType: "jsonp",
                headers: this.headers,
                method,
                url: this.url,
            }).promise();
        });*/
    }

    /**
     * Executes the current request using get
     * @returns {Rx.Observable<any>} -
     */
    public get(): Rx.Observable<any> {
        return this.request("GET");
    }

    /**
     * Executes the current request using post
     * @returns {Rx.Observable<any>} -
     */
    public post(): Rx.Observable<any> {
        return this.request("POST");
    }

    /**
     * Executes the current request using put
     * @returns {Rx.Observable<any>} -
     */
    public put(): Rx.Observable<any> {
        return this.request("PUT");
    }

    /**
     * Executes the current request using delete
     * @returns {Rx.Observable<any>} -
     */
    public delete(): Rx.Observable<any> {
        return this.request("DELETE");
    }
}

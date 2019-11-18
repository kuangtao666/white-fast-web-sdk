export class IframeController {

    private readonly setGlobalState: (netlessState: any) => void;
    private handleStateFuncArray: ((netlessState: any) => void)[] = [];
    private iframeState: any;
    private readonly domId: string;
    public constructor(domId: string, setGlobalState: (netlessState: any) => void) {
        this.setGlobalState = setGlobalState;
        this.domId = domId;
        window.addEventListener("message", this.handleReceiveMessage, false);
    }

    private handleReceiveMessage = (evt: any): void => {
        this.setGlobalState(evt.data);
        if (this.handleStateFuncArray.length > 0) {
            for (const handleStateFunc of this.handleStateFuncArray) {
                try {
                    handleStateFunc(evt.data);
                } catch (err) {
                    console.log("addStateChangeListener error" + err);
                }
            }
        }
    }



    public addStateChangeListener = (handleStateChange: (netlessState: any) => void): void => {
        this.handleStateFuncArray.push(handleStateChange);
    }

    public getIframeState = (): any => {
        return this.iframeState;
    }

    public setIframeState = (param: string | {[key: string]: any}): void => {
        if (typeof param === "string") {
            this.iframeState = {
                ...this.iframeState,
                tuoKeJson: param,
            };
            this.handlePushToIframe(this.iframeState);
        } else {
            this.iframeState = {
                ...this.iframeState,
                ...param,
            };
            this.handlePushToIframe(this.iframeState);
        }
    }

    public deleteIframeState = (stateKey: string): void => {
        delete this.iframeState[stateKey];
        this.handlePushToIframe(this.iframeState);
    }

    private handlePushToIframe = (netlessState: any): void => {
        const childFrameObj = document.getElementById(this.domId) as HTMLIFrameElement;
        if (childFrameObj) {
            if (netlessState.tuoKeJson) {
                childFrameObj.contentWindow!.postMessage(netlessState.tuoKeJson, "*");
            } else {
                childFrameObj.contentWindow!.postMessage(netlessState, "*");
            }
        }
    }
}

import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";
import "./Iframe.less";
import {IframeController} from "./IframeController";

export type IframeComponentProps = PluginComponentProps & {
    readonly netlessState: any;
};

export type IframeComponentStates =  {
    isClickDisable: boolean;
    url: string;
    submitUrl: string;
};

export class Iframe extends React.Component<IframeComponentProps, IframeComponentStates > {

    public static readonly protocol: string = "iframe";
    // public static readonly backgroundProps: Partial<IframeComponentProps> = {netlessState: string};
    public constructor(props: IframeComponentProps) {
        super(props);
        this.state = {
            isClickDisable: false,
            url: "",
            submitUrl: "",
        };
    }
    private iframeController: IframeController;
    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public componentWillReceiveProps(nextProps: IframeComponentProps): void {
        if (nextProps.netlessState !== this.props.nenetlessState) {
            this.iframeController.setIframeState(nextProps.netlessState);
            if (nextProps.netlessState.submitUrl) {
                this.setState({submitUrl: nextProps.netlessState.submitUrl});
            }
        }
    }

    public componentDidMount(): void {
        this.iframeController = new IframeController("calculation", this.setGlobalState);
        if (this.props.netlessState.submitUrl) {
            this.setState({submitUrl: this.props.netlessState.submitUrl});
        }
    }
    private setGlobalState = (netlessState: any) => {
        this.props.setProps(this.props.uuid, {
            netlessState: netlessState,
        });
    }

    private renderIframe = (): React.ReactNode => {
        const {isClickDisable, submitUrl} = this.state;
        if (submitUrl) {
            return (
                <iframe frameBorder="no" className="iframe-box-body-" style={{pointerEvents: isClickDisable ? "auto" : "none"}} id="calculation" src={submitUrl}/>
            );
        } else {
            return (
                <div>
                    dasdas
                </div>
            );
        }
    }
    private handleUrlChange = (evt: any) => {
        this.setState({url: evt.target.value});
    }

    private submitUrl = (): void => {
        this.setState({submitUrl: this.state.url});
        this.iframeController.setIframeState({submitUrl: this.state.url});
        this.setGlobalState({
            ...this.iframeController.getIframeState,
            submitUrl: this.state.url,
        });
    }
    public render(): React.ReactNode {
        const {width, height} = this.props;
        return (
            <CNode kind={CNodeKind.HTML}>
                <div className="iframe-box" style={{width: width, height: height}}>
                    <div className="iframe-box-nav">
                        <button style={{pointerEvents: "auto"}}  className="iframe-controller" onClick={() => this.setState({isClickDisable: true})}>允许点击</button>
                        <button style={{pointerEvents: "auto", left: 100}}  className="iframe-controller" onClick={() => this.setState({isClickDisable: false})}>禁止点击</button>
                        <input style={{pointerEvents: "auto"}} value={this.state.url} onChange={this.handleUrlChange}/>
                        <button style={{pointerEvents: "auto"}}  className="iframe-controller" onClick={() => this.submitUrl()}>提交</button>
                    </div>
                    <div className="iframe-box-body">
                        {this.renderIframe()}
                    </div>
                </div>
            </CNode>
        );
    }
}

import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-react-sdk";
import "./Iframe.less";
import {IframeController} from "./IframeController";
import iframe_close from "../assets/image/iframe_close.svg";
import iframe_min from "../assets/image/iframe_min.svg";
import iframe_max from "../assets/image/iframe_max.svg";
import fix_icon from "../assets/image/fix_icon.svg";
import editor_icon from "../assets/image/editor_icon.svg";
import uneditor_icon from "../assets/image/uneditor_icon.svg";
import netless_gray from "../assets/image/netless_gray.svg";

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

    public UNSAFE_componentWillReceiveProps(nextProps: IframeComponentProps): void {
        if (nextProps.netlessState !== this.props.nenetlessState) {
            this.iframeController.setIframeState(nextProps.netlessState);
            if (nextProps.netlessState.submitUrl) {
                this.setState({submitUrl: nextProps.netlessState.submitUrl});
            }
        }
    }

    public componentDidMount(): void {
        this.iframeController = new IframeController("calculation", this.setGlobalState);
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
                <div style={{pointerEvents: isClickDisable ? "auto" : "none"}}>
                    <img style={{width: 120}} src={netless_gray}/>
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

    private handleInputFocus = (evt: any): void => {
        console.log(evt);
    }
    public render(): React.ReactNode {
        const {width, height} = this.props;
        const {isClickDisable} = this.state;
        return (
            <CNode kind={CNodeKind.HTML}>
                <div className="iframe-box" style={{width: width, height: height}}>
                    <div className="iframe-box-nav">
                        <div className="iframe-box-nav-left">
                            <div className="iframe-box-nav-close">
                                <img style={{width: 7.2}} src={iframe_close}/>
                            </div>
                            <div className="iframe-box-nav-min">
                                <img src={iframe_min}/>
                            </div>
                            <div className="iframe-box-nav-max">
                                <img  style={{width: 6}} src={iframe_max}/>
                            </div>
                        </div>
                        <input className="iframe-box-search"
                               style={{pointerEvents: "auto"}}
                               value={this.state.url} onFocus={this.handleInputFocus}
                               onChange={this.handleUrlChange}/>
                        <div className="iframe-box-nav-right">
                            <div className="iframe-box-nav-right-btn">
                                <img src={fix_icon}/>
                            </div>
                            <div onClick={() => this.setState({isClickDisable: !this.state.isClickDisable})} className="iframe-box-nav-right-btn">
                                {isClickDisable ? <img src={editor_icon}/> : <img src={uneditor_icon}/>}
                            </div>
                        </div>
                        {/*<button style={{pointerEvents: "auto"}}  className="iframe-controller" onClick={() => this.submitUrl()}>提交</button>*/}
                    </div>
                    <div className="iframe-box-body">
                        {this.renderIframe()}
                    </div>
                </div>
            </CNode>
        );
    }
}

import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-react-sdk";
import {Input, message} from "antd";
import "./index.less";
import {IframeController} from "./IframeController";
import iframe_close from "./image/iframe_close.svg";
import iframe_min from "./image/iframe_min.svg";
import iframe_max from "./image/iframe_max.svg";
import fix_icon from "./image/fix_icon.svg";
import editor_icon from "./image/editor_icon.svg";
import uneditor_icon from "./image/uneditor_icon.svg";
import netless_gray from "./image/netless_gray.svg";

export type IframeComponentProps = PluginComponentProps & {
    readonly netlessState: any;
};

export type IframeComponentStates =  {
    isClickDisable: boolean;
    url: string;
    submitUrl: string;
};

export class WhiteIframePlugin extends React.Component<IframeComponentProps, IframeComponentStates > {

    public static readonly protocol: string = "white-iframe-plugin";
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
        const selfNetlessState = this.props.netlessState;
        if (selfNetlessState && selfNetlessState.submitUrl) {
            this.setState({url: selfNetlessState.submitUrl, submitUrl: selfNetlessState.submitUrl});
        }
    }
    private setGlobalState = (netlessState: any) => {
        this.props.setProps(this.props.uuid, {
            netlessState: netlessState,
        });
    }
    private validURL = (str: string): boolean => {
        const pattern = new RegExp("^(https?:\\/\\/)?" + // protocol
            "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
            "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
            "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
            "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
            "(\\#[-a-z\\d_]*)?$", "i"); // fragment locator
        return pattern.test(str);
    }
    private renderIframe = (): React.ReactNode => {
        const {isClickDisable, submitUrl} = this.state;
        if (submitUrl) {
            return (
                <iframe frameBorder="no" className="iframe-box-body"  style={{pointerEvents: "auto"}} id="calculation" src={submitUrl}/>
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

    private submitUrl = (evt: any): void => {
        const url = evt.target.value;
        if (this.validURL(url)) {
            this.iframeController.setIframeState({submitUrl: evt.target.value});
            this.setGlobalState({
                ...this.iframeController.getIframeState,
                submitUrl: evt.target.value,
            });
        } else {
            message.warning("输入网址有误，请检查后重新输入");
        }
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
                        <div style={{pointerEvents: "auto"}} className="iframe-box-search">
                            <Input
                                onPressEnter={this.submitUrl}
                                value={this.state.url}
                                onChange={this.handleUrlChange}
                                placeholder="输入网址"
                                style={{pointerEvents: "auto"}}
                            />
                        </div>
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

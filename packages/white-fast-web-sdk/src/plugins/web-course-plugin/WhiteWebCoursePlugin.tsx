import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";
import {Input, message} from "antd";
import "../PluginStyle.less";
import "./WhiteWebCoursePlugin.less";
import {WebCourseController} from "./WebCourseController";
import plugin_window_close from "../../assets/image/plugin_window_close.svg";
import plugin_window_min from "../../assets/image/plugin_window_min.svg";
import plugin_window_max from "../../assets/image/plugin_window_max.svg";
import plugin_fix_icon from "../../assets/image/plugin_fix_icon.svg";
import plugin_editor_icon from "../../assets/image/plugin_editor_icon.svg";
import plugin_uneditor_icon from "../../assets/image/plugin_uneditor_icon.svg";
import netless_gray from "../../assets/image/netless_gray.svg";

export type WhiteWebCoursePluginProps = PluginComponentProps & {
    readonly netlessState: any;
};

export type WhiteWebCoursePluginStates =  {
    isClickDisable: boolean;
    url: string;
    submitUrl: string;
};

export default class WhiteWebCoursePlugin extends React.Component<WhiteWebCoursePluginProps, WhiteWebCoursePluginStates > {

    public static readonly protocol: string = "white-web-course-plugin";
    // public static readonly backgroundProps: Partial<IframeComponentProps> = {netlessState: string};
    public constructor(props: WhiteWebCoursePluginProps) {
        super(props);
        this.state = {
            isClickDisable: false,
            url: "",
            submitUrl: "",
        };
    }
    private iframeController: WebCourseController;
    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteWebCoursePluginProps): void {
        if (nextProps.netlessState !== this.props.nenetlessState) {
            this.iframeController.setIframeState(nextProps.netlessState);
            if (nextProps.netlessState.submitUrl) {
                this.setState({submitUrl: nextProps.netlessState.submitUrl});
            }
        }
    }

    public componentDidMount(): void {
        this.iframeController = new WebCourseController("calculation", this.setGlobalState);
        const selfNetlessState = this.props.netlessState;
        if (selfNetlessState && selfNetlessState.submitUrl) {
            this.setState({url: selfNetlessState.submitUrl, submitUrl: selfNetlessState.submitUrl});
        }
    }
    private setGlobalState = (netlessState: any) => {
        this.props.operator.setProps(this.props.uuid, {
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
                <iframe frameBorder="no" className="plugin-box-body"  style={{pointerEvents: "auto"}} id="calculation" src={submitUrl}/>
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
                <div className="plugin-box" style={{width: width, height: height}}>
                    <div className="plugin-box-nav">
                        <div className="plugin-box-nav-left">
                            <div className="plugin-box-nav-close">
                                <img style={{width: 7.2}} src={plugin_window_close}/>
                            </div>
                            <div className="plugin-box-nav-min">
                                <img src={plugin_window_min}/>
                            </div>
                            <div className="plugin-box-nav-max">
                                <img  style={{width: 6}} src={plugin_window_max}/>
                            </div>
                        </div>
                        <div style={{pointerEvents: "auto"}} className="plugin-box-search">
                            <Input
                                onPressEnter={this.submitUrl}
                                value={this.state.url}
                                onChange={this.handleUrlChange}
                                placeholder="输入网址"
                                style={{pointerEvents: "auto"}}
                            />
                        </div>
                        <div className="plugin-box-nav-right">
                            <div className="plugin-box-nav-right-btn">
                                <img src={plugin_fix_icon}/>
                            </div>
                            <div onClick={() => this.setState({isClickDisable: !this.state.isClickDisable})} className="plugin-box-nav-right-btn">
                                {isClickDisable ? <img src={plugin_editor_icon}/> : <img src={plugin_uneditor_icon}/>}
                            </div>
                        </div>
                        {/*<button style={{pointerEvents: "auto"}}  className="iframe-controller" onClick={() => this.submitUrl()}>提交</button>*/}
                    </div>
                    <div className="plugin-box-body">
                        {this.renderIframe()}
                    </div>
                </div>
            </CNode>
        );
    }
}

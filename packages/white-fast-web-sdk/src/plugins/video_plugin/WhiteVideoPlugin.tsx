import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps, RoomConsumer, Room} from "white-react-sdk";
import plugin_window_close from "../../assets/image/plugin_window_close.svg";
import plugin_window_min from "../../assets/image/plugin_window_min.svg";
import plugin_window_max from "../../assets/image/plugin_window_max.svg";
import plugin_fix_icon from "../../assets/image/plugin_fix_icon.svg";
import plugin_editor_icon from "../../assets/image/plugin_editor_icon.svg";
import plugin_uneditor_icon from "../../assets/image/plugin_uneditor_icon.svg";
import "./WhiteVideoPlugin.less";
import "../PluginStyle.less";
import Video from "./Video";
import {HostUserType} from "../../pages/RoomManager";
import {IdentityType} from "../../components/whiteboard/WhiteboardTopRight";
import {WhiteEditorPluginProps} from "../../../../white-editor-plugin/src";
import {number} from "prop-types";

export enum VideoStateEnum {
    play = "play",
    pause = "pause",
}

export type WhiteVideoPluginProps = PluginComponentProps & {
    play: boolean;
    seek: number;
};

export type WhiteVideoPluginStates = {
    isClickDisable: boolean;
    play: boolean;
    seek: number;
};

export default class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    public static readonly protocol: string = "media";
    private room: Room | undefined = undefined;
    public static readonly backgroundProps: Partial<WhiteEditorPluginProps> = {play: false, seek: 0};

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.state = {
            isClickDisable: false,
            play: false,
            seek: 0,
        };
    }
    public componentDidMount(): void {
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteVideoPluginProps): void {
        if (this.props.play !== nextProps.play) {
            if (this.room && this.room.state.globalState.hostInfo) {
                const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
                if (hostInfo.identity !== IdentityType.host) {
                    this.setState({play: nextProps.play});
                }
            }
        }
    }

    private handleSeekData = (seek: number): void => {
        if (this.room && this.room.state.globalState.hostInfo) {
            const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
            if (hostInfo.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {seek: seek});
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        console.log(play);
        // if (this.room && this.room.state.globalState.hostInfo) {
        //     const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
        //     if (hostInfo.identity === IdentityType.host) {
        //         this.props.operator.setProps(this.props.uuid, {play: play});
        //         this.setState({play: play});
        //     }
        // }
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;

        return (
            <CNode kind={CNodeKind.HTML}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        this.room = room;
                        let isHaveControls: boolean = false;
                        if (this.room && this.room.state.globalState.hostInfo) {
                            const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
                            if (hostInfo.userId === (window as any).__userId) {
                                isHaveControls = true;
                            }
                        }
                        return (
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
                                    <div className="plugin-box-nav-right">
                                        <div className="plugin-box-nav-right-btn">
                                            <img src={plugin_fix_icon}/>
                                        </div>
                                        <div onClick={() => this.setState({isClickDisable: !this.state.isClickDisable})} className="plugin-box-nav-right-btn">
                                            {this.state.isClickDisable ? <img src={plugin_editor_icon}/> : <img src={plugin_uneditor_icon}/>}
                                        </div>
                                    </div>
                                </div>
                                <div className="plugin-box-body">
                                    <Video
                                        videoURL={"https://white-sdk.oss-cn-beijing.aliyuncs.com/video/whiteboard_video.mp4"}
                                        play={this.state.play}
                                        controls={isHaveControls}
                                        width={600}
                                        height={600}
                                        onPlayed={this.handlePlayState}
                                        onSeeked={this.handleSeekData}/>
                                </div>
                            </div>
                        );
                    }}
                </RoomConsumer>
            </CNode>
        );
    }
}

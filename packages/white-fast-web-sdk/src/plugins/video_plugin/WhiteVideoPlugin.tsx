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

export enum VideoStateEnum {
    play = "play",
    pause = "pause",
}

export type WhiteVideoPluginProps = PluginComponentProps & {
    play: boolean;
    seek: number;
    currentTime: 0;
};

export type WhiteVideoPluginStates = {
    isClickEnable: boolean;
    play: boolean;
    seek: number;
    currentTime: number;
};

export type SelfUserInf = {
    userId: number, identity: IdentityType,
};

export default class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    public static readonly protocol: string = "media";
    private room: Room | undefined = undefined;
    public static readonly backgroundProps: Partial<WhiteEditorPluginProps> = {play: false, seek: 0, currentTime: 0};
    private selfUserInf: SelfUserInf | null = null;

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.state = {
            isClickEnable: true,
            play: false,
            seek: 0,
            currentTime: 0,
        };
    }

    public componentDidMount(): void {
        this.setState({seek: this.props.currentTime});
        this.handleSeekData(this.props.currentTime);
        this.handlePlayState(false);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteVideoPluginProps): void {
        if (this.selfUserInf) {
            if (this.props.play !== nextProps.play) {
                if (this.selfUserInf.identity !== IdentityType.host) {
                    this.setState({play: nextProps.play});
                }
            }
            if (this.props.seek !== nextProps.seek) {
                if (this.selfUserInf.identity !== IdentityType.host) {
                    this.setState({seek: nextProps.seek});
                }
            }
        }
    }

    private handleSeekData = (seek: number): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {seek: seek});
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {play: play});
                this.setState({play: play});
            }
        }
    }

    private setMyIdentity = (room: Room | undefined): void => {
        if (room) {
            const observerId = room.observerId;
            const roomMember = room.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
            if (roomMember && roomMember.payload) {
                this.selfUserInf = {
                    userId: roomMember.payload.userId,
                    identity: roomMember.payload.identity,
                };
            }
        }
    }

    private detectIsHaveControls = (room: Room | undefined): boolean => {
        if (room) {
            if (room && room.state.globalState.hostInfo && this.selfUserInf) {
                const hostInfo: HostUserType = room.state.globalState.hostInfo;
                return hostInfo.userId === `${this.selfUserInf.userId}`;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private onTimeUpdate = (time: number): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {currentTime: time});
            }
        }
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        return (
            <CNode kind={CNodeKind.HTML}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        this.room = room;
                        this.setMyIdentity(room);
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
                                        <div onClick={() => this.setState({isClickEnable: !this.state.isClickEnable})} className="plugin-box-nav-right-btn">
                                            {this.state.isClickEnable ? <img src={plugin_uneditor_icon}/> : <img src={plugin_editor_icon}/>}
                                        </div>
                                    </div>
                                </div>
                                <div style={{pointerEvents: this.state.isClickEnable ? "auto" : "none"}} className="plugin-box-body">
                                    <Video
                                        videoURL={"https://white-sdk.oss-cn-beijing.aliyuncs.com/video/whiteboard_video.mp4"}
                                        play={this.state.play} onTimeUpdate={this.onTimeUpdate}
                                        controls={this.detectIsHaveControls(room)}
                                        seek={this.state.seek} isClickEnable={this.state.isClickEnable}
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

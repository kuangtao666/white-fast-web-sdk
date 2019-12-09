import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps, RoomConsumer, Room, PlayerConsumer, Player} from "white-react-sdk";
import {Icon, Upload, Progress, Button} from "antd";
import uuidv4 from "uuid/v4";
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
import * as OSS from "ali-oss";
import {PPTProgressPhase, UploadManager} from "../../tools/upload/UploadManager";
import {ossConfigObj} from "../../appToken";
export enum VideoStateEnum {
    play = "play",
    pause = "pause",
}

export type WhiteVideoPluginProps = PluginComponentProps & {
    play: boolean;
    seek: number;
    currentTime: number;
    url: string;
    loadingPercent: number;
    isUpload: boolean;
};

export type WhiteVideoPluginStates = {
    isClickEnable: boolean;
    play: boolean;
    seek: number;
    currentTime: number;
    url: string;
    loadingPercent: number;
    isUpload: boolean;
};

export type SelfUserInf = {
    userId: number, identity: IdentityType,
};

export default class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    public static readonly protocol: string = "media";
    private room: Room | undefined = undefined;
    private play: Player | undefined = undefined;
    public static readonly backgroundProps: Partial<WhiteEditorPluginProps> = {play: false, seek: 0, currentTime: 0, url: "",
        loadingPercent: 0,
        isUpload: false};
    private selfUserInf: SelfUserInf | null = null;
    private readonly client: any;

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
            url: "",
            loadingPercent: 0,
            isUpload: false,
        };
        this.client = new OSS({
            accessKeyId: ossConfigObj.accessKeyId,
            accessKeySecret: ossConfigObj.accessKeySecret,
            region: ossConfigObj.region,
            bucket: ossConfigObj.bucket,
        });
    }

    public componentDidMount(): void {
        this.setState({seek: this.props.currentTime});
        this.handleSeekData(this.props.currentTime);
        this.handlePlayState(false);
        this.setState({url: this.props.url});
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

            if (this.props.url !== nextProps.url) {
                if (this.selfUserInf.identity !== IdentityType.host) {
                    this.setState({url: nextProps.url});
                }
            }
            if (this.props.loadingPercent !== nextProps.loadingPercent) {
                if (this.selfUserInf.identity !== IdentityType.host) {
                    this.setState({loadingPercent: nextProps.loadingPercent});
                }
            }
            if (this.props.isUpload !== nextProps.isUpload) {
                if (this.selfUserInf.identity !== IdentityType.host) {
                    this.setState({isUpload: nextProps.isUpload});
                }
            }
        }
    }

    private handleSeekData = (seek: number): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {seek: seek});
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {play: play});
                this.setState({play: play});
            }
        }
    }

    private setMyIdentityRoom = (room: Room): void => {
        const observerId = room.observerId;
        const roomMember = room.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                userId: roomMember.payload.userId,
                identity: roomMember.payload.identity,
            };
        }
    }

    private setMyIdentityPlay = (play: Player): void => {
        const observerId = play.observerId;
        const roomMember = play.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                userId: roomMember.payload.userId,
                identity: roomMember.payload.identity,
            };
        }
    }

    private detectIsHaveControlsRoom = (room: Room): boolean => {
        if (room && room.state.globalState.hostInfo && this.selfUserInf) {
            const hostInfo: HostUserType = room.state.globalState.hostInfo;
            return hostInfo.userId === `${this.selfUserInf.userId}`;
        } else {
            return false;
        }
    }

    private handleUrl = (url: string): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {url: url});
            }
        }
    }

    private onTimeUpdate = (time: number): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {currentTime: time});
            }
        }
    }

    private handleUploadVideo = (isUpload: boolean): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {isUpload: isUpload});
            }
        }
    }

    private uploadVideo = async (event: any): Promise<void> => {
        const videoFile = event.file;
        if (this.room) {
            this.setState({isUpload: true});
            this.handleUploadVideo(true);
            const uploadManager = new UploadManager(this.client, this.room);
            try {
                const res = await uploadManager.addFile(`${uuidv4()}/${videoFile.name}`, videoFile, this.loadingCallback);
                this.setState({isUpload: false});
                this.handleUploadVideo(false);
                const url = res.replace("http", "https");
                this.handleUrl(url);
                this.setState({url: url});
            } catch (err) {
                this.setState({isUpload: false});
                this.handleUploadVideo(false);
                console.log(err);
            }
        }
    }

    private handleUploadPercent = (percent: number): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {loadingPercent: percent});
            }
        }
    }

    private loadingCallback = (phase: PPTProgressPhase, percent: number) => {
        const thisPercent = Math.round(percent * 100);
        this.handleUploadPercent(thisPercent);
        this.setState({loadingPercent: thisPercent});
    }

    private renderVideoUploadBox = (room: Room): React.ReactNode => {
        if (this.state.url) {
            return  <Video
                videoURL={this.state.url}
                play={this.state.play}
                onTimeUpdate={this.onTimeUpdate} currentTime={this.props.currentTime}
                controls={this.detectIsHaveControlsRoom(room)}
                seek={this.state.seek} isClickEnable={this.state.isClickEnable}
                onPlayed={this.handlePlayState}
                onSeeked={this.handleSeekData}/>;
        } else {
            return (
                <div className="video-upload-box">
                    {this.state.isUpload ?
                        <Progress width={80} type="circle" style={{marginBottom: 18}} percent={this.state.loadingPercent}  strokeLinecap="square" /> :
                        <Icon style={{fontSize: 64, color: "#5B908E", marginBottom: 18}} type="inbox" />
                    }
                    <Upload
                        style={{pointerEvents: this.state.isClickEnable ? "auto" : "none"}}
                        accept="video/mp4"
                        showUploadList={false}
                        customRequest={this.uploadVideo}>
                        <Button size={"large"}>
                            <Icon type="upload" /> 点击上传视频
                        </Button>
                    </Upload>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const {width, height} = this.props;
        return (
            <CNode kind={CNodeKind.HTML}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            this.room = room;
                            this.setMyIdentityRoom(room);
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
                                        {this.renderVideoUploadBox(room)}
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(play: Player | undefined) => {
                        if (play) {
                            this.play = play;
                            this.setMyIdentityPlay(play);
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
                                            play={this.props.play}
                                            controls={false} currentTime={this.props.currentTime}
                                            seek={this.props.seek}
                                            isClickEnable={false}
                                            onPlayed={this.handlePlayState}
                                            onSeeked={this.handleSeekData}/>
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

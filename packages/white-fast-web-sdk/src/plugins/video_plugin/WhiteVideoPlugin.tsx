import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps, RoomConsumer, Room, PlayerConsumer, Player} from "white-react-sdk";
import {Icon, Upload, Progress, Button} from "antd";
import uuidv4 from "uuid/v4";
import "./WhiteVideoPlugin.less";
import "../PluginStyle.less";
import Video from "./Video";
import {IdentityType} from "../../components/whiteboard/WhiteboardTopRight";
import {WhiteEditorPluginProps} from "../../../../white-editor-plugin/src";
import * as OSS from "ali-oss";
import {PPTProgressPhase, UploadManager} from "../../tools/upload/UploadManager";
import {ossConfigObj} from "../../appToken";
import {observer} from "mobx-react";
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

@observer
class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    public static readonly protocol: string = "video";
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
        if (this.selfUserInf && this.selfUserInf.identity !== IdentityType.host) {
            this.setState({isClickEnable: false});
        }
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
                const isHttps = res.indexOf("https") !== -1;
                let url;
                if (isHttps) {
                    url = res;
                } else {
                    url = res.replace("http", "https");
                }
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
                isClickEnable={this.state.isClickEnable}
                play={this.state.play}
                identity={this.selfUserInf ? this.selfUserInf.identity : undefined}
                onTimeUpdate={this.onTimeUpdate}
                currentTime={this.props.currentTime}
                seek={this.state.seek}
                onPlayed={this.handlePlayState}
                onSeeked={this.handleSeekData}/>;
        } else {
            if (this.selfUserInf && this.selfUserInf.identity === IdentityType.host) {
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
            } else {
                return (
                    <div className="video-upload-box">
                        {this.state.isUpload ?
                            <Progress width={80} type="circle" style={{marginBottom: 18}} percent={this.state.loadingPercent}  strokeLinecap="square" /> :
                            <Icon style={{fontSize: 64, color: "#5B908E", marginBottom: 18}} type="inbox" />
                        }
                        <div>
                            等待老师上传视频
                        </div>
                    </div>
                );
            }

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
                                        <span>
                                            视频播放
                                        </span>
                                    </div>
                                    <div className="plugin-box-body">
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
                                        <span>
                                            视频播放
                                        </span>
                                    </div>
                                    <div className="plugin-box-body">
                                        <Video
                                            videoURL={this.props.url}
                                            isClickEnable={false}
                                            play={this.props.play}
                                            currentTime={this.props.currentTime}
                                            seek={this.props.seek}
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

export default WhiteVideoPlugin;

import * as React from "react";
import "./ClassroomMedia.less";
import {Room, ViewMode} from "white-react-sdk";
import {Button, Radio, Tooltip, notification, Icon} from "antd";
import {GuestUserType, HostUserType, ClassModeType} from "../../pages/RoomManager";
import * as set_video from "../../assets/image/set_video.svg";
import * as hangUp from "../../assets/image/hangUp.svg";
import * as menu_in from "../../assets/image/menu_in.svg";
import * as close_white from "../../assets/image/close_white.svg";
import {LanguageEnum, RtcType} from "../../pages/NetlessRoom";
import Identicon from "react-identicons";
import ClassroomMediaManager from "./ClassroomMediaManager";
export type NetlessStream = {
    state: {isAudioOpen: boolean, isInStage: boolean, identity?: IdentityType},
} & any;

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type ClassroomMediaStates = {
    isRtcStart: boolean;
    isMaskAppear: boolean;
    isFullScreen: boolean;
    streams: NetlessStream[];
    isLocalStreamPublish: boolean;
    isRtcLoading: boolean;
};

export type ClassroomMediaProps = {
    userId: number;
    channelId: string;
    isRecording: boolean;
    room: Room;
    classMode: ClassModeType;
    identity?: IdentityType;
    handleManagerState: () => void;
    rtc?: RtcType;
    applyForRtc: boolean;
    language?: LanguageEnum;
    isVideoEnable: boolean;
    startRtcCallback: (startRtc: (recordFunc?: () => void) => void) => void;
    stopRtcCallback: (stopRtc: () => void) => void;
    stopRecord?: () => void;
};

export default class ClassroomMedia extends React.Component<ClassroomMediaProps, ClassroomMediaStates> {

    private agoraClient: any;

    public constructor(props: ClassroomMediaProps) {
        super(props);
        this.state = {
            isRtcStart: false,
            isMaskAppear: false,
            isFullScreen: false,
            streams: [],
            isRtcLoading: false,
            isLocalStreamPublish: false,
        };
    }

    public componentDidMount(): void {
        if (this.props.identity !== IdentityType.host && this.props.isVideoEnable) {
            const {userId, room} = this.props;
            const hostInfo: HostUserType = room.state.globalState.hostInfo;
            const key = `${Date.now()}`;
            const btn = (
                <Button type="primary" onClick={() => {
                    if (hostInfo) {
                        if (hostInfo.classMode === ClassModeType.discuss) {
                            this.startRtc();
                        } else {
                            this.startRtc(undefined, true);
                        }
                    }
                    notification.close(key);
                }}>
                    确认加入
                </Button>
            );
            notification.open({
                message: `你好！${userId}`,
                duration: 8,
                description:
                    "此教室中老师已经开启视频通讯邀请，请确认是否加入。",
                icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                btn,
                key,
                top: 64,
            });
        }
        this.props.startRtcCallback(this.startRtc);
        this.props.stopRtcCallback(this.stopRtc);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: ClassroomMediaProps): void {
        if (this.props.isVideoEnable !== nextProps.isVideoEnable) {
            if (nextProps.isVideoEnable) {
                this.videoJoinRemind();
            } else {
                notification.close("notification");
                this.stopRtc();
            }
        }

        // if (this.props.classMode !== nextProps.classMode) {
        //     if (nextProps.classMode !== ClassModeType.discuss && this.agoraClient !==  undefined) {
        //         if (this.props.identity !== IdentityType.host && this.state.localStream) {
        //             this.agoraClient.unpublish(this.state.localStream);
        //         }
        //     }
        // }

        if (this.props.applyForRtc !== nextProps.applyForRtc) {
            const hostInfo: HostUserType = this.props.room.state.globalState.hostInfo;
            if (hostInfo.classMode === ClassModeType.handUp && nextProps.applyForRtc) {
                const {rtc, userId} = this.props;
                const AgoraRTC = rtc!.rtcObj;
                this.createLocalStream(AgoraRTC, userId);
            }
        }
    }

    private videoJoinRemind = (): void => {
        const {userId, room} = this.props;
        const hostInfo: HostUserType = room.state.globalState.hostInfo;
        if (this.props.identity !== IdentityType.host) {
            const key = `notification`;
            const btn = (
                <Button type="primary" onClick={() => {
                    if (hostInfo) {
                        if (hostInfo.classMode === ClassModeType.discuss) {
                            this.startRtc();
                        } else {
                            this.startRtc(undefined, true);
                        }
                    }
                    notification.close(key);
                }}>
                    确认加入
                </Button>
            );
            notification.open({
                message: `你好！${userId}`,
                duration: 6,
                description:
                    "此教室中老师已经开启视频通讯邀请，请确认是否加入。",
                icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                btn,
                key,
                top: 64,
            });
        }
    }

    private handleHandup = (classMode: ClassModeType, room: Room, userId?: string): void => {
        const globalGuestUsers: GuestUserType[] = room.state.globalState.guestUsers;
        const selfHostInfo: HostUserType = room.state.globalState.hostInfo;
        if (userId) {
            if (classMode === ClassModeType.handUp && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    if (parseInt(user.userId) === this.props.userId) {
                        user.isHandUp = !user.isHandUp;
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        } else {
            if (classMode !== ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    user.isHandUp = false;
                    user.isReadOnly = true;
                    user.cameraState = ViewMode.Follower;
                    user.disableCameraTransform = true;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Broadcaster;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            } else if (classMode === ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    user.isHandUp = false;
                    user.isReadOnly = false;
                    user.cameraState = ViewMode.Freedom;
                    user.disableCameraTransform = false;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Freedom;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            }
        }
    }

    private renderHostController = (hostInfo: HostUserType): React.ReactNode => {
        const {room, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        const guestUsers: GuestUserType[] = room.state.globalState.guestUsers;
        if (hostInfo.classMode) {
            if (this.props.identity === IdentityType.host) {
                return (
                    <Radio.Group buttonStyle="solid" size={"small"} style={{marginTop: 6, fontSize: 12}} value={hostInfo.classMode} onChange={evt => {
                        this.handleHandup(evt.target.value, room);
                        let users: GuestUserType[] | undefined = undefined;
                        if (guestUsers) {
                            users = guestUsers.map((user: GuestUserType) => {
                                user.applyForRtc = false;
                                return user;
                            });
                        }
                        if (hostInfo.classMode === ClassModeType.handUp) {
                            room.setGlobalState({hostInfo: {...hostInfo, classMode: evt.target.value}});
                        } else {
                            room.setGlobalState({hostInfo: {...hostInfo, classMode: evt.target.value}, guestUsers: users});
                        }
                    }}>
                        <Radio.Button value={ClassModeType.lecture}>{isEnglish ? "Lecture" : "讲课模式"}</Radio.Button>
                        <Radio.Button value={ClassModeType.handUp}>{isEnglish ? "Hand Up" : "举手参与"}</Radio.Button>
                        <Radio.Button value={ClassModeType.discuss}>{isEnglish ? "Interactive" : "自由互动"}</Radio.Button>
                    </Radio.Group>
                );
            } else {
                if (isEnglish) {
                    return (
                        <div style={{marginTop: 6, color: "white"}}>Class mode: {this.handleModeText(hostInfo.classMode)}</div>
                    );
                } else {
                    return (
                        <div style={{marginTop: 6, color: "white"}}>模式：{this.handleModeText(hostInfo.classMode)}</div>
                    );
                }
            }
        } else {
            return null;
        }
    }

    private handleModeText = (classMode: ClassModeType) => {
        const {language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        switch (classMode) {
            case ClassModeType.discuss: {
                if (isEnglish) {
                    return "Interactive";
                } else {
                    return "自由讨论";
                }
            }
            case ClassModeType.lecture: {
                if (isEnglish) {
                    return "Lecture";
                } else {
                    return "讲课模式";
                }
            }
            default: {
                if (isEnglish) {
                    return "Hand Up";
                } else {
                    return "举手问答";
                }
            }
        }
    }

    private renderRtcBtn = (): React.ReactNode => {
        const {language, rtc, room, identity} = this.props;
        const hostInfo: HostUserType = room.state.globalState.hostInfo;
        const isEnglish = language === LanguageEnum.English;
        if (rtc) {
            if (hostInfo.classMode === ClassModeType.discuss) {
                return (
                    <div className="manager-box-btn">
                        {this.state.isRtcLoading ?
                            <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                            :
                            <Tooltip placement={"right"} title={isEnglish ? "Start video call" : "开启音视频通信"}>
                                <Button onClick={() => this.startRtc()} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                            </Tooltip>
                        }
                    </div>
                );
            } else {
                if (identity === IdentityType.host) {
                    return (
                        <div className="manager-box-btn">
                            {this.state.isRtcLoading ?
                                <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                                :
                                <Tooltip placement={"right"} title={isEnglish ? "Start video call" : "开启音视频通信"}>
                                    <Button onClick={() => this.startRtc()} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                                </Tooltip>
                            }
                        </div>
                    );
                } else {
                    if (hostInfo.isVideoEnable) {
                        return (
                            <div className="manager-box-btn">
                                {this.state.isRtcLoading ?
                                    <Button style={{fontSize: 16}} type="primary" shape="circle" icon="loading"/>
                                    :
                                    <Tooltip placement={"right"} title={isEnglish ? "Start video call" : "开启音视频通信"}>
                                        <Button onClick={() => this.startRtc(undefined, true)} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                                    </Tooltip>
                                }
                            </div>
                        );
                    } else {
                        return null;
                    }
                }
            }
        } else {
            return null;
        }
    }

    private renderHost = (): React.ReactNode => {
        const {room, handleManagerState, language} = this.props;
        const hostInfo: HostUserType = room.state.globalState.hostInfo;
        const isEnglish = language === LanguageEnum.English;
        if (hostInfo) {
            return (
                <div className="manager-box-inner-host">
                    {this.renderRtcBtn()}
                    <div className="manager-box-btn-right">
                        <Tooltip placement={"left"} title={isEnglish ? "Hide sidebar" : "隐藏侧边栏"}>
                            <div onClick={() => handleManagerState()} className="manager-box-btn-right-inner">
                                <img src={menu_in}/>
                            </div>
                        </Tooltip>
                    </div>
                    <div className="manager-box-image">
                        {hostInfo.avatar ? <img src={hostInfo.avatar}/> :
                            <Identicon
                                className={`avatar-${hostInfo.userId}`}
                                size={60}
                                string={hostInfo.userId}/>
                        }
                    </div>
                    {isEnglish ?
                        <div className="manager-box-text">Teacher: {hostInfo.name ? hostInfo.name : hostInfo.userId}</div> :
                        <div className="manager-box-text">老师：{hostInfo.name ? hostInfo.name : hostInfo.userId}</div>
                    }
                    {this.renderHostController(hostInfo)}
                </div>
            );
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const {room, language} = this.props;
        const hostInfo: HostUserType = room.state.globalState.hostInfo;
        const isEnglish = language === LanguageEnum.English;
        return (
            <div className="netless-video-out-box">
               {!this.state.isRtcStart &&
               <div className="netless-video-mask">
                   {this.renderHost()}
               </div>}
               <div className="netless-video-box">
                   <div onClick={() => {
                       this.setState({isMaskAppear: !this.state.isMaskAppear});
                   }} className="classroom-box-video-set">
                       {this.state.isMaskAppear ? <img style={{width: 14}} src={close_white}/> : <img src={set_video}/>}
                   </div>
                   {this.state.isMaskAppear &&
                   <div className="classroom-box-video-mask">
                       <div className="manager-box-inner-host2">
                           <div className="manager-box-btn">
                               <Tooltip placement={"right"} title={isEnglish ? "Close video call" : "关闭视频"}>
                                   <div className="manager-box-btn-hang" onClick={() => {
                                       if (this.props.isRecording && this.props.identity === IdentityType.host) {
                                           const key = `rtc-close`;
                                           const btn = (
                                               <Button type="primary" onClick={() => {
                                                   if (this.props.stopRecord) {
                                                       this.props.stopRecord();
                                                   }
                                                   this.stopRtc();
                                                   notification.close(key);
                                               }}>
                                                   停止录制并关闭
                                               </Button>
                                           );
                                           notification.open({
                                               message: `关闭 RTC 提醒`,
                                               duration: 6,
                                               description:
                                                   "您正开启录制服务，关闭 RTC 之前请先停止录制。否则视频和白板会录制时长不统一。",
                                               icon: <Icon type="smile" style={{ color: "#108ee9" }} />,
                                               btn,
                                               key,
                                               top: 64,
                                           });
                                       } else {
                                           this.stopRtc();
                                       }
                                   }}>
                                       <img src={hangUp}/>
                                   </div>
                               </Tooltip>
                           </div>
                           <div className="manager-box-image">
                               {hostInfo.avatar ? <img src={hostInfo.avatar}/> :
                                   <Identicon
                                       className={`avatar-${hostInfo.userId}`}
                                       size={60}
                                       string={hostInfo.userId}/>
                               }
                           </div>
                           {isEnglish ?
                               <div className="manager-box-text">Teacher: {hostInfo.name ? hostInfo.name : hostInfo.userId}</div> :
                               <div className="manager-box-text">老师：{hostInfo.name ? hostInfo.name : hostInfo.userId}</div>
                           }
                           {this.renderHostController(hostInfo)}
                       </div>
                   </div>}
                   <ClassroomMediaManager
                       rtcClient={this.agoraClient}
                       setMemberToStageById={this.setMemberToStageById}
                       userId={this.props.userId}
                       classMode={this.props.classMode}
                       streams={this.state.streams}/>
               </div>
            </div>
        );
    }


    private setMediaState = (state: boolean): void => {
        const {room, identity} = this.props;
        if (identity === IdentityType.host) {
            room.setGlobalState({hostInfo: {
                    ...room.state.globalState.hostInfo,
                    isVideoEnable: state,
                }});
        }
    }
    private startRtc = (recordFunc?: () => void, isUnPublish?: boolean): void => {
        const {rtc, classMode, userId, channelId, identity} = this.props;
        const AgoraRTC = rtc!.rtcObj;
        const agoraAppId = rtc!.token;
        // 按钮 loading
        this.setState({isRtcLoading: true});
        // 初始化
        this.agoraClient = AgoraRTC.createClient({mode: "rtc", codec: "h264"});
        this.agoraClient.init(agoraAppId, () => {
            console.log("AgoraRTC client initialized");
            this.agoraClient.join(agoraAppId, channelId, userId, (uid: string) => {
                console.log("User " + uid + " join channel successfully");
                // 创建本地流对象
                this.setState({isRtcStart: true, isRtcLoading: false});
                if (classMode === ClassModeType.discuss || identity === IdentityType.host) {
                    this.createLocalStream(AgoraRTC, userId);
                }
                // 添加监听
                this.addRtcListeners(this.agoraClient);
            }, (err: any) => {
                console.log(err);
            });
        }, (err: any) => {
            console.log("AgoraRTC client init failed", err);
        });
    }

    private stopRtc = (): void => {
        const localStream = this.state.streams.find(stream => stream.getId() === this.props.userId);
        const remoteStreams = this.state.streams.filter(stream => stream.getId() !== this.props.userId);
        this.agoraClient.leave(() => {
            // Stop playing the local stream
            if (localStream) {
                localStream.stop();
                localStream.close();
            }
            // Stop playing the remote streams and remove the views
            while (remoteStreams.length > 0) {
                const stream = remoteStreams.shift();
                stream.stop();
            }
            this.setState({streams: [], isRtcStart: false, isMaskAppear: false});
            console.log("client leaves channel success");
        }, (err: any) => {
            console.log("channel leave failed");
            console.error(err);
        });
    }

    private createLocalStream = (rtcObj: any, userId: number): void => {
        // 创建本地流对象
        const localStream = rtcObj.createStream({
            streamID: userId,
            audio: true,
            video: true,
        });

        // 初始化本地流
        localStream.init(()  => {
            console.log("getUserMedia successfully");
            this.setMediaState(true);
            this.addStream(localStream);
        }, (err: any) => {
            console.log("getUserMedia failed", err);
        });
    }

    private getStreamIdentity = (userId: number): IdentityType => {
        const {room} = this.props;
        const roomMember = room.state.roomMembers.find((roomMember: any) => {
            if (roomMember.payload && roomMember.payload.userId !== undefined) {
                if (parseInt(roomMember.payload.userId) === userId) {
                    return roomMember;
                }
            }
        });
        if (roomMember) {
            return roomMember.payload.identity;
        } else {
            return IdentityType.listener;
        }
    }

    private addStream = (stream: any): void => {
        const originalStreamArray = this.state.streams;
        const newStream: NetlessStream = {...stream, state: {
                isAudioOpen: true,
                isInStage: false,
                identity: this.getStreamIdentity(stream.getId()),
            }};
        originalStreamArray.push(newStream);
        this.setState({streams: originalStreamArray});
    }

    private setMemberToStageById = (userId: number): void => {
        const originalStreamArray = this.state.streams;
        const newStreams: NetlessStream[] = originalStreamArray.map(originalStream => {
            originalStream.isInStage = originalStream.getId() === userId;
            return originalStream;
        });
        this.setState({streams: newStreams});
        console.log(this.state.streams);
    }

    private removeStream = (stream: any): void => {
        const originalStreamArray = this.state.streams;
        const newStream = originalStreamArray.filter(originalStream => {
            return stream.getId() !== originalStream.getId();
        });
        this.setState({streams: newStream});
    }

    private addRtcListeners = (rtcClient: any): void => {
        // 监听
        rtcClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        rtcClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            rtcClient.subscribe(stream);
        });
        rtcClient.on("stream-removed",  (evt: any) => {
            const stream = evt.stream;
            this.removeStream(stream);
        });
        rtcClient.on("stream-subscribed", (evt: any) => {
            const stream = evt.stream;
            this.addStream(stream);
            console.log("Subscribe remote stream successfully: " + stream.getId());
        });
        rtcClient.on("peer-leave", (evt: any) => {
            const stream = evt.stream;
            this.removeStream(stream);
            console.log("remote user left ", evt.uid);
        });
        rtcClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
            // const streams = this.state.remoteMediaStreams.map((data: any) => {
            //     if (data.getId() === uid) {
            //         data.state.isVideoOpen = false;
            //     }
            //     return data;
            // });
            // this.setState({remoteMediaStreams: streams});
        });
        rtcClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
            // const streams = this.state.remoteMediaStreams.map((data: any) => {
            //     if (data.getId() === uid) {
            //         data.state.isVideoOpen = true;
            //     }
            //     return data;
            // });
            // this.setState({remoteMediaStreams: streams});
        });
        rtcClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.streams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            this.setState({streams: streams});
        });
        rtcClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.streams.map(data => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = true;
                }
                return data;
            });
            this.setState({streams: streams});
        });
    }

}

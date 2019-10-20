import * as React from "react";
import "./ClassroomMedia.less";
import {Room, RoomMember, ViewMode} from "white-react-sdk";
import {Button, Radio, Tooltip} from "antd";
import ClassroomMediaCell from "./ClassroomMediaCell";
import ClassroomMediaHostCell from "./ClassroomMediaHostCell";
import {CSSProperties} from "react";
import {GuestUserType, HostUserType, ClassModeType} from "../../pages/RoomManager";
import * as set_video from "../../assets/image/set_video.svg";
import * as hangUp from "../../assets/image/hangUp.svg";
import * as menu_in from "../../assets/image/menu_in.svg";
import * as close_white from "../../assets/image/close_white.svg";
import {LanguageEnum, RtcType} from "../../pages/NetlessRoom";
import Identicon from "react-identicons";
export type NetlessStream = {
    state: {isVideoOpen: boolean, isAudioOpen: boolean},
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
    remoteMediaStreams: NetlessStream[];
    localStream: NetlessStream | null;
};

export type ClassroomMediaProps = {
    userId: number;
    channelId: string;
    room: Room;
    identity?: IdentityType;
    setMediaState: (state: boolean) => void;
    handleManagerState: () => void;
    rtc?: RtcType;
    language?: LanguageEnum;
};

export default class ClassroomMedia extends React.Component<ClassroomMediaProps, ClassroomMediaStates> {

    private agoraClient: any;

    public constructor(props: ClassroomMediaProps) {
        super(props);
        this.state = {
            isRtcStart: false,
            isMaskAppear: false,
            isFullScreen: false,
            remoteMediaStreams: [],
            localStream: null,
        };
    }

    private renderMediaBoxArray = (): React.ReactNode => {
        const {remoteMediaStreams} = this.state;
        const {room, identity} = this.props;
        const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
        if (hostRoomMember) {
            const mediaStreams = remoteMediaStreams.filter(data => data.getId() !== hostRoomMember.payload.userId);
            const hasHost = !!remoteMediaStreams.find(data => data.getId() === hostRoomMember.payload.userId);
            const nodes = mediaStreams.map((data: NetlessStream, index: number) => {
                return (
                    <ClassroomMediaCell
                        hasHost={hasHost}
                        streamsLength={mediaStreams.length}
                        identity={identity}
                        key={`${data.getId()}`}
                        stream={data}/>
                );
            });
            return nodes;
        } else {
            const nodes = remoteMediaStreams.map((data: NetlessStream, index: number) => {
                return (
                    <ClassroomMediaCell
                        hasHost={false}
                        streamsLength={remoteMediaStreams.length}
                        identity={identity}
                        key={`${data.getId()}`}
                        stream={data}/>
                );
            });
            return nodes;
        }
    }

    private renderRemoteHostBox = (): React.ReactNode => {
        const {remoteMediaStreams} = this.state;
        const {room} = this.props;
        const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
        if (hostRoomMember) {
            const hostStream = remoteMediaStreams.find((stream: NetlessStream) => stream.getId() === hostRoomMember.payload.userId);
            if (hostStream) {
                return <ClassroomMediaHostCell streamsLength={remoteMediaStreams.length} key={`${hostStream.getId()}`} stream={hostStream}/>;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    private renderSelfBox = (): React.ReactNode => {
        const {localStream} = this.state;
        if (localStream) {
            return (
                <div style={this.handleLocalVideoBox()} id="rtc_local_stream">
                </div>
            );

        } else {
            return null;
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
        if (hostInfo.classMode) {
            if (this.props.identity === IdentityType.host) {
                return (
                    <Radio.Group buttonStyle="solid" size={"small"} style={{marginTop: 6, fontSize: 12}} value={hostInfo.classMode} onChange={evt => {
                        this.handleHandup(evt.target.value, room);
                        room.setGlobalState({hostInfo: {...hostInfo, classMode: evt.target.value}});
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
        const {userId, channelId, language, rtc} = this.props;
        const isEnglish = language === LanguageEnum.English;
        if (rtc) {
            return (
                <div className="manager-box-btn">
                    <Tooltip placement={"right"} title={isEnglish ? "Start video call" : "开启音视频通信"}>
                        <Button onClick={() => this.startRtc(userId, channelId)} style={{fontSize: 16}} type="primary" shape="circle" icon="video-camera"/>
                    </Tooltip>
                </div>
            );
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
               {!this.state.localStream &&
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
                                   <div className="manager-box-btn-hang" onClick={() => this.stopLocal()}>
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
                   {this.renderRemoteHostBox()}
                   {this.renderSelfBox()}
                   {this.renderMediaBoxArray()}
               </div>
            </div>
        );
    }

    private handleLocalVideoBox = (): CSSProperties => {
        const {remoteMediaStreams} = this.state;
        const {identity, room} = this.props;
        if (identity === IdentityType.host) {
            if (remoteMediaStreams.length === 0) {
                return {width: "100%", height: 300};
            } else if (remoteMediaStreams.length === 3) {
                return {width: "100%", height: 225};
            } else {
                return {width: "100%", height: 150};
            }
        } else {
            const hostRoomMember = room.state.roomMembers.find((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.host);
            if (hostRoomMember) {
                const hostStream = remoteMediaStreams.find((stream: NetlessStream) => stream.getId() === hostRoomMember.payload.userId);
                if (hostStream) {
                    if (remoteMediaStreams.length === 0) {
                        return {width: "100%", height: 300};
                    } else if (remoteMediaStreams.length === 1) {
                        return {width: "100%", height: 150};
                    } else if (remoteMediaStreams.length === 2) {
                        return {width: "50%", height: 150};
                    } else {
                        return {width: "33.33%", height: 75};
                    }
                } else {
                    if (remoteMediaStreams.length === 0) {
                        return {width: "100%", height: 300};
                    } else if (remoteMediaStreams.length === 3) {
                        return {width: "100%", height: 225};
                    } else {
                        return {width: "100%", height: 150};
                    }
                }
            } else {
                if (remoteMediaStreams.length === 0) {
                    return {width: "100%", height: 300};
                } else if (remoteMediaStreams.length === 3) {
                    return {width: "100%", height: 225};
                } else {
                    return {width: "100%", height: 150};
                }
            }
        }
    }

    private startRtc = (userId: number, channelId: string): void => {
        const {rtc, identity} = this.props;
        const AgoraRTC = rtc!.rtcObj;
        const agoraAppId = rtc!.token;
        this.agoraClient = AgoraRTC.createClient({mode: "rtc", codec: "h264"});
        this.agoraClient.init(agoraAppId, () => {
            console.log("AgoraRTC client initialized");
        }, (err: any) => {
            console.log("AgoraRTC client init failed", err);
        });
        const localStream = AgoraRTC.createStream({
            streamID: userId,
            audio: true,
            video: true,
        });
        localStream.init(()  => {
            console.log("getUserMedia successfully");
            const netlessLocalStream = {
                ...localStream,
                state: {isVideoOpen: true, isAudioOpen: true},
            };
            this.setState({localStream: netlessLocalStream});
            netlessLocalStream.play("rtc_local_stream");
            this.agoraClient.join(agoraAppId, channelId, userId, (uid: string) => {
                this.props.setMediaState(true);
                console.log("User " + uid + " join channel successfully");
                if (identity !== IdentityType.listener) {
                    this.agoraClient.publish(localStream, (err: any) => {
                        console.log("Publish local stream error: " + err);
                    });
                }
            }, (err: any) => {
                console.log(err);
            });
        }, (err: any) => {
            console.log("getUserMedia failed", err);
        });

        // 监听
        this.agoraClient.on("stream-published", () => {
            console.log("Publish local stream successfully");
        });
        this.agoraClient.on("stream-added",  (evt: any) => {
            const stream = evt.stream;
            console.log("New stream added: " + stream.getId());
            this.agoraClient.subscribe(stream);
        });
        this.agoraClient.on("stream-subscribed", (evt: any) => {
            const remoteStream = evt.stream;
            remoteStream.state = {isVideoOpen: true, isAudioOpen: true};
            const remoteMediaStreams = this.state.remoteMediaStreams;
            remoteMediaStreams.push(remoteStream);
            this.setState({
                remoteMediaStreams: remoteMediaStreams,
            });
            console.log("Subscribe remote stream successfully: " + remoteStream.getId());
        });
        this.agoraClient.on("peer-leave", (evt: any) => {
            const uid = evt.uid;
            this.stop(uid);
            console.log("remote user left ", uid);
        });
        this.agoraClient.on("mute-video", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isVideoOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("unmute-video", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isVideoOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("mute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map((data: any) => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
        this.agoraClient.on("unmute-audio", (evt: any) => {
            const uid = evt.uid;
            const streams = this.state.remoteMediaStreams.map(data => {
                if (data.getId() === uid) {
                    data.state.isAudioOpen = true;
                }
                return data;
            });
            this.setState({remoteMediaStreams: streams});
        });
    }

    private stop = (streamId: number): void => {
        const mediaStreams = this.state.remoteMediaStreams;
        const stream = mediaStreams.find((stream: NetlessStream) => {
            return stream.getId() === streamId;
        });
        if (stream) {
            const newMediaStreams = this.state.remoteMediaStreams.map(data => {
                if (stream.getId() === stream.getId()) {
                    data.state.isVideoOpen = false;
                    data.state.isAudioOpen = false;
                }
                return data;
            });
            newMediaStreams.splice(newMediaStreams.indexOf(stream), 1);
            this.setState({
                remoteMediaStreams: newMediaStreams,
            });
        }
    }

    private stopLocal = (): void => {
        const localStream = this.state.localStream;
        if (localStream) {
            this.agoraClient.leave(() => {
                localStream.stop();
                localStream.close();
                this.setState({remoteMediaStreams: [], localStream: null});
                console.log("client leaves channel success");
                this.setState({isMaskAppear: false});
            }, (err: any) => {
                console.log("channel leave failed");
                console.error(err);
                this.setState({isMaskAppear: false});
            });
        }
    }

}

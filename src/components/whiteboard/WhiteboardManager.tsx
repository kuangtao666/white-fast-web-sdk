import * as React from "react";
import "./WhiteboardManager.less";
import {Room, Player} from "white-web-sdk";
import * as close from "../../assets/image/close.svg";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {IdentityType} from "./WhiteboardTopRight";
import {RoomMember, ViewMode} from "white-react-sdk";
import {Icon, Radio} from "antd";
import Identicon from "react-identicons";
import {ModeType} from "../../pages/RoomManager";
import speak from "../../assets/image/speak.svg";
import raise_hands_active from "../../assets/image/raise_hands_active.svg";

export type WhiteboardManagerProps = {
    room: Room;
    userId: string;
    handleManagerState: () => void;
    isManagerOpen: boolean;
    cameraState?: ViewMode;
    disableCameraTransform?: boolean;
    identity?: IdentityType;
    userName?: string;
    userAvatarUrl?: string;
    language?: LanguageEnum;
};

export type WhiteboardManagerStates = {
};


export default class WhiteboardManager extends React.Component<WhiteboardManagerProps, WhiteboardManagerStates> {


    public constructor(props: WhiteboardManagerProps) {
        super(props);
    }

    public componentWillReceiveProps(nextProps: WhiteboardManagerProps): void {
        if (this.props.cameraState !== undefined && this.props.disableCameraTransform !== undefined && nextProps.cameraState !== undefined && nextProps.disableCameraTransform !== undefined) {
           if (this.props.cameraState !== nextProps.cameraState) {
               this.props.room.setViewMode(nextProps.cameraState);
               this.props.room.disableCameraTransform = nextProps.disableCameraTransform;
           }
        }
    }

    private getSelfUserInfo = (): any => {
        const globalGuestUsers = this.props.room.state.globalState.guestUsers;
        if (globalGuestUsers) {
            return globalGuestUsers.find((user: any) => user.userId === this.props.userId);
        } else {
            return null;
        }
    }

    private handleHandup = (mode: ModeType, room: Room, userId?: string): void => {
        const globalGuestUsers = room.state.globalState.guestUsers;
        const selfHostInfo = room.state.globalState.hostInfo;
        if (userId) {
            if (mode === ModeType.handUp && globalGuestUsers) {
                const users = globalGuestUsers.map((user: any) => {
                    if (user.userId === this.props.userId) {
                        user.isHandUp = !user.isHandUp;
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        } else {
            if (mode !== ModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: any) => {
                    user.isHandUp = false;
                    user.isReadOnly = true;
                    user.cameraState = ViewMode.Follower;
                    user.disableCameraTransform = true;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Broadcaster;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            } else if (mode === ModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: any) => {
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

    private handleModeText = (mode: ModeType) => {
        switch (mode) {
            case ModeType.discuss: {
                return "自由讨论";
            }
            case ModeType.lecture: {
                return "讲课模式";
            }
            default: {
                return "举手问答";
            }
        }
    }
    private renderHostController = (hostInfo: any): React.ReactNode => {
        const {room} = this.props;
        if (hostInfo.mode) {
            if (this.props.identity === IdentityType.host) {
                return (
                    <Radio.Group style={{marginTop: 6}} value={hostInfo.mode} onChange={evt => {
                        this.handleHandup(evt.target.value, room);
                        room.setGlobalState({hostInfo: {...hostInfo, mode: evt.target.value}});
                    }}>
                        <Radio.Button value={ModeType.lecture}>讲课模式</Radio.Button>
                        <Radio.Button value={ModeType.handUp}>举手问答</Radio.Button>
                        <Radio.Button value={ModeType.discuss}>自由讨论</Radio.Button>
                    </Radio.Group>
                );
            } else {
                return (
                    <div style={{marginTop: 6}}>模式: {this.handleModeText(hostInfo.mode)}</div>
                );
            }
        } else {
            return null;
        }
    }

    private renderHost = (): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        if (hostInfo) {
            return (
                <div className="manager-box-inner-host">
                    <div className="manager-box-image">
                        <img src={hostInfo.avatar}/>
                    </div>
                    <div className="manager-box-text">身份：老师</div>
                    <div className="manager-box-text">名字：{hostInfo.name}</div>
                    {this.renderHostController(hostInfo)}
                </div>
            );
        } else {
            return null;
        }
    }

    private handleAgree = (room: Room, guestUser: any, guestUsers: any[]): void => {
        if (this.props.identity === IdentityType.host) {
            if (guestUsers) {
                const users = guestUsers.map((user: any) => {
                    if (user.userId === guestUser.userId) {
                        user.isReadOnly = false;
                        user.cameraState = ViewMode.Freedom;
                        user.disableCameraTransform = false;
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        }
    }

    private handleUnlock = (state: boolean, room: Room, guestUser: any, guestUsers: any[]): void => {
        const {identity} = this.props;
        if (identity === IdentityType.host && guestUsers) {
            let users;
            if (state) {
                // 解锁
                users = guestUsers.map((user: any) => {
                    if (user.userId === guestUser.userId) {
                        user.isReadOnly = false;
                        user.cameraState = ViewMode.Freedom;
                        user.disableCameraTransform = false;
                    }
                    return user;
                });
            } else {
                // 锁定
                users = guestUsers.map((user: any) => {
                    if (user.userId === guestUser.userId) {
                        user.isReadOnly = true;
                        user.cameraState = ViewMode.Follower;
                        user.isHandUp = false;
                        user.disableCameraTransform = true;
                    }
                    return user;
                });
            }
            room.setGlobalState({guestUsers: users});
        }
    }
    private renderGuestIcon = (guestUser: any, guestUsers: any[]): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        const isHost = this.props.identity === IdentityType.host;
        if (hostInfo.mode === ModeType.handUp) {
            if (guestUser.isHandUp) {
                if (guestUser.isReadOnly) {
                    return (
                        <div className="room-member-icon-box">
                            <div onClick={() => this.handleAgree(room, guestUser, guestUsers)} className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <img src={raise_hands_active}/>
                            </div>
                            <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)} className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <Icon type="lock" />
                            </div>
                        </div>
                    );
                } else {
                    return (
                        <div className="room-member-icon-box">
                            <div className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <img style={{width: 14}} src={speak}/>
                            </div>
                            <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                                 className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                                <Icon type="unlock" />
                            </div>
                        </div>
                    );
                }
            } else {
                if (!guestUser.isReadOnly) {
                    return <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                                className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                        <Icon type="unlock" />
                    </div>;
                } else {
                    return <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)}
                                className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                        <Icon type="lock" />
                    </div>;
                }
            }
        } else {
            if (!guestUser.isReadOnly) {
                return <div onClick={() => this.handleUnlock(false, room, guestUser, guestUsers)}
                            className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                    <Icon type="unlock" />
                </div>;
            } else {
                return <div onClick={() => this.handleUnlock(true, room, guestUser, guestUsers)}
                            className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                    <Icon type="lock" />
                </div>;
            }
        }
    }
    private renderGuest = (): React.ReactNode => {
        const {room} = this.props;
        const globalGuestUsers = room.state.globalState.guestUsers;

        if (globalGuestUsers) {
            const guestNodes = globalGuestUsers.map((guestUser: any, index: number) => {
                return (
                    <div className="room-member-cell" key={`${index}`}>
                        <div className="room-member-cell-inner">
                            {guestUser.avatar ?
                                <div className="manager-avatar-box">
                                    <img className="room-member-avatar"  src={guestUser.avatar}/>
                                </div>
                                :
                                <div className="manager-avatar-box">
                                    <Identicon
                                        size={24}
                                        string={guestUser.userId}/>
                                </div>
                            }
                            <div className="control-box-name">{guestUser.name}</div>
                        </div>
                        {this.renderGuestIcon(guestUser, globalGuestUsers)}
                    </div>
                );
            });
            return (
                <div className="guest-box">
                    <div className="guest-box-title">学生</div>
                    {guestNodes}
                </div>
            );
        } else {
            return null;
        }
    }
    private renderHandUpBtn = (): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        if (this.props.identity === IdentityType.guest && hostInfo.mode === ModeType.handUp) {
            const user = this.getSelfUserInfo();
            if (user) {
                if (user.isReadOnly) {
                    return <div onClick={() => this.handleHandup(hostInfo.mode, room, this.props.userId)}
                                className="manager-under-btn">
                        {user.isHandUp ? "放下" : "举手"}
                    </div>;
                } else {
                    return null;
                }
            } else {
                return <div onClick={() => this.handleHandup(hostInfo.mode, room, this.props.userId)}
                            className="manager-under-btn">
                    {user.isHandUp ? "放下" : "举手"}
                </div>;
            }
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        if (this.props.isManagerOpen) {
            return (
                <div className="manager-box">
                    <div className="chat-box-title">
                        <div className="chat-box-name">
                            <span>课堂管理</span>
                        </div>
                        <div onClick={() => {
                            this.props.handleManagerState();
                        }} className="chat-box-close">
                            <img src={close}/>
                        </div>
                    </div>
                    {this.renderHost()}
                    {this.renderGuest()}
                    {this.renderHandUpBtn()}
                </div>
            );
        } else {
            return null;
        }
    }
}

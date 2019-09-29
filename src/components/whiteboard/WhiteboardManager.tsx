import * as React from "react";
import "./WhiteboardManager.less";
import {Room, Player} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import * as empty from "../../assets/image/empty.svg";
import * as close from "../../assets/image/close.svg";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {IdentityType} from "./WhiteboardTopRight";
import {RoomMember} from "white-react-sdk";
import {Icon, Radio} from "antd";
import Identicon from "react-identicons";
import {ModeType} from "../../pages/RoomManager";

export type WhiteboardManagerProps = {
    room: Room;
    userId: string;
    identity?: IdentityType;
    userName?: string;
    userAvatarUrl?: string;
};

export type WhiteboardManagerStates = {
};


export default class WhiteboardManager extends React.Component<WhiteboardManagerProps, WhiteboardManagerStates> {


    public constructor(props: WhiteboardManagerProps) {
        super(props);
    }


    private handleHandup = (mode: ModeType, room: Room, userId?: string): void => {
        const globalGuestUsers = room.state.globalState.guestUsers;
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
            if (mode !== ModeType.handUp && globalGuestUsers) {
                const users = globalGuestUsers.map((user: any) => {
                    user.isHandUp = false;
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        }
    }
    private renderHostController = (hostInfo: any): React.ReactNode => {
        const {room} = this.props;
        if (this.props.identity === IdentityType.host) {
            return (
                <Radio.Group value={hostInfo.mode} onChange={evt => {
                    this.handleHandup(evt.target.value, room);
                    room.setGlobalState({hostInfo: {...hostInfo, mode: evt.target.value}});
                }}>
                    <Radio.Button value={ModeType.lecture}>lecture</Radio.Button>
                    <Radio.Button value={ModeType.handUp}>handUp</Radio.Button>
                    <Radio.Button value={ModeType.discuss}>discuss</Radio.Button>
                </Radio.Group>
            );
        } else {
            return (
                <div>state: {hostInfo.mode}</div>
            );
        }
    }

    private renderHost = (): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        if (hostInfo) {
            return (
                <div className="manager-box-inner-host">
                    <div>Host</div>
                    <div className="manager-box-image">
                        <img src={hostInfo.avatar}/>
                    </div>
                    <div>name: {hostInfo.name}</div>
                    {this.renderHostController(hostInfo)}
                </div>
            );
        } else {
            return null;
        }
    }

    // private handleAgree = (): void => {
    //     if (mode === ModeType.handUp && globalGuestUsers) {
    //         const users = globalGuestUsers.map((user: any) => {
    //             if (user.userId === this.props.userId) {
    //                 user.isHandUp = !user.isHandUp;
    //             }
    //             return user;
    //         });
    //         room.setGlobalState({guestUsers: users});
    //     }
    // }

    private renderGuestIcon = (guestUser: any): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        const isHost = this.props.identity === IdentityType.host;
        if (hostInfo.mode === ModeType.lecture) {
            return <div className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                <Icon type="lock" />
            </div>;
        } else if (hostInfo.mode === ModeType.handUp) {
            if (guestUser.isHandUp) {
                return <div className={isHost ? "room-member-cell-icon" : "room-member-cell-icon-disable"}>
                    <Icon type="smile" theme="twoTone" />
                </div>;
            } else {
                return null;
            }
        } else {
            return null;
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
                        {this.renderGuestIcon(guestUser)}
                    </div>
                );
            });
            return <div>
                <div>Guest</div>
                {guestNodes}
            </div>;
        } else {
            return null;
        }
    };
    private renderListener = (): React.ReactNode => {
        const {room} = this.props;
        const listenerRoomMembers = room.state.roomMembers.filter((roomMember: RoomMember) => roomMember.payload.identity === IdentityType.listener);
        const listenerNodes = listenerRoomMembers.map((roomMember: RoomMember, index: number) => {
            return (
                <div className="room-member-cell" key={`${index}`}>
                    <div className="room-member-cell-inner">
                        {roomMember.payload.avatar ?
                            <div className="manager-avatar-box">
                                <img className="room-member-avatar"  src={roomMember.payload.avatar}/>
                            </div>
                            :
                            <div className="manager-avatar-box">
                                <Identicon
                                    size={24}
                                    string={roomMember.payload.userId}/>
                            </div>
                        }
                        <div className="control-box-name">{roomMember.payload.name}</div>
                    </div>
                    <div className="room-member-cell-icon">
                        <Icon type="lock" />
                    </div>
                </div>
            );
        });
        if (listenerNodes) {
            return <div>
                <div>Listener</div>
                {listenerNodes}
            </div>;
        } else {
            return null;
        }
    }

    private renderHandUpBtn = (): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        if (this.props.identity === IdentityType.guest && hostInfo.mode === ModeType.handUp) {
            return <div onClick={() => this.handleHandup(hostInfo.mode, room, this.props.userId)} className="manager-under-btn">
                {hostInfo.isHandUp ? "hand down" : "hand up"}
            </div>;
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="manager-box">
                <div className="chat-box-title">
                    <div className="chat-box-name">
                        <span>Room Manager</span>
                    </div>
                    <div className="chat-box-close">
                        <img src={close}/>
                    </div>
                </div>
                {this.renderHost()}
                {this.renderGuest()}
                {this.renderHandUpBtn()}
            </div>
        );
    }
}

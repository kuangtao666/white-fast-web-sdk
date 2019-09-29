import * as React from "react";
import "./WhiteboardManager.less";
import {Room, Player} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import * as empty from "../../assets/image/empty.svg";
import * as close from "../../assets/image/close.svg";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {IdentityType} from "./WhiteboardTopRight";
import {RoomMember} from "white-react-sdk";
import {Icon} from "antd";
import Identicon from "react-identicons";

export type WhiteboardManagerProps = {
    room: Room;
};

export type WhiteboardManagerStates = {
};


export default class WhiteboardManager extends React.Component<WhiteboardManagerProps, WhiteboardManagerStates> {


    public constructor(props: WhiteboardManagerProps) {
        super(props);
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
                    <div>state: {hostInfo.mode}</div>
                </div>
            );
        } else {
            return null;
        }
    }
    private renderGuest = (): React.ReactNode => {
        const {room} = this.props;
        const globalGuestUsers = room.state.globalState.guestUsers;
        if (globalGuestUsers) {
            const guestNodes = globalGuestUsers.map((guestUser: any, index: number) => {
                console.log(guestUser);
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
                        <div className="room-member-cell-lock">
                            <Icon type="lock" />
                        </div>
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
    }
    private renderListener = (): React.ReactNode => {
        const {room} = this.props;
        console.log(78);
        console.log(room.state.roomMembers);
        return null;
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
                {this.renderListener()}
            </div>
        );
    }
}

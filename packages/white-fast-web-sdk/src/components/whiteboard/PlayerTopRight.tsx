import * as React from "react";
import {ViewMode, Player, Scene, DeviceType} from "white-react-sdk";
import {Badge} from "antd";
import Identicon from "react-identicons";
import menu_out from "../../assets/image/menu_out.svg";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {GuestUserType} from "../../pages/RoomManager";
import "./WhiteboardTopRight.less";

export type PlayerTopRightProps = {
    userId: string;
    player: Player;
    handleManagerState: () => void;
    userAvatarUrl?: string;
    userName?: string;
    isReadOnly?: boolean;
    language?: LanguageEnum;
    isManagerOpen: boolean;
    isFirstScreenReady: boolean;
};

export type PlayerTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
    handUpNumber: number;
    seenHandUpNumber: number;
    isInviteVisible: boolean;
    isCloseTipsVisible: boolean;
    url: string;
};


export default class PlayerTopRight extends React.Component<PlayerTopRightProps, PlayerTopRightStates> {

    public constructor(props: PlayerTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            canvas: null,
            imageRef: null,
            handUpNumber: 0,
            seenHandUpNumber: 0,
            isInviteVisible: false,
            isCloseTipsVisible: false,
            url: location.href,
        };
    }

    private handleDotState = (): boolean => {
        if (!this.props.isManagerOpen && this.props.isFirstScreenReady) {
            const guestUsers: GuestUserType[] = this.props.player.state.globalState.guestUsers;
            if (guestUsers && guestUsers.length > 0) {
                const handUpGuestUsers = guestUsers.filter((guestUser: GuestUserType) => guestUser.isHandUp);
                return handUpGuestUsers && handUpGuestUsers.length > 0;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    private handleUserAvatar = (): React.ReactNode => {
        const  {userAvatarUrl, userId} = this.props;
        if (userAvatarUrl) {
            return (
                <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-user">
                    <img src={userAvatarUrl}/>
                </div>
            );
        } else {
            return (
                <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-user">
                    <div className="whiteboard-top-right-avatar">
                        <Identicon
                            className={`avatar-${userId}`}
                            size={22}
                            string={userId}
                        />
                    </div>
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const  {isManagerOpen} = this.props;
        return (
            <div className="whiteboard-top-right-box">
                <div className="whiteboard-top-user-box">
                    {this.handleUserAvatar()}
                </div>
                {!isManagerOpen &&
                <Badge offset={[-5, 7]} dot={this.handleDotState()}>
                    <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={menu_out}/>
                    </div>
                </Badge>}
            </div>
        );

    }
}
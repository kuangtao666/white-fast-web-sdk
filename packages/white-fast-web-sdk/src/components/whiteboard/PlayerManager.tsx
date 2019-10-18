import * as React from "react";
import {Badge, Tabs, Icon, message} from "antd";
import "./WhiteboardManager.less";
import {Player} from "white-web-sdk";
import {LanguageEnum, RtcType} from "../../pages/NetlessRoom";
import {IdentityType} from "./WhiteboardTopRight";
import {RoomMember, ViewMode} from "white-react-sdk";
import Identicon from "react-identicons";
import WhiteboardChat from "./WhiteboardChat";
import {MessageType} from "./WhiteboardBottomRight";
import ClassroomMedia from "./ClassroomMedia";

export type PlayerManagerProps = {
    player?: Player;
    userId: string;
    handleManagerState: () => void;
    isManagerOpen?: boolean;
    uuid?: string;
    userName?: string;
    userAvatarUrl?: string;
    language?: LanguageEnum;
    messages: MessageType[];
};

export type PlayerManagerStates = {
    isLandscape: boolean;
    isRtcReady: boolean,
    isManagerOpen: boolean,
};


export default class PlayerManager extends React.Component<PlayerManagerProps, PlayerManagerStates> {


    public constructor(props: PlayerManagerProps) {
        super(props);
        this.state = {
            isLandscape: false,
            isRtcReady: false,
            isManagerOpen: this.props.isManagerOpen !== undefined ? this.props.isManagerOpen : false,
        };
    }
    public render(): React.ReactNode {
        return (
            <div className="manager-box">
                <div className="replay-video-box">
                </div>
                <div className="chat-box-switch">
                    <WhiteboardChat
                        language={this.props.language}
                        messages={this.props.messages}
                        userAvatarUrl={this.props.userAvatarUrl}
                        userId={this.props.userId}
                        userName={this.props.userName}
                        player={this.props.player}/>
                </div>
            </div>
        );
    }
}

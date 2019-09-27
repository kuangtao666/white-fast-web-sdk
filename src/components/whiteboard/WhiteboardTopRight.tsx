import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene, DeviceType} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import screen_shot from "../../assets/image/screen_shot.svg";
import raise_hands from "../../assets/image/raise_hands.svg";
import html2canvas from "html2canvas";
import download from "downloadjs";
import "./WhiteboardTopRight.less";
import {Button, Icon, message, Popover, Tooltip} from "antd";
import {LanguageEnum} from "../../pages/NetlessRoom";

export type WhiteboardTopRightProps = {
    userId: string;
    room: Room;
    roomState: RoomState;
    whiteboardLayerDownRef: HTMLDivElement;
    deviceType: DeviceType;
    userAvatarUrl?: string;
    userName?: string;
    identity?: IdentityType;
    isReadOnly?: boolean;
    language?: LanguageEnum;
};

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
};

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export default class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightStates> {

    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            canvas: null,
            imageRef: null,
        };
    }

    private handleExportImage = async (): Promise<void> => {
        const {language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        message.loading(isEnglish ? "Exporting image" : "正在导出图片");
        const imageCanvas = await html2canvas(this.props.whiteboardLayerDownRef, {
            useCORS: true,
            logging: false,
        });
        const image = imageCanvas.toDataURL();
        download(image, isEnglish ? "unnamed" : "未命名资料", "image/png");
    }

    private setComponent = (): React.ReactNode => {
        const {room, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        const hostRoomMembers = room.state.roomMembers.filter((roomMember: RoomMember) => roomMember.memberState.identity === IdentityType.host);
        const hostNodes = hostRoomMembers.map((roomMember: RoomMember, index: number) => {
            return (
                <div className="room-member-cell" key={`${index}`}>
                    <div className="room-member-cell-inner">
                        <img className="room-member-avatar"  src={roomMember.payload.avatar}/>
                        <div className="control-box-name">{roomMember.payload.name}</div>
                    </div>
                    <Button onClick={() => {
                        if (room.state.globalState.guestUsers !== undefined) {
                           const users = room.state.globalState.guestUsers.map((data: any) => {
                               data.isReadOnly = true;
                               return data;
                           });
                           room.setGlobalState({guestUsers: users});
                           room.dispatchMagixEvent("take-back-all", {});
                        }
                    }} className="control-box-btn" size={"small"}>控制</Button>
                    <Button className="control-box-btn" size={"small"}>讨论</Button>
                </div>
            );
        });
        const guestRoomMembers = room.state.roomMembers.filter((roomMember: RoomMember) => roomMember.memberState.identity === IdentityType.guest);
        const guestNodes = guestRoomMembers.map((roomMember: RoomMember, index: number) => {
            return (
                <div className="room-member-cell" key={`${index}`}>
                    <div className="room-member-cell-inner">
                        <img className="room-member-avatar"  src={roomMember.payload.avatar}/>
                        <div className="control-box-name">{roomMember.payload.name}</div>
                    </div>
                    <div className="room-member-cell-lock">
                        <Icon type="lock" />
                    </div>
                </div>
            );
        });
        const listenerRoomMembers = room.state.roomMembers.filter((roomMember: RoomMember) => roomMember.memberState.identity === IdentityType.listener);
        const listenerNodes = listenerRoomMembers.map((roomMember: RoomMember, index: number) => {
            return (
                <div className="room-member-cell" key={`${index}`}>
                    <div className="room-member-cell-inner">
                        <img className="room-member-avatar"  src={roomMember.payload.avatar}/>
                        <div className="control-box-name">{roomMember.payload.name}</div>
                    </div>
                    <div className="room-member-cell-lock">
                        <Icon type="lock" />
                    </div>
                </div>
            );
        });
        return (
            <div className="control-box">
                {hostNodes.length > 0 &&
                <div className="control-box-title">
                    {isEnglish ? "Host" : "主持人"}
                </div>}
                {hostNodes}
                {guestNodes.length > 0 &&
                <div className="control-box-title">
                    {isEnglish ? "Guest" : "参与者"}
                </div>
                }
                {guestNodes}
                {listenerNodes.length > 0 &&
                <div className="control-box-title">
                    {isEnglish ? "Listener" : "观众"}
                </div>
                }
                {listenerNodes}
            </div>
        );
    }

    private renderScreenShot = (): React.ReactNode => {
        const  {deviceType, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        const isMobile = deviceType === DeviceType.Touch;
        if (isMobile) {
            return (
                <div onClick={this.handleExportImage} className="whiteboard-top-right-cell">
                    <img style={{width: 22}} src={screen_shot}/>
                </div>
            );
        } else {
            return (
                <Tooltip title={isEnglish ? "Screen shot" : "截图"}>
                    <div onClick={this.handleExportImage} className="whiteboard-top-right-cell">
                        <img style={{width: 22}} src={screen_shot}/>
                    </div>
                </Tooltip>
            );
        }
    }

    private renderSetIcon = (): React.ReactNode => {
        const {identity, room} = this.props;
        if (identity === IdentityType.host) {
            return (
                <Popover trigger="click" placement="bottomRight" content={this.setComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={set_icon}/>
                    </div>
                </Popover>
            );
        } else if (identity === IdentityType.guest) {
            return (
                <div onClick={() => room.dispatchMagixEvent("handup", {userId: this.props.userId, name: this.props.userName, userAvatarUrl: this.props.userAvatarUrl})} className="whiteboard-top-right-cell">
                    <img style={{width: 20}} src={raise_hands}/>
                </div>
            );
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const  {userAvatarUrl} = this.props;
        return (
            <div className="whiteboard-top-right-box">
                {this.renderSetIcon()}
                {this.renderScreenShot()}
                <div className="whiteboard-top-user-box">
                    <div className="whiteboard-top-right-user">
                        <img src={userAvatarUrl}/>
                    </div>
                </div>
            </div>
        );

    }
}

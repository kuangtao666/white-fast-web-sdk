import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene, DeviceType} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import screen_shot from "../../assets/image/screen_shot.svg";
import html2canvas from "html2canvas";
import download from "downloadjs";
import "./WhiteboardTopRight.less";
import {Badge, Button, Icon, message, Popover, Tooltip} from "antd";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {GuestUserType} from "../../pages/RoomManager";

export type WhiteboardTopRightProps = {
    userId: string;
    room: Room;
    roomState: RoomState;
    whiteboardLayerDownRef: HTMLDivElement;
    handleManagerState: () => void;
    deviceType: DeviceType;
    userAvatarUrl?: string;
    userName?: string;
    identity?: IdentityType;
    isReadOnly?: boolean;
    language?: LanguageEnum;
    isManagerOpen: boolean;
};

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
    handUpNumber: number;
    seenHandUpNumber: number;
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
            handUpNumber: 0,
            seenHandUpNumber: 0,
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

    private handleDotState = (): boolean => {
        if (!this.props.isManagerOpen) {
            const guestUsers: GuestUserType[] = this.props.room.state.globalState.guestUsers;
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

    public render(): React.ReactNode {
        const  {userAvatarUrl} = this.props;
        const isHost = this.props.identity === IdentityType.host;
        return (
            <div className="whiteboard-top-right-box">
                {isHost &&
                <Badge offset={[-5, 7]} dot={this.handleDotState()}>
                    <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={set_icon}/>
                    </div>
                </Badge>}
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

import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene, DeviceType} from "white-react-sdk";
import QRCode from "qrcode.react";
import set_icon from "../../assets/image/set_icon.svg";
// import screen_shot from "../../assets/image/screen_shot.svg";
import * as add from "../../assets/image/add.svg";
// import html2canvas from "html2canvas";
// import download from "downloadjs";
import {Badge, Button, Icon, message, Popover, Tooltip, Modal, Input} from "antd";
import Clipboard from "react-clipboard.js";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {GuestUserType} from "../../pages/RoomManager";
import "./WhiteboardTopRight.less";

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
    isInviteVisible: boolean;
    url: string;
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
            isInviteVisible: false,
            url: location.href,
        };
    }
    // private handleExportImage = async (): Promise<void> => {
    //     const {language} = this.props;
    //     const isEnglish = language === LanguageEnum.English;
    //     message.loading(isEnglish ? "Exporting image" : "正在导出图片");
    //     const imageCanvas = await html2canvas(this.props.whiteboardLayerDownRef, {
    //         useCORS: true,
    //         logging: false,
    //     });
    //     const image = imageCanvas.toDataURL();
    //     download(image, isEnglish ? "unnamed" : "未命名资料", "image/png");
    // }


    // private renderScreenShot = (): React.ReactNode => {
    //     const  {deviceType, language} = this.props;
    //     const isEnglish = language === LanguageEnum.English;
    //     const isMobile = deviceType === DeviceType.Touch;
    //     if (isMobile) {
    //         return (
    //             <div onClick={this.handleExportImage} className="whiteboard-top-right-cell">
    //                 <img style={{width: 22}} src={screen_shot}/>
    //             </div>
    //         );
    //     } else {
    //         return (
    //             <Tooltip title={isEnglish ? "Screen shot" : "截图"}>
    //                 <div onClick={this.handleExportImage} className="whiteboard-top-right-cell">
    //                     <img style={{width: 22}} src={screen_shot}/>
    //                 </div>
    //             </Tooltip>
    //         );
    //     }
    // }

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

    private handleUrl = (url: string): string => {
        let classUrl;
        if (this.props.identity === IdentityType.host) {
            classUrl = url.replace(`${IdentityType.host}/`, `${IdentityType.guest}/`);
        } else {
            classUrl = url;
        }
        if (this.props.isReadOnly) {
            classUrl = classUrl.replace(`${IdentityType.guest}/`, `${IdentityType.listener}/`);
        }
        const regex = /[\w]+\/$/gm;
        const match = regex.exec(classUrl);
        if (match) {
            return classUrl.substring(0, match.index);
        } else {
            return classUrl;
        }
    }
    // private renderShareTitle = (): React.ReactNode => {
    //     if (this.props.identity === IdentityType.host) {
    //         if (this.props.) {
    //             return  "未开启只读模式";
    //         } else {
    //             return  "已开启只读模式";
    //         }
    //     } else {
    //         return "分享只读房间";
    //     }
    // }
    // private switchWhiteboardRoomType = (): void => {
    //     if (this.state.netlessRoomType === NetlessRoomType.interactive) {
    //         const shareUrl = this.state.url.replace(`${NetlessRoomType.interactive}`, `${NetlessRoomType.live}`);
    //         this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.live});
    //     } else if (this.state.netlessRoomType === NetlessRoomType.teacher_interactive) {
    //         const shareUrl = this.state.url.replace(`${NetlessRoomType.teacher_interactive}`, `${NetlessRoomType.live}`);
    //         this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.live});
    //     } else {
    //         const shareUrl = this.state.url.replace(`${NetlessRoomType.live}`, `${NetlessRoomType.interactive}`);
    //         this.setState({url: shareUrl, netlessRoomType: NetlessRoomType.interactive});
    //     }
    // }
    private handleInvite = (): void => {
        this.setState({isInviteVisible: true});
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
                {/*{this.renderScreenShot()}*/}
                <div
                    className="whiteboard-top-right-cell" onClick={this.handleInvite}>
                    <img style={{width: 18}} src={add}/>
                </div>
                <div className="whiteboard-top-user-box">
                    <div className="whiteboard-top-right-user">
                        <img src={userAvatarUrl}/>
                    </div>
                </div>
                <Modal
                    visible={this.state.isInviteVisible}
                    footer={null}
                    title="邀请"
                    onCancel={() => this.setState({isInviteVisible: false})}
                >
                    <div className="whiteboard-share-box">
                        <QRCode value={`${this.handleUrl(this.state.url)}`} />
                        <div className="whiteboard-share-text-box">
                            <Input readOnly size="large" value={`${this.handleUrl(this.state.url)}`}/>
                            <Clipboard
                                data-clipboard-text={`${this.handleUrl(this.state.url)}`}
                                component="div"
                                onSuccess={() => {
                                    message.success("Copy already copied address to clipboard");
                                    this.setState({isInviteVisible: false});
                                }}
                            >
                                <Button style={{marginTop: 16, width: 240}} size="large" type="primary">复制链接</Button>
                            </Clipboard>
                        </div>
                    </div>
                </Modal>
            </div>
        );

    }
}

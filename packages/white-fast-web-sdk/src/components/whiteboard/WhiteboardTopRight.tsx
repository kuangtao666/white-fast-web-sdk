import * as React from "react";
import {ViewMode, Room, RoomState, Scene, DeviceType} from "white-react-sdk";
import {Badge, Button, message, Modal, Input} from "antd";
import Clipboard from "react-clipboard.js";
import Identicon from "react-identicons";
import QRCode from "qrcode.react";
import menu_out from "../../assets/image/menu_out.svg";
import stop_icon from "../../assets/image/stop_icon.svg";
import replay_video_cover_en from "../../assets/image/replay_video_cover_en.svg";
import replay_video_cover from "../../assets/image/replay_video_cover.svg";
import * as add from "../../assets/image/add.svg";
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
    exitRoomCallback?: () => void;
    replayCallback?: () => void;
};

export type WhiteboardTopRightStates = {
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
            isCloseTipsVisible: false,
            url: location.href,
        };
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
    private handleInvite = (): void => {
        this.setState({isInviteVisible: true});
    }

    private handleClose = (): void => {
        this.setState({isCloseTipsVisible: true});
    }
    private handleUserAvatar = (): React.ReactNode => {
        const  {userAvatarUrl, userId} = this.props;
        const isHost = this.props.identity === IdentityType.host;
        if (isHost) {
            return (
                <div onClick={this.handleClose} className="whiteboard-top-right-user">
                    <img src={stop_icon}/>
                </div>
            );
        } else {
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
    }
    public render(): React.ReactNode {
        const  {isManagerOpen, language} = this.props;
        const isHost = this.props.identity === IdentityType.host;
        const isEnglish = this.props.language === language;
        return (
            <div className="whiteboard-top-right-box">
                <div
                    className="whiteboard-top-right-cell" onClick={this.handleInvite}>
                    <img style={{width: 18}} src={add}/>
                </div>
                <div className="whiteboard-top-user-box">
                    {this.handleUserAvatar()}
                </div>
                {(isHost && !isManagerOpen) &&
                <Badge offset={[-5, 7]} dot={this.handleDotState()}>
                    <div onClick={() => this.props.handleManagerState()} className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={menu_out}/>
                    </div>
                </Badge>}
                <Modal
                    visible={this.state.isInviteVisible}
                    footer={null}
                    title={isEnglish ? "Invite" : "邀请"}
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
                                    if (isEnglish) {
                                        message.success("Copy already copied address to clipboard");
                                    } else {
                                        message.success("已经将链接复制到剪贴板");
                                    }
                                    this.setState({isInviteVisible: false});
                                }}
                            >
                                <Button style={{marginTop: 16, width: 240}} size="large" type="primary">
                                    {isEnglish ? "Copy Link" : "复制链接"}
                                </Button>
                            </Clipboard>
                        </div>
                    </div>
                </Modal>
                <Modal
                    visible={this.state.isCloseTipsVisible}
                    footer={null}
                    title={isEnglish ? "Exit classroom" : "退出教室"}
                    onCancel={() => this.setState({isCloseTipsVisible: false})}
                >
                    <div className="whiteboard-share-box">
                        <div className="whiteboard-share-text-box">
                            <div onClick={() => {
                                if (this.props.replayCallback) {
                                    this.props.replayCallback();
                                    this.setState({isCloseTipsVisible: false});
                                }
                            }} className="replay-video-cover">
                                {isEnglish ?
                                    <img src={replay_video_cover_en}/> :
                                    <img src={replay_video_cover}/>
                                }
                            </div>
                            <Button
                                    onClick={() => {
                                        if (this.props.exitRoomCallback) {
                                            this.props.exitRoomCallback();
                                            this.setState({isCloseTipsVisible: false});
                                        }
                                    }}
                                    style={{marginTop: 16, width: 240}}
                                    size="large">
                                {isEnglish ? "Confirm exit" : "确认退出"}
                            </Button>
                        </div>
                    </div>
                </Modal>
            </div>
        );

    }
}

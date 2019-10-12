import * as React from "react";
import {ViewMode, Room, RoomState, Scene, DeviceType} from "white-react-sdk";
import QRCode from "qrcode.react";
import set_icon from "../../assets/image/set_icon.svg";
import * as add from "../../assets/image/add.svg";
import {Badge, Button, message, Modal, Input} from "antd";
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

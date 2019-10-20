import * as React from "react";
import * as annex_box from "../../assets/image/annex_box.svg";
import * as left_arrow from "../../assets/image/left_arrow.svg";
import * as right_arrow from "../../assets/image/right_arrow.svg";
import * as chat from "../../assets/image/chat.svg";
import * as handup from "../../assets/image/handup.svg";
import * as handup_black from "../../assets/image/handup_black.svg";
import "./WhiteboardBottomRight.less";
import {Badge, message, Tooltip} from "antd";
import {Room, Scene, RoomState} from "white-web-sdk";
import {LanguageEnum} from "../../pages/NetlessRoom";
import {DeviceType, ViewMode} from "white-react-sdk";
import {GuestUserType, HostUserType, ClassModeType} from "../../pages/RoomManager";

export type MessageType = {
    name: string,
    avatar: string,
    id: string,
    messageInner: string[],
};



export type hotkeyTooltipState = {
    hotkeyTooltipDisplay: boolean,
    messages:  MessageType[],
    seenMessagesLength: number,
};

export type WhiteboardBottomRightProps = {
    room: Room;
    roomState: RoomState;
    userId: string;
    handleAnnexBoxMenuState: () => void;
    handleChatState: () => void;
    deviceType: DeviceType;
    isReadOnly?: boolean;
    isManagerOpen: boolean;
    language?: LanguageEnum;
};

export default class WhiteboardBottomRight extends React.Component<WhiteboardBottomRightProps, hotkeyTooltipState> {

    public constructor(props: WhiteboardBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
        };
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    public componentWillReceiveProps(nextProps: WhiteboardBottomRightProps): void {
        if (this.props.isManagerOpen !== nextProps.isManagerOpen && !nextProps.isManagerOpen) {
            this.setState({seenMessagesLength: this.state.messages.length});
        }
    }

    private pageNumber = (): React.ReactNode => {
        const {deviceType, language, roomState} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        const isMobile = deviceType === DeviceType.Touch;
        const isEnglish = language === LanguageEnum.English;
        if (isMobile) {
            return (
                <div
                    onClick={this.props.handleAnnexBoxMenuState}
                    className="whiteboard-annex-arrow-mid">
                    <div className="whiteboard-annex-img-box">
                        <img src={annex_box}/>
                    </div>
                    <div className="whiteboard-annex-arrow-page">
                        {activeIndex + 1} / {scenes.length}
                    </div>
                </div>
            );
        } else {
            return (
                <Tooltip placement="top" title={isEnglish ? "Preview" : "预览"}>
                    <div
                        onClick={this.props.handleAnnexBoxMenuState}
                        className="whiteboard-annex-arrow-mid">
                        <div className="whiteboard-annex-img-box">
                            <img src={annex_box}/>
                        </div>
                        <div className="whiteboard-annex-arrow-page">
                            {activeIndex + 1} / {scenes.length}
                        </div>
                    </div>
                </Tooltip>
            );
        }
    }

    private pageIcon = (): React.ReactNode => {
        const {deviceType, language} = this.props;
        const isMobile = deviceType === DeviceType.Touch;
        const isEnglish = language === LanguageEnum.English;
        if (isMobile) {
            return (
                <div
                    onClick={this.props.handleAnnexBoxMenuState}
                    className="whiteboard-bottom-right-cell">
                    <img src={annex_box}/>
                </div>
            );
        } else {
            return (
                <Tooltip placement="topRight" title={isEnglish ? "Preview" : "预览"}>
                    <div
                        onClick={this.props.handleAnnexBoxMenuState}
                        className="whiteboard-bottom-right-cell">
                        <img src={annex_box}/>
                    </div>
                </Tooltip>
            );
        }
    }
    private renderAnnexBox = (): React.ReactNode => {
        const {roomState, room} = this.props;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left">
                            <img src={left_arrow}/>
                        </div>
                        {this.pageNumber()}
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right">
                            <img src={right_arrow}/>
                        </div>
                    </div> :
                    this.pageIcon()
                }
            </div>
        );
    }
    private getSelfUserInfo = (): GuestUserType | null => {
        const globalGuestUsers: GuestUserType[] = this.props.room.state.globalState.guestUsers;
        if (globalGuestUsers) {
            const self = globalGuestUsers.find((user: GuestUserType) => user.userId === this.props.userId);
            if (self) {
                return self;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    private handleHandup = (mode: ClassModeType, room: Room, userId?: string): void => {
        const {language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        const globalGuestUsers: GuestUserType[] = room.state.globalState.guestUsers;
        const selfHostInfo: HostUserType = room.state.globalState.hostInfo;
        if (userId) {
            if (mode === ClassModeType.handUp && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    if (user.userId === this.props.userId) {
                        user.isHandUp = !user.isHandUp;
                        if (user.isHandUp) {
                            if (isEnglish) {
                                message.info("You have raised your hand, please wait for approval.");
                            } else {
                                message.info("您已举手，请等待批准。");
                            }
                        } else {
                            if (isEnglish) {
                                message.info("You have cancelled your raise.");
                            } else {
                                message.info("您已取消举手。");
                            }
                        }
                    }
                    return user;
                });
                room.setGlobalState({guestUsers: users});
            }
        } else {
            if (mode !== ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
                    user.isHandUp = false;
                    user.isReadOnly = true;
                    user.cameraState = ViewMode.Follower;
                    user.disableCameraTransform = true;
                    return user;
                });
                selfHostInfo.cameraState = ViewMode.Broadcaster;
                selfHostInfo.disableCameraTransform = false;
                room.setGlobalState({guestUsers: users, hostInfo: selfHostInfo});
            } else if (mode === ClassModeType.discuss && globalGuestUsers) {
                const users = globalGuestUsers.map((user: GuestUserType) => {
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

    private renderHandUpBtn = (): React.ReactNode => {
        const {room} = this.props;
        const hostInfo = room.state.globalState.hostInfo;
        if (hostInfo && hostInfo.classMode === ClassModeType.handUp) {
            const user = this.getSelfUserInfo();
            if (user) {
                if (user.isReadOnly) {
                    return <div onClick={() => this.handleHandup(hostInfo.classMode, room, this.props.userId)}
                                className="manager-under-btn">
                        <img src={user.isHandUp ? handup_black : handup}/>
                    </div>;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    public render(): React.ReactNode {
        const {isReadOnly} = this.props;
        if (isReadOnly) {
            return (
                <div className="whiteboard-box-bottom-right">
                    <div className="whiteboard-box-bottom-right-mid">
                        {this.renderHandUpBtn()}
                        <Badge overflowCount={99} offset={[-3, 6]} count={this.props.isManagerOpen ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                            <div onClick={this.props.handleChatState} className="whiteboard-box-bottom-left-chart">
                                <img src={chat}/>
                            </div>
                        </Badge>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="whiteboard-box-bottom-right">
                    <div className="whiteboard-box-bottom-right-mid">
                        {this.renderAnnexBox()}
                        <Badge overflowCount={99} offset={[-3, 6]} count={this.props.isManagerOpen ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                            <div onClick={this.props.handleChatState} className="whiteboard-box-bottom-left-chart">
                                <img src={chat}/>
                            </div>
                        </Badge>
                    </div>
                </div>
            );
        }
    }
}

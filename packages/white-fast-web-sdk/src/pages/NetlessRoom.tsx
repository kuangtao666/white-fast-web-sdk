import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import {Icon, message} from "antd";
import Dropzone from "react-dropzone";
import {
    WhiteWebSdk,
    RoomWhiteboard,
    Room,
    RoomState,
    RoomPhase,
    PptConverter,
    MemberState,
    ViewMode,
    DeviceType,
} from "white-react-sdk";
import "white-web-sdk/style/index.css";
import "./NetlessRoom.less";
import PageError from "../components/PageError";
import WhiteboardTopRight, {IdentityType} from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "../components/whiteboard/WhiteboardBottomRight";
import MenuBox from "../components/menu/MenuBox";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import {ossConfigObj} from "../appToken";
import {UserCursor} from "../components/whiteboard/UserCursor";
import ToolBox, {CustomerComponentPositionType} from "../tools/toolBox/index";
import UploadBtn from "../tools/upload/UploadBtn";
import {RoomContextProvider} from "./RoomContext";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardFile from "../components/whiteboard/WhiteboardFile";
import {PPTDataType} from "../components/menu/PPTDatas";
import LoadingPage from "../components/LoadingPage";
import {isMobile} from "react-device-detect";
import {GuestUserType, HostUserType, ModeType, RoomManager} from "./RoomManager";
import WhiteboardManager from "../components/whiteboard/WhiteboardManager";
import ExtendTool from "../tools/extendTool/ExtendTool";
import {Iframe} from "../components/Iframe";
import {Editor} from "../components/Editor";
import WhiteboardRecord from "../components/whiteboard/WhiteboardRecord";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export enum MenuInnerType {
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
}

export enum LanguageEnum {
    Chinese = "Chinese",
    English = "English",
}

export enum UploadDocumentEnum {
    image = "image",
    static_conversion = "static_conversion",
    dynamic_conversion = "dynamic_conversion",
}

export enum RtcEnum {
    agora = "agora",
    zego = "zego",
    qiniu = "qiniu",
}

export type UploadToolBoxType = {
    enable: boolean,
    type: UploadDocumentEnum,
    icon?: string,
    title?: string,
    script?: string,
};

export type RtcType = {
    type: RtcEnum,
    rtcObj: any,
    token: string,
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};
export type RealTimeProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    mode?: ModeType,
    userName?: string;
    roomName?: string;
    userAvatarUrl?: string;
    isReadOnly?: boolean;
    uploadToolBox?: UploadToolBoxType[],
    toolBarPosition?: ToolBarPositionEnum;
    pagePreviewPosition?: PagePreviewPositionEnum;
    boardBackgroundColor?: string;
    defaultColorArray?: string[];
    identity?: IdentityType;
    colorArrayStateCallback?: (colorArray: string[]) => void;
    roomRenameCallback?: (name: string) => void;
    documentArray?: PPTDataType[];
    roomCallback?: (room: Room) => void;
    logoUrl?: string;
    loadingSvgUrl?: string;
    language?: LanguageEnum;
    clickLogoCallback?: () => void;
    deviceType?: DeviceType;
    rtc?: RtcType;
    exitRoomCallback?: () => void;
    replayCallback?: () => void;
    recordDataCallback?: (data: RecordDataType) => void;
    isManagerOpen?: boolean;
};

export enum ToolBarPositionEnum {
    top = "top",
    bottom = "bottom",
    left = "left",
    right = "right",
}

export enum PagePreviewPositionEnum {
    left = "left",
    right = "right",
}

export type RealTimeStates = {
    phase: RoomPhase;
    connectedFail: boolean;
    didSlaveConnected: boolean;
    menuInnerState: MenuInnerType;
    isMenuVisible: boolean;
    roomToken: string | null;
    ossPercent: number;
    converterPercent: number;
    isPreviewMenuOpen: boolean;
    isFileMenuOpen: boolean;
    isChatOpen: boolean;
    isFileOpen: boolean;
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    progressDescription?: string,
    fileUrl?: string,
    whiteboardLayerDownRef?: HTMLDivElement;
    isManagerOpen: boolean;
    deviceType: DeviceType;
    mode?: ModeType,
};

export default class NetlessRoom extends React.Component<RealTimeProps, RealTimeStates> {
    private didLeavePage: boolean = false;
    private roomManager: RoomManager;
    private readonly cursor: UserCursor;
    public constructor(props: RealTimeProps) {
        super(props);
        this.state = {
            phase: RoomPhase.Connecting,
            connectedFail: false,
            didSlaveConnected: false,
            menuInnerState: MenuInnerType.PPTBox,
            isMenuVisible: false,
            roomToken: null,
            ossPercent: 0,
            converterPercent: 0,
            isPreviewMenuOpen: false,
            isFileMenuOpen: false,
            isChatOpen: false,
            isFileOpen: false,
            deviceType: DeviceType.Desktop,
            isManagerOpen: this.props.isManagerOpen ? this.props.isManagerOpen : false,
            mode: this.props.mode ? this.props.mode : ModeType.discuss,
        };
        this.cursor = new UserCursor();
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, roomToken, roomCallback, userId, userName, userAvatarUrl, identity} = this.props;
        const {mode} = this.state;
        if (roomToken && uuid) {
            let whiteWebSdk;
            if (isMobile) {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Touch, plugins: [Iframe, Editor]});
            } else {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Surface, handToolKey: " ", plugins: [Iframe, Editor]});
            }
            const pptConverter = whiteWebSdk.pptConverter(roomToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {
                        userId: userId,
                        name: userName,
                        avatar: userAvatarUrl,
                        identity: identity,
                    }},
                {
                    onPhaseChanged: phase => {
                        console.log(phase);
                        if (!this.didLeavePage) {
                            this.setState({phase});
                        }
                        console.log(`room ${"uuid"} changed: ${phase}`);
                    },
                    onDisconnectWithError: error => {
                        console.error(error);
                    },
                    onKickedWithReason: reason => {
                        console.error("kicked with reason: " + reason);
                    },
                    onRoomStateChanged: modifyState => {
                        if (modifyState.roomMembers) {
                            this.cursor.setColorAndAppliance(modifyState.roomMembers);
                        }
                        this.setState({
                            roomState: {...this.state.roomState, ...modifyState} as RoomState,
                        });
                    },
                });
            room.moveCameraToContain({
                originX: - 600,
                originY: - 337.5,
                width: 1200,
                height: 675,
                animationMode: "immediately",
            });
            this.roomManager = new RoomManager(userId, room, userAvatarUrl, identity, userName, mode);
            await this.roomManager.start();
            if (roomCallback) {
                roomCallback(room);
            }
            this.setState({room: room, roomState: room.state, roomToken: roomToken});
        } else {
            message.error("join fail");
        }
    }

    private onWindowResize = (): void => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }
    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
        if (this.props.deviceType) {
            this.setState({deviceType: this.props.deviceType});
        } else {
           if (isMobile) {
               this.setState({deviceType: DeviceType.Touch});
           } else {
               this.setState({deviceType: DeviceType.Desktop});
           }
        }
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
        this.onWindowResize();
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }

    public async componentWillUnmount(): Promise<void> {
        this.didLeavePage = true;
        if (this.state.room) {
            this.state.room.removeMagixEventListener("handup");
            await this.state.room.disconnect();
        }
        if (this.roomManager) {
            this.roomManager.stop();
        }
        window.removeEventListener("resize", this.onWindowResize);
    }
    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
                    isPreviewMenuOpen={this.state.isPreviewMenuOpen}
                    room={this.state.room!}
                    roomState={this.state.roomState!}
                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>;
            default:
                return null;
        }
    }


    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    private handleAnnexBoxMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.AnnexBox,
        });
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
    }

    private onDropFiles = async (
        acceptedFiles: File[],
        rejectedFiles: File[],
        event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        try {
            const imageFiles = acceptedFiles.filter(file => this.isImageType(file.type));
            const client = new OSS({
                accessKeyId: ossConfigObj.accessKeyId,
                accessKeySecret: ossConfigObj.accessKeySecret,
                region: ossConfigObj.region,
                bucket: ossConfigObj.bucket,
            });
            const uploadManager = new UploadManager(client, this.state.room!);
            await Promise.all([
                uploadManager.uploadImageFiles(imageFiles, event.clientX, event.clientY),
            ]);
        } catch (error) {
            this.state.room!.setMemberState({
                currentApplianceName: "selector",
            });
        }
    }

    private progress = (phase: PPTProgressPhase, percent: number): void => {
        message.config({
            maxCount: 1,
        });
        switch (phase) {
            case PPTProgressPhase.Uploading: {
                this.setState({ossPercent: percent * 100});
                break;
            }
            case PPTProgressPhase.Converting: {
                this.setState({converterPercent: percent * 100});
                break;
            }
        }
    }
    private setPreviewMenuState = (state: boolean) => {
        this.setState({isPreviewMenuOpen: state});
    }
    private setFileMenuState = (state: boolean) => {
        this.setState({isFileMenuOpen: state});
    }
    private setMemberState = (modifyState: Partial<MemberState>) => {
        this.state.room!.setMemberState(modifyState);
    }

    private handleChatState = async (): Promise<void> => {
        if (!this.state.isManagerOpen) {
            this.setState({isChatOpen: true, isManagerOpen: true});
            await timeout(100);
            this.onWindowResize();
        } else {
            this.setState({isChatOpen: true});
        }
    }
    private handleManagerState = async (): Promise<void> => {
        if (this.state.isManagerOpen) {
            this.setState({isManagerOpen: false, isChatOpen: false});
        } else {
            this.setState({isManagerOpen: true});
        }
        await timeout(100);
        this.onWindowResize();
    }
    private handleFileState = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen});
    }

    private detectIsReadOnly = (): boolean => {
        const {identity, userId} = this.props;
        const {room} = this.state;
        if (identity === IdentityType.listener) {
            return true;
        } else if (identity === IdentityType.host) {
            return false;
        }
        if (room) {
            const selfUser: GuestUserType = room.state.globalState.guestUsers.find((user: GuestUserType) => user.userId === userId);
            if (selfUser) {
                room.disableDeviceInputs = selfUser.isReadOnly;
                return selfUser.isReadOnly;
            } else {
                if (this.props.isReadOnly) {
                    room.disableDeviceInputs = this.props.isReadOnly;
                    return this.props.isReadOnly;
                } else {
                    return true;
                }
            }
        } else {
            return true;
        }
    }
    public render(): React.ReactNode {
        const {phase, connectedFail, room, roomState} = this.state;
        const {language, loadingSvgUrl, userId} = this.props;
        const isReadOnly = this.detectIsReadOnly();
        if (connectedFail || phase === RoomPhase.Disconnected) {
            return <PageError/>;
        } else if (phase === RoomPhase.Reconnecting) {
            return <LoadingPage language={language} phase={phase} loadingSvgUrl={loadingSvgUrl}/>;
        } else if (phase === RoomPhase.Connecting ||
            phase === RoomPhase.Disconnecting) {
            return <LoadingPage language={language} phase={phase} loadingSvgUrl={loadingSvgUrl}/>;
        } else if (!room) {
            return <LoadingPage language={language} phase={phase} loadingSvgUrl={loadingSvgUrl}/>;
        } else if (!roomState) {
            return <LoadingPage language={language} phase={phase} loadingSvgUrl={loadingSvgUrl}/>;
        } else {
            let cameraState;
            let disableCameraTransform;
            if (this.props.identity === IdentityType.host) {
                const userSelf: HostUserType = room.state.globalState.hostInfo;
                if (userSelf) {
                    cameraState = userSelf.cameraState;
                    disableCameraTransform = userSelf.disableCameraTransform;
                }
            } else if (this.props.identity === IdentityType.guest) {
                const userSelf: GuestUserType = room.state.globalState.guestUsers.find((user: GuestUserType) => user.userId === userId);
                if (userSelf) {
                    cameraState = userSelf.cameraState;
                    disableCameraTransform = userSelf.disableCameraTransform;
                }
            } else {
                cameraState = ViewMode.Follower;
                disableCameraTransform = true;
            }
            return (
                <RoomContextProvider value={{
                    onColorArrayChange: this.props.colorArrayStateCallback,
                    whiteboardLayerDownRef: this.state.whiteboardLayerDownRef!,
                    room: room,
                }}>
                    <div className="realtime-box">
                        <MenuBox
                            pagePreviewPosition={this.props.pagePreviewPosition}
                            setMenuState={this.setPreviewMenuState}
                            isVisible={this.state.isMenuVisible}
                        >
                            {this.renderMenuInner()}
                        </MenuBox>
                        <MenuBox
                            pagePreviewPosition={PagePreviewPositionEnum.left}
                            setMenuState={this.setFileMenuState}
                            sideMenuWidth={336}
                            isVisible={this.state.isFileOpen}
                        >
                            <WhiteboardFile
                                handleFileState={this.handleFileState}
                                isFileMenuOpen={this.state.isFileMenuOpen}
                                language={this.props.language}
                                documentArray={this.props.documentArray}
                                room={room}/>
                        </MenuBox>
                        <Dropzone
                            accept={"image/*"}
                            disableClick={true}
                            className="whiteboard-out-box"
                            onDrop={this.onDropFiles}>
                            <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                            <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                            <WhiteboardTopLeft
                                clickLogoCallback={this.props.clickLogoCallback}
                                roomRenameCallback={this.props.roomRenameCallback}
                                identity={this.props.identity}
                                roomName={this.props.roomName}
                                logoUrl={this.props.logoUrl}/>
                            {this.state.whiteboardLayerDownRef &&
                            <WhiteboardTopRight
                                isManagerOpen={this.state.isManagerOpen}
                                exitRoomCallback={this.props.exitRoomCallback}
                                handleManagerState={this.handleManagerState}
                                whiteboardLayerDownRef={this.state.whiteboardLayerDownRef}
                                roomState={roomState} deviceType={this.state.deviceType}
                                identity={this.props.identity}
                                userName={this.props.userName}
                                userId={this.props.userId}
                                room={room}
                                replayCallback={this.props.replayCallback}
                                language={this.props.language}
                                isReadOnly={isReadOnly}
                                userAvatarUrl={this.props.userAvatarUrl}/>}
                            <WhiteboardBottomLeft
                                handleFileState={this.handleFileState}
                                isReadOnly={isReadOnly}
                                identity={this.props.identity}
                                deviceType={this.state.deviceType}
                                roomState={roomState}
                                room={room}/>
                            <WhiteboardBottomRight
                                isManagerOpen={this.state.isManagerOpen}
                                deviceType={this.state.deviceType}
                                roomState={roomState}
                                userId={this.props.userId}
                                language={this.props.language}
                                isReadOnly={isReadOnly}
                                handleChatState={this.handleChatState}
                                handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                room={room}/>
                            {this.props.identity === IdentityType.host &&
                            <WhiteboardRecord
                                recordDataCallback={this.props.recordDataCallback}
                                channelName={this.props.uuid}/>}
                            <ToolBox
                                isReadOnly={isReadOnly}
                                language={this.props.language}
                                toolBarPosition={this.props.toolBarPosition}
                                colorConfig={this.props.defaultColorArray}
                                setMemberState={this.setMemberState}
                                customerComponent={[
                                    <UploadBtn
                                        toolBarPosition={this.props.toolBarPosition}
                                        deviceType={this.state.deviceType}
                                        oss={ossConfigObj}
                                        room={room}
                                        uploadToolBox={this.props.uploadToolBox}
                                        roomToken={this.state.roomToken}
                                        onProgress={this.progress}
                                        language={this.props.language}
                                        whiteboardRef={this.state.whiteboardLayerDownRef}
                                    />,
                                    <ExtendTool toolBarPosition={this.props.toolBarPosition}/>,
                                ]} customerComponentPosition={CustomerComponentPositionType.end}
                                memberState={room.state.memberState}/>
                            <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                {this.renderWhiteboard()}
                            </div>
                        </Dropzone>
                        <WhiteboardManager
                            uuid={this.props.uuid}
                            userAvatarUrl={this.props.userAvatarUrl}
                            userName={this.props.userName}
                            userId={this.props.userId}
                            isChatOpen={this.state.isChatOpen}
                            rtc={this.props.rtc}
                            identity={this.props.identity}
                            isManagerOpen={this.state.isManagerOpen}
                            handleManagerState={this.handleManagerState}
                            cameraState={cameraState}
                            disableCameraTransform={disableCameraTransform}
                            room={room}/>
                        {isReadOnly &&
                        <div onClick={() => message.warning("老师正在讲课，屏幕被锁定。")} className="lock-icon">
                            <Icon type="lock"/>
                        </div>}
                    </div>
                </RoomContextProvider>
            );
        }
    }
    private renderWhiteboard(): React.ReactNode {
        const {boardBackgroundColor} = this.props;
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room}
                                   style={{width: "100%", height: "100%", backgroundColor: boardBackgroundColor ? boardBackgroundColor : "white"}}/>;
        } else {
            return null;
        }
    }
}

import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import {Button, message, notification} from "antd";
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
import WhiteboardChat from "../components/whiteboard/WhiteboardChat";
import WhiteboardFile from "../components/whiteboard/WhiteboardFile";
import {PPTDataType} from "../components/menu/PPTDatas";
import LoadingPage from "../components/LoadingPage";
import {isMobile} from "react-device-detect";
import Identicon from "react-identicons";

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

export type UploadToolBoxType = {
    enable: boolean,
    type: UploadDocumentEnum,
    icon?: string,
    title?: string,
    script?: string,
};
export type RealTimeProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    userName?: string;
    userAvatarUrl?: string;
    isReadOnly?: boolean;
    uploadToolBox?: UploadToolBoxType[],
    toolBarPosition?: ToolBarPositionEnum;
    pagePreviewPosition?: PagePreviewPositionEnum;
    boardBackgroundColor?: string;
    defaultColorArray?: string[];
    identity?: IdentityType;
    colorArrayStateCallback?: (colorArray: string[]) => void;
    documentArray?: PPTDataType[];
    roomCallback?: (room: Room) => void;
    logoUrl?: string;
    loadingSvgUrl?: string;
    isChatOpen?: boolean;
    language?: LanguageEnum;
    clickLogoCallback?: () => void;
    deviceType?: DeviceType;
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
    isChatOpen?: boolean;
    isFileOpen: boolean;
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    progressDescription?: string,
    fileUrl?: string,
    whiteboardLayerDownRef?: HTMLDivElement;
    isReadOnly?: boolean;
    deviceType: DeviceType;
};

export default class NetlessRoom extends React.Component<RealTimeProps, RealTimeStates> {
    private didLeavePage: boolean = false;
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
            isChatOpen: this.props.isChatOpen,
            isFileOpen: false,
            deviceType: DeviceType.Desktop,
        };
        this.cursor = new UserCursor();
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, roomToken, roomCallback, userId, userName, userAvatarUrl} = this.props;
        if (roomToken && uuid) {
            let whiteWebSdk;
            if (isMobile) {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Touch});
            } else {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Desktop, handToolKey: " "});
            }
            const pptConverter = whiteWebSdk.pptConverter(roomToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {userId: userId, name: userName, avatar: userAvatarUrl}},
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
            room.setMemberState({identity: this.props.identity ? this.props.identity : IdentityType.guest});
            if (this.props.identity === IdentityType.listener) {
                await room.setWritable(false);
                this.setState({isReadOnly: true});
            } else if (this.props.identity === IdentityType.guest) {
                if (room.state.globalState.guestUsers === undefined) {
                    this.setState({isReadOnly: true});
                    room.disableDeviceInputs = true;
                } else {
                    console.log(room.state.globalState.guestUsers);
                    const myUser = room.state.globalState.guestUsers.find((data: any) => data.userId === this.props.userId);
                    if (myUser) {
                        this.setState({isReadOnly: myUser.isReadOnly});
                        room.disableDeviceInputs = myUser.isReadOnly;
                    } else {
                        this.setState({isReadOnly: true});
                    }
                }
                room.addMagixEventListener("take-back-all", () => {
                    this.setState({isReadOnly: true});
                    room.disableDeviceInputs = true;
                    message.info("主持人收回权限");
                });
                room.addMagixEventListener("agree", event => {
                    if (event.payload.userId === this.props.userId && event.payload.isReadyOnly !== undefined) {
                        this.setState({isReadOnly: event.payload.isReadyOnly});
                        room.disableDeviceInputs = false;
                        const guestUser = {
                            userId: this.props.userId,
                            isReadOnly: event.payload.isReadyOnly,
                        };
                        if (room.state.globalState.guestUsers) {
                            const userArray = room.state.globalState.guestUsers;
                            const myUser = room.state.globalState.guestUsers.find((data: any) => data.userId === this.props.userId);
                            if (myUser) {
                               const users = userArray.map((data: any) => {
                                   if (data.userId === myUser.userId) {
                                       return {
                                           userId: data.userId,
                                           isReadOnly: event.payload.isReadyOnly,
                                       };
                                   } else {
                                       return data;
                                   }
                               });
                               room.setGlobalState({guestUsers: users});
                            } else {
                                userArray.push(guestUser);
                                room.setGlobalState({guestUsers: userArray});
                            }
                        } else {
                            room.setGlobalState({guestUsers: [guestUser]});
                        }
                    }
                });
            } else {
                room.addMagixEventListener("handup", event => {
                    const key = `open${Date.now()}`;
                    notification.open({
                        message: event.payload.name,
                        description: "申请获得操作权限",
                        onClose: close,
                        duration: 12,
                        top: 56,
                        key,
                        btn: <Button type="primary" size="small" onClick={() => {
                            notification.close(key);
                            room.dispatchMagixEvent("agree", {userId: event.payload.userId, isReadyOnly: false});
                        }}>
                            同意
                        </Button>,
                        icon: <div className="cursor-box">
                            {event.payload.userAvatarUrl ? <img style={{width: 28}} src={event.payload.userAvatarUrl}/> :
                                <Identicon
                                    size={24}
                                    string={event.payload.userId}/>}
                        </div>,
                    });
                });
            }
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
        if (this.props.isReadOnly !== undefined) {
            this.setState({isReadOnly: this.props.isReadOnly});
        }
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
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
        if (this.state.room) {
            this.state.room.removeMagixEventListener("handup");
            this.state.room.removeMagixEventListener("agree");
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

    private handleChatState = (): void => {
        if (this.state.isChatOpen === undefined) {
            this.setState({isChatOpen: true});
        } else {
            this.setState({isChatOpen: !this.state.isChatOpen});
        }
    }
    private handleFileState = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen});
    }

    private detectIsReadOnly = (): boolean => {
        const {identity} = this.props;
        return this.state.isReadOnly || (identity === IdentityType.listener);
    }
    public render(): React.ReactNode {
        const {phase, connectedFail, room, roomState} = this.state;
        const {language, loadingSvgUrl} = this.props;
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
                                logoUrl={this.props.logoUrl}/>
                            {this.state.whiteboardLayerDownRef &&
                            <WhiteboardTopRight
                                whiteboardLayerDownRef={this.state.whiteboardLayerDownRef}
                                roomState={roomState} deviceType={this.state.deviceType}
                                identity={this.props.identity}
                                userName={this.props.userName}
                                userId={this.props.userId}
                                room={room}
                                language={this.props.language}
                                isReadOnly={isReadOnly}
                                userAvatarUrl={this.props.userAvatarUrl}/>}
                            <WhiteboardBottomLeft
                                handleFileState={this.handleFileState}
                                isReadOnly={isReadOnly}
                                deviceType={this.state.deviceType}
                                roomState={roomState}
                                room={room}/>
                            <WhiteboardBottomRight
                                deviceType={this.state.deviceType}
                                roomState={roomState}
                                language={this.props.language}
                                isReadOnly={isReadOnly}
                                chatState={this.state.isChatOpen}
                                handleChatState={this.handleChatState}
                                handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                room={room}/>
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
                                ]} customerComponentPosition={CustomerComponentPositionType.end}
                                memberState={room.state.memberState}/>
                            <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                {this.renderWhiteboard()}
                            </div>
                        </Dropzone>
                        <WhiteboardChat
                            language={this.props.language}
                            isChatOpen={this.state.isChatOpen}
                            handleChatState={this.handleChatState}
                            userAvatarUrl={this.props.userAvatarUrl}
                            userId={this.props.userId}
                            userName={this.props.userName}
                            room={this.state.room}/>
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

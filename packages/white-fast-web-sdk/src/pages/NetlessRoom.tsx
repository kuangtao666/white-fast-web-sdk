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
    PluginComponentClass,
} from "white-react-sdk";
import "white-web-sdk/style/index.css";
import PageError from "../components/PageError";
import WhiteboardTopRight, {IdentityType} from "../components/whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "../components/whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "../components/whiteboard/WhiteboardBottomRight";
import MenuBox from "../components/menu/MenuBox";
import MenuAnnexBox from "../components/menu/MenuAnnexBox";
import {ossConfigObj, OSSConfigObjType} from "../appToken";
import {UserCursor} from "../components/whiteboard/UserCursor";
import ToolBox, {CustomerComponentPositionType} from "../tools/toolBox/index";
import UploadBtn from "../tools/upload/UploadBtn";
import {RoomContextProvider} from "./RoomContext";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";
import WhiteboardFile from "../components/whiteboard/WhiteboardFile";
import {PPTDataType, PPTType} from "../components/menu/PPTDatas";
import LoadingPage from "../components/LoadingPage";
import {isMobile} from "react-device-detect";
import {GuestUserType, HostUserType, ClassModeType, RoomManager} from "./RoomManager";
import WhiteboardManager from "../components/whiteboard/WhiteboardManager";
import ExtendTool from "../tools/extendTool/ExtendTool";
import WhiteboardRecord from "../components/whiteboard/WhiteboardRecord";
import "./NetlessRoom.less";
import {RoomFacadeObject, RoomFacadeSetter} from "../facade/Facade";
import * as default_cover from "../assets/image/default_cover.svg";
import WhiteVideoPlugin from "../plugins/video_plugin/WhiteVideoPlugin";
import WhiteWebCoursePlugin from "../plugins/web-course-plugin/WhiteWebCoursePlugin";
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
    appId: string,
    channel?: string, // 不写默认是 uuid,
    authConfig?: {
        token: string,
    }
    recordConfig?: {
        recordUid?: string,
        recordToken?: string,
        customerId: string,
        customerCertificate: string,
    },
};
export type RecordDataType = {startTime?: number, endTime?: number, mediaUrl?: string};
export type RealTimeProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    roomFacadeSetter: RoomFacadeSetter;
    classMode?: ClassModeType,
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
    logoUrl?: string;
    loadingSvgUrl?: string;
    language?: LanguageEnum;
    clickLogoCallback?: () => void;
    deviceType?: DeviceType;
    rtc?: RtcType;
    roomCallback?: (room: Room) => void;
    exitRoomCallback?: () => void;
    replayCallback?: () => void;
    recordDataCallback?: (data: RecordDataType) => void;
    documentArrayCallback?: (data: PPTDataType[]) => void;
    isManagerOpen?: boolean | null;
    elementId: string;
    ossConfigObj?: OSSConfigObjType;
    ossUploadCallback?: (res: any) => void;
    enableRecord?: boolean;
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
    fileUrl?: string;
    whiteboardLayerDownRef?: HTMLDivElement;
    isManagerOpen: boolean | null;
    deviceType: DeviceType;
    classMode: ClassModeType;
    ossConfigObj: OSSConfigObjType;
    documentArray: PPTDataType[];
    startRtc?: (recordFunc?: () => void) => void;
    stopRtc?: () => void;
    stopRecord?: (stopRecordFunc?: () => void) => void;
    isRecording: boolean;
    secondsElapsed?: number;
    releaseMedia?: () => void;
    releaseMediaStage?: () => void;
};

export default class NetlessRoom extends React.Component<RealTimeProps, RealTimeStates> implements RoomFacadeObject {
    private didLeavePage: boolean = false;
    private roomManager: RoomManager;
    private readonly cursor: UserCursor;
    private menuChild: React.Component;
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
            isManagerOpen: this.handleManagerOpenState(),
            classMode: this.props.classMode !== undefined ? this.props.classMode : ClassModeType.discuss,
            ossConfigObj: this.props.ossConfigObj !== undefined ? this.props.ossConfigObj : ossConfigObj,
            documentArray: this.props.documentArray !== undefined ? this.handleDocs(this.props.documentArray) : [],
            isRecording: false,
        };
        this.cursor = new UserCursor();
    }

    private handleManagerOpenState = (): boolean | null => {
        if (this.props.isManagerOpen !== undefined) {
            return this.props.isManagerOpen;
        } else {
            return false;
        }
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, roomToken, userId, userName, userAvatarUrl, identity, isManagerOpen} = this.props;
        const {classMode} = this.state;
        if (roomToken && uuid) {
            let whiteWebSdk;
            if (isMobile) {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Touch});
            } else {
                whiteWebSdk = new WhiteWebSdk({ deviceType: DeviceType.Desktops, handToolKey: " ", plugins: [WhiteVideoPlugin, WhiteWebCoursePlugin]});
            }
            const pptConverter = whiteWebSdk.pptConverter(roomToken);
            this.setState({pptConverter: pptConverter});
            (window as any).__userId = userId;
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
            if (this.props.roomCallback) {
                this.props.roomCallback(room);
            }
            if (isManagerOpen !== null) {
                this.roomManager = new RoomManager(userId, room, userAvatarUrl, identity, userName, classMode);
                await this.roomManager.start();
            }
            if (identity === IdentityType.host) {
                this.initDocumentState(room);
            }
            this.setState({room: room, roomState: room.state, roomToken: roomToken});
        } else {
            message.error("join fail");
        }
    }

    private initDocumentState = (room: Room): void => {
        const {uuid} = this.props;
        if (this.state.documentArray.length > 0 ) {
            const activeDoc = this.state.documentArray.find(data => data.active);
            if (activeDoc) {
                room.putScenes(`/${uuid}/${activeDoc.id}`, activeDoc.data);
                room.setScenePath(`/${uuid}/${activeDoc.id}/1`);
                const documentArrayState: {id: string, isHaveScenes: boolean}[] = this.state.documentArray.map(data => {
                    if (data.id === activeDoc.id) {
                        return {
                            id: data.id,
                            isHaveScenes: true,
                        };
                    } else {
                        return {
                            id: data.id,
                            isHaveScenes: false,
                        };
                    }
                });
                room.setGlobalState({documentArrayState: documentArrayState});
            } else {
                const newDocumentArray = [
                    {active: true,
                    pptType: PPTType.init,
                    id: "init",
                    data: [{componentsCount: 0,
                        name: "init"}],
                    }, ...this.state.documentArray];
                this.setState({documentArray: newDocumentArray});
                const documentArrayState: {id: string, isHaveScenes: boolean}[] = newDocumentArray.map(data => {
                    if (data.pptType === PPTType.init && data.active) {
                        return {
                            id: data.id,
                            isHaveScenes: true,
                        };
                    } else {
                        return {
                            id: data.id,
                            isHaveScenes: false,
                        };
                    }
                });
                room.setGlobalState({documentArrayState: documentArrayState});
            }
        }
    }
    private handleDocs = (documentArray: PPTDataType[]): PPTDataType[] => {
        if (documentArray.length > 0) {
            const docs = documentArray.map((PPTData: PPTDataType) => {
                const newDataArray = JSON.parse(PPTData.data);
                if (PPTData.pptType === PPTType.static) {
                    const newDataObj = newDataArray.map((data: any) => {
                        const proportion = data.ppt.width / data.ppt.height;
                        data.ppt.width = 1024;
                        data.ppt.height = 1024 / proportion;
                        return data;
                    });
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataObj,
                        pptType: PPTData.pptType,
                    };
                } else {
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataArray,
                        pptType: PPTData.pptType,
                    };
                }
            });
            return docs;
        } else {
            return [];
        }
    }

    private onWindowResize = (): void => {
        if (this.state.room) {
            this.state.room.refreshViewSize();
        }
    }
    public componentWillMount (): void {
        this.props.roomFacadeSetter(this);
        window.addEventListener("beforeunload", this.beforeunload);
    }
    private beforeunload = (): void => {
        this.stopAll();
    }

    private recordTime = (time: number): void => {
        this.setState({secondsElapsed: time});
    }

    private getMediaCellReleaseFunc = (func: () => void): void => {
        this.setState({releaseMedia: func});
    }

    private getMediaStageCellReleaseFunc = (func: () => void): void => {
        this.setState({releaseMediaStage: func});
    }

    private stopAll = (): void => {
        const {identity} = this.props;
        const {room} = this.state;
        if (room && identity === IdentityType.host) {
            room.setGlobalState({hostInfo: {
                    ...room.state.globalState.hostInfo,
                    isVideoEnable: false,
                    secondsElapsed: this.state.secondsElapsed,
                }});
        }
        this.didLeavePage = true;
        if (this.state.room) {
            this.state.room.removeMagixEventListener("handup");
            this.state.room.disconnect();
        }
        if (this.roomManager) {
            this.roomManager.stop();
        }
        if (this.state.stopRtc) {
            this.state.stopRtc();
        }
        if (this.state.releaseMedia) {
            this.state.releaseMedia();
        }
        if (this.state.releaseMediaStage) {
            this.state.releaseMediaStage();
        }
        window.removeEventListener("resize", this.onWindowResize);
        window.removeEventListener("beforeunload", this.beforeunload);
    }
    public release(): void {
        this.stopAll();
    }
    public async componentDidMount(): Promise<void> {
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
        await this.startJoinRoom();
        this.onWindowResize();
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }
    public componentWillUnmount(): void {
        this.props.roomFacadeSetter(null);
        window.removeEventListener("beforeunload", this.beforeunload);
    }

    public async setPptPreviewShow(): Promise<void> {
        if (this.state.room) {
            this.setState({
                isMenuVisible: true,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        } else {
            await timeout(1500);
            this.setState({
                isMenuVisible: true,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        }
    }
    public async setPptPreviewHide(): Promise<void> {
        if (this.menuChild) {
            this.menuChild.setState({isMenuOpen: false});
        }
        await timeout(200);
        this.setState({
            isMenuVisible: false,
            menuInnerState: MenuInnerType.AnnexBox,
        });
    }
    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
                    isPreviewMenuOpen={this.state.isPreviewMenuOpen}
                    room={this.state.room!}
                    roomState={this.state.roomState!}
                    language={this.props.language}
                    handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}/>;
            default:
                return null;
        }
    }

    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    private handleAnnexBoxMenuState = async (): Promise<void> => {
        if (this.state.isMenuVisible) {
            if (this.menuChild) {
                this.menuChild.setState({isMenuOpen: false});
            }
            await timeout(200);
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        } else {
            this.setState({
                isMenuVisible: !this.state.isMenuVisible,
                menuInnerState: MenuInnerType.AnnexBox,
            });
        }
    }

    private isImageType = (type: string): boolean => {
        return type === "image/jpeg" || type === "image/png";
    }

    private onDropFiles = async (
        acceptedFiles: File[],
        rejectedFiles: File[],
        event: React.DragEvent<HTMLDivElement>): Promise<void> => {
        event.persist();
        const {ossConfigObj} = this.state;
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
    private onRef = (ref: React.Component) => {
        this.menuChild = ref;
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
        if (this.props.isManagerOpen !== null) {
            if (!this.state.isManagerOpen) {
                this.setState({isChatOpen: true, isManagerOpen: true});
                await timeout(100);
                this.onWindowResize();
            } else {
                this.setState({isChatOpen: true});
            }
        }
    }
    private handleManagerState = async (): Promise<void> => {
        if (this.props.isManagerOpen !== null) {
            if (this.state.isManagerOpen) {
                this.setState({isManagerOpen: false, isChatOpen: false});
            } else {
                this.setState({isManagerOpen: true});
            }
            await timeout(100);
            this.onWindowResize();
        }
    }
    private handleFileState = (): void => {
        this.setState({isFileOpen: !this.state.isFileOpen});
    }

    private detectIsReadOnly = (): boolean => {
        const {identity, userId, isManagerOpen} = this.props;
        const {room} = this.state;
        if (isManagerOpen === null) {
            return false;
        }
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
    private renderRecordComponent = (): React.ReactNode => {
        if (this.props.enableRecord === false) {
          return null;
        }
        if (this.props.identity === IdentityType.host && this.state.deviceType !== DeviceType.Touch) {
            return (
                <WhiteboardRecord
                    ossConfigObj={this.state.ossConfigObj}
                    recordTime={this.recordTime}
                    startRtc={this.state.startRtc}
                    replayCallback={this.props.replayCallback}
                    stopRecordCallback={this.stopRecordCallback}
                    setRecordingState={this.setRecordingState}
                    room={this.state.room!}
                    recordDataCallback={this.props.recordDataCallback}
                    uuid={this.props.uuid} rtc={this.props.rtc}
                    channelName={this.props.uuid}/>
            );
        } else {
            return null;
        }
    }

    private  documentFileCallback = (documentFile: PPTDataType): void => {
        const {documentArrayCallback} = this.props;
        const documents = this.state.documentArray.map(data => {
            data.active = false;
            return data;
        });
        this.setState({documentArray: [...documents, documentFile]});
        if (this.state.room) {
            if (this.state.room.state.globalState.documentArrayState) {
                const documentArrayState = this.state.room.state.globalState.documentArrayState;
                this.state.room.setGlobalState({documentArrayState: [...documentArrayState, {id: documentFile.id, isHaveScenes: true}]});
            } else {
                this.state.room.setGlobalState({documentArrayState: [{id: documentFile.id, isHaveScenes: true}]});
            }
        }
        if (documentArrayCallback) {
            const docs: PPTDataType[] = this.state.documentArray;
            const documentArray = docs.map(doc => {
                doc.data = JSON.stringify(doc.data);
                return doc;
            });
            documentArrayCallback(documentArray);
        }
    }

    private renderExtendTool = (): React.ReactNode => {
        if (!isMobile) {
            return (
                <ExtendTool
                    userId={this.props.userId}
                    language={this.props.language}
                    toolBarPosition={this.props.toolBarPosition}/>
            );
        } else {
            return null;
        }
    }

    private handleDocumentArrayState = (state: PPTDataType[]): void => {
        this.setState({documentArray: state});
    }

    private startRtcCallback = (func: (recordFunc?: () => void) => void): void => {
        this.setState({startRtc: func});
    }

    private stopRtcCallback = (func: () => void): void => {
        this.setState({stopRtc: func});
    }

    private stopRecordCallback = (func: () => void): void => {
        this.setState({stopRecord: func});
    }
    private setRecordingState = (state: boolean): void => {
        this.setState({isRecording: state});
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
                    startRtcCallback: this.startRtcCallback,
                    stopRtcCallback: this.stopRtcCallback,
                    whiteboardLayerDownRef: this.state.whiteboardLayerDownRef!,
                    room: room,
                    stopRecord: this.state.stopRecord,
                    isRecording: this.state.isRecording,
                    getMediaCellReleaseFunc: this.getMediaCellReleaseFunc,
                    getMediaStageCellReleaseFunc: this.getMediaStageCellReleaseFunc,
                }}>
                    <div className="realtime-box">
                        <MenuBox
                            language={this.props.language}
                            onRef={this.onRef}
                            isSidePreview={this.state.menuInnerState === MenuInnerType.AnnexBox}
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
                                language={this.props.language} handleDocumentArrayState={this.handleDocumentArrayState}
                                uuid={this.props.uuid} documentArray={this.state.documentArray}
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
                                isManagerOpen={this.state.isManagerOpen}
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
                            {this.renderRecordComponent()}
                            <ToolBox
                                isReadOnly={isReadOnly}
                                language={this.props.language}
                                toolBarPosition={this.props.toolBarPosition}
                                colorConfig={this.props.defaultColorArray}
                                setMemberState={this.setMemberState}
                                customerComponent={[
                                    <UploadBtn
                                        toolBarPosition={this.props.toolBarPosition}
                                        uuid={this.props.uuid}
                                        deviceType={this.state.deviceType}
                                        oss={this.state.ossConfigObj}
                                        ossUploadCallback={this.props.ossUploadCallback}
                                        room={room}
                                        documentFileCallback={this.documentFileCallback}
                                        uploadToolBox={this.props.uploadToolBox}
                                        roomToken={this.state.roomToken}
                                        onProgress={this.progress}
                                        language={this.props.language}
                                        whiteboardRef={this.state.whiteboardLayerDownRef}
                                    />,
                                    this.renderExtendTool(),
                                ]} customerComponentPosition={CustomerComponentPositionType.end}
                                memberState={room.state.memberState}/>
                            <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                {this.renderWhiteboard()}
                            </div>
                        </Dropzone>
                        {!isMobile &&
                        <WhiteboardManager
                            elementId={this.props.elementId}
                            language={this.props.language}
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
                            room={room}/>}
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
                                   style={{width: "100%", height: "100%", backgroundColor: boardBackgroundColor ? boardBackgroundColor : "#F2F2F2"}}/>;
        } else {
            return null;
        }
    }
}

import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import {message} from "antd";
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
import "./RealTime.less";
import PageError from "../pages/PageError";
import WhiteboardTopRight from "./whiteboard/WhiteboardTopRight";
import WhiteboardBottomLeft from "./whiteboard/WhiteboardBottomLeft";
import WhiteboardBottomRight from "./whiteboard/WhiteboardBottomRight";
import * as loading from "../assets/image/loading.svg";
import MenuBox from "./menu/MenuBox";
import MenuAnnexBox from "./menu/MenuAnnexBox";
import {ossConfigObj} from "../appToken";
import {UserCursor} from "./whiteboard/UserCursor";
import ToolBox, {CustomerComponentPositionType} from "../tools/toolBox";
import UploadBtn from "../tools/upload/UploadBtn";
import ExtendTool from "../tools/extendTool/ExtendTool";
import {RoomContextProvider} from "./RoomContext";
import WhiteboardTopLeft from "./whiteboard/WhiteboardTopLeft";
import WhiteboardChat from "./whiteboard/WhiteboardChat";
import WhiteboardFile from "./whiteboard/WhiteboardFile";

export enum MenuInnerType {
    AnnexBox = "AnnexBox",
    PPTBox = "PPTBox",
}
export type UserType = {
    name: string;
    id: string;
    avatar: string;
};
export type RealTimeProps = {
    uuid: string;
    userInf: UserType;
    roomToken: string;
    isReadOnly?: boolean;
    toolBarPosition?: ToolBarPositionEnum;
    pagePreviewPosition?: PagePreviewPositionEnum;
    boardBackgroundColor?: string;
    defaultColorArray?: string[];
    colorArrayStateCallback?: (colorArray: string[]) => void;
    logoUrl?: string | boolean;
    isChatOpen?: boolean;
    isFileOpen?: boolean;
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
    isMenuOpen: boolean;
    isChatOpen?: boolean;
    isFileOpen?: boolean;
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    progressDescription?: string,
    fileUrl?: string,
    whiteboardLayerDownRef?: HTMLDivElement;
};

export default class RealTime extends React.Component<RealTimeProps, RealTimeStates> {
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
            isMenuOpen: false,
            isChatOpen: this.props.isChatOpen,
            isFileOpen: this.props.isFileOpen,
        };
        this.cursor = new UserCursor();
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, userInf, roomToken} = this.props;
        const userId = userInf.id;
        if (roomToken && uuid) {
            const whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Desktops});
            const pptConverter = whiteWebSdk.pptConverter(roomToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {userId: userId, name: userInf.name, avatar: userInf.avatar ? userInf.avatar : userId}},
                {
                    onPhaseChanged: phase => {
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
    }

    public async componentDidMount(): Promise<void> {
        await this.startJoinRoom();
        if (this.state.room && this.state.room.state.roomMembers) {
            this.cursor.setColorAndAppliance(this.state.room.state.roomMembers);
        }
    }

    public componentWillUnmount(): void {
        this.didLeavePage = true;
        window.removeEventListener("resize", this.onWindowResize);
    }
    private renderMenuInner = (): React.ReactNode => {
        switch (this.state.menuInnerState) {
            case MenuInnerType.AnnexBox:
                return <MenuAnnexBox
                    isMenuOpen={this.state.isMenuOpen}
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

    private resetMenu = () => {
        this.setState({
            isMenuVisible: false,
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
    private setMenuState = (state: boolean) => {
        this.setState({isMenuOpen: state});
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
        if (this.state.isFileOpen === undefined) {
            this.setState({isFileOpen: true});
        } else {
            this.setState({isFileOpen: !this.state.isFileOpen});
        }
    }
    public render(): React.ReactNode {

        if (this.state.connectedFail) {
            return <PageError/>;

        } else if (this.state.phase === RoomPhase.Connecting ||
            this.state.phase === RoomPhase.Disconnecting) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (!this.state.room) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else if (!this.state.roomState) {
            return <div className="white-board-loading">
                <img src={loading}/>
            </div>;
        } else {
            return (
                <RoomContextProvider value={{
                    onColorArrayChange: this.props.colorArrayStateCallback,
                    whiteboardLayerDownRef: this.state.whiteboardLayerDownRef!,
                    room: this.state.room,
                }}>
                    <div className="realtime-box">
                        <MenuBox
                            pagePreviewPosition={this.props.pagePreviewPosition}
                            setMenuState={this.setMenuState}
                            resetMenu={this.resetMenu}
                            isVisible={this.state.isMenuVisible}
                            menuInnerState={this.state.menuInnerState}>
                            {this.renderMenuInner()}
                        </MenuBox>
                        <WhiteboardFile
                            handleFileState={this.handleFileState}
                            isFileOpen={this.state.isFileOpen}
                            room={this.state.room}/>
                        <Dropzone
                            accept={"image/*"}
                            disableClick={true}
                            className="whiteboard-out-box"
                            onDrop={this.onDropFiles}>
                            <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                            <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                            <WhiteboardTopLeft
                                logoUrl={this.props.logoUrl}/>
                            <WhiteboardTopRight
                                whiteboardLayerDownRef={this.state.whiteboardLayerDownRef}
                                roomState={this.state.roomState}
                                name={this.props.userInf.name}
                                userId={this.props.userInf.id}
                                room={this.state.room}
                                avatar={this.props.userInf.avatar}/>
                            <WhiteboardBottomLeft handleFileState={this.handleFileState}
                                roomState={this.state.roomState}
                                room={this.state.room}/>
                            <WhiteboardBottomRight
                                roomState={this.state.roomState}
                                chatState={this.state.isChatOpen}
                                handleChatState={this.handleChatState}
                                handleAnnexBoxMenuState={this.handleAnnexBoxMenuState}
                                room={this.state.room}/>
                            <ToolBox
                                isReadOnly={this.props.isReadOnly}
                                toolBarPosition={this.props.toolBarPosition}
                                colorConfig={this.props.defaultColorArray}
                                setMemberState={this.setMemberState}
                                customerComponent={[
                                    <UploadBtn
                                        toolBarPosition={this.props.toolBarPosition}
                                        oss={ossConfigObj}
                                        room={this.state.room}
                                        roomToken={this.state.roomToken}
                                        onProgress={this.progress}
                                        whiteboardRef={this.state.whiteboardLayerDownRef}
                                    />,
                                ]} customerComponentPosition={CustomerComponentPositionType.end}
                                memberState={this.state.room.state.memberState}/>
                            <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                {this.renderWhiteboard()}
                            </div>
                        </Dropzone>
                        <WhiteboardChat
                            isChatOpen={this.state.isChatOpen}
                            handleChatState={this.handleChatState}
                            room={this.state.room}
                            userInf={this.props.userInf}/>
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

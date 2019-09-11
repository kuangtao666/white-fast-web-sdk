import * as React from "react";
import TopLoadingBar from "@netless/react-loading-bar";
import {PPTProgressPhase, UploadManager} from "@netless/oss-upload-manager";
import * as OSS from "ali-oss";
import {message} from "antd";
import * as uuidv4 from "uuid/v4";
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
import {netlessToken, ossConfigObj} from "../appToken";
import {UserCursor} from "./whiteboard/UserCursor";
import MenuPPTDoc from "./menu/MenuPPTDoc";
import {netlessWhiteboardApi, UserInfType} from "../apiMiddleware";
import ToolBox, {CustomerComponentPositionType} from "../tools/toolBox";
import UploadBtn from "../tools/upload/UploadBtn";
import ExtendTool from "../tools/extendTool/ExtendTool";
import {RoomContextProvider} from "./RoomContext";
import WhiteboardTopLeft from "./whiteboard/WhiteboardTopLeft";

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
    boardBackgroundColor?: string;
    defaultColorArray?: string[];
    onColorArrayChange?: (colorArray: string[]) => void;
    logoUrl?: string | boolean;
};

export enum ToolBarPositionEnum {
    top = "top",
    bottom = "bottom",
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
    room?: Room;
    roomState?: RoomState;
    pptConverter?: PptConverter;
    isMenuLeft?: boolean;
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
            menuInnerState: MenuInnerType.AnnexBox,
            isMenuVisible: false,
            roomToken: null,
            ossPercent: 0,
            converterPercent: 0,
            isMenuOpen: false,
        };
        this.cursor = new UserCursor();
    }

    private startJoinRoom = async (): Promise<void> => {
        const {uuid, userInf, roomToken} = this.props;
        const userId = userInf.id;
        if (netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`) === `Netless uuid ${userId}`) {
            const userUuid = uuidv4();
            netlessWhiteboardApi.user.updateUserInf(userUuid, userUuid, userId);
        }
        const userUuid = netlessWhiteboardApi.user.getUserInf(UserInfType.uuid, `${userId}`);
        const name = netlessWhiteboardApi.user.getUserInf(UserInfType.name, `${userId}`);
        if (roomToken && uuid) {
            const whiteWebSdk = new WhiteWebSdk({deviceType: DeviceType.Desktop});

            const pptConverter = whiteWebSdk.pptConverter(netlessToken.sdkToken);
            this.setState({pptConverter: pptConverter});
            const room = await whiteWebSdk.joinRoom({
                    uuid: uuid,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                    userPayload: {id: userId, userId: userUuid, nickName: name, avatar: userUuid}},
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
            case MenuInnerType.PPTBox:
                return <MenuPPTDoc
                    room={this.state.room!}/>;
            default:
                return null;
        }
    }


    private setWhiteboardLayerDownRef = (whiteboardLayerDownRef: HTMLDivElement): void => {
        this.setState({whiteboardLayerDownRef: whiteboardLayerDownRef});
    }

    private handleHotKeyMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            isMenuLeft: false,
        });
    }
    private handleAnnexBoxMenuState = (): void => {
        this.setState({
            isMenuVisible: !this.state.isMenuVisible,
            menuInnerState: MenuInnerType.AnnexBox,
            isMenuLeft: false,
        });
    }

    private resetMenu = () => {
        this.setState({
            isMenuVisible: false,
            isMenuLeft: false,
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
                    onColorArrayChange: this.props.onColorArrayChange,
                    whiteboardLayerDownRef: this.state.whiteboardLayerDownRef!,
                    room: this.state.room,
                }}>
                    <div id="outer-container">
                        <MenuBox
                            setMenuState={this.setMenuState}
                            resetMenu={this.resetMenu}
                            pageWrapId={"page-wrap" }
                            outerContainerId={ "outer-container" }
                            isLeft={this.state.isMenuLeft}
                            isVisible={this.state.isMenuVisible}
                            menuInnerState={this.state.menuInnerState}>
                            {this.renderMenuInner()}
                        </MenuBox>
                        <div style={{backgroundColor: "white"}} id="page-wrap">
                            <Dropzone
                                accept={"image/*"}
                                disableClick={true}
                                onDrop={this.onDropFiles}
                                className="whiteboard-drop-upload-box">
                                <TopLoadingBar loadingPercent={this.state.ossPercent}/>
                                <TopLoadingBar style={{backgroundColor: "red"}} loadingPercent={this.state.converterPercent}/>
                                <div className="whiteboard-out-box">
                                    <WhiteboardTopLeft
                                        logoUrl={this.props.logoUrl}/>
                                    <WhiteboardTopRight
                                        roomState={this.state.roomState}
                                        room={this.state.room}/>
                                    <WhiteboardBottomLeft
                                        roomState={this.state.roomState}
                                        room={this.state.room}/>
                                    <WhiteboardBottomRight
                                        roomState={this.state.roomState}
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
                                            <ExtendTool toolBarPosition={this.props.toolBarPosition}/>,
                                        ]} customerComponentPosition={CustomerComponentPositionType.end}
                                        memberState={this.state.room.state.memberState}/>
                                    <div className="whiteboard-tool-layer-down" ref={this.setWhiteboardLayerDownRef}>
                                        {this.renderWhiteboard()}
                                    </div>
                                </div>
                            </Dropzone>
                        </div>
                    </div>
                </RoomContextProvider>
            );
        }
    }
    private renderWhiteboard(): React.ReactNode {
        const {boardBackgroundColor} = this.props;
        if (this.state.room) {
            return <RoomWhiteboard room={this.state.room}
                                   style={{width: "100%", height: "100vh", backgroundColor: boardBackgroundColor ? boardBackgroundColor : "white"}}/>;
        } else {
            return null;
        }
    }
}

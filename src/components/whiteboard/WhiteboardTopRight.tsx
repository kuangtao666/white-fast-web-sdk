import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import export_icon from "../../assets/image/export_icon.svg";
import image_export from "../../assets/image/image_export.svg";
import pdf_export from "../../assets/image/pdf_export.svg";
import WhiteSnapshot from "@netless/white-snapshot";
import html2canvas from "html2canvas";
import "./WhiteboardTopRight.less";
import {Button, message, Modal, Popover} from "antd";
import download from "downloadjs";
import NsPDF from "jspdf";
import WhiteboardPreviewCell from "./WhiteboardPreviewCell";

export type WhiteboardTopRightProps = {
    avatar: string;
    name: string;
    userId: string;
    room: Room;
    roomState: RoomState;
    identity?: IdentityType;
    whiteboardLayerDownRef?: HTMLDivElement;
};

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
    classSize: {
        width: number,
        height: number,
    } | null;
};

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export default class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightStates> {

    private pdf: any;
    private message: any;
    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            canvas: null,
            imageRef: null,
            classSize: null,
        };
    }

    public componentDidMount(): void {
        const {whiteboardLayerDownRef} = this.props;
        if (whiteboardLayerDownRef) {
            this.setState({
                classSize: {
                    width: whiteboardLayerDownRef.clientWidth,
                    height: whiteboardLayerDownRef.clientHeight,
                },
            });
        }
    }

    private handleExportPDF = async (): Promise<void> => {
        const {room, roomState} = this.props;
        // this.setState({isVisible: true});
        const scenes = roomState.sceneState.scenes;
        const snapshot = new WhiteSnapshot(room);
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        this.pdf = new NsPDF("", "pt", "a4");
        await scenes.map( async(scene: Scene, index: number): Promise<void> => {
            const base64 = await snapshot.previewBase64(sceneDir.concat(scene.name).join("/"), 600, 400);
            this.pdf.addImage(base64, "JPEG", 0, 0, 600, 400);
            if (scenes.length > (index + 1)) {
                this.pdf.addPage();
            }
        });
    }

    private handleExportImage = async (): Promise<void> => {
        if (this.props.whiteboardLayerDownRef) {
            message.loading("正在导出图片");
            const imageCanvas = await html2canvas(this.props.whiteboardLayerDownRef, {
                useCORS: true,
                logging: false,
            });
            const image = imageCanvas.toDataURL();
            download(image, `未命名资料`, "image/png");
        }
    }

    private setImageRef = (ref: any): void => {
        this.setState({imageRef: ref});
    }

    private dowloadImage = async (): Promise<void> => {
        if (this.state.imageRef) {
            const netlessMessage = message.loading("正在导出图片，请耐心等待", 0);
            const imageCanvas = await html2canvas(this.state.imageRef, {
                useCORS: true,
                logging: false,
            });
            const image = imageCanvas.toDataURL();
            download(image, `test`, "image/png");
            netlessMessage();
        }
    }
    private exportComponent = (): React.ReactNode => {
        return (
            <div className="export-box">
                <div onClick={this.handleExportImage} className="export-box-cell">
                    <img src={image_export}/>本页导出为 PNG
                </div>
                <div onClick={this.handleExportPDF} className="export-box-cell">
                    <img src={pdf_export}/>全部导出为 PDF
                </div>
            </div>
        );
    }

    private setComponent = (): React.ReactNode => {
        const {room} = this.props;
        const roomMembers = room.state.roomMembers.map((roomMember: RoomMember, index: number) => {
            return (
                <div className="room-member-cell" key={`${index}`}>
                    <div className="room-member-cell-inner">
                        <img className="room-member-avatar"  src={roomMember.payload.avatar}/>
                        <div className="control-box-name">{roomMember.payload.name}</div>
                    </div>
                    {/*<div className="room-member-cell-lock">*/}
                        {/*<Icon type="lock" />*/}
                    {/*</div>*/}
                </div>
            );
        });
        return (
            <div className="control-box">
                {/*<div className="export-box-title">*/}
                    {/*主持人*/}
                {/*</div>*/}
                <div className="control-box-title">
                    参与者
                </div>
                {roomMembers}
            </div>
        );
    }

    public render(): React.ReactNode {
        const  {avatar, room, roomState} = this.props;
        return (
            <div className="whiteboard-top-right-box">
                <Popover placement="bottomRight" content={this.setComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={set_icon}/>
                    </div>
                </Popover>
                <Popover placement="bottomRight" content={this.exportComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={export_icon}/>
                    </div>
                </Popover>
                <div className="whiteboard-top-user-box">
                    <div className="whiteboard-top-right-user">
                        <img src={avatar}/>
                    </div>
                </div>
                <Modal
                    destroyOnClose={true}
                    width={720}
                    title="导出图片预览"
                    visible={this.state.isVisible}
                    onOk={this.dowloadImage}
                    okText="下载"
                    cancelText="取消"
                    onCancel={() => this.setState({isVisible: false})}
                >
                    <WhiteboardPreviewCell setImageRef={this.setImageRef} roomState={roomState} room={room}/>
                    <div>
                        请等待预览内容加载完毕再导出图片
                    </div>
                </Modal>
            </div>
        );

    }
}

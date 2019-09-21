import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import export_icon from "../../assets/image/export_icon.svg";
import image_export from "../../assets/image/image_export.svg";
import pdf_export from "../../assets/image/pdf_export.svg";
import WhiteSnapshot from "@netless/white-snapshot";
import html2canvas from "html2canvas";
import "./WhiteboardTopRight.less";
import {Button, Modal, Popover} from "antd";
import download from "downloadjs";
import NsPDF from "jspdf";


export type WhiteboardTopRightProps = {
    avatar: string;
    name: string;
    userId: string;
    room: Room;
    identity?: IdentityType;
    roomState: RoomState;
};

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    imageUrl: string;
    canvas: any;
};

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export default class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightStates> {

    private pdf: any;
    private ref: any;
    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            imageUrl: "",
            canvas: null,
        };
    }

    private handleExportPDF = async (): Promise<void> => {
        const {room, roomState} = this.props;
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
        this.setState({isVisible: true});
        const {roomState, room} = this.props;
        const snapshot = new WhiteSnapshot(room);
        const path = roomState.sceneState.scenePath;
        await snapshot.divPreviewCanvas(path, this.ref);
        const test = await html2canvas(this.ref, {
            useCORS: true,
            logging: false,
        });
    }

    private dowloadImage = (): void => {
        if (this.state.imageUrl) {
            download(this.state.imageUrl, `test`, "image/png");
        }
    }
    private exportComponent = (): React.ReactNode => {
        return (
            <div className="export-box">
                <div onClick={this.handleExportImage} className="export-box-cell">
                    <img src={image_export}/>本页导出为 PNG
                </div>
                <div className="export-box-cell">
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
        const  {avatar} = this.props;
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
                    width={720}
                    title="导出图片"
                    visible={this.state.isVisible}
                    onOk={this.dowloadImage}
                    okText="下载"
                    cancelText="取消"
                    onCancel={() => {
                        this.setState({isVisible: false, imageUrl: ""});
                    }}
                >
                    <div className="preview-image">
                        <img src={this.state.imageUrl}/>
                    </div>
                </Modal>
            </div>
        );

    }
}

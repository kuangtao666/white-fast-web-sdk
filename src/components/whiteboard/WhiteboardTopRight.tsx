import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import export_icon from "../../assets/image/export_icon.svg";
import screen_shot from "../../assets/image/screen_shot.svg";
import image_export from "../../assets/image/image_export.svg";
import pdf_export from "../../assets/image/pdf_export.svg";
import html2canvas from "html2canvas";
import download from "downloadjs";
import "./WhiteboardTopRight.less";
import {Button, message, Modal, Popover, Tooltip} from "antd";
import NsPDF from "jspdf";
import WhiteboardPreviewCell from "./WhiteboardPreviewCell";
import {LanguageEnum} from "../../pages/NetlessRoom";

export type WhiteboardTopRightProps = {
    userId: string;
    room: Room;
    roomState: RoomState;
    whiteboardLayerDownRef: HTMLDivElement;
    userAvatarUrl?: string;
    userName?: string;
    identity?: IdentityType;
    isReadOnly?: boolean;
    language?: LanguageEnum;
};

export type WhiteboardTopRightStates = {
    isVisible: boolean;
    isLoading: boolean;
    canvas: any;
    imageRef: any;
};

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export default class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightStates> {

    private pdf: any;
    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            isVisible: false,
            isLoading: false,
            canvas: null,
            imageRef: null,
        };
    }

    private handleExportPDF = async (): Promise<void> => {
        const {room, roomState, whiteboardLayerDownRef} = this.props;
        const scenes = roomState.sceneState.scenes;
        const sceneDir = roomState.sceneState.scenePath.split("/");
        sceneDir.pop();
        this.pdf = new NsPDF("", "pt", "a4");
        await scenes.map( async(scene: Scene, index: number): Promise<void> => {
            // this.pdf.addImage(base64, "JPEG", 0, 0, whiteboardLayerDownRef.clientWidth, whiteboardLayerDownRef.clientHeight);
            // if (scenes.length > (index + 1)) {
            //     this.pdf.addPage();
            // }
        });
    }

    private handleExportImage = async (): Promise<void> => {
        const {language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        message.loading(isEnglish ? "Exporting image" : "正在导出图片");
        const imageCanvas = await html2canvas(this.props.whiteboardLayerDownRef, {
            useCORS: true,
            logging: false,
        });
        const image = imageCanvas.toDataURL();
        download(image, isEnglish ? "unnamed" : "未命名资料", "image/png");
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
                <div onClick={() => this.pdf.save("我的简历.pdf")} className="export-box-cell">
                    <img src={pdf_export}/>下载
                </div>
            </div>
        );
    }

    private setComponent = (): React.ReactNode => {
        const {room, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
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
                    {isEnglish ? "Guest" : "参与者"}
                </div>
                {roomMembers}
            </div>
        );
    }

    public render(): React.ReactNode {
        const  {userAvatarUrl, room, roomState, identity, language} = this.props;
        const isHost = identity === IdentityType.host;
        const isEnglish = language === LanguageEnum.English;
        return (
            <div className="whiteboard-top-right-box">
                {isHost ||
                <Popover placement="bottomRight" content={this.setComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={set_icon}/>
                    </div>
                </Popover>}
                <Tooltip title={isEnglish ? "Screen shot" : "截图"}>
                    <div onClick={this.handleExportImage} className="whiteboard-top-right-cell">
                        <img style={{width: 22}} src={screen_shot}/>
                    </div>
                </Tooltip>
                <div className="whiteboard-top-user-box">
                    <div className="whiteboard-top-right-user">
                        <img src={userAvatarUrl}/>
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

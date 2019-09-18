import * as React from "react";
import {ViewMode, Room, RoomMember, RoomState, Scene} from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import export_icon from "../../assets/image/export_icon.svg";
import WhiteSnapshot from "@netless/white-snapshot";
import "./WhiteboardTopRight.less";
import {Popover} from "antd";
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
    }

    private handleExportImage = async (): Promise<void> => {
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

    private exportComponent = (): React.ReactNode => {
        return (
            <div className="export-box">
                <div onClick={this.handleExportImage} className="export-box-title">
                    本页导出为图片
                </div>
                <div onClick={() => this.pdf.save("我的简历.pdf")} className="export-box-title">
                    全部导出为 PDF
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
                        <div className="export-box-name">{roomMember.payload.name}</div>
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
                <div className="export-box-title">
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
                        <img src={set_icon}/>
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
            </div>
        );

    }
}

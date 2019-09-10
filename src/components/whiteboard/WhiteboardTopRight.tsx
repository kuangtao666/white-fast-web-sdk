import { message, Popover, Tooltip } from "antd";
import * as React from "react";
import { Room, RoomState, ViewMode } from "white-react-sdk";
import * as board from "../../assets/image/board.svg";
import * as board_black from "../../assets/image/board_black.svg";
import { PPTProgressListener } from "../../tools/upload/UploadManager";
import WhiteboardPerspectiveSet from "./WhiteboardPerspectiveSet";
import "./WhiteboardTopRight.less";

export type WhiteboardTopRightState = {
    scaleAnimation: boolean;
    reverseState: boolean;
    isFirst: boolean;
    isInviteVisible: boolean;
};

export type WhiteboardTopRightProps = {
    room: Room,
    number: string,
    uuid: string,
    roomState: RoomState,
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
};

class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, WhiteboardTopRightState> {

    public constructor(props: WhiteboardTopRightProps) {
        super(props);
        this.state = {
            scaleAnimation: true,
            reverseState: false,
            isFirst: true,
            isInviteVisible: false,
        };
    }


    public componentWillReceiveProps(nextProps: WhiteboardTopRightProps): void {
        if (this.props.roomState.broadcastState !== nextProps.roomState.broadcastState ) {
            const perspectiveState = nextProps.roomState.broadcastState;
            const isBeforeBroadcaster = this.props.roomState.broadcastState.mode === ViewMode.Broadcaster;
            const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
            const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
            if (!isBroadcaster) {
                if (hasBroadcaster) {
                    if (perspectiveState.mode === ViewMode.Follower) {
                        message.info("当前演讲者为：" + " " + perspectiveState.broadcasterInformation!.payload.nickName + "," + "您将跟随其视角");
                    } else {
                        message.info("目前为自由视角");
                    }
                } else {
                    if (!isBeforeBroadcaster) {
                        message.info("目前为自由视角");
                    }
                }
            }
        }
    }


    private renderBroadController = (): React.ReactNode => {
        const {room, roomState} = this.props;
        const perspectiveState = roomState.broadcastState;
        const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
        const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
        if (isBroadcaster) {
            return (
                <Tooltip placement="bottom" title={"您正在演讲中..."}>
                    <div
                        onClick={ () => {
                            room.setViewMode(ViewMode.Freedom);
                            message.info("退出演讲模式，他人不再跟随您的视角");
                        }}
                        className="whiteboard-top-bar-btn-mb">
                        <img src={board_black}/>
                    </div>
                </Tooltip>
            );
        } else {
            if (hasBroadcaster) {
                return (
                    <Popover
                        overlayClassName="whiteboard-perspective"
                        content={<WhiteboardPerspectiveSet roomState={roomState} room={room}/>}
                        placement="bottom">
                        <div
                            className="whiteboard-top-bar-btn-mb">
                            <img src={board}/>
                        </div>
                    </Popover>
                );
            } else {
                return (
                    <Tooltip placement="bottom" title={"成为演讲者"}>
                        <div
                            onClick={ () => {
                                room.setViewMode(ViewMode.Broadcaster);
                                message.info("进入演讲模式，他人会跟随您的视角");
                            }}
                            className="whiteboard-top-bar-btn-mb">
                            <img src={board}/>
                        </div>
                    </Tooltip>
                );
            }
        }
    }


    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-top-right">
                <div
                    className="whiteboard-box-top-right-mid">
                    {this.renderBroadController()}
                </div>
            </div>
        );

    }
}

export default WhiteboardTopRight;

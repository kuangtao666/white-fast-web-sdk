import { Button, Input, message, Modal, Popover, Tooltip } from "antd";
import QRCode from "qrcode.react";
import * as React from "react";
import Clipboard from "react-clipboard.js";
import { isMobile } from "react-device-detect";
import { Room, RoomState, ViewMode } from "white-react-sdk";
import * as add from "../../assets/image/add.svg";
import * as board from "../../assets/image/board.svg";
import * as board_black from "../../assets/image/board_black.svg";
import { UploadBtnMobile } from "../../tools/upload/UploadBtn";
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

    private renderBroadControllerMbile = (): React.ReactNode => {
        const {room, roomState} = this.props;
        const perspectiveState = roomState.broadcastState;
        const isBroadcaster = perspectiveState.mode === ViewMode.Broadcaster;
        const hasBroadcaster = perspectiveState.broadcasterId !== undefined;
        if (isBroadcaster) {
            return (
                <div
                    onClick={ () => {
                        room.setViewMode(ViewMode.Freedom);
                        message.info("退出演讲模式，他人不再跟随您的视角");
                    }}
                    className="whiteboard-top-bar-btn-mb">
                    <img src={board_black}/>
                </div>
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
                    <div
                        onClick={ () => {
                            room.setViewMode(ViewMode.Broadcaster);
                            message.info("进入演讲模式，他人会跟随您的视角");
                        }}
                        className="whiteboard-top-bar-btn-mb">
                        <img src={board}/>
                    </div>
                );
            }
        }
    }

    private handleInvite = (): void => {
        this.setState({isInviteVisible: true});
    }

    private handleUrl = (url: string): string => {
        const regex = /[\w]+\/$/gm;
        const match = regex.exec(url);
        if (match) {
            return url.substring(0, match.index);
        } else {
            return url;
        }

    }

    public render(): React.ReactNode {
        if (isMobile) {
            return (
                <div className="whiteboard-box-top-right-mb">
                    <div
                        className="whiteboard-box-top-right-mid-mb">
                        <UploadBtnMobile
                            room={this.props.room}
                            oss={this.props.oss}
                            onProgress={this.props.onProgress}
                            whiteboardRef={this.props.whiteboardRef} />
                        {isMobile ? this.renderBroadControllerMbile() : this.renderBroadController()}
                        <div
                            className="whiteboard-top-bar-btn-mb" onClick={this.handleInvite}>
                            <img src={add}/>
                        </div>
                    </div>
                    <Modal
                        visible={this.state.isInviteVisible}
                        footer={null}
                        title="Invite"
                        onCancel={() => this.setState({isInviteVisible: false})}
                    >
                        <div className="whiteboard-share-box">
                            <QRCode value={`${this.handleUrl(location.href)}`} />
                            <div className="whiteboard-share-text-box">
                                <Input readOnly className="whiteboard-share-text" size="large" value={`${this.handleUrl(location.href)}`}/>
                                <Clipboard
                                    data-clipboard-text={`${this.handleUrl(location.href)}`}
                                    component="div"
                                    onSuccess={() => {
                                        message.success("Copy already copied address to clipboard");
                                        this.setState({isInviteVisible: false});
                                    }}
                                >
                                    <Button size="large" className="white-btn-size" type="primary">复制链接</Button>
                                </Clipboard>
                            </div>
                        </div>
                    </Modal>
                </div>
            );
        } else {
            return (
                <div className="whiteboard-box-top-right">
                    <div
                        className="whiteboard-box-top-right-mid">
                        {this.renderBroadController()}
                        <Tooltip placement="bottomLeft" title={"invite your friend"}>
                            <div
                                style={{marginRight: 12}}
                                className="whiteboard-top-bar-btn" onClick={this.handleInvite}>
                                <img src={add}/>
                            </div>
                        </Tooltip>
                    </div>
                    <Modal
                        visible={this.state.isInviteVisible}
                        footer={null}
                        title="Invite"
                        onCancel={() => this.setState({isInviteVisible: false})}
                    >
                        <div className="whiteboard-share-box">
                            <QRCode value={`${this.handleUrl(location.href)}`} />
                            <div className="whiteboard-share-text-box">
                                <Input readOnly className="whiteboard-share-text" size="large" value={`${this.handleUrl(location.href)}`}/>
                                <Clipboard
                                    data-clipboard-text={`${this.handleUrl(location.href)}`}
                                    component="div"
                                    onSuccess={() => {
                                        message.success("Copy already copied address to clipboard");
                                        this.setState({isInviteVisible: false});
                                    }}
                                >
                                    <Button size="large" className="white-btn-size" type="primary">复制链接</Button>
                                </Clipboard>
                            </div>
                        </div>
                    </Modal>
                </div>
            );
        }
    }
}

export default WhiteboardTopRight;

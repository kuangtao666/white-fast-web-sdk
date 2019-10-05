import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as down from "../../assets/image/down.svg";
import {IdentityType} from "./WhiteboardTopRight";
import {Button, Input, Popover} from "antd";

export type WhiteboardTopLeftProps = {
    logoUrl?: string;
    clickLogoCallback?: () => void;
    roomName?: string;
    identity?: IdentityType;
};

export type WhiteboardTopLeftStates = {
    isVisible: boolean;
};


export default class WhiteboardTopLeft extends React.Component<WhiteboardTopLeftProps, WhiteboardTopLeftStates> {

    public constructor(props: WhiteboardTopLeftProps) {
        super(props);
        this.state = {
            isVisible: false,
        };
    }

    private handleReset = (): void => {
        this.setState({isVisible: false});
    }
    private handleRename = (): void => {
        this.setState({isVisible: false});
    }
    private handlePopoverVisible = (): void => {
        this.setState({isVisible: !this.state.isVisible});
    }

    private handleChange = (visible: any): void => {
        this.setState({
            isVisible: visible,
        });
    }
    private renderRoomName = (): React.ReactNode => {
        const {identity, roomName} = this.props;
        const isHost = identity === IdentityType.host;
        if (isHost) {
            return (
                <Popover
                    trigger="click"
                    onVisibleChange={this.handleChange}
                    visible={this.state.isVisible}
                    content={<div className="rename-box">
                        <Input defaultValue={roomName} style={{width: "100%", marginBottom: 12}}/>
                        <div>
                            <Button
                                type="primary"
                                onClick={() => this.handleRename()}
                                style={{ width: 90, marginRight: 8 }}
                            >
                                确认
                            </Button>
                            <Button onClick={() => this.handleReset()} style={{ width: 90 }}>
                                取消
                            </Button>
                        </div>
                    </div>}
                >
                    <div onClick={this.handlePopoverVisible} style={{cursor: "pointer"}} className="whiteboard-box-top-left-text">
                        {roomName}
                        <img src={down}/>
                    </div>
                </Popover>
            );
        } else {
            return (
                <div className="whiteboard-box-top-left-text">
                    {roomName}
                </div>
            );
        }
    }
    public render(): React.ReactNode {
        const {logoUrl, clickLogoCallback, roomName} = this.props;
        return (
            <div className="whiteboard-box-top-left">
                <div onClick={() => {
                    if (clickLogoCallback) {
                        clickLogoCallback();
                    }
                }} className="whiteboard-box-top-left-logo">
                    {logoUrl &&  <img src={logoUrl}/>}
                </div>
                {roomName && <div className="whiteboard-box-top-left-text-box">
                    {logoUrl && <div className="whiteboard-box-top-left-cutline"/>}
                    {this.renderRoomName()}
                    </div>}
            </div>
        );
    }
}

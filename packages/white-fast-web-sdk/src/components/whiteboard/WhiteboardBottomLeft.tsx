import * as React from "react";
import {DeviceType, Room, RoomState} from "white-web-sdk";
import {observer} from "mobx-react";
import "./WhiteboardBottomLeft.less";
import ScaleController from "../../tools/scaleController";
import file from "../../assets/image/file.svg";
import * as click_icon from "../../assets/image/click_icon.svg";
import * as click_icon_black from "../../assets/image/click_icon_black.svg";
import {roomStore} from "../../models/RoomStore";
import {IdentityType} from "../../pages/NetlessRoomTypes";

export type WhiteboardBottomLeftProps = {
    room: Room;
    roomState: RoomState;
    handleFileState: (state: boolean) => void;
    deviceType: DeviceType;
    isManagerOpen: boolean | null;
    identity?: IdentityType;
    isReadOnly?: boolean;
};

@observer
class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

    public constructor(props: WhiteboardBottomLeftProps) {
        super(props);
    }

    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.zoomChange(scale);
    }

    private renderFileIcon = (): React.ReactNode => {
        const {handleFileState, isManagerOpen} = this.props;
        if (isManagerOpen === null) {
            return (
                <div onClick={() => handleFileState(true)} className="whiteboard-box-bottom-left-chart-2">
                    <img src={file}/>
                </div>
            );
        }
        if (this.props.identity === IdentityType.host) {
            return (
                <div onClick={() => handleFileState(true)} className="whiteboard-box-bottom-left-chart-2">
                    <img src={file}/>
                </div>
            );
        } else {
            return null;
        }
    }
    private isHavePpt = (): boolean => {
        const {room} = this.props;
        return !!(room.state.globalState && room.state.globalState.h5PptUrl);
    }
    public render(): React.ReactNode {
        const {roomState, isReadOnly} = this.props;
        if (isReadOnly) {
            return <div className="whiteboard-box-bottom-left">
                <div className="whiteboard-box-mid">
                    <ScaleController
                        zoomScale={roomState.zoomScale} isReadOnly={this.props.isReadOnly}
                        deviceType={this.props.deviceType}
                        zoomChange={this.zoomChange}/>
                </div>
            </div>;
        }
        return (
            <div className="whiteboard-box-bottom-left">
                <div className="whiteboard-box-mid">
                    {this.isHavePpt() &&
                    <div onClick={() => {
                        if (roomStore.boardPointerEvents === "auto") {
                            roomStore.boardPointerEvents = "none";
                        } else {
                            roomStore.boardPointerEvents = "auto";
                        }
                    }} className="whiteboard-click-icon">
                        {roomStore.boardPointerEvents === "auto" ? <img src={click_icon}/> : <img src={click_icon_black}/>}
                    </div>}
                    {this.renderFileIcon()}
                    <ScaleController
                        zoomScale={roomState.zoomScale}
                        deviceType={this.props.deviceType}
                        zoomChange={this.zoomChange}/>
                </div>
            </div>
        );
    }

}

export default WhiteboardBottomLeft;

import * as React from "react";
import {DeviceType, Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "../../tools/scaleController";
import file from "../../assets/image/file.svg";
import {IdentityType} from "./WhiteboardTopRight";

export type WhiteboardBottomLeftProps = {
    room: Room;
    roomState: RoomState;
    handleFileState: (state: boolean) => void;
    deviceType: DeviceType;
    isManagerOpen: boolean | null;
    identity?: IdentityType;
    isReadOnly?: boolean;
};


export default class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

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

    public render(): React.ReactNode {
        const {roomState, isReadOnly} = this.props;
        if (isReadOnly) {
            return <div className="whiteboard-box-bottom-left">
                <ScaleController
                    zoomScale={roomState.zoomScale} isReadOnly={this.props.isReadOnly}
                    deviceType={this.props.deviceType}
                    zoomChange={this.zoomChange}/>
            </div>;
        }
        return (
            <div className="whiteboard-box-bottom-left">
                {this.renderFileIcon()}
                <ScaleController
                    zoomScale={roomState.zoomScale}
                    deviceType={this.props.deviceType}
                    zoomChange={this.zoomChange}/>
            </div>
        );
    }

}

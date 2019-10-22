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

    public render(): React.ReactNode {
        const {roomState, isReadOnly, handleFileState} = this.props;
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
                {this.props.identity === IdentityType.host && <div onClick={() => handleFileState(true)} className="whiteboard-box-bottom-left-chart-2">
                    <img src={file}/>
                </div>}
                <ScaleController
                    zoomScale={roomState.zoomScale}
                    deviceType={this.props.deviceType}
                    zoomChange={this.zoomChange}/>
            </div>
        );
    }

}

import * as React from "react";
import {Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "../../tools/scaleController";
import file from "../../assets/image/file.svg";

export type WhiteboardBottomLeftProps = {
    room: Room;
    roomState: RoomState;
    handleFileState: () => void;
};


class WhiteboardBottomLeft extends React.Component<WhiteboardBottomLeftProps, {}> {

    public constructor(props: WhiteboardBottomLeftProps) {
        super(props);
    }


    private zoomChange = (scale: number): void => {
        const {room} = this.props;
        room.zoomChange(scale);
    }

    public render(): React.ReactNode {
        const {roomState} = this.props;
        return (
            <div className="whiteboard-box-bottom-left">
                <div onClick={this.props.handleFileState} className="whiteboard-box-bottom-left-chart">
                    <img src={file}/>
                </div>
                <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
            </div>
        );
    }
}

export default WhiteboardBottomLeft;

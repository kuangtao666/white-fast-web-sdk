import * as React from "react";
import {Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "../../tools/scaleController";
import * as chat from "../../assets/image/chat.svg";

export type WhiteboardBottomLeftProps = {
    room: Room;
    roomState: RoomState;
    chatState?: boolean;
    handleChatState: () => void;
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
                <div onClick={this.props.handleChatState} className="whiteboard-box-bottom-left-chart">
                    <img src={chat}/>
                </div>
                <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
            </div>
        );
    }
}

export default WhiteboardBottomLeft;

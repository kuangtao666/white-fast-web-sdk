import * as React from "react";
import {Room, RoomState} from "white-react-sdk";
import "./WhiteboardBottomLeft.less";
import ScaleController from "@netless/react-scale-controller";
import * as player from "../../assets/image/player.svg";
import {Tooltip} from "antd";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";

export type WhiteboardBottomLeftInnerProps = {
    room: Room;
    roomState: RoomState;
    uuid: string;
    userId: string;
};

export type WhiteboardBottomLeftProps = RouteComponentProps<{}> & WhiteboardBottomLeftInnerProps;

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
                <ScaleController zoomScale={roomState.zoomScale} zoomChange={this.zoomChange}/>
                <Tooltip placement="top" title={"回放"}>
                    <div className="whiteboard-box-bottom-left-player">
                        <img src={player}/>
                    </div>
                </Tooltip>
            </div>
        );
    }
}

export default withRouter(WhiteboardBottomLeft);

import * as React from "react";
import uuidv4 from "uuid/v4";
import "./ExtendToolInner.less";
import {
    Room,
} from "white-react-sdk";

export type ExtendToolInnerProps = {
    whiteboardLayerDownRef: HTMLDivElement;
    room: Room;
};

export default class ExtendToolInner extends React.Component<ExtendToolInnerProps, {}> {
    public constructor(props: ExtendToolInnerProps) {
        super(props);
    }

    private addImage = (url: string): void => {
        const {clientWidth, clientHeight} = this.props.whiteboardLayerDownRef;
        const {x, y} = this.props.room.convertToPointInWorld({x: clientWidth / 2, y: clientHeight / 2});
        const uuid = uuidv4();
        this.props.room.insertImage({
            uuid: uuid,
            centerX: x,
            centerY: y,
            width: 180,
            height: 180,
        });
        this.props.room.completeImageUpload(uuid, url);
    }

    public render(): React.ReactNode {
        return (
            <div className="extend-inner-box">
                <div onClick={() => {
                    this.addImage("https://ohuuyffq2.qnssl.com/netless.png");
                }}>三角形1</div>
                <div>三角形1</div>
                <div>三角形1</div>
                <div>三角形1</div>
            </div>
        );
    }
}

import * as React from "react";
import uuidv4 from "uuid/v4";
import "./ExtendToolInner.less";
import {
    Room,
} from "white-react-sdk";
import {Tabs} from "antd";
const { TabPane } = Tabs;
export type ExtendToolInnerProps = {
    whiteboardLayerDownRef: HTMLDivElement;
    room: Room;
};

enum ExtendToolType {
    plugin = "plugin",
    geometry = "geometry",
    subject = "subject",
}

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
        this.props.room.setMemberState({
            currentApplianceName: "selector",
        });
    }

    public render(): React.ReactNode {
        return (
            <div className="extend-inner-box">
                <div className="extend-inner-nav">
                    <div className="extend-inner-title">插件教具</div>
                    <div className="extend-inner-title">几何图形</div>
                    <div className="extend-inner-title">学科图形</div>
                </div>
                <div className="extend-inner-body">
                </div>
            </div>
        );
    }
}

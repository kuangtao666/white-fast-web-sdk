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
                <Tabs defaultActiveKey="1">
                    <TabPane tab="几何图形" key="1">
                        <div  className="extend-inner-detail">
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img style={{width: 64}} src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/triangle.svg")}>
                                <img style={{width: 56}} src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/triangle.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="插件教具" key="2">
                        <div  className="extend-inner-detail">
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/triangle.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="学科图形" key="3">
                        <div  className="extend-inner-detail">
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                            <div className="extend-inner-detail-cell" onClick={() => this.addImage("https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg")}>
                                <img src="https://white-sdk.oss-cn-beijing.aliyuncs.com/icons/star.svg"/>
                            </div>
                        </div>
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

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

export type ExtendToolInnerStates = {
    activeKey: string;
};

export default class ExtendToolInner extends React.Component<ExtendToolInnerProps, ExtendToolInnerStates> {
    public constructor(props: ExtendToolInnerProps) {
        super(props);
        this.state = {
            activeKey: "1",
        };
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

    private handleTabsChange = (evt: any): void => {
        if (evt === "1") {
            this.setState({activeKey: evt});
        } else {
            this.setState({activeKey: evt});
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="extend-inner-box">
                <Tabs activeKey={this.state.activeKey} onChange={this.handleTabsChange}>
                    <TabPane tab="插件教具" key="1">
                        <div>
                            <div onClick={() => this.props.room.insertPlugin({protocal: "iframe", centerX: 0, centerY: 0, width: 600, height: 600})}>
                                <div></div>
                                网页
                            </div>
                            <div onClick={() => this.props.room.insertPlugin({protocal: "test", centerX: 0, centerY: 0, width: 300, height: 300})}>
                                <div></div>
                                test
                            </div>
                        </div>
                    </TabPane>
                    <TabPane tab="常用图形" key="2">
                    </TabPane>
                </Tabs>
            </div>
        );
    }
}

import * as React from "react";
import {Popover} from "antd";
import "./ExtendTool.less";
import {ExtendToolIcon} from "./ExtendToolIcon";
import ExtendToolInner from "./ExtendToolInner";
import {RoomContextConsumer} from "../../components/RoomContext";
import {ToolBarPositionEnum} from "../../components/RealTime";

export type ExtendToolStates = {
    toolBoxColor: string;
};

export type ExtendToolProps = {
    toolBarPosition?: ToolBarPositionEnum;
};

export default class ExtendTool extends React.Component<ExtendToolProps, ExtendToolStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
    }

    public render(): React.ReactNode {
        return (
            <RoomContextConsumer key={"add"} children={context => (
                <Popover placement="bottom" content={<ExtendToolInner room={context.room} whiteboardLayerDownRef={context.whiteboardLayerDownRef}/>}>
                    <div
                        onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                        onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                        className="extend-tool-cell-box">
                        <div className="extend-tool-cell">
                            <ExtendToolIcon color={this.state.toolBoxColor}/>
                        </div>
                    </div>
                </Popover>
        )}/>
        );
    }
}

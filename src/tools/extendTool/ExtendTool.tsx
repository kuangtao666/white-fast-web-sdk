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
        const {toolBarPosition} = this.props;
        return (
            <RoomContextConsumer key={"add"} children={context => (
                <Popover placement="bottom" content={<ExtendToolInner room={context.room} whiteboardLayerDownRef={context.whiteboardLayerDownRef}/>}>
                    <div
                        onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                        onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                        className={(toolBarPosition === ToolBarPositionEnum.left || toolBarPosition === ToolBarPositionEnum.right) ? "extend-tool-cell-box-left" : "extend-tool-cell-box"}>
                        <div className="extend-tool-cell">
                            <ExtendToolIcon color={this.state.toolBoxColor}/>
                        </div>
                    </div>
                </Popover>
        )}/>
        );
    }
}

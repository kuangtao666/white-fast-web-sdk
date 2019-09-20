import * as React from "react";
import {Popover} from "antd";
import "./ExtendTool.less";
import {ExtendToolIcon} from "./ExtendToolIcon";
import ExtendToolInner from "./ExtendToolInner";
import {RoomContextConsumer} from "../../components/RoomContext";
import {ToolBarPositionEnum} from "../../components/RealTime";
import {TooltipPlacement} from "antd/lib/tooltip";

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
    private handlePlacement = (): TooltipPlacement => {
        const {toolBarPosition} = this.props;
        switch (toolBarPosition) {
            case ToolBarPositionEnum.left: {
                return "left";
            }
            case ToolBarPositionEnum.bottom: {
                return "bottom";
            }
            case ToolBarPositionEnum.right: {
                return "right";
            }
            default: {
                return "bottom";
            }
        }
    }


    public render(): React.ReactNode {
        const {toolBarPosition} = this.props;
        return (
            <RoomContextConsumer key={"add"} children={context => (
                <Popover placement={this.handlePlacement()} content={<ExtendToolInner room={context.room} whiteboardLayerDownRef={context.whiteboardLayerDownRef}/>}>
                    <div
                        onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                        onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                        className={(toolBarPosition === ToolBarPositionEnum.left || toolBarPosition === ToolBarPositionEnum.right) ? "extend-tool-cell-box-left" : "extend-tool-cell-box"}>
                        <div className="extend-tool-cell">
                            <ExtendToolIcon color={this.state.toolBoxColor}/>
                        </div>
                    </div>
                </Popover>
        )}/>);
    }
}

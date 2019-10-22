import * as React from "react";
import {Popover} from "antd";
import "./ExtendTool.less";
import {ExtendToolIcon} from "./ExtendToolIcon";
import ExtendToolInner from "./ExtendToolInner";
import {RoomContextConsumer} from "../../pages/RoomContext";
import {LanguageEnum, ToolBarPositionEnum} from "../../pages/NetlessRoom";
import {TooltipPlacement} from "antd/lib/tooltip";

export type ExtendToolStates = {
    toolBoxColor: string;
};

export type ExtendToolProps = {
    toolBarPosition?: ToolBarPositionEnum;
    language?: LanguageEnum;
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
                <Popover trigger="click" placement={this.handlePlacement()} content={<ExtendToolInner language={this.props.language} room={context.room} whiteboardLayerDownRef={context.whiteboardLayerDownRef}/>}>
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

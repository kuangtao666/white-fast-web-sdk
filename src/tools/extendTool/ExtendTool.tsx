import * as React from "react";
import {Popover, Upload} from "antd";
import "./ExtendTool.less";
import {ExtendToolIcon} from "./ExtendToolIcon";

export type ExtendToolStates = {
    toolBoxColor: string;
};

export default class ExtendTool extends React.Component<{}, ExtendToolStates> {
    public constructor(props: {}) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
    }

    public render(): React.ReactNode {
        return (
            <Popover placement="bottom" content={""}>
                <div
                    onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                    onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                    className="extend-tool-cell-box">
                    <div className="extend-tool-cell">
                        <ExtendToolIcon color={this.state.toolBoxColor}/>
                    </div>
                </div>
            </Popover>
        );
    }
}

import * as React from "react";
import {Popover} from "antd";
import {ChromePicker, ColorResult} from "react-color";
import toolPaletteConfig from "./ToolPaletteConfig";
import * as add_white from "../../assets/image/add_white.svg";

export type ToolBoxAddColorStates = {
    isColorChanged: boolean;
    newColor: string | null;
};

export type ToolBoxAddColorProps = {
    newColorArray?: (colorArray: string[]) => void;
    newColor?: (color: string) => void;
    colorConfig?: string[];
};

export default class ToolBoxAddColor extends React.Component<ToolBoxAddColorProps, ToolBoxAddColorStates> {

    public constructor(props: ToolBoxAddColorProps) {
        super(props);
        this.setState({
            newColor: null,
            isColorChanged: false,
        });
    }

    private handleChangeComplete = (color: ColorResult): void => {
        this.setState({ newColor: color.hex });
        if (!this.state.isColorChanged) {
            this.setState({isColorChanged: true});
        }
    }

    private updateColorArray = (): void => {
        const {newColorArray, colorConfig} = this.props;
        if (this.state.newColor) {
            if (colorConfig) {
                colorConfig.push(this.state.newColor);
                if (newColorArray) {
                    newColorArray(colorConfig);
                }
            } else {
                toolPaletteConfig.push(this.state.newColor);
                if (newColorArray) {
                    newColorArray(toolPaletteConfig);
                }
            }
        }
    }
    private handleVisibleChange = (visible: boolean): void => {
        if (!visible) {
            this.updateColorArray();
            const {newColor} = this.props;
            if (newColor && this.state.newColor) {
                newColor(this.state.newColor);
            }
        }
    }

    public componentWillUnmount(): void {
        this.updateColorArray();
        const {newColor} = this.props;
        if (newColor && this.state.newColor) {
            newColor(this.state.newColor);
        }
    }
    public render(): React.ReactNode {

        return (
            <Popover
                onVisibleChange={this.handleVisibleChange}
                trigger="click"
                content={<ChromePicker color={"#BEBEBE"} onChangeComplete={this.handleChangeComplete}/>}
                placement="bottom"
            >
                <div className="palette-color-inner-box">
                    <div className="palette-color"
                         style={{backgroundColor: "#BEBEBE"}}>
                        <img src={add_white}/>
                    </div>
                </div>
            </Popover>);
    }

}

import * as React from "react";
import {StrokeWidth} from "./ToolIconComponent";
import toolPaletteConfig from "./ToolPaletteConfig";
import  "./ToolBoxPaletteBox.less";
import isColor from "is-color";
import {message} from "antd";
export type ToolBoxPaletteBoxProps = {
    displayStroke: boolean;
    setMemberState: (modifyState: Partial<any>) => void;
    memberState: Readonly<any>;
    colorConfig?: ReadonlyArray<any>;
};

export default class ToolBoxPaletteBox extends React.Component<ToolBoxPaletteBoxProps, {}> {

    public constructor(props: ToolBoxPaletteBoxProps) {
        super(props);
        this.state = {};
    }

    private setStrokeWidth(event: Event): void {
        const strokeWidth = parseInt((event.target as any).value);
        this.props.setMemberState({strokeWidth: strokeWidth});
    }

    public render(): React.ReactNode {
        return (
            <div className="palette-mid-box">
                {this.props.displayStroke && this.renderStrokeSelector()}
                {this.renderColorSelector()}
            </div>
        );
    }

    private hexToRgb = (hex: string): any => {
        const rgb: number[] = [];

        hex = hex.substr(1);

        if (hex.length === 3) { // 处理 "#abc" 成 "#aabbcc"
            hex = hex.replace(/(.)/g, "$1$1");
        }

        hex.replace(/../g, (color: any): any => {
            rgb.push(parseInt(color, 0x10)); // 按16进制将字符串转换为数字
        });

        return rgb;
    }

    private isEffectiveColor = (color: any): boolean => {
        if (isColor(color)) {
            return true;
        } else {
            const rgb = "rgb(" + color.join(",") + ")";
            return isColor(rgb);
        }
    }

    private renderColorCellArray = (): React.ReactNode => {
        const {colorConfig} = this.props;
        if (colorConfig) {
            return colorConfig.map((cell, index) => {
                if (this.isEffectiveColor(cell.color)) {
                    if (typeof cell.color === "string") {
                        const color = this.hexToRgb(cell.color);
                        const className = this.isMatchColor(color) ? "palette-color-inner-box-active"
                            : "palette-color-inner-box";
                        const [r, g, b] = color;

                        return (
                            <div className={className}
                                 key={`${index}`}
                                 onClick={() => this.props.setMemberState({strokeColor: color})}>
                                <div className="palette-color"
                                     style={{backgroundColor: `rgb(${r},${g},${b})`}}/>
                            </div>
                        );
                    } else {
                        const className = this.isMatchColor(cell.color) ? "palette-color-inner-box-active"
                            : "palette-color-inner-box";
                        const [r, g, b] = cell.color;

                        return (
                            <div className={className}
                                 key={`${index}`}
                                 onClick={() => this.props.setMemberState({strokeColor: cell.color})}>
                                <div className="palette-color"
                                     style={{backgroundColor: `rgb(${r},${g},${b})`}}/>
                            </div>
                        );
                    }
                } else {
                    message.error(`${cell.color}是非法颜色，无法被渲染。`);
                    return null;
                }
            });
        } else {
            return toolPaletteConfig.map((cell, index) => {
                const className = this.isMatchColor(cell.color) ? "palette-color-inner-box-active"
                    : "palette-color-inner-box";
                const [r, g, b] = cell.color;

                return (
                    <div className={className}
                         key={`${index}`}
                         onClick={() => this.props.setMemberState({strokeColor: cell.color})}>
                        <div className="palette-color"
                             style={{backgroundColor: `rgb(${r},${g},${b})`}}/>
                    </div>
                );
            });
        }
    }
    private renderColorSelector = (): React.ReactNode => {
        return [
            <div key="title" className="palette-title-one">
                颜色
            </div>,
            <div key="cells" className="palette-color-box">
                {this.renderColorCellArray()}
            </div>,
        ];
    }

    private isMatchColor(color: any): boolean {
        const {strokeColor} = this.props.memberState;
        return (
            strokeColor[0] === color[0] &&
            strokeColor[1] === color[1] &&
            strokeColor[2] === color[2]
        );
    }

    private renderStrokeSelector(): React.ReactNode {
        const [r, g, b] = this.props.memberState.strokeColor;
        return [
            <div key="title" className="palette-title-two">宽度</div>,
            <div key="box" className="palette-stroke-width-box">
                <StrokeWidth
                    className="palette-stroke-under-layer"
                    color={`rgb(${r},${g},${b})`}/>

                <div className="palette-stroke-slider-mask">
                    <input className="palette-stroke-slider"
                           type="range"
                           min={2}
                           max={32}
                           onChange={this.setStrokeWidth.bind(this)}
                           defaultValue={`${this.props.memberState.strokeWidth}`}
                           onMouseUp={
                               () => this.props.setMemberState({strokeWidth: this.props.memberState.strokeWidth})
                           }/>
                </div>
            </div>,
        ];
    }
}

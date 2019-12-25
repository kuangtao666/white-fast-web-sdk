import * as React from "react";
import {StrokeWidth} from "./ToolIconComponent";
import toolPaletteConfig from "./ToolPaletteConfig";
import  "./ToolBoxPaletteBox.less";
import isColor from "is-color";
import {message} from "antd";
import ToolBoxAddColor from "./ToolBoxAddColor";
import {RoomContextConsumer} from "../../pages/RoomContext";
import {LanguageEnum} from "../../pages/NetlessRoomTypes";
export type ToolBoxPaletteBoxProps = {
    displayStroke: boolean;
    setMemberState: (modifyState: Partial<any>) => void;
    memberState: Readonly<any>;
    colorConfig?: string[];
    language?: LanguageEnum;
};

export type ToolBoxPaletteBoxStates = {
    colorConfig: string[];
};

export default class ToolBoxPaletteBox extends React.Component<ToolBoxPaletteBoxProps, ToolBoxPaletteBoxStates> {

    public constructor(props: ToolBoxPaletteBoxProps) {
        super(props);
        const {colorConfig} = this.props;
        this.state = {
            colorConfig: colorConfig ? colorConfig : toolPaletteConfig,
        };
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

        if (hex.length === 3) {
            hex = hex.replace(/(.)/g, "$1$1");
        }

        hex.replace(/../g, (color: any): any => {
            rgb.push(parseInt(color, 0x10));
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

    private appendNewColor = (color: string): void => {
        const colorArray = this.state.colorConfig;
        colorArray.push(color);
        this.setState({colorConfig: colorArray});
        const newColor = this.hexToRgb(color);
        this.props.setMemberState({strokeColor: newColor});
    }

    private renderColorCellArray = (): React.ReactNode => {
        const {colorConfig} = this.state;
        const nodes = colorConfig.map((color, index) => {
            if (this.isEffectiveColor(color)) {
                const newColor = this.hexToRgb(color);
                const className = this.isMatchColor(newColor) ? "palette-color-inner-box-active"
                    : "palette-color-inner-box";
                const [r, g, b] = newColor;

                return (
                    <div className={className}
                         key={`${index}`}
                         onClick={() => this.props.setMemberState({strokeColor: newColor})}>
                        <div className="palette-color"
                             style={{backgroundColor: `rgb(${r},${g},${b})`}}/>
                    </div>
                );
            } else {
                message.error(`${color}是非法颜色，无法被渲染。`);
                return null;
            }
        });
        nodes.push(<RoomContextConsumer key={"add"} children={context => (
            <ToolBoxAddColor newColor={this.appendNewColor} newColorArray={context.onColorArrayChange}/>
        )}/>);
        return nodes;
    }
    private renderColorSelector = (): React.ReactNode => {
        const {language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        return [
            <div key="title" className="palette-title-one">
                {isEnglish ? "Color" : "颜色"}
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
        const {memberState, language} = this.props;
        const [r, g, b] = memberState.strokeColor;
        const isEnglish = language === LanguageEnum.English;
        return [
            <div key="title" className="palette-title-two">{isEnglish ? "Width" : "宽度"}</div>,
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

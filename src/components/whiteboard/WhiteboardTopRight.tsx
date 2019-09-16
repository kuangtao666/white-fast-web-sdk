import * as React from "react";
import { ViewMode } from "white-react-sdk";
import set_icon from "../../assets/image/set_icon.svg";
import export_icon from "../../assets/image/export_icon.svg";
import "./WhiteboardTopRight.less";
import {Popover} from "antd";

export type WhiteboardTopRightProps = {
    avatar: string;
    name: string;
    id: string;
};

export default class WhiteboardTopRight extends React.Component<WhiteboardTopRightProps, {}> {

    public constructor(props: WhiteboardTopRightProps) {
        super(props);
    }

    private exportComponent = (): React.ReactNode => {
        return (
            <div className="export-box">
            </div>
        );
    }

    private setComponent = (): React.ReactNode => {
        return (
            <div className="export-box">
            </div>
        );
    }

    public render(): React.ReactNode {
        const  {avatar, name} = this.props;
        return (
            <div className="whiteboard-top-right-box">
                <div className="whiteboard-top-user-box">
                    <div className="whiteboard-top-right-user">
                        <img src={avatar}/>
                    </div>
                    <div className="whiteboard-top-right-name">{name}</div>
                    <div className="whiteboard-top-right-line">|</div>
                </div>
                <Popover placement="bottomRight" content={this.setComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img src={set_icon}/>
                    </div>
                </Popover>
                <Popover placement="bottomRight" content={this.exportComponent()}>
                    <div className="whiteboard-top-right-cell">
                        <img style={{width: 16}} src={export_icon}/>
                    </div>
                </Popover>
            </div>
        );

    }
}

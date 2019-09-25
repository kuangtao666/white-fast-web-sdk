import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as netless_black from "../../assets/image/netless_black.svg";


export type WhiteboardTopLeftProps = {
    logoUrl?: string;
    clickLogoCallback?: () => void;
};


export default class WhiteboardTopLeft extends React.Component<WhiteboardTopLeftProps, {}> {

    public constructor(props: WhiteboardTopLeftProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const {logoUrl, clickLogoCallback} = this.props;
        return (
            <div onClick={() => {
                if (clickLogoCallback) {
                    clickLogoCallback();
                }
            }} className="whiteboard-box-top-left">
                {logoUrl &&  <img src={logoUrl}/>}
            </div>
        );
    }
}

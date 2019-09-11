import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as netless_black from "../../assets/image/netless_black.svg";


export type WhiteboardTopLeftProps = {
    logoUrl?: string | boolean;
};


class WhiteboardTopLeft extends React.Component<WhiteboardTopLeftProps, {}> {

    public constructor(props: WhiteboardTopLeftProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const {logoUrl} = this.props;
        if (logoUrl === false) {
            return null;
        } else if (logoUrl === true) {
            return (
                <div className="whiteboard-box-top-left">
                    <img src={netless_black}/>
                </div>
            );
        } else {
            return (
                <div className="whiteboard-box-top-left">
                    <img src={logoUrl ? logoUrl : netless_black}/>
                    {/*<img/>*/}
                    {/*<div className="whiteboard-box-top-left-name">伍双的教室</div>*/}
                </div>
            );
        }
    }
}


export default WhiteboardTopLeft;

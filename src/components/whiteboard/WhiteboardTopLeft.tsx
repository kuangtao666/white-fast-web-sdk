import * as React from "react";
import "./WhiteboardTopLeft.less";
import * as homeIcon from "../../assets/image/home.svg";


export type WhiteboardTopLeftProps = {
    logoUrl?: string;
};


class WhiteboardTopLeft extends React.Component<WhiteboardTopLeftProps, {}> {

    public constructor(props: WhiteboardTopLeftProps) {
        super(props);
    }

    public render(): React.ReactNode {

        return (
            <div className="whiteboard-box-top-left">
                <img src={homeIcon}/>
            </div>
        );
    }
}


export default WhiteboardTopLeft;

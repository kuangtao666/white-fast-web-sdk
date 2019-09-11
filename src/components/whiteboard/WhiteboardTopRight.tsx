import * as React from "react";
import { ViewMode } from "white-react-sdk";
import "./WhiteboardTopRight.less";


export default class WhiteboardTopRight extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-top-right-box">
                <div></div>
            </div>
        );

    }
}

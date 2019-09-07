import * as React from "react";
import "./ExtendToolInner.less";
import {UploadManager} from "../upload/UploadManager";

export type ExtendToolInnerProps = {
    whiteboardLayerDownRef: HTMLDivElement;
};

export default class ExtendToolInner extends React.Component<ExtendToolInnerProps, {}> {
    public constructor(props: ExtendToolInnerProps) {
        super(props);
    }

    // private addImage = ():void => {
    //     // const uploadManager = new UploadManager(this.client, this.props.room);
    // }

    public render(): React.ReactNode {
        return (
            <div className="extend-inner-box">
                {/*<div onClick={() =>  uploadManager}>三角形1</div>*/}
                <div>三角形1</div>
                <div>三角形1</div>
                <div>三角形1</div>
            </div>
        );
    }
}

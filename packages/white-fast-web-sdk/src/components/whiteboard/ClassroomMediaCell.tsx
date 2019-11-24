import * as React from "react";
import "./ClassroomMediaManager.less";
import {NetlessStream} from "./ClassroomMedia";

export type ClassroomManagerCellProps = {
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
};

export default class ClassroomMediaCell extends React.Component<ClassroomManagerCellProps, {}> {


    public constructor(props: ClassroomManagerCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
    }

    public componentWillUnmount(): void {
        const {stream} = this.props;
        stream.stop();
    }

    public render(): React.ReactNode {
        const {stream, userId} = this.props;
        const streamId =  stream.getId();
        if (streamId === userId) {
            return (
                <div id={`netless-${streamId}`} className="rtc-media-cell-box" style={{border: "3px solid #5B908E"}}>
                </div>
            );
        } else {
            return (
                <div id={`netless-${streamId}`} className="rtc-media-cell-box">
                </div>
            );
        }
    }
}

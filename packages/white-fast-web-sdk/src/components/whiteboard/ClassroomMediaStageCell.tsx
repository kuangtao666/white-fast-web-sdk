import * as React from "react";
import {NetlessStream} from "./ClassroomMedia";
import "./ClassroomMediaManager.less";

export type ClassroomMediaStageCellProps = {
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
};

export default class ClassroomMediaStageCell extends React.Component<ClassroomMediaStageCellProps, {}> {


    public constructor(props: ClassroomMediaStageCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        this.startStream(stream);
    }

    private startStream = (stream: NetlessStream): void => {
        const {userId, rtcClient} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
        if (streamId === userId) {
            rtcClient.publish(stream, (err: any) => {
                console.log("publish failed");
                console.error(err);
            });
        }
    }

    public render(): React.ReactNode {
        const {stream, userId} = this.props;
        const streamId =  stream.getId();
        if (streamId === userId) {
            return (
                <div id={`netless-${streamId}`} className="rtc-media-cell-box-self">
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

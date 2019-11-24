import * as React from "react";
import {NetlessStream} from "./ClassroomMedia";
import "./ClassroomMediaManager.less";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type ClassroomMediaStageCellProps = {
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
    streamsLength: number;
};

export default class ClassroomMediaStageCell extends React.Component<ClassroomMediaStageCellProps, {}> {


    public constructor(props: ClassroomMediaStageCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        this.startStream(stream);
        this.publishLocalStream(stream);
    }

    public async UNSAFE_componentWillReceiveProps(nextProps: ClassroomMediaStageCellProps): Promise<void> {
        if (nextProps.stream !== this.props.stream) {
            this.stopStream(this.props.stream);
            await timeout(0);
            this.startStream(nextProps.stream);
        }
    }

    private startStream = (stream: NetlessStream): void => {
        const streamId = stream.getId();
        stream.play(`netless-${streamId}`);
    }

    private publishLocalStream = (stream: NetlessStream): void => {
        const {userId, rtcClient} = this.props;
        const streamId = stream.getId();
        if (streamId === userId) {
            rtcClient.publish(stream, (err: any) => {
                console.log("publish failed");
                console.error(err);
            });
        }
    }

    private stopStream = (stream: NetlessStream): void => {
        stream.stop();
    }

    public componentWillUnmount(): void {
        const {stream} = this.props;
        this.stopStream(stream);
    }

    public render(): React.ReactNode {
        const {stream, streamsLength} = this.props;
        const streamId =  stream.getId();
        if (streamsLength <= 2) {
            return (
                <div id={`netless-${streamId}`} style={{width: 300, height: 300}} className="rtc-media-stage-box">
                </div>
            );
        } else if (streamsLength > 3 && streamsLength < 6) {
            return (
                <div id={`netless-${streamId}`} style={{width: 300, height: 225}} className="rtc-media-stage-box">
                </div>
            );
        } else {
            return (
                <div id={`netless-${streamId}`} style={{width: 300, height: 200}} className="rtc-media-stage-box">
                </div>
            );
        }
    }
}

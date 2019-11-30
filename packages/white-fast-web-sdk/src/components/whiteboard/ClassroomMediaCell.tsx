import * as React from "react";
import "./ClassroomMediaManager.less";
import {NetlessStream} from "./ClassroomMedia";
import {CSSProperties} from "react";
import {ClassModeType} from "../../pages/RoomManager";

export type ClassroomManagerCellProps = {
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
    streamsLength: number;
    streamIndex: number
    setMemberToStageById: (userId: number) => void;
    classMode: ClassModeType;
    setLocalStreamState: (state: boolean) => void;
    isLocalStreamPublish: boolean;
    getMediaCellReleaseFunc: (fun: () => void) => void;
};

export default class ClassroomMediaCell extends React.Component<ClassroomManagerCellProps, {}> {


    public constructor(props: ClassroomManagerCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
        this.publishLocalStream(stream);
        this.props.getMediaCellReleaseFunc(this.release);
    }

    private release = (): void => {
        const {stream} = this.props;
        if (stream.isPlaying()) {
            stream.stop();
        }
        this.unpublishLocalStream(stream);
    }

    public componentWillUnmount(): void {
       this.release();
    }

    private renderStyle = (): CSSProperties => {
        const {streamsLength, streamIndex} = this.props;
        if (streamsLength === 2) {
            return {width: 100, height: 100};
        } else if (streamsLength === 3) {
            return {width: 150, height: 100, right: (streamIndex * 150)};
        } else if (streamsLength === 4) {
            return {width: 100, height: 100, right: (streamIndex * 100)};
        } else if (streamsLength === 5) {
            return {width: 75, height: 75, right: (streamIndex * 75)};
        } else {
            if (streamIndex >= 4) {
                return {width: 75, height: 75, right: ((streamIndex - 4) * 75), bottom: 75};
            } else {
                return {width: 75, height: 75, right: (streamIndex * 75)};
            }
        }
    }

    private publishLocalStream = (stream: NetlessStream): void => {
        const {userId, rtcClient} = this.props;
        const streamId = stream.getId();
        if (streamId === userId && !this.props.isLocalStreamPublish && rtcClient !== undefined) {
            rtcClient.publish(stream, (err: any) => {
                console.log("publish failed");
                console.error(err);
            });
            this.props.setLocalStreamState(true);
        }
    }

    private unpublishLocalStream = (stream: NetlessStream): void => {
        const {userId, rtcClient} = this.props;
        const streamId = stream.getId();
        if (streamId === userId && this.props.isLocalStreamPublish && rtcClient !== undefined) {
            rtcClient.unpublish(stream, (err: any) => {
                console.log("unpublish failed");
                console.error(err);
            });
            this.props.setLocalStreamState(false);
        }
    }

    private handleClickVideo = (userId: number): void => {
        this.props.setMemberToStageById(userId);
    }

    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        return (
            <div className="rtc-media-cell-out-box" style={this.renderStyle()}>
                <div className="rtc-media-cell-mid-box">
                    <div id={`netless-${streamId}`} onClick={() => this.handleClickVideo(streamId)} style={this.renderStyle()} className="rtc-media-cell-box">
                    </div>
                    <div style={{backgroundColor: stream.state.isAudioOpen ? "green" : "red"}} className="rtc-media-cell-icon">
                    </div>
                </div>
            </div>
        );
    }
}

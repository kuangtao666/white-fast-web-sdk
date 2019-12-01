import * as React from "react";
import "./ClassroomMediaManager.less";
import {NetlessStream} from "./ClassroomMedia";
import {CSSProperties} from "react";
import {ClassModeType} from "../../pages/RoomManager";
import * as microphone_open from "../../assets/image/microphone_open.svg";
import * as microphone_close from "../../assets/image/microphone_close.svg";
import * as camera_open from "../../assets/image/camera_open.svg";
import * as camera_close from "../../assets/image/camera_close.svg";
import Identicon from "../../tools/identicon/Identicon";
export type ClassroomManagerCellProps = {
    stream: NetlessStream;
    userId: number;
    rtcClient: any;
    streamsLength: number;
    streamIndex: number
    userAvatarUrl?: string;
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

    public async componentDidMount(): Promise<void> {
        const {stream} = this.props;
        await this.startStream(stream);
        this.props.getMediaCellReleaseFunc(this.release);
    }

    private startStream = (stream: NetlessStream): void => {
        const streamId = stream.getId();
        this.publishLocalStream(stream);
        stream.play(`netless-${streamId}`);
    }

    private release = (): void => {
        const {stream} = this.props;
        this.stopStream(stream);
    }

    public componentWillUnmount(): void {
       this.release();
    }

    private stopStream = (stream: NetlessStream): void => {
        if (stream.isPlaying()) {
            stream.stop();
        }
    }

    private renderStageStyle = (): any => {
        const {streamsLength} = this.props;
        if (streamsLength <= 2) {
            return {width: 300, height: 300};
        } else if (streamsLength > 3 && streamsLength < 6) {
            return {width: 300, height: 225};
        } else {
            return {width: 300, height: 200};
        }
    }
    private renderStyle = (): any => {
        const {streamsLength, streamIndex} = this.props;
        const index = streamIndex - 1;
        if (streamsLength === 2) {
            return {width: 100, height: 100};
        } else if (streamsLength === 3) {
            return {width: 150, height: 100, left: (index * 150)};
        } else if (streamsLength === 4) {
            return {width: 100, height: 100, left: (index * 100)};
        } else if (streamsLength === 5) {
            return {width: 75, height: 75, left: (index * 75)};
        } else {
            if (streamIndex >= 4) {
                return {width: 75, height: 75, left: ((index - 4) * 75), bottom: 75};
            } else {
                return {width: 75, height: 75, left: (index * 75)};
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

    private handleClickVideo = (userId: number): void => {
        this.props.setMemberToStageById(userId);
    }

    private renderStageAvatar = (): React.ReactNode => {
        const {userAvatarUrl, userId, stream} = this.props;
        const size = this.renderStageStyle();
        if (userAvatarUrl) {
            return <div className="rtc-media-avatar-image">
                <img src={userAvatarUrl}/>
            </div>;
        } else {
            return <div className="rtc-media-avatar-image">
                <Identicon
                    className="rtc-media-stage-image-avatar"
                    size={size.width}
                    string={`${stream.getId()}`}/>
            </div>;
        }
    }

    private renderAvatar = (): React.ReactNode => {
        const {userAvatarUrl, stream} = this.props;
        const size = this.renderStyle();
        if (userAvatarUrl) {
            return <div className="rtc-media-avatar-image">
                <img src={userAvatarUrl}/>
            </div>;
        } else {
            return <div className="rtc-media-avatar-image">
                <Identicon
                    className="rtc-media-stage-image-avatar"
                    size={size.width}
                    string={`${stream.getId()}`}/>
            </div>;
        }
    }
    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        if (stream.state.isInStage) {
            return (
                <div className="rtc-media-stage-out-box" style={this.renderStageStyle()}>
                    <div className="rtc-media-stage-mid-box">
                        <div className="rtc-media-stage-icon">
                            {stream.state.isAudioOpen ? <img src={microphone_open}/> : <img src={microphone_close}/>}
                        </div>
                        {!stream.state.isVideoOpen && this.renderStageAvatar()}
                        <div id={`netless-${streamId}`} className="rtc-media-stage-box">
                        </div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="rtc-media-cell-out-box" style={this.renderStyle()}>
                    <div className="rtc-media-cell-mid-box">
                        <div className="rtc-media-cell-icon">
                            {stream.state.isAudioOpen ? <img src={microphone_open}/> : <img src={microphone_close}/>}
                        </div>
                        {!stream.state.isVideoOpen && this.renderAvatar()}
                        <div id={`netless-${streamId}`} onClick={() => this.handleClickVideo(streamId)} className="rtc-media-cell-box">
                        </div>
                    </div>
                </div>
            );
        }
    }
}

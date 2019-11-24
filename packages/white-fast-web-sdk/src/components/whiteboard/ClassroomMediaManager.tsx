import * as React from "react";
import {IdentityType, NetlessStream} from "./ClassroomMedia";
import ClassroomMediaStageCell from "./ClassroomMediaStageCell";
import ClassroomMediaCell from "./ClassroomMediaCell";
import "./ClassroomMediaManager.less";

export type ClassroomMediaManagerProps = {
    streams: NetlessStream[];
    userId: number;
    identity?: IdentityType;
    rtcClient: any;
};

export type ClassroomMediaManagerStates = {
};

export default class ClassroomMediaManager extends React.Component<ClassroomMediaManagerProps, ClassroomMediaManagerStates> {


    public constructor(props: ClassroomMediaManagerProps) {
        super(props);
    }

    private renderStage = (): React.ReactNode => {
        const stageStream = this.getStageStream();
        if (stageStream) {
            return <ClassroomMediaStageCell
                userId={this.props.userId}
                rtcClient={this.props.rtcClient}
                stream={stageStream}/>;
        } else {
            return null;
        }
    }
    private renderAudience = (): React.ReactNode => {
        const {streams} = this.props;
        const stageStream = this.getStageStream();
        const audienceStreams = streams.filter(stream => {
            return stream.getId() !== stageStream.getId();
        });
        if (audienceStreams && audienceStreams.length > 0) {
            return audienceStreams.map(audienceStream => {
                return <ClassroomMediaCell key={`${audienceStream.getId()}`} userId={this.props.userId} rtcClient={this.props.rtcClient} stream={audienceStream}/>;
            });
        } else {
            return null;
        }
    }
    private getStageStream = (): NetlessStream => {
        const {streams, userId} = this.props;
        const stageStream = streams.find(stream => stream.state.isInStage);
        if (stageStream) {
            return stageStream;
        } else {
            const hostStream = streams.find(stream => stream.state.identity === IdentityType.host);
            if (hostStream) {
                return hostStream;
            } else {
                const selfStream = streams.find(stream => stream.getId() === userId);
                if (selfStream) {
                    return selfStream;
                }
            }
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="rtc-media-box">
                {this.renderStage()}
                {this. renderAudience()}
            </div>
        );
    }
}

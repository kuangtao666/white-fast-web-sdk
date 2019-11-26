import * as React from "react";
import {IdentityType, NetlessStream} from "./ClassroomMedia";
import ClassroomMediaStageCell from "./ClassroomMediaStageCell";
import ClassroomMediaCell from "./ClassroomMediaCell";
import "./ClassroomMediaManager.less";
import {ClassModeType} from "../../pages/RoomManager";

export type ClassroomMediaManagerProps = {
    streams: NetlessStream[];
    userId: number;
    classMode: ClassModeType;
    identity?: IdentityType;
    rtcClient: any;
    setMemberToStageById: (userId: number) => void;
    setLocalStreamState: (state: boolean) => void;
    isLocalStreamPublish: boolean;
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
                setLocalStreamState={this.props.setLocalStreamState}
                userId={this.props.userId} classMode={this.props.classMode}
                streamsLength={this.props.streams.length} isLocalStreamPublish={this.props.isLocalStreamPublish}
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
            return audienceStreams.map((audienceStream: NetlessStream, index: number) => {
                return <ClassroomMediaCell setLocalStreamState={this.props.setLocalStreamState}
                    key={`${audienceStream.getId()}`} streamIndex={index} classMode={this.props.classMode}
                    streamsLength={this.props.streams.length} isLocalStreamPublish={this.props.isLocalStreamPublish}
                    userId={this.props.userId}
                    setMemberToStageById={this.props.setMemberToStageById}
                    rtcClient={this.props.rtcClient}
                    stream={audienceStream}/>;
            });
        } else {
            return null;
        }
    }
    private getStageStream = (): NetlessStream => {
        const {streams, userId} = this.props;
        const stageStream = streams.find(stream => stream.state.isInStage);
        // 如何制定了舞台的流就有限选用指定
        if (stageStream) {
            return stageStream;
        } else {
            const streamsLength = streams.length;
            // 如果是两个人的时候就是吧对方的视频作为舞台。
            if (streamsLength === 2) {
                const theirStream = streams.find(stream => stream.getId() !== userId);
                if (theirStream) {
                    return theirStream;
                }
            } else {
                // 剩余的情况遵循，有老师显示老师，没老师显示自己。
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

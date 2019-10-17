import * as React from "react";
import "./WhiteboardRecord.less";
import {message} from "antd";
import {displayWatch} from "../../tools/WatchDisplayer";
import {RecordDataType} from "../../pages/NetlessRoom";

export type WhiteboardRecordState = {
    isRecord: boolean;
    secondsElapsed: number;
    startTime?: number;
    endTime?: number;
    mediaUrl?: string;
};
export type WhiteboardRecordProps = {
    channelName: string;
    isMediaRun?: boolean;
    recordDataCallback?: (data: RecordDataType) => void;
};

export default class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {

    private interval: any;
    public constructor(props: WhiteboardRecordProps) {
        super(props);
        this.state = {
            isRecord: false,
            secondsElapsed: 0,
        };
    }

    private tick = (): void => {
        this.setState(({
            secondsElapsed: this.state.secondsElapsed + 1,
        }));
    }


    private startClock = (): void => {
        this.interval = setInterval(() => this.tick(), 1000);
    }
    private stopClock = (): void => {
        clearInterval(this.interval);
    }
    public record = (): void => {
        if (this.state.isRecord) {
            message.info("结束录制");
            const time =  new Date();
            const timeStamp = time.getTime();
            this.setState({isRecord: false});
            if (this.props.recordDataCallback) {
                this.props.recordDataCallback({endTime: timeStamp, startTime: this.state.startTime});
            }
            this.stopClock();
        } else {
            message.success("开始录制");
            const time =  new Date();
            const timeStamp = time.getTime();
            if (this.props.recordDataCallback) {
                this.props.recordDataCallback({startTime: timeStamp});
            }
            this.setState({isRecord: true, startTime: timeStamp});
            this.startClock();
        }
    }
    public componentWillUnmount(): void {
        clearInterval(this.interval);
    }
    public render(): React.ReactNode {
        return (
            <div onClick={this.record} className="record-out-box">
                <div className="record-box">
                    {this.state.isRecord ?
                        <div className="record-box-inner-rect"/> :
                        <div className="record-box-inner"/>
                    }
                </div>
                <div className="record-time">
                    {displayWatch(this.state.secondsElapsed)}
                </div>
            </div>
        );
    }
}

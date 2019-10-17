import * as React from "react";
import "./WhiteboardRecord.less";
import {message} from "antd";

export type WhiteboardRecordState = {
    isRecord: boolean,
};
export type WhiteboardRecordProps = {
    setStartTime: (time: number) => void;
    setStopTime: (time: number) => void;
    setMediaSource: (source: string) => void;
    channelName: string;
    isMediaRun?: boolean;
};

class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {


    public constructor(props: WhiteboardRecordProps) {
        super(props);
        this.state = {
            isRecord: false,
        };
    }

    public record = (): void => {
        if (this.state.isRecord) {
            message.info("结束录制");
            const time =  new Date();
            this.props.setStopTime(time.getTime());
            this.setState({isRecord: false});
        } else {
            message.success("开始录制");
            const time =  new Date();
            this.props.setStartTime(time.getTime());
            this.setState({isRecord: true });
        }
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
                    00:00
                </div>
            </div>
        );
    }
}

export default WhiteboardRecord;


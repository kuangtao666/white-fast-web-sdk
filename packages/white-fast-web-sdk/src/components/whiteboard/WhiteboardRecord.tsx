import * as React from "react";
import {message} from "antd";
import "./WhiteboardRecord.less";
import {displayWatch} from "../../tools/WatchDisplayer";
import {RecordDataType, RtcType} from "../../pages/NetlessRoom";
import {RecordOperator} from "./RecordOperator";
import {ossConfigObj} from "../../appToken";
import {HostUserType} from "../../pages/RoomManager";
import {Room} from "white-react-sdk";

export type WhiteboardRecordState = {
    isRecord: boolean;
    secondsElapsed: number;
    startTime?: number;
    endTime?: number;
    mediaUrl?: string;
};
export type WhiteboardRecordProps = {
    channelName: string;
    uuid: string;
    setMediaSource: (source: string) => void;
    rtc?: RtcType;
    recordDataCallback?: (data: RecordDataType) => void;
    room: Room;
};

export default class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {
    private recrod: RecordOperator;
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
    private getMediaState = (): boolean => {
        const {room} = this.props;
        if (room.state.globalState.hostInfo) {
            const hostInfo: HostUserType = room.state.globalState.hostInfo;
            return hostInfo.isVideoEnable;
        } else {
            return false;
        }
    }
    public record = async (): Promise<void> => {
        const {rtc, uuid} = this.props;
        const isMediaRun = this.getMediaState();
        if (rtc && rtc.restId !== undefined && rtc.restSecret !== undefined) {
            if (this.recrod) {
                if (!this.recrod.resourceId) {
                    await this.recrod.acquire();
                }
            } else {
                if (isMediaRun) {
                    this.recrod = new RecordOperator(rtc.token, rtc.restId, rtc.restSecret, uuid,
                        {
                            audioProfile: 1,
                            transcodingConfig: {
                                width: 240,
                                height: 180,
                                bitrate: 120,
                                fps: 15,
                                // "mixedVideoLayout": 1,
                                // "maxResolutionUid": "1",
                            },
                        },
                        {
                            vendor: 2,
                            region: 0,
                            bucket: "netless-media",
                            accessKey: ossConfigObj.accessKeyId,
                            secretKey: ossConfigObj.accessKeySecret,
                        });
                    await this.recrod.acquire();
                }
            }
        }
        if (this.state.isRecord) {
            try {
                if (isMediaRun) {
                    const resp = await this.recrod.query();
                    if (resp.serverResponse.fileList) {
                        const res = await this.recrod.stop();
                        this.props.setMediaSource(res.serverResponse.fileList);
                        message.info("结束录制");
                        const time =  new Date();
                        const timeStamp = time.getTime();
                        this.setState({isRecord: false});
                        if (this.props.recordDataCallback) {
                            this.props.recordDataCallback({endTime: timeStamp, startTime: this.state.startTime});
                        }
                        this.stopClock();
                    } else {
                        message.info("录制时间过短");
                    }
                } else {
                    message.info("结束录制");
                    const time =  new Date();
                    const timeStamp = time.getTime();
                    this.setState({isRecord: false});
                    if (this.props.recordDataCallback) {
                        this.props.recordDataCallback({endTime: timeStamp, startTime: this.state.startTime});
                    }
                    this.stopClock();
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            if (isMediaRun) {
                try {
                    await this.recrod.start();
                    message.success("开始录制");
                    const time =  new Date();
                    const timeStamp = time.getTime();
                    if (this.props.recordDataCallback) {
                        this.props.recordDataCallback({startTime: timeStamp});
                    }
                    this.setState({isRecord: true, startTime: timeStamp});
                    this.startClock();
                } catch (err) {
                    console.log(err);
                    message.error("录制错误");
                }
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

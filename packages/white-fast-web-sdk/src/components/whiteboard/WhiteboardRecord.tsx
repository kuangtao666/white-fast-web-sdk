import * as React from "react";
import {message, Modal} from "antd";
import "./WhiteboardRecord.less";
import {displayWatch} from "../../tools/WatchDisplayer";
import {RecordDataType, RtcType} from "../../pages/NetlessRoom";
import {RecordOperator} from "./RecordOperator";
import {ossConfigObj, OSSConfigObjType} from "../../appToken";
import {HostUserType} from "../../pages/RoomManager";
import {Room} from "white-react-sdk";
import video_record from "../../assets/image/video_record.svg";
import whiteboard_record from "../../assets/image/whiteboard_record.svg";
import player_green from "../../assets/image/player_green.svg";

export type WhiteboardRecordState = {
    isRecord: boolean;
    secondsElapsed: number;
    startTime?: number;
    endTime?: number;
    mediaUrl?: string;
    isRecordModalVisible: boolean;
    isRecordWhiteboardOnly: boolean;
    isRecordOver: boolean;
};
export type WhiteboardRecordProps = {
    channelName: string;
    uuid: string;
    ossConfigObj: OSSConfigObjType;
    rtc?: RtcType;
    recordDataCallback?: (data: RecordDataType) => void;
    room: Room;
    startRtc?: (recordFunc?: () => void) => void;
    stopRecordCallback?: (recordFunc: () => void) => void;
    replayCallback?: () => void;
    setRecordingState: (state: boolean) => void;
    recordTime: (time: number) => void;
};

export default class WhiteboardRecord extends React.Component<WhiteboardRecordProps, WhiteboardRecordState> {
    private recordOperator: RecordOperator;
    private interval: any;
    public constructor(props: WhiteboardRecordProps) {
        super(props);
        this.state = {
            isRecord: false,
            secondsElapsed: 0,
            isRecordModalVisible: false,
            isRecordWhiteboardOnly: false,
            isRecordOver: false,
        };
    }

    public componentDidMount(): void {
        if (this.props.stopRecordCallback) {
            this.props.stopRecordCallback(this.stopRecord);
        }
        // const {room} = this.props;
        // const hostInfo: HostUserType = room.state.globalState.hostInfo;
        // if (hostInfo && hostInfo.secondsElapsed !== undefined) {
        //     this.setState({secondsElapsed: hostInfo.secondsElapsed, isRecord: true});
        //     this.startClock();
        // }
    }
    private tick = (): void => {
        this.setState(({
            secondsElapsed: this.state.secondsElapsed + 1,
        }));
        this.props.recordTime(this.state.secondsElapsed);
    }


    private startClock = (): void => {
        this.interval = setInterval(() => this.tick(), 1000);
    }
    private stopClock = (): void => {
        if (this.interval) {
            clearInterval(this.interval);
        }
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

    private handleRegion = (region: string): number => {
        switch (region) {
            case "CN_Hangzhou":
                return 0;
            case "oss-cn-hangzhou":
                return 0;
            case "CN_Shanghai":
                return 1;
            case "oss-cn-shanghai":
                return 1;
            case "CN_Qingdao":
                return 2;
            case "oss-cn-qingdao":
                return 2;
            case "CN_Beijin":
                return 3;
            case "oss-cn-beijing":
                return 3;
            case "CN_Zhangjiakou":
                return 4;
            case "oss-cn-zhangjiakou":
                return 4;
            case "CN_Huhehaote":
                return 5;
            case "oss-cn-huhehaote":
                return 5;
            case "CN_Shenzhen":
                return 6;
            case "oss-cn-shenzhen":
                return 6;
            case "CN_Hongkong":
                return 7;
            case "oss-cn-hongkong":
                return 7;
            case "US_West_1":
                return 8;
            case "oss-us-west-1":
                return 8;
            case "US_East_1":
                return 9;
            case "oss-us-east-1":
                return 9;
            case "AP_Southeast_1":
                return 10;
            case "oss-ap-southeast-1":
                return 10;
            case "AP_Southeast_2":
                return 11;
            case "oss-ap-southeast-2":
                return 11;
            case "AP_Southeast_3":
                return 12;
            case "oss-ap-southeast-3":
                return 12;
            case "AP_Southeast_5":
                return 13;
            case "oss-ap-southeast-5":
                return 13;
            case "AP_Northeast_1":
                return 14;
            case "oss-ap-northeast-1":
                return 14;
            case "AP_South_1":
                return 15;
            case "oss-ap-south-1":
                return 15;
            case "EU_Central_1":
                return 16;
            case "oss-eu-central-1":
                return 16;
            case "EU_West_1":
                return 17;
            case "oss-eu-west-1":
                return 17;
            case "EU_East_1":
                return 18;
            case "oss-me-east-1":
                return 18;
            default:
                return 0;
        }
    }
    public stopRecord = async (): Promise<void> => {
        const isMediaRun = this.getMediaState();
        if (this.state.isRecord) {
            try {
                if (isMediaRun) {
                    const resp = await this.recordOperator.query();
                    if (resp.serverResponse.fileList) {
                        const res = await this.recordOperator.stop();
                        message.info("结束录制");
                        this.props.setRecordingState(false);
                        this.setRecordState(false);
                        const time =  new Date();
                        const timeStamp = time.getTime();
                        this.setState({isRecord: false});
                        if (this.props.recordDataCallback) {
                            this.props.recordDataCallback({endTime: timeStamp, startTime: this.state.startTime, mediaUrl: res.serverResponse.fileList});
                            this.setState({mediaUrl: res.serverResponse.fileList});
                        }
                        this.stopClock();
                    } else {
                        message.info("录制时间过短");
                    }
                } else {
                    message.info("结束录制");
                    this.props.setRecordingState(false);
                    const time =  new Date();
                    const timeStamp = time.getTime();
                    this.setState({isRecord: false, isRecordOver: true});
                    if (this.props.recordDataCallback) {
                        this.props.recordDataCallback({endTime: timeStamp, startTime: this.state.startTime});
                    }
                    this.stopClock();
                }
            } catch (err) {
                console.log(err);
            }
        }
    }

    private startRecord = async (): Promise<void>  => {
        const {rtc, uuid} = this.props;
        const isMediaRun = this.getMediaState();
        if (rtc && rtc.recordConfig) {
            if (this.recordOperator) {
                if (!this.recordOperator.resourceId) {
                    await this.recordOperator.acquire();
                }
            } else {
                if (isMediaRun) {
                    let channel: string = uuid;
                    if (rtc.channel) {
                        channel = rtc.channel;
                    }
                    this.recordOperator = new RecordOperator(rtc.appId, rtc.recordConfig.customerId, rtc.recordConfig.customerCertificate, channel,
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
                            region: this.handleRegion(this.props.ossConfigObj.region),
                            bucket: this.props.ossConfigObj.bucket,
                            accessKey: this.props.ossConfigObj.accessKeyId,
                            secretKey: this.props.ossConfigObj.accessKeySecret,
                        }, "mix", rtc.authConfig ? rtc.authConfig.token : undefined);
                    await this.recordOperator.acquire();
                }
            }

            if (isMediaRun) {
                try {
                    await this.recordOperator.start();
                    message.success("开始录制");
                    this.setRecordState(true);
                    this.props.setRecordingState(true);
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
                this.props.setRecordingState(true);
                this.setRecordState(true);
                const time =  new Date();
                const timeStamp = time.getTime();
                if (this.props.recordDataCallback) {
                    this.props.recordDataCallback({startTime: timeStamp});
                }
                this.setState({isRecord: true, startTime: timeStamp});
                this.startClock();
            }
        } else {
            message.warning("sss");
        }
    }
    public componentWillUnmount(): void {
        this.stopClock();
    }
    private setRecordState = (state: boolean): void => {
        const {room} = this.props;
        if (state) {
            room.setGlobalState({hostInfo: {
                    ...room.state.globalState.hostInfo,
                    isRecording: state,
                }});
        } else {
            room.setGlobalState({hostInfo: {
                    ...room.state.globalState.hostInfo,
                    isRecording: state,
                    secondsElapsed: undefined,
                }});
        }
    }

    private handleCancel = (): void => {
        this.setState({isRecordModalVisible: false});
    }

    private renderRecordBtn = (): React.ReactNode => {
        const isMediaRun = this.getMediaState();
        if (this.state.mediaUrl || this.state.isRecordOver) {
          return <div onClick={() => {
              if (this.props.replayCallback) {
                  this.props.replayCallback();
              }
          }} className="record-out-box">
              <div className="record-box-play">
                  <img src={player_green}/>
              </div>
              <div className="record-time">
                  {displayWatch(this.state.secondsElapsed)}
              </div>
          </div>;
        }
        if (isMediaRun || this.state.isRecordWhiteboardOnly) {
            if (this.state.isRecord) {
                return (
                    <div onClick={() => this.stopRecord()} className="record-out-box">
                        <div className="record-box">
                            <div className="record-box-inner-rect"/>
                        </div>
                        <div className="record-time">
                            {displayWatch(this.state.secondsElapsed)}
                        </div>
                    </div>
                );
            } else {
                return (
                    <div onClick={() => this.startRecord()} className="record-out-box">
                        <div className="record-box">
                            <div className="record-box-inner"/>
                        </div>
                        <div className="record-time">
                            {displayWatch(this.state.secondsElapsed)}
                        </div>
                    </div>
                );
            }
        } else {
            return (
                <div onClick={() => this.setState({isRecordModalVisible: true})} className="record-out-box">
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
    public render(): React.ReactNode {
        return (
            <div>
                {this.renderRecordBtn()}
                <Modal
                    centered
                    width={384}
                    visible={this.state.isRecordModalVisible}
                    footer={null}
                    onCancel={this.handleCancel}
                >
                    <div className="record-select-box">
                        <div onClick={() => {
                            if (this.props.startRtc) {
                                this.props.startRtc(this.startRecord);
                                this.setState({isRecordModalVisible: false});
                            }
                        }} className="record-select-cell">
                            <div className="record-select-cell-icon">
                                <img style={{width: 96}} src={video_record}/>
                            </div>
                            <div className="record-select-cell-text">
                                开启视频并录制
                            </div>
                        </div>
                        <div onClick={async() => {
                            await this.startRecord();
                            this.setState({isRecordModalVisible: false, isRecordWhiteboardOnly: true});
                        }} className="record-select-cell">
                            <div className="record-select-cell-icon">
                                <img style={{width: 85}} src={whiteboard_record}/>
                            </div>
                            <div className="record-select-cell-text">
                                确认只录制白板
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}

import * as React from "react";
import "./LoadingPage.less";
import {RoomPhase} from "white-react-sdk";
import {LanguageEnum} from "../pages/NetlessRoom";
export type LoadingPageProps = {
    loadingSvgUrl?: string;
    language?: LanguageEnum;
    phase: RoomPhase;
};

export default class LoadingPage extends React.Component<LoadingPageProps, {}> {
    public constructor(props: LoadingPageProps) {
        super(props);
    }

    private renderScript = (): React.ReactNode => {
        const {phase, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
        switch (phase) {
            case RoomPhase.Reconnecting: {
                return (
                    <div>
                        {isEnglish ? "Reconnecting" : "正在重连房间"}
                    </div>
                );
            }
            case RoomPhase.Disconnected: {
                return (
                    <div>
                        {isEnglish ? "Disconnected" : "已经断开房间"}
                    </div>
                );
            }
            case RoomPhase.Connected: {
                return (
                    <div>
                        {isEnglish ? "Connected" : "已经连接房间"}
                    </div>
                );
            }
            case RoomPhase.Connecting: {
                return (
                    <div>
                        {isEnglish ? "Connecting" : "正在连接房间"}
                    </div>
                );
            }
            case RoomPhase.Disconnecting: {
                return (
                    <div>
                        {isEnglish ? "Disconnecting" : "正在断开房间"}
                    </div>
                );
            }
            default: {
                return (
                    <div>
                        {isEnglish ? "Connected" : "已经连接房间"}
                    </div>
                );
            }
        }
    }
    public render(): React.ReactNode {
        const {loadingSvgUrl} = this.props;
        const loading = "https://white-sdk.oss-cn-beijing.aliyuncs.com/fast-sdk/icons/loading.svg";
        return (
            <div className="white-board-loading">
                <div className="white-board-loading-mid">
                    <img src={loadingSvgUrl ? loadingSvgUrl : loading}/>
                    {this.renderScript()}
                </div>
            </div>
        );
    }
}

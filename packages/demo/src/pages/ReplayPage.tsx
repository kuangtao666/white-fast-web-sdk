import * as React from "react";
import {RouteComponentProps, withRouter} from "react-router";
import "./WhiteboardPage.less";
import {netlessWhiteboardApi} from "../apiMiddleware";
import WhiteFastSDK from "white-fast-web-sdk";
export type ReplayPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
}>;

export type WhiteboardPageState = {
};

class ReplayPage extends React.Component<ReplayPageProps, WhiteboardPageState> {
    public constructor(props: ReplayPageProps) {
        super(props);
    }

    private getRoomToken = async (uuid: string): Promise<string | null> => {
        const res = await netlessWhiteboardApi.room.joinRoomApi(uuid);
        if (res.code === 200) {
            return res.msg.roomToken;
        } else {
            return null;
        }
    }


    private startReplay = async (): Promise<void> => {
        const {userId, uuid} = this.props.match.params;
        const roomToken = await this.getRoomToken(uuid);
        if (roomToken) {
            WhiteFastSDK.Player("netless-replay", {
                uuid: uuid,
                roomToken: roomToken,
                userId: userId,
                userName: "伍双",
                userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png",
                logoUrl: "https://white-sdk.oss-cn-beijing.aliyuncs.com/video/netless_black.svg",
                boardBackgroundColor: "#F2F2F2",
                playerCallback: (player: any) => {
                    console.log(player);
                },
                // beginTimestamp:
                // duration:
                mediaUrl: "https://netless-media.oss-cn-hangzhou.aliyuncs.com/ad5ce237124d7210e24ca5838d79f509_b9fc17d5d017466ab446c3094c87b1b3.m3u8",
                // isChatOpen:
            });
        }
    }


    public async componentDidMount(): Promise<void> {
        await this.startReplay();
    }

    public render(): React.ReactNode {
        return (
            <div id="netless-replay" className="whiteboard-box"/>
        );
    }
}

export default withRouter(ReplayPage);

import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps, RoomConsumer, Room, PlayerConsumer, Player} from "white-web-sdk";
import "./PluginStyle.less";
import Video from "./Video";
export enum VideoStateEnum {
    play = "play",
    pause = "pause",
}

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteVideoPluginProps = PluginComponentProps & {
    play: boolean;
    seek: number;
    volume: number,
    mute: boolean,
    currentTime: number;
    loadingPercent: number;
    isUpload: boolean;
};

export type WhiteVideoPluginStates = {
    isClickEnable: boolean;
    play: boolean;
    mute: false;
    volume: number;
    seek: number;
    currentTime: number;
    loadingPercent: number;
    isUpload: boolean;
};

export type SelfUserInf = {
    identity: IdentityType,
};

class Index extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    public static readonly protocol: string = "video";
    private room: Room | undefined = undefined;
    private play: Player | undefined = undefined;
    public static readonly backgroundProps: Partial<WhiteVideoPluginProps> = {
        play: false,
        seek: 0,
        mute: false,
        volume: 1,
        currentTime: 0,
        loadingPercent: 0,
        isUpload: false};
    private selfUserInf: SelfUserInf | null = null;

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.state = {
            isClickEnable: true,
            play: false,
            seek: 0,
            currentTime: 0,
            loadingPercent: 0,
            isUpload: false,
            mute: false,
            volume: 1,
        };
    }

    public componentDidMount(): void {
        this.setState({seek: this.props.currentTime});
        this.setState({play: this.props.play});
        this.handleSeekData(this.props.currentTime);
        this.handlePlayState(false);
        if (this.selfUserInf && this.selfUserInf.identity !== IdentityType.host) {
            this.setState({isClickEnable: false});
        }
    }

    private isHost = (): boolean => {
        return !!(this.selfUserInf && this.selfUserInf.identity === IdentityType.host);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: WhiteVideoPluginProps): void {
        if (!this.isHost()) {
            if (this.props.play !== nextProps.play) {
                this.setState({play: nextProps.play});
            }
            if (this.props.seek !== nextProps.seek) {
                this.setState({seek: nextProps.seek});
            }
            if (this.props.loadingPercent !== nextProps.loadingPercent) {
                this.setState({loadingPercent: nextProps.loadingPercent});
            }
            if (this.props.isUpload !== nextProps.isUpload) {
                this.setState({isUpload: nextProps.isUpload});
            }
            if (this.props.mute !== nextProps.mute) {
                this.setState({mute: nextProps.mute});
            }
            if (this.props.volume !== nextProps.volume) {
                this.setState({volume: nextProps.volume});
            }
        }
    }

    private handleSeekData = (seek: number): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {seek: seek});
            }
        }
    }

    private handleMuteState = (mute: boolean): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {mute: mute});
            }
        }
    }

    private handleVolumeChange = (volume: number): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {volume: volume});
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {play: play});
            }
        }
    }

    private setMyIdentityRoom = (room: Room): void => {
        const observerId = room.observerId;
        const roomMember = room.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                identity: roomMember.payload.identity,
            };
        }
    }

    private setMyIdentityPlay = (play: Player): void => {
        const observerId = play.observerId;
        const roomMember = play.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                identity: roomMember.payload.identity,
            };
        }
    }

    private onTimeUpdate = (time: number): void => {
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                this.props.operator.setProps(this.props.uuid, {currentTime: time});
            }
        }
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        return (
            <CNode kind={CNodeKind.HTML}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            this.room = room;
                            this.setMyIdentityRoom(room);
                            return (
                                <div className="plugin-box" style={{width: width, height: height}}>
                                    <div className="plugin-box-nav">
                                        <span>
                                            Video Player
                                        </span>
                                    </div>
                                    <div className="plugin-box-body">
                                        <Video
                                            videoURL={this.props.videoUrl}
                                            volume={this.state.volume}
                                            onVolumeChange={this.handleVolumeChange}
                                            mute={this.state.mute}
                                            isClickEnable={this.state.isClickEnable}
                                            play={this.state.play}
                                            identity={this.selfUserInf ? this.selfUserInf.identity : undefined}
                                            onTimeUpdate={this.onTimeUpdate}
                                            currentTime={this.props.currentTime}
                                            seek={this.state.seek}
                                            onMuted={this.handleMuteState}
                                            onPlayed={this.handlePlayState}
                                            onSeeked={this.handleSeekData}/>
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(play: Player | undefined) => {
                        if (play) {
                            this.play = play;
                            this.setMyIdentityPlay(play);
                            return (
                                <div className="plugin-box" style={{width: width, height: height}}>
                                    <div className="plugin-box-nav">
                                        <span>
                                              Video Player
                                        </span>
                                    </div>
                                    <div className="plugin-box-body">
                                        <Video volume={this.props.volume}
                                            mute={this.props.mute}
                                            onVolumeChange={this.handleVolumeChange}
                                            videoURL={this.props.videoUrl}
                                            isClickEnable={false}
                                            onMuted={this.handleMuteState}
                                            play={this.props.play}
                                            currentTime={this.props.currentTime}
                                            seek={this.props.seek}
                                            onPlayed={this.handlePlayState}
                                            onSeeked={this.handleSeekData}/>
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

export default Index;

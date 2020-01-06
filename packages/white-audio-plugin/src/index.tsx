import * as React from "react";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin} from "white-web-sdk";
import "./PluginStyle.less";
import WhiteAudio from "./WhiteAudio";

export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteAudioPluginProps = {
    play: boolean;
    seek: number;
    currentTime: number;
    loadingPercent: number;
    isUpload: boolean;
};

export type WhiteAudioPluginStates = {
    isClickEnable: boolean;
    play: boolean;
    seek: number;
    mute: boolean;
    volume: number;
    currentTime: number;
    loadingPercent: number;
    isUpload: boolean;
};

export type SelfUserInf = {
    identity: IdentityType,
};

class WhiteAudioPlugin extends React.Component<PluginProps<{}, WhiteAudioPluginProps>, WhiteAudioPluginStates> {

    private room: Room | undefined = undefined;
    private play: Player | undefined = undefined;
    private selfUserInf: SelfUserInf | null = null;
    public constructor(props: WhiteAudioPluginProps) {
        super(props);
        this.state = {
            isClickEnable: true,
            play: false,
            seek: 0,
            mute: false,
            volume: 1,
            currentTime: 0,
            loadingPercent: 0,
            isUpload: false,
        };
    }

    public componentDidMount(): void {
        this.setState({seek: this.props.plugin.attributes.currentTime});
        this.setState({play: this.props.plugin.attributes.play});
        this.handleSeekData(this.props.plugin.attributes.currentTime);
        this.handlePlayState(false);
        if (this.selfUserInf && this.selfUserInf.identity !== IdentityType.host) {
            this.setState({isClickEnable: false});
        }
    }

    private isHost = (): boolean => {
        return !!(this.selfUserInf && this.selfUserInf.identity === IdentityType.host);
    }
    public UNSAFE_componentWillReceiveProps(nextProps: PluginProps<{}, WhiteAudioPluginProps>): void {
        if (!this.isHost()) {
            if (this.props.plugin.attributes.play !== nextProps.plugin.attributes.play) {
                this.setState({play: nextProps.plugin.attributes.play});
            }
            if (this.props.plugin.attributes.seek !== nextProps.plugin.attributes.seek) {
                this.setState({seek: nextProps.plugin.attributes.seek});
            }

            if (this.props.plugin.attributes.loadingPercent !== nextProps.plugin.attributes.loadingPercent) {
                this.setState({loadingPercent: nextProps.plugin.attributes.loadingPercent});
            }
            if (this.props.plugin.attributes.isUpload !== nextProps.plugin.attributes.isUpload) {
                this.setState({isUpload: nextProps.plugin.attributes.isUpload});
            }
            if (this.props.plugin.attributes.mute !== nextProps.plugin.attributes.mute) {
                this.setState({mute: nextProps.plugin.attributes.mute});
            }
            if (this.props.plugin.attributes.volume !== nextProps.plugin.attributes.volume) {
                this.setState({volume: nextProps.plugin.attributes.volume});
            }
        }
    }

    private handleSeekData = (seek: number): void => {
        const {plugin} = this.props;
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({seek: seek});
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        const {plugin} = this.props;
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({play: play});
            }
        }
    }
    private handleMuteState = (mute: boolean): void => {
        const {plugin} = this.props;
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({mute: mute});
            }
        }
    }

    private handleVolumeChange = (volume: number): void => {
        const {plugin} = this.props;
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({volume: volume});
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
        const {plugin} = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({currentTime: time});
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            this.room = room;
                            this.setMyIdentityRoom(room);
                            return (
                                <div className="plugin-audio-box" style={{width: this.props.size.width, height: this.props.size.height}}>
                                    <div className="plugin-audio-box-nav">
                                        <span>
                                            Audio Player
                                        </span>
                                    </div>
                                    <div style={{backgroundColor: "#F1F3F4"}} className="plugin-audio-box-body">
                                        <WhiteAudio
                                            volume={this.state.volume}
                                            mute={this.state.mute}
                                            onVolumeChange={this.handleVolumeChange}
                                            onMuted={this.handleMuteState}
                                            audioURL={this.props.plugin.attributes.pluginAudioUrl}
                                            isClickEnable={this.state.isClickEnable}
                                            play={this.state.play}
                                            identity={this.selfUserInf ? this.selfUserInf.identity : undefined}
                                            onTimeUpdate={this.onTimeUpdate}
                                            currentTime={this.props.plugin.attributes.currentTime}
                                            seek={this.state.seek}
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
                                <div className="plugin-audio-box" style={{width: this.props.size.width, height: this.props.size.height}}>
                                    <div className="plugin-audio-box-nav">
                                        <span>
                                              Audio Player
                                        </span>
                                    </div>
                                    <div style={{backgroundColor: "#F1F3F4"}} className="plugin-audio-box-body">
                                        <WhiteAudio
                                            onVolumeChange={this.handleVolumeChange}
                                            onMuted={this.handleMuteState}
                                            audioURL={this.props.plugin.attributes.pluginAudioUrl}
                                            volume={this.props.plugin.attributes.volume}
                                            mute={this.props.plugin.attributes.mute}
                                            isClickEnable={false}
                                            play={this.props.plugin.attributes.play}
                                            currentTime={this.props.plugin.attributes.currentTime}
                                            seek={this.props.plugin.attributes.seek}
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

export const audioPlugin: Plugin<{}, WhiteAudioPluginProps> = Object.freeze({
    kind: "audio",
    render: WhiteAudioPlugin,
    defaultAttributes: {
        play: false,
        seek: 0,
        currentTime: 0,
        loadingPercent: 0,
        isUpload: false,
    },
});

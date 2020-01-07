import * as React from "react";
import {PluginProps} from "white-web-sdk";
import { reaction, IReactionDisposer } from "mobx";
import "./index.less";
import * as mute_icon from "./image/mute_icon.svg";
import * as audio_plugin from "./image/audio_plugin.svg";
import * as delete_icon from "./image/delete_icon.svg";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteAudioPluginProps = PluginProps<{
    play: boolean;
    seek: number;
    volume: number,
    mute: boolean,
    currentTime: number;
}>;


export type WhiteAudioPluginStates = {
    play: boolean;
    mute: boolean;
    selfMute: boolean;
    volume: number;
    seek: number;
    currentTime: number;
};

export type SelfUserInf = {
    identity: IdentityType,
};

export default class WhiteAudioPluginRoom extends React.Component<WhiteAudioPluginProps, WhiteAudioPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLAudioElement>;
    private selfUserInf: SelfUserInf | null = null;
    public constructor(props: WhiteAudioPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.state = {
            play: false,
            seek: 0,
            selfMute: false,
            currentTime: 0,
            mute: false,
            volume: 1,
        };
    }

    public componentDidMount(): void {
        const { plugin } = this.props;
        this.handleSeekData(plugin.attributes.currentTime);
        this.handlePlayState(false);
        if (this.player.current) {
            this.player.current.currentTime = plugin.attributes.currentTime;
            this.player.current.addEventListener("play", (event: any) => {
                this.handlePlayState(true);
            });
            this.player.current.addEventListener("pause", (event: any) => {
                this.handlePlayState(false);
                if (this.player.current) {
                    this.player.current.currentTime = plugin.attributes.currentTime;
                }
            });
            this.player.current.addEventListener("seeked", (event: any) => {
                if (this.player.current) {
                    const currentTime = Math.round(plugin.attributes.currentTime);
                    if (plugin.attributes.seek !== currentTime) {
                        this.handleSeekData(currentTime);
                    }
                }
            });
            this.player.current.addEventListener("volumechange", (event: any) => {
                this.handleVolumeChange(event.target.volume);
                this.handleMuteState(event.target.muted);
            });
        }

        this.setMyIdentityRoom();
    }

    private isHost = (): boolean => {
        return !!(this.selfUserInf && this.selfUserInf.identity === IdentityType.host);
    }

    private setMyIdentityRoom = (): void => {
        const {plugin} = this.props;
        if (plugin.context) {
            this.selfUserInf = {
                identity: this.props.plugin.context.identity,
            };
        }
    }

    private handleSeekData = (seek: number): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ seek: seek });
            }
        }
    }

    private handleMuteState = (mute: boolean): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ mute: mute });
            }
        }
    }

    private handleVolumeChange = (volume: number): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ volume: volume });
            }
        }
    }

    private handlePlayState = (play: boolean): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ play: play });
            }
        }
    }

    private onTimeUpdate = (currentTime: number): void => {
        const { plugin } = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({ currentTime: currentTime });
            }
        }
    }

    private startPlayReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.play;
        }, async play => {
            if (!this.isHost()) {
                if (play) {
                    if (this.player.current) {
                        try {
                            await this.player.current.play();
                        } catch (err) {
                            if (`${err.name}` === "NotAllowedError") {
                                this.setState({ selfMute: true });
                                await this.player.current.play();
                            }
                        }
                    }
                } else {
                    if (this.player.current) {
                        this.player.current.pause();
                    }
                }
            }
        });
    }

    private startSeekReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.seek;
        }, seek => {
            if (!this.isHost()) {
                if (this.player.current) {
                    this.player.current.currentTime = seek;
                }
            }
        });
    }

    private startVolumeReaction(): IReactionDisposer {
        const {plugin} = this.props;
        return reaction(() => {
            return plugin.attributes.volume;
        }, volume => {
            if (!this.isHost()) {
                if (this.player.current) {
                    this.player.current.volume = volume;
                }
            }
        });
    }
    private startMuteTimeReaction(): IReactionDisposer {
        const { plugin } = this.props;
        return reaction(() => {
            return plugin.attributes.mute;
        }, mute => {
            if (!this.isHost()) {
                this.setState({ mute: mute });
            }
        });
    }

    public componentWillUnmount(): void {
        this.reactionPlayDisposer();
        this.reactionSeekDisposer();
        this.reactionMuteDisposer();
        this.reactionVolumeDisposer();
    }

    private timeUpdate = (): void => {
        if (this.player.current) {
            const currentTime = Math.round(this.player.current.currentTime);
            this.onTimeUpdate(currentTime);
        }
    }

    private detectAudioClickEnable = (): any => {
        const { plugin } = this.props;
        if (plugin.context) {
            if (plugin.context.identity !== IdentityType.host) {
                return "none";
            } else {
                return "auto";
            }
        } else {
            return "none";
        }
    }
    private renderMuteBox = (): React.ReactNode => {
        if (this.props.identity !== IdentityType.host) {
            if (this.state.selfMute) {
                return (
                    <div className="media-mute-box">
                        <div onClick={() => {
                            this.setState({ selfMute: false });
                        }} style={{ pointerEvents: "auto" }} className="media-mute-box-inner">
                            <img src={mute_icon} />
                            <span>unmute</span>
                        </div>
                    </div>
                );
            } else {
                return null;
            }
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const { size, plugin } = this.props;
        return (
            <div className="plugin-audio-box" style={{ width: size.width, height: size.height }}>
                <div className="plugin-audio-box-nav">
                    <div>
                        <img style={{ width: 20, marginLeft: 8 }} src={audio_plugin} />
                        <span>
                            Audio Player
                        </span>
                    </div>
                    <div
                        style={{ pointerEvents: "auto" }}
                        className="plugin-audio-box-delete"
                        onClick={() => {
                            plugin.remove();
                        }}
                    >
                        <img src={delete_icon} />
                    </div>
                </div>
                <div className="plugin-audio-box-body">
                    {this.renderMuteBox()}
                    <div className="white-plugin-audio-box">
                        <audio webkit-playsinline="true"
                            className="white-plugin-aduio"
                            src={plugin.attributes.pluginAudioUrl}
                            ref={this.player}
                            muted={this.state.mute ? this.state.mute : this.state.selfMute}
                            style={{
                                width: "100%",
                                height: "100%",
                                pointerEvents: this.detectAudioClickEnable(),
                                outline: "none",
                            }}
                            controls
                            controlsList={"nodownload nofullscreen"}
                            onTimeUpdate={this.timeUpdate}
                            preload="auto"
                        />
                    </div>
                </div>
            </div>
        );
    }
}
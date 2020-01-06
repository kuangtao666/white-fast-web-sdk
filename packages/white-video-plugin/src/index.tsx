import * as React from "react";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin} from "white-web-sdk";
import {reaction, IReactionDisposer} from "mobx";
import "./index.less";
import {PluginContext} from "./Plugins";
import * as mute_icon from "./image/mute_icon.svg";
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type WhiteVideoPluginProps = PluginProps<{
    play: boolean;
    seek: number;
    volume: number,
    mute: boolean,
    currentTime: number;
}>;


export type WhiteVideoPluginStates = {
    isClickEnable: boolean;
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

class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, WhiteVideoPluginStates> {

    private readonly reactionPlayDisposer: IReactionDisposer;
    private readonly reactionSeekDisposer: IReactionDisposer;
    private readonly reactionVolumeDisposer: IReactionDisposer;
    private readonly reactionMuteDisposer: IReactionDisposer;
    private readonly player: React.RefObject<HTMLVideoElement>;
    private room: Room | undefined = undefined;
    private play: Player | undefined = undefined;
    private selfUserInf: SelfUserInf | null = null;
    public constructor(props: WhiteVideoPluginProps) {
        super(props);
        this.player = React.createRef();
        this.reactionPlayDisposer = this.startPlayReaction();
        this.reactionSeekDisposer = this.startSeekReaction();
        this.reactionVolumeDisposer = this.startVolumeReaction();
        this.reactionMuteDisposer = this.startMuteTimeReaction();
        this.state = {
            isClickEnable: true,
            play: false,
            seek: 0,
            selfMute: false,
            currentTime: 0,
            mute: false,
            volume: 1,
        };
    }

    public componentDidMount(): void {
        const {plugin} = this.props;
        this.handleSeekData(plugin.attributes.currentTime);
        this.handlePlayState(false);
        if (this.selfUserInf && this.selfUserInf.identity !== IdentityType.host) {
            this.setState({isClickEnable: false});
        }

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
    }

    private isHost = (): boolean => {
        return !!(this.selfUserInf && this.selfUserInf.identity === IdentityType.host);
    }

    private handleSeekData = (seek: number): void => {
        const {plugin} = this.props;
        if (this.selfUserInf && this.room) {
            if (this.selfUserInf.identity === IdentityType.host) {
                plugin.putAttributes({seek: seek});
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
                console.log(volume);
                plugin.putAttributes({volume: volume});
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

    private setMyIdentityRoom = (): void => {
        const {plugin} = this.props;
        if (plugin.context && plugin.context.identity) {
            this.selfUserInf = {
                identity: this.props.plugin.context.identity,
            };
        }
    }

    private setMyIdentityPlay = (): void => {
        const {plugin} = this.props;
        if (plugin.context && plugin.context.identity) {
            this.selfUserInf = {
                identity: plugin.context.identity,
            };
        }
    }

    private onTimeUpdate = (currentTime: number): void => {
        const {plugin} = this.props;
        if (this.selfUserInf) {
            if (this.selfUserInf.identity === IdentityType.host) {
                console.log("----> before", currentTime, plugin.attributes);
                (window as any).__debug = true;
                console.log("set", (window as any).__debug);
                console.log("----> af", plugin.attributes);
                plugin.putAttributes({currentTime: currentTime});
                (window as any).__debug = false;
                console.log("set", (window as any).__debug);
            }
        }
    }

    private startPlayReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.play;
        }, async play => {
            console.log("-----> play", play);
            console.log("-----> attributes", this.props.plugin.attributes);
            if (!this.isHost()) {
                if (play) {
                    if (this.player.current) {
                        try {
                            await this.player.current.play();
                        } catch (err) {
                            if (`${err.name}` === "NotAllowedError") {
                                this.setState({selfMute: true});
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
        }, {equals: (play1, play2) => {
            return play1 === play2;
            }});
    }

    private startSeekReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.seek;
        }, seek => {
            if (!this.isHost()) {
                if (this.player.current) {
                    // this.player.current.currentTime = seek;
                }
            }
        });
    }

    private startVolumeReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.volume;
        }, volume => {
            if (!this.isHost()) {
                if (this.player.current) {
                    // this.player.current.volume = volume;
                }
            }
        });
    }
    private startMuteTimeReaction(): IReactionDisposer {
        return reaction(() => {
            return this.props.plugin.attributes.mute;
        }, mute => {
            if (!this.isHost()) {
                this.setState({mute: mute});
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

    private detectVideoClickEnable = (): any => {
        if (this.props.plugin.context.identity !== IdentityType.host) {
            return "none";
        }
        if (this.state.isClickEnable) {
            return "auto";
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
                            this.setState({selfMute: false});
                        }} style={{pointerEvents: "auto"}} className="media-mute-box-inner">
                            <img src={mute_icon}/>
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
        const {size, plugin} = this.props;
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            this.room = room;
                            this.setMyIdentityRoom();
                            return (
                                <div className="plugin-video-box" style={{width: size.width, height: size.height}}>
                                    <div className="plugin-video-box-nav">
                                        <span>
                                            Video Player
                                        </span>
                                        <button
                                            style={{pointerEvents: "auto"}}
                                            onClick={() => {
                                            this.props.plugin.remove();
                                        }}>delete</button>
                                    </div>
                                    <div className="plugin-video-box-body">
                                        {this.renderMuteBox()}
                                        <div className="white-plugin-video-box">
                                            <video webkit-playsinline="true"
                                                   className="white-plugin-video"
                                                   src={this.props.plugin.attributes.pluginVideoUrl}
                                                   ref={this.player}
                                                   muted={this.state.mute ? this.state.mute : this.state.selfMute}
                                                   style={{
                                                       width: "100%",
                                                       height: "100%",
                                                       pointerEvents: this.detectVideoClickEnable(),
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
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(play: Player | undefined) => {
                        if (play) {
                            this.play = play;
                            this.setMyIdentityPlay();
                            return (
                                <div className="plugin-video-box" style={{width: size.width, height: size.height}}>
                                    <div className="plugin-video-box-nav">
                                        <span>
                                              Video Player
                                        </span>
                                    </div>
                                    <div className="plugin-video-box-body">
                                        <div className="white-plugin-video-box">
                                            <video webkit-playsinline="true"
                                                   className="white-plugin-video"
                                                   src={plugin.attributes.pluginVideoUrl}
                                                   ref={this.player}
                                                   muted={plugin.attributes.mute}
                                                   style={{
                                                       width: "100%",
                                                       height: "100%",
                                                       pointerEvents: "none",
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
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

export const videoPlugin: Plugin<PluginContext, WhiteVideoPluginProps> = Object.freeze({
    kind: "video",
    render: WhiteVideoPlugin,
    defaultAttributes: {
        play: false,
        seek: 0,
        mute: false,
        volume: 1,
        currentTime: 0,
    },
    willInterruptEvent(props: any, event: any): boolean {
        return true;
    },
});

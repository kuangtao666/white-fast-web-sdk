import * as React from "react";
import "./index.less";
import * as mute_icon from "./image/mute_icon.svg";

export type VideoProps = {
    readonly videoURL: string;
    readonly play: boolean;
    readonly seek: number;
    readonly mute: boolean;
    readonly volume: number;
    readonly width?: number;
    readonly height?: number;
    readonly onPlayed: (play: boolean) => void;
    readonly onSeeked: (seek: number) => void;
    readonly onMuted: (mute: boolean) => void;
    readonly onVolumeChange: (volume: number) => void;
    isClickEnable: boolean;
    currentTime: number;
    identity?: IdentityType;
    onTimeUpdate?: (time: number) => void;
};
export enum IdentityType {
    host = "host",
    guest = "guest",
    listener = "listener",
}

export type VideoStates = {
    isMediaPlayAllow: boolean;
    muted: boolean;
    volume: number;
    selfMute: boolean;
};

class Video extends React.Component<VideoProps, VideoStates> {
    private readonly player: React.RefObject<HTMLVideoElement>;
    public constructor(props: VideoProps) {
        super(props);
        this.player = React.createRef();
        this.state = {
            isMediaPlayAllow: true,
            muted: props.mute,
            volume: 1,
            selfMute: false,
        };
    }
    public async componentWillReceiveProps(nextProps: Readonly<VideoProps>): Promise<void> {
        if (this.props.play !== nextProps.play) {
            if (nextProps.play) {
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
        if (this.props.seek !== nextProps.seek) {
            if (this.player.current) {
                this.player.current.currentTime = nextProps.seek;
            }
        }
        if (this.props.mute !== nextProps.mute) {
            this.setState({muted: nextProps.mute});
        }
        if (this.props.volume !== nextProps.volume) {
            if (this.player.current) {
                this.player.current.volume = nextProps.volume;
            }
        }
    }
    public componentDidMount(): void {
        if (this.player.current) {
            this.player.current.currentTime = this.props.currentTime;
            this.player.current.addEventListener("play", (event: any) => {
                this.props.onPlayed(true);
            });
            this.player.current.addEventListener("pause", (event: any) => {
                this.props.onPlayed(false);
                if (this.player.current) {
                    this.player.current.currentTime = this.props.currentTime;
                }
            });
            this.player.current.addEventListener("seeked", (event: any) => {
                if (this.player.current) {
                    const currentTime = Math.round(this.player.current.currentTime);
                    if (this.props.seek !== currentTime) {
                        this.props.onSeeked(currentTime);
                    }
                }
            });
            this.player.current.addEventListener("volumechange", (event: any) => {
                this.props.onVolumeChange(event.target.volume);
                this.props.onMuted(event.target.muted);
            });
        }

    }

    private timeUpdate = (): void => {
        if (this.player.current && this.props.onTimeUpdate) {
            const currentTime = Math.round(this.player.current.currentTime);
            this.props.onTimeUpdate(currentTime);
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

    private detectVideoClickEnable = (): any => {
        if (this.props.identity !== IdentityType.host) {
            return "none";
        }
        if (this.props.isClickEnable) {
            return "auto";
        } else {
            return "none";
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="white-plugin-video-box" style={{
                width: this.props.width ? this.props.width : "100%",
                height: this.props.height ? this.props.height : "100%",
            }}>
                {this.renderMuteBox()}
                <video playsInline
                       webkit-playsinline="true"
                       className="white-plugin-video"
                       src={this.props.videoURL}
                       ref={this.player}
                       muted={this.state.muted ? this.state.muted : this.state.selfMute}
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
        );
    }
}

export default Video;

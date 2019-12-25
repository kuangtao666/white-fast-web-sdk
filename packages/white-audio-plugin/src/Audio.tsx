import * as React from "react";
import "./index.less";
import * as mute_icon from "./image/mute_icon.svg";

export type VideoProps = {
    readonly audioURL: string;
    readonly play: boolean;
    readonly seek: number;
    readonly width?: number;
    readonly height?: number;
    readonly onPlayed: (play: boolean) => void;
    readonly onSeeked: (seek: number) => void;
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
};

class Audio extends React.Component<VideoProps, VideoStates> {
    private readonly player: React.RefObject<HTMLVideoElement>;
    public constructor(props: VideoProps) {
        super(props);
        this.player = React.createRef();
        this.state = {
            isMediaPlayAllow: true,
            muted: false,
        };
    }
    public async componentWillReceiveProps(nextProps: Readonly<VideoProps>): Promise<void> {
        if (this.props.play !== nextProps.play) {
            if (nextProps.play) {
                if (this.player.current) {
                    try {
                        await this.player.current.play();
                    } catch (err) {
                        console.log(err);
                        this.setState({muted: true});
                        await this.player.current.play();
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
    }

    public componentDidMount(): void {
        if (this.player.current) {
            this.player.current.currentTime = this.props.currentTime;
            this.player.current.addEventListener("play", (event: any) => {
                if (!this.props.play) {
                    this.props.onPlayed(true);
                }
            });
            this.player.current.addEventListener("pause", (event: any) => {
                if (this.props.play) {
                    this.props.onPlayed(false);
                }
            });
            this.player.current.addEventListener("seeked", (event: any) => {
                if (this.player.current) {
                    if (this.props.seek !== this.player.current.currentTime) {
                        const currentTime = Math.round(this.player.current.currentTime);
                        this.props.onSeeked(currentTime);
                    }
                }
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
            if (this.state.muted) {
                return (
                    <div className="media-mute-box">
                        <div onClick={() => {
                            this.setState({muted: false});
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
            <div className="white-plugin-audio-box" style={{
                width: this.props.width ? this.props.width : "100%",
                height: this.props.height ? this.props.height : "100%",
            }}>
                {this.renderMuteBox()}
                <audio className="white-plugin-audio"
                       src={this.props.audioURL}
                       ref={this.player}
                       muted={this.state.muted}
                       style={{
                           width: "100%",
                           height: "100%",
                           pointerEvents: this.detectVideoClickEnable(),
                           outline: "none",
                       }}
                       controls
                       controlsList={"nodownload"}
                       onTimeUpdate={this.timeUpdate}
                       preload="auto"
                />
            </div>
        );
    }
}

export default Audio;

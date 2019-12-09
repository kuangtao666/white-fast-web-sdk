import * as React from "react";
import {Button, Icon, notification} from "antd";
import {async} from "q";


export type VideoProps = {
    readonly videoURL: string;
    readonly play: boolean;
    readonly controls: boolean;
    readonly seek: number;
    readonly width?: number;
    readonly height?: number;
    readonly onPlayed: (play: boolean) => void;
    readonly onSeeked: (seek: number) => void;
    isClickEnable: boolean;
    currentTime: number;
    onTimeUpdate?: (time: number) => void;
};

export type VideoStates = {
    isMediaPlayAllow: boolean;
};

export default class Video extends React.Component<VideoProps, VideoStates> {
    private readonly player: React.RefObject<HTMLVideoElement>;
    public constructor(props: VideoProps) {
        super(props);
        this.player = React.createRef();
        this.state = {
            isMediaPlayAllow: true,
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
                        this.playErrorNotification();
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

    private playErrorNotification = (): void => {
        const key = `video-notification`;
        const btn = (
            <Button type="primary" onClick={async () => {
                await this.restart();
                notification.close(key);
            }}>
                确认同意
            </Button>
        );
        if (this.state.isMediaPlayAllow) {
            notification.open({
                message: `重要说明`,
                duration: 0,
                description:
                    "您的尚未授权播放外部内容，点击确认才能播放。",
                icon: <Icon type="exclamation-circle" style={{color: "#FF756E"}} />,
                btn,
                key,
                top: 64,
            });
            this.setState({isMediaPlayAllow: false});
        }
    }
    public restart = async (): Promise<void> => {
        if (this.player.current) {
            this.player.current.currentTime = this.props.currentTime;
            try {
                await this.player.current.play();
                this.setState({isMediaPlayAllow: true});
            } catch (err) {
                console.log(err);
                this.playErrorNotification();
            }
        }
    }
    public componentDidMount(): void {
        if (this.player.current) {
            this.player.current.currentTime = this.props.currentTime;
        }
        if (this.player.current) {
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
                        this.props.onSeeked(this.player.current.currentTime);
                    }
                }
            });
        }

    }

    private timeUpdate = (): void => {
        if (this.player.current && this.props.onTimeUpdate) {
            this.props.onTimeUpdate(this.player.current.currentTime);
        }
    }

    public render(): React.ReactNode {
        return (
            <video src={this.props.videoURL}
                   ref={this.player}
                   style={{
                       width: this.props.width ? this.props.width : "100%",
                       height: this.props.height ? this.props.height : "100%",
                       pointerEvents: this.props.isClickEnable ? "auto" : "none",
                       outline: "none",
                   }}
                   onTimeUpdate={this.timeUpdate}
                   preload="auto"
                   controls={this.props.controls}
            />
        );
    }
}

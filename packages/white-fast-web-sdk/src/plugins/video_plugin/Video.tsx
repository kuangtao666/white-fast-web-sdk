import * as React from "react";


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
};

export default class Video extends React.Component<VideoProps> {
    private readonly player: React.RefObject<HTMLVideoElement>;
    public constructor(props: VideoProps) {
        super(props);
        this.player = React.createRef();
    }

    public componentWillReceiveProps(nextProps: Readonly<VideoProps>): void {
        if (this.props.play !== nextProps.play) {
            if (nextProps.play) {
                if (this.player.current) {
                    this.player.current.play().catch(error => {
                        console.log(error);
                    });
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
                   preload="auto"
                   controls={this.props.controls}
            />
        );
    }
}

import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps } from "white-web-sdk";
import Video from "./Video";

export type VideoPluginProps = PluginComponentProps & {
    readonly videoURL: string;
    readonly play: boolean;
    readonly seek: number;
};

export default class VideoPlugin extends React.Component<VideoPluginProps> {

    public static readonly protocol: string = "media";
    public static readonly backgroundProps: Partial<VideoPluginProps> = {};

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }


    public render(): React.ReactNode {
        return (
            <CNode kind={CNodeKind.HTML}>
                <Video
                    onPlayed={(play: boolean) => {
                        this.props.setProps(this.props.uuid, {
                            play
                        });
                    }}
                    onSeeked={(seek: number) => {
                        this.props.setProps(this.props.uuid, {
                            seek
                        });
                    }}
                    videoURL={this.props.videoURL}
                    controls={this.props.controls}
                    play={this.props.play}
                    width={this.props.width}
                    height={this.props.height} />
            </CNode>
        );
    }
}

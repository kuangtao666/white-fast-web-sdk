import * as React from "react";
import {CNode, RoomConsumer, Room, PlayerConsumer, Player, PluginProps, Plugin, PluginInstance} from "white-web-sdk";
import "./index.less";
import {PluginContext} from "./Plugins";
import WhiteVideoPluginRoom from "./room";
import WhiteVideoPluginReplay from "./replay";

export type WhiteVideoPluginProps = PluginProps<{
    play: boolean;
    seek: number;
    volume: number;
    mute: boolean;
    currentTime: number;
}>;

class WhiteVideoPlugin extends React.Component<WhiteVideoPluginProps, {}> {

    public constructor(props: WhiteVideoPluginProps) {
        super(props);
    }

    public render(): React.ReactNode {
        return (
            <CNode context={this.props.cnode}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            return <WhiteVideoPluginRoom
                                {...this.props}
                            />
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(play: Player | undefined) => {
                        if (play) {
                            return <WhiteVideoPluginReplay
                                {...this.props}
                            />;
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
    hitTest: (plugin: PluginInstance<PluginContext, WhiteVideoPluginProps>): boolean => {
        const memberState = plugin.component.context.getMemberState();
        if (memberState && memberState.currentApplianceName === "eraser") {
            return false;
        }
        return true;
    },
});

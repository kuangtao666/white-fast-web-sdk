import * as React from "react";
import {IdentityType, NetlessStream} from "./ClassroomMedia";
import "./ClassroomMediaCell.less";
import {CSSProperties} from "react";
import {Room} from "white-react-sdk";
import {ClassModeType, HostUserType} from "../../pages/RoomManager";

export type ClassroomMediaCellProps = {
    stream: NetlessStream;
    streamsLength: number;
    room: Room;
    identity?: IdentityType;
};

export default class ClassroomMediaHostCell extends React.Component<ClassroomMediaCellProps, {}> {


    public constructor(props: ClassroomMediaCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
    }

    private handleLocalVideoBox = (): CSSProperties => {
        const {streamsLength, identity, room} = this.props;
        const hostInfo: HostUserType = room.state.globalState.hostInfo;
        if (streamsLength === 0) {
            return {width: "100%", height: 300};
        } else {
            if (identity !== IdentityType.host && hostInfo.classMode !== ClassModeType.discuss) {
                return {width: "100%", height: 300};
            } else {
                if (streamsLength === 3) {
                    return {width: "100%", height: 225};
                } else {
                    return {width: "100%", height: 150};
                }
            }
        }
    }

    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        return (
            <div id={`netless-${streamId}`} style={this.handleLocalVideoBox()} className="media-box">
            </div>
        );
    }
}

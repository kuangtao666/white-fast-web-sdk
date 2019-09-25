import * as React from "react";
import {ViewMode, Scene, RoomState, Room} from "white-react-sdk";
import "./WhiteboardPreviewCell.less";

export type WhiteboardPreviewCellProps = {
    room: Room;
    roomState: RoomState;
    setImageRef: (ref: any) => void;
};

export default class WhiteboardPreviewCell extends React.Component<WhiteboardPreviewCellProps, {}> {

    private ref: any;
    public constructor(props: WhiteboardPreviewCellProps) {
        super(props);
    }

    public async componentDidMount(): Promise<void> {
        // const {roomState, room, setImageRef} = this.props;
        // const snapshot = new WhiteSnapshot(room);
        // const path = roomState.sceneState.scenePath;
        // await snapshot.divPreviewCanvas(path, this.ref);
        // setImageRef(this.ref);
    }



    public render(): React.ReactNode {
        return (
            <div onLoadedData={() => alert(1)} ref={ref => this.ref = ref} className="whiteboard-preview-cell">
            </div>
        );

    }
}

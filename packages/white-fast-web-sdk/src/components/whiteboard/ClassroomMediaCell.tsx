import * as React from "react";
import "./ClassroomMediaManager.less";

export type ClassroomManagerCellProps = {
    stream: any;
};

export default class ClassroomMediaCell extends React.Component<ClassroomManagerCellProps, {}> {


    public constructor(props: ClassroomManagerCellProps) {
        super(props);
    }

    public componentDidMount(): void {
        const {stream} = this.props;
        const streamId =  stream.getId();
        stream.play(`netless-${streamId}`);
    }

    public render(): React.ReactNode {
        const {stream} = this.props;
        const streamId =  stream.getId();
        return (
            <div id={`netless-${streamId}`} className="media-box-text">
            </div>
        );
    }
}

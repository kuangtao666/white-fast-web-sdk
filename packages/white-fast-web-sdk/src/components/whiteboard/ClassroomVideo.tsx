import * as React from "react";

export type ClassroomVideoProps = {
    streams: any[];
    userId: number;
};

export default class ClassroomVideo extends React.Component<ClassroomVideoProps, {}> {


    public constructor(props: ClassroomVideoProps) {
        super(props);
    }

    private renderStage = (): React.ReactNode => {
        return null;
    }

    private renderAudience = (): React.ReactNode => {
        return null;
    }
    public render(): React.ReactNode {
        return (
            <div>
                {this.renderStage()}
                {this. renderAudience()}
            </div>
        );
    }
}

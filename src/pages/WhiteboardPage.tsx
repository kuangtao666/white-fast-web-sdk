import * as React from "react";
import {RouteComponentProps} from "react-router";
import RealTime from "../components/RealTime";
import {NetlessRoomType} from "./WhiteboardCreatorPage";

export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    netlessRoomType: NetlessRoomType;
}>;

export type WhiteboardPageStates = {
    colorConfig: string[];
};

export default class WhiteboardPage extends React.Component<WhiteboardPageProps, WhiteboardPageStates> {
    public constructor(props: WhiteboardPageProps) {
        super(props);
        this.state = {
            colorConfig: [
                "#EC3455",
                "#005BF6",
                "#F5AD46",
                "#68AB5D",
                "#9E51B6",
                "#1E2023",
            ],
        };
    }

    private onColorArrayChange = (colorArray: string[]): void => {
        // this.setState({colorConfig: colorArray});
        console.log(colorArray);
    }

    public render(): React.ReactNode {
        const {uuid, userId} = this.props.match.params;
        return (
            <div>
                <RealTime colorConfig={this.state.colorConfig} onColorArrayChange={this.onColorArrayChange} uuid={uuid} userId={userId}/>
            </div>
        );
    }
}

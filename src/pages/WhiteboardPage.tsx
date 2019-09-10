import * as React from "react";
import RealTime from "../components/RealTime";
import { NetlessRoomType } from "./WhiteboardCreatorPage";
// 6a8c0862779c46f1956ea278da1b953d
// WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWZjMmE0MzdlN2IyMWM3ZWI2MWM5MzRjYTdhNmMwZDJkNzVlZDBlNzI6YWRtaW5JZD0xNTgmcm9vbUlkPTZhOGMwODYyNzc5YzQ2ZjE5NTZlYTI3OGRhMWI5NTNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE1OTk1OTc3NTMmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NjgwNDA4MDEmbm9uY2U9MTU2ODA0MDgwMTAwNDAw
export type WhiteboardPageProps = {
    uuid: string;
    userId: string;
    netlessRoomType: NetlessRoomType;
};

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
        const {uuid, userId} = this.props;
        return (
            <div>
                <RealTime colorConfig={this.state.colorConfig} onColorArrayChange={this.onColorArrayChange} uuid={uuid} userId={userId}/>
            </div>
        );
    }
}

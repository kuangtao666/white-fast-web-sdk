import * as React from "react";
import {RouteComponentProps} from "react-router";
import RealTime from "../components/RealTime";
import {NetlessRoomType} from "./WhiteboardCreatorPage";

export type WhiteboardPageProps = RouteComponentProps<{
    uuid: string;
    userId: string;
    netlessRoomType: NetlessRoomType;
}>;

export default class WhiteboardPage extends React.Component<WhiteboardPageProps, {}> {
    public constructor(props: WhiteboardPageProps) {
        super(props);
    }

    public render(): React.ReactNode {
        const {uuid, userId} = this.props.match.params;
        return (
            <div>
                <RealTime uuid={uuid} userId={userId}/>
            </div>
        );
    }
}

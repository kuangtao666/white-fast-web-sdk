import * as React from "react";
import "./WebPpt.less";
import {WebCourseController} from "../tools/WebCourseController";
import {
    Room,
} from "white-web-sdk";
import {IdentityType} from "./NetlessRoomTypes";
export type WebPptProps = {
    room: Room;
    ppt?: any;
    identity?: IdentityType;
};

export type WebPptStates = {

};

class WebPpt extends React.Component<WebPptProps, WebPptStates> {
    private iframeController: WebCourseController;
    public constructor(props: WebPptProps) {
        super(props);
    }
    public componentDidMount(): void {
        this.iframeController = new WebCourseController("calculation-under", this.props.room, this.setGlobalState);
    }

    public componentWillReceiveProps(nextProps: WebPptProps): void {
        if (this.props.ppt !== undefined && nextProps.ppt !== undefined) {
            if (this.props.ppt !== nextProps.ppt && this.props.identity !== IdentityType.host) {
                this.iframeController.setIframeState(nextProps.ppt);
            }
        }
    }
    private setGlobalState = (netlessState: any) => {
        const {room, identity} = this.props;
        // if (identity === IdentityType.host) {
        //     room.setGlobalState({ppt: netlessState});
        // }
    }

    private isHavePpt = (): boolean => {
        const {room} = this.props;
        return !!(room.state.globalState && room.state.globalState.h5PptUrl);
    }
    public render(): React.ReactNode {
        const {room} = this.props;
        return (
            <div className="whiteboard-h5-ppt">
                {this.isHavePpt() &&
                <iframe  id="calculation-under" frameBorder={0} src={room.state.globalState.h5PptUrl}>
                </iframe>}
            </div>
        );
    }
}

export default WebPpt;

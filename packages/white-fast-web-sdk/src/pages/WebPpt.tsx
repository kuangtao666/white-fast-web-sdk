import * as React from "react";
import "./WebPpt.less";
import {WebCourseController} from "../tools/WebCourseController";
import {
    Room,
} from "white-react-sdk";
import {IdentityType} from "../components/whiteboard/ClassroomMedia";
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
        if (identity === IdentityType.host) {
            room.setGlobalState({ppt: netlessState});
        }
    }
    public render(): React.ReactNode {
        return (
            <div className="whiteboard-h5-ppt">
                {/*<iframe  id="calculation-under" frameBorder={0} src={"http://doccdn.talk-cloud.net/upload0/20190507_232816_slizsenl/index.html"}>*/}
                {/*</iframe>*/}
            </div>
        );
    }
}

export default WebPpt;

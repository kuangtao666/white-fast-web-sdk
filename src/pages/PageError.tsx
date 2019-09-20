import * as React from "react";
import "./PageError.less";
import * as room_not_find from "../assets/image/room_not_find.svg";
import {Button} from "antd";

class PageError extends React.Component<{}, {}> {
    public constructor(props: {}) {
        super(props);
    }
    public render(): React.ReactNode {
        return (
            <div className="page404-box">
                <div className="page404-image-box">
                    <img className="page404-image-inner" src={room_not_find}/>
                    <div className="page404-inner">
                        {/* <FormattedMessage
                            id="error-page.title-room-not-exist"
                        /> */}
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        className="page404-btn"
                        onClick={() => console.warn("TODO")}
                    >
                        {/* <FormattedMessage
                            id="error-page.btn"
                        /> */}
                    </Button>
                </div>
            </div>
        );
    }
}

export default PageError;

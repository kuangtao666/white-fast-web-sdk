import * as React from "react";
import * as ReactDOM from "react-dom";
import NetlessPlayer from "../pages/NetlessPlayer";
import NetlessRoom from "../pages/NetlessRoom";

export const RoomFacade = (element: string, config: any): void => {
    ReactDOM.render(
        <NetlessRoom {...config}/>,
        document.getElementById(element),
    );
};

export const PlayerFacade = (element: string, config: any): void => {
    ReactDOM.render(
        <NetlessPlayer {...config}/>,
        document.getElementById(element),
    );
};


import * as React from "react";
import * as ReactDOM from "react-dom";
import NetlessPlayer from "../pages/NetlessPlayer";
import NetlessRoom from "../pages/NetlessRoom";
import {NetlessType} from "./index";


export const RoomFacade = (element: string, config: any): NetlessType | undefined => {
    let releaseFuc: (() => void) | undefined = undefined;
    ReactDOM.render(
        <NetlessRoom getRemoveFunction={(func: () => void) => {
            releaseFuc = func;
        }} {...config}/>,
        document.getElementById(element),
    );
    if (releaseFuc) {
        return {
            release: releaseFuc,
        };
    } else {
        return undefined;
    }
};

export const PlayerFacade = (element: string, config: any): NetlessType | undefined => {
    let releaseFuc: (() => void) | undefined = undefined;
    ReactDOM.render(
        <NetlessPlayer getRemoveFunction={(func: () => void) => {
            releaseFuc = func;
        }} {...config}/>,
        document.getElementById(element),
    );
    if (releaseFuc) {
        return {
            release: releaseFuc,
        };
    } else {
        return undefined;
    }
};


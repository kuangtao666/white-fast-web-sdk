import * as React from "react";
import * as ReactDOM from "react-dom";
import PlayerPage from "../pages/PlayerPage";
import RealTime from "../components/RealTime";

const RoomFacade = function (element: string, config: any): void {
    ReactDOM.render(
        <RealTime {...config}/>,
        document.getElementById(element),
    );
};

const PlayerFacade = function (element: string, config: any): void {
    ReactDOM.render(
        <PlayerPage {...config}/>,
        document.getElementById(element),
    );
};

(window as any).WhiteFastSDK = {
    Room: RoomFacade,
    Player: PlayerFacade,
};


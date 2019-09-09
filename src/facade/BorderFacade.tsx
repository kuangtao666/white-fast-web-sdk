import * as React from "react";
import * as ReactDOM from "react-dom";
import WhiteboardPage from "../pages/WhiteboardPage";

const BorderFacade = function (element: string, config: any): void {
    ReactDOM.render(
        <WhiteboardPage {...config}/>,
        document.getElementById(element),
    );
};

(window as any).BorderFacade = BorderFacade;


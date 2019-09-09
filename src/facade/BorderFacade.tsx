import * as React from "react";
import * as ReactDOM from "react-dom";
import { AppRoutes } from "../pages/AppRoutes";

const BorderFacade = function (element: string, config: any): void {
    ReactDOM.render(
        <AppRoutes />,
        document.getElementById(element),
    );
};

(window as any).BorderFacade = BorderFacade;


import * as React from "react";
import * as ReactDOM from "react-dom";
import {AppRoutes} from "./pages/AppRoutes";
import WhiteFastSDK from "white-fast-web-sdk";
console.log(WhiteFastSDK);
ReactDOM.render(
    <AppRoutes/>,
    document.getElementById("app-root"),
);

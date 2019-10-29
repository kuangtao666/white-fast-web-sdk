import  * as React from "react";
import {AppRouter, HistoryType} from "@netless/i18n-react-router";
import {language} from "../locale";
import {message} from "antd";
import WhiteboardCreatorPage from "./WhiteboardCreatorPage";
import WhiteboardPage from "./WhiteboardPage";
import IndexPage from "./IndexPage";
import ReplayPage from "./ReplayPage";
export class AppRoutes extends React.Component<{}, {}> {

    public constructor(props: {}) {
        super(props);
    }

    public componentDidCatch(error: any, inf: any): void {
        message.error(`网页加载发生错误：${error}`);
    }

    public render(): React.ReactNode {
        return (
            <AppRouter historyType={HistoryType.BrowserRouter} language={language} routes={[
                {path: "/", component: IndexPage},
                {path: "/whiteboard/:identityType/:uuid?/", component: WhiteboardCreatorPage},
                {path: "/whiteboard/:identityType/:uuid/:userId/", component: WhiteboardPage},
                {path: "/replay/:uuid/:userId/:startTime?/:endTime?/:mediaUrl?/", component: ReplayPage},
            ]}/>
        );
    }
}


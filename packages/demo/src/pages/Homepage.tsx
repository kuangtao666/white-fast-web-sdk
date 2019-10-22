import * as React from "react";
import {Input, Button, Tabs} from "antd";
import "./Homepage.less";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import netless_black from "../assets/image/netless_black.svg";
import {Link} from "@netless/i18n-react-router";
import {FormComponentProps} from "antd/lib/form";
import {IdentityType} from "./WhiteboardCreatorPage";

const { TabPane } = Tabs;

export type HomepageProps = RouteComponentProps<{}> & FormComponentProps;
export type HomepageStates = {
    name: string;
    url: string;
};

class Homepage extends React.Component<HomepageProps, HomepageStates> {
    public constructor(props: HomepageProps) {
        super(props);
        this.state = {
            name: "",
            url: "",
        };
    }
    private handleWhiteboardClickBtn = (): void => {
        this.props.history.push(`/whiteboard/${IdentityType.host}`);
    }
    private handleClickBtnUrl = (): void => {
        const isUrl = this.state.url.substring(0, 4) === "http";
        if (this.state.url) {
            if (isUrl) {
                window.open(this.state.url, "_self");
            } else {
                if (this.state.url.length === 32) {
                    const isNotLive = this.state.url.search("listener/") === -1;
                    if (isNotLive) {
                        const isNotHost = this.state.url.search("guest/") === -1;
                        if (isNotHost) {
                            this.props.history.push(`/whiteboard/${IdentityType.host}/${this.state.url}/`);
                        } else {
                            this.props.history.push(`/whiteboard/${IdentityType.guest}/${this.state.url}/`);
                        }
                    } else {
                        this.props.history.push(`/whiteboard/${IdentityType.listener}/${this.state.url}/`);
                    }
                }
            }
        }
    }

    public render(): React.ReactNode {
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={netless_black}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <Tabs className="page-input-left-mid-box-tab" defaultActiveKey="1">
                            <TabPane tab="创建房间" key="1">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input"
                                           value={this.state.name}
                                           onChange={e => this.setState({name: e.target.value})}
                                           size={"large"}
                                           placeholder={"输入用户名"}/>
                                    <Button
                                        type="primary"
                                        size="large"
                                        onClick={this.handleWhiteboardClickBtn}
                                        className="name-button">
                                        创建白板房间
                                    </Button>
                                </div>
                            </TabPane>
                            <TabPane tab="加入房间" key="2">
                                <div className="page-input-left-inner-box">
                                    <Input className="page-input"
                                           value={this.state.url}
                                           onChange={e => this.setState({url: e.target.value})}
                                           size={"large"} placeholder={"输入房间地址或者 UUID"}/>
                                    <Button
                                        size="large"
                                        type="primary"
                                        disabled={!this.state.url}
                                        onClick={this.handleClickBtnUrl}
                                        className="name-button">
                                        加入房间
                                    </Button>
                                </div>
                            </TabPane>
                        </Tabs>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>);
    }
}

export default withRouter(Homepage);

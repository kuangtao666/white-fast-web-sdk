import * as React from "react";
import * as uuidv4 from "uuid/v4";
import {Input, Button, Form, Select} from "antd";
import "./PageInput.less";
import {withRouter} from "react-router-dom";
import {RouteComponentProps} from "react-router";
import netless_black from "../assets/image/netless_black.svg";
import {Link} from "@netless/i18n-react-router";
import {netlessWhiteboardApi} from "../apiMiddleware";
import {FormComponentProps} from "antd/lib/form";
const FormItem = Form.Item;
const Option = Select.Option;


export type PageNameInputProps = RouteComponentProps<{}> & FormComponentProps;
export type PageNameInputStates = {
    name: string;
};

class PageInput extends React.Component<PageNameInputProps, PageNameInputStates> {
    public constructor(props: PageNameInputProps) {
        super(props);
        this.state = {
            name: "",
        };
    }
    private handleClickBtn = (): void => {
        if (this.state.name) {
            netlessWhiteboardApi.user.updateUserInf(this.state.name, uuidv4(), "1");
        } else {
            netlessWhiteboardApi.user.updateUserInf("Netless user", uuidv4(), "1");
        }
        this.props.history.push("/whiteboard/");
    }
    private hasErrors = (fieldsError: any): boolean => {
        return Object.keys(fieldsError).some(field => fieldsError[field]);
    }

    private handleSubmitStorage = async (e: any): Promise<void> => {
        e.preventDefault();
        const host = location.href;
        this.props.form.validateFields(async(err, values) => {
            if (!err) {
                window.open(`${host}whiteboard/${values.room_token}/${values.room_uuid}/${values.version}/${values.room_type}/`);
            }
        });
    }
    public render(): React.ReactNode {
        const {getFieldDecorator, getFieldsError} = this.props.form;
        return (
            <div className="page-input-box">
                <Link to="/">
                    <img src={netless_black}/>
                </Link>
                <div className="page-input-left-box">
                    <div className="page-input-left-mid-box">
                        <Form key={"sdd"} onSubmit={this.handleSubmitStorage} className="login-form">
                            <FormItem>
                                {getFieldDecorator("room_token", {
                                    rules: [{required: true, message: "请输入 roomToken"}],
                                })(
                                    <Input
                                        size="large"
                                        placeholder="roomToken"/>,
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator("room_uuid", {
                                    rules: [{required: true, message: "请输入 uuid"}],
                                })(
                                    <Input
                                        size="large"
                                        placeholder="uuid"/>,
                                )}
                            </FormItem>
                            <FormItem>
                                {getFieldDecorator("version", {
                                    rules: [{required: true, message: "请选择 Web SDK 版本号"}],
                                })(
                                    <Select size="large" placeholder="请选择 Web SDK 版本号" className="select-box-inner">
                                        <Option value="2.0.0-beta.15">2.0.0-beta.15</Option>
                                        <Option value="2.0.0-beta.11">2.0.0-beta.11</Option>
                                        <Option value="2.0.0-beta.7">2.0.0-beta.7</Option>
                                    </Select>,
                                )}
                            </FormItem>
                            {/*<FormItem>*/}
                                {/*{getFieldDecorator("room_type", {*/}
                                    {/*rules: [{required: true, message: "请选择进入房间的状态"}],*/}
                                {/*})(*/}
                                    {/*<Select size="large" placeholder="请选择进入房间的状态" className="select-box-inner">*/}
                                        {/*<Option value="read_only">只读：对房间影响小</Option>*/}
                                        {/*<Option value="interactive">互动：可以测试各种操作</Option>*/}
                                    {/*</Select>,*/}
                                {/*)}*/}
                            {/*</FormItem>*/}
                            <FormItem>
                                <Button
                                    disabled={this.hasErrors(getFieldsError())}
                                    size="large"
                                    type="primary"
                                    htmlType="submit"
                                    className="name-button">
                                    进入房间
                                </Button>
                            </FormItem>
                        </Form>
                    </div>
                </div>
                <div className="page-input-right-box"/>
            </div>);
    }
}

export default Form.create()(withRouter(PageInput));

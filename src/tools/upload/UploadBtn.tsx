import * as React from "react";
import {Icon, Popover, Upload} from "antd";
import * as OSS from "ali-oss";
import {ToolBoxUpload} from "./ToolBoxUpload";
import {PPTProgressListener, UploadManager} from "./UploadManager";
import "./UploadBtn.less";
import {PptKind, Room, WhiteWebSdk} from "white-react-sdk";
import * as image_icon from "../../assets/image/image_icon.svg";
import * as image_transform from "../../assets/image/image_transform.svg";
import * as web_transform from "../../assets/image/web_transform.svg";
import * as upload from "../../assets/image/upload.svg";
import {ToolBarPositionEnum, UploadDocumentEnum, UploadToolBoxType} from "../../pages/NetlessRoom";
import {TooltipPlacement} from "antd/lib/tooltip";

export type ToolBoxUploadBoxState = {
    toolBoxColor: string,
};

export const FileUploadStatic: string = "application/pdf, " +
    "application/vnd.openxmlformats-officedocument.presentationml.presentation, " +
    "application/vnd.ms-powerpoint, " +
    "application/msword, " +
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type UploadBtnProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    room: Room,
    roomToken: string | null,
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
    toolBarPosition?: ToolBarPositionEnum;
    uploadToolBox?: UploadToolBoxType[],
};

export type UploadBtnMobileProps = {
    oss: {
        accessKeyId: string,
        accessKeySecret: string,
        region: string,
        bucket: string,
        folder: string,
        prefix: string,
    },
    room: Room,
    whiteboardRef?: HTMLDivElement,
    onProgress?: PPTProgressListener,
    uploadToolBox?: UploadToolBoxType[],
};

export default class UploadBtn extends React.Component<UploadBtnProps, ToolBoxUploadBoxState> {
    private readonly client: any;
    public constructor(props: UploadBtnProps) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
        this.client = new OSS({
            accessKeyId: this.props.oss.accessKeyId,
            accessKeySecret: this.props.oss.accessKeySecret,
            region: this.props.oss.region,
            bucket: this.props.oss.bucket,
        });
    }

    private uploadStatic = (event: any) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Static,
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    private uploadDynamic = (event: any) => {
        const uploadManager = new UploadManager(this.client, this.props.room);
        const whiteWebSdk = new WhiteWebSdk();
        const pptConverter = whiteWebSdk.pptConverter(this.props.roomToken!);
        uploadManager.convertFile(
            event.file,
            pptConverter,
            PptKind.Dynamic,
            this.props.onProgress).catch(error => alert("upload file error" + error));
    }

    private uploadImage = (event: any) => {
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        }
    }

    private renderUploadButton = (): React.ReactNode => {
        const {uploadToolBox} = this.props;
        let Nodes: React.ReactNode[];
        if (uploadToolBox) {
            Nodes = uploadToolBox.map((data: UploadToolBoxType, index: number) => {
                if (data.type === UploadDocumentEnum.image) {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                accept={"image/*"}
                                showUploadList={false}
                                customRequest={this.uploadImage}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={68} src={data.icon ? data.icon : image_icon}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : "上传图片"}</div>
                                            <div className="popover-section-text">{data.script ? data.script : "支持常见格式，可以改变图片大小和位置。"}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                } else if (data.type === UploadDocumentEnum.dynamic_conversion) {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                disabled={!this.props.roomToken}
                                accept={FileUploadStatic}
                                showUploadList={false}
                                customRequest={this.uploadStatic}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={72} src={data.icon ? data.icon : image_transform}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : "资料转图片"}</div>
                                            <div className="popover-section-text">{data.script ? data.script : "支持 ppt、pptx、word 以及 pdf。"}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                } else {
                    if (data.enable) {
                        return (
                            <Upload
                                key={`${index}`}
                                disabled={!this.props.roomToken}
                                accept={FileUploadStatic}
                                showUploadList={false}
                                customRequest={this.uploadStatic}>
                                <div className="popover-section">
                                    <div className="popover-section-inner">
                                        <div className="popover-section-image">
                                            <img width={72} src={data.icon ? data.icon : image_transform}/>
                                        </div>
                                        <div className="popover-section-script">
                                            <div className="popover-section-title">{data.title ? data.title : "资料转图片"}</div>
                                            <div className="popover-section-text">{data.script ? data.script : "支持 ppt、pptx、word 以及 pdf。"}</div>
                                        </div>
                                    </div>
                                </div>
                            </Upload>
                        );
                    } else {
                        return null;
                    }
                }
            });
            return Nodes;
        } else {
            return null;
        }
    }

    private renderPopoverContent = (): React.ReactNode => {
        const {uploadToolBox} = this.props;
        if (uploadToolBox) {
            const length = uploadToolBox.filter(data => data.enable).length;
            return (
                <div style={{height: 118 * length}} className="popover-box">
                    {this.renderUploadButton()}
                </div>
            );
        } else {
            return (
                <div className="popover-box">
                    {this.renderUploadButton()}
                </div>
            );
        }
    }

    private handlePlacement = (): TooltipPlacement => {
        const {toolBarPosition} = this.props;
        switch (toolBarPosition) {
            case ToolBarPositionEnum.left: {
                return "left";
            }
            case ToolBarPositionEnum.bottom: {
                return "bottom";
            }
            case ToolBarPositionEnum.right: {
                return "right";
            }
            default: {
                return "bottom";
            }
        }
    }

    public render(): React.ReactNode {
        const {toolBarPosition} = this.props;
        return (
            <Popover placement={this.handlePlacement()} content={this.renderPopoverContent()}>
                <div
                    onMouseEnter={() => this.setState({toolBoxColor: "#141414"})}
                    onMouseLeave={() => this.setState({toolBoxColor: "#A2A7AD"})}
                    className={(toolBarPosition === ToolBarPositionEnum.left || toolBarPosition === ToolBarPositionEnum.right) ?
                        "tool-box-cell-box-left" : "tool-box-cell-box"}>
                    <div className="tool-box-cell">
                        <ToolBoxUpload color={this.state.toolBoxColor}/>
                    </div>
                </div>
            </Popover>
        );
    }
}

export class UploadBtnMobile extends React.Component <UploadBtnMobileProps, ToolBoxUploadBoxState> {
    private readonly client: any;
    public constructor(props: UploadBtnProps) {
        super(props);
        this.state = {
            toolBoxColor: "#A2A7AD",
        };
        this.client = new OSS({
            accessKeyId: this.props.oss.accessKeyId,
            accessKeySecret: this.props.oss.accessKeySecret,
            region: this.props.oss.region,
            bucket: this.props.oss.bucket,
        });
    }
    private uploadImage = (event: any) => {
        const uploadFileArray: File[] = [];
        uploadFileArray.push(event.file);
        const uploadManager = new UploadManager(this.client, this.props.room);
        if (this.props.whiteboardRef) {
            const {clientWidth, clientHeight} = this.props.whiteboardRef;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        } else {
            const clientWidth = window.innerWidth;
            const clientHeight = window.innerHeight;
            uploadManager.uploadImageFiles(uploadFileArray, clientWidth / 2, clientHeight / 2, this.props.onProgress)
                .catch(error => alert("upload file error" + error));
        }
    }
    public render(): React.ReactNode {
        return (
            <Upload
                accept={"image/*"}
                showUploadList={false}
                customRequest={this.uploadImage}>
                        <div className="whiteboard-top-bar-btn-mb" >
                            <img style={{width: 16}} src={upload}/>
                        </div>
            </Upload>
        );
    }
}

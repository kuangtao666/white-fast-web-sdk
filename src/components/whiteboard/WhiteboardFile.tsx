import * as React from "react";
import "./WhiteboardFile.less";
import {Room} from "white-web-sdk";
import * as close from "../../assets/image/close.svg";
import {PPTDataType, PPTType} from "../menu/PPTDatas";
import PPTDatas from "../menu/PPTDatas";

export type WhiteboardFileProps = {
    room: Room;
    isFileOpen?: boolean;
    handleFileState: () => void;
};

export type WhiteboardFileStates = {
    docs: PPTDataType[];
    activeDocData?: PPTDataType;
};


export default class WhiteboardFile extends React.Component<WhiteboardFileProps, WhiteboardFileStates> {

    public constructor(props: WhiteboardFileProps) {
        super(props);
        this.state = {
            docs: [],
        };
    }
    public componentDidMount(): void {
        const docs: PPTDataType[] = PPTDatas.map((PPTData: PPTDataType) => {
            const dataObj = JSON.parse(PPTData.data);
            if (PPTData.pptType === PPTType.static) {
                const newDataObj = dataObj.map((data: any) => {
                    data.ppt.width = 1200;
                    data.ppt.height = 675;
                    return data;
                });
                return {
                    active: PPTData.active,
                    static_cover: dataObj[0].ppt.src,
                    id: PPTData.id,
                    data: newDataObj,
                    pptType: PPTData.pptType,
                };
            } else {
                const newDataObj = dataObj.map((data: any) => {
                    data.ppt.width = 1200;
                    data.ppt.height = 675;
                    return data;
                });
                return {
                    active: PPTData.active,
                    dynamic_cover: PPTData.dynamic_cover,
                    id: PPTData.id,
                    data: newDataObj,
                    pptType: PPTData.pptType,
                };
            }
        });
        this.setState({docs: docs});
    }

    private selectDoc = (id: number) => {
        const {room} = this.props;
        const activeData = this.state.docs!.find(data => data.id === id)!;
        this.setState({activeDocData: activeData});
        room.putScenes(`/defaultPPT${activeData.id}`, activeData.data);
        room.setScenePath(`/defaultPPT${activeData.id}/${activeData.data[0].name}`);
        const docsArray = this.state.docs.map(data => {
            if (data.id === id) {
                data.active = true;
                return data;
            } else {
                data.active = false;
                return data;
            }
        });
        this.setState({docs: docsArray});
        const proportion = window.innerWidth / window.innerHeight;
        if (proportion > 1) {
            const zoomNumber = window.innerHeight / 675;
            room.moveCamera({scale: zoomNumber});
        } else {
            const zoomNumber = window.innerWidth / 1200;
            room.moveCamera({scale: zoomNumber});
        }
    }
    public render(): React.ReactNode {
        let docCells: React.ReactNode;
        if (this.state.docs.length > 0) {
            docCells = this.state.docs.map(data => {
                if (data.pptType === PPTType.static) {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <svg key="" width={144} height={104}>
                                <image
                                    width="100%"
                                    height="100%"
                                    xlinkHref={data.static_cover + "?x-oss-process=style/ppt_preview"}
                                />
                            </svg>
                        </div>
                    </div>;
                } else {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <div className="menu-ppt-image-box-inner">
                                <img src={data.dynamic_cover}/>
                                <div>
                                    动态 PPT
                                </div>
                            </div>
                        </div>
                    </div>;
                }
            });
        }
        if (this.props.isFileOpen) {
            return (
                <div className="file-box">
                    <div className="chat-inner-box">
                        <div className="chat-box-title">
                            <div className="chat-box-name">
                                <span>文档中心</span>
                            </div>
                            <div onClick={this.props.handleFileState} className="chat-box-close">
                                <img src={close}/>
                            </div>
                        </div>
                        <div className="file-inner-box">
                            {docCells}
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }
}
import * as React from "react";
import "./WhiteboardFile.less";
import {Room} from "white-react-sdk";
import * as close from "../../assets/image/close.svg";
import * as default_cover from "../../assets/image/default_cover.svg";
import {PPTDataType, PPTType} from "../menu/PPTDatas";
import {LanguageEnum} from "../../pages/NetlessRoom";
const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));
export type WhiteboardFileProps = {
    room: Room;
    handleFileState: () => void;
    documentArray: PPTDataType[];
    isFileOpen?: boolean;
    language?: LanguageEnum;
    isFileMenuOpen: boolean;
    uuid: string;
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
    public async componentDidMount(): Promise<void> {
        const docs = this.handleDocs(this.props.documentArray);
        this.setState({docs: docs});
        await this.setUpDefaultDocs();
    }

    private handleDocs = (documentArray: PPTDataType[]): PPTDataType[] => {
        if (documentArray.length > 0) {
            const docs = documentArray.map((PPTData: PPTDataType) => {
                const newDataArray = JSON.parse(PPTData.data);
                if (PPTData.pptType === PPTType.static) {
                    const newDataObj = newDataArray.map((data: any) => {
                        const proportion = data.ppt.width / data.ppt.height;
                        data.ppt.width = 1024;
                        data.ppt.height = 1024 / proportion;
                        return data;
                    });
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataObj,
                        pptType: PPTData.pptType,
                    };
                } else {
                    return {
                        active: PPTData.active,
                        cover: PPTData.cover ? PPTData.cover : default_cover,
                        id: PPTData.id,
                        data: newDataArray,
                        pptType: PPTData.pptType,
                    };
                }
            });
            return docs;
        } else {
            return [];
        }
    }

    public componentWillReceiveProps(nextProps: WhiteboardFileProps): void {
        if (this.props.documentArray.length !== nextProps.documentArray.length) {
            const docs = this.handleDocs(nextProps.documentArray);
            this.setState({docs: docs});
        }
    }

    private setUpDefaultDocs = async (): Promise<void> => {
        const activeDoc = this.state.docs.find(data => data.active);
        if (activeDoc) {
            await timeout(0);
            this.selectDoc(activeDoc.id);
        }
    }

    private selectDoc = (id: string) => {
        const {room, uuid} = this.props;
        const activeData = this.state.docs.find(data => data.id === id)!;
        const activeIndex = room.state.sceneState.scenes.length - 1;
        this.setState({activeDocData: activeData});
        const pptData: any[] = activeData.data.map((docData: any, index: number) => {
            if (activeIndex === 0) {
                docData.name = `${parseInt(docData.name) + activeIndex}`;
                return docData;
            } else {
                docData.name = `${parseInt(docData.name) + activeIndex + 1}`;
                return docData;
            }
        });
        room.putScenes(`/${uuid}`, pptData, activeIndex + 1);
        room.setScenePath(`/${uuid}/${pptData[0].name}`);
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
        const {language, handleFileState} = this.props;
        const isEnglish = language === LanguageEnum.English;
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
                                    xlinkHref={data.cover}
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
                                <img src={data.cover}/>
                                <div>
                                    {isEnglish ? "Dynamic PPT" : "动态 PPT"}
                                </div>
                            </div>
                        </div>
                    </div>;
                }
            });
        }
        return (
            <div className="file-box">
                <div className="chat-inner-box">
                    <div className="chat-box-title">
                        <div className="chat-box-name">
                            <span>{isEnglish ? "Document" : "文档中心"}</span>
                        </div>
                        <div onClick={() => handleFileState()} className="chat-box-close">
                            <img src={close}/>
                        </div>
                    </div>
                    <div className="file-inner-box">
                        {docCells}
                    </div>
                </div>
            </div>
        );
    }
}

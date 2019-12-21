import * as React from "react";
import "./WhiteboardFile.less";
import {Room} from "white-web-sdk";
import * as default_cover_home from "../../assets/image/default_cover_home.svg";
import * as close from "../../assets/image/close.svg";
import {PPTDataType, PPTType} from "../menu/PPTDatas";
import {LanguageEnum} from "../../pages/NetlessRoomTypes";
export type WhiteboardFileProps = {
    room: Room;
    handleFileState: () => void;
    isFileOpen?: boolean;
    language?: LanguageEnum;
    isFileMenuOpen: boolean;
    uuid: string;
    documentArray: PPTDataType[];
    handleDocumentArrayState: (state: PPTDataType[]) => void;
};

export default class WhiteboardFile extends React.Component<WhiteboardFileProps, {}> {

    public constructor(props: WhiteboardFileProps) {
        super(props);
    }

    private selectDoc = (id: string) => {
        const {documentArray, handleDocumentArrayState} = this.props;
        if (documentArray) {
            this.handleUpdateDocsState(id, documentArray);
            const docsArray = documentArray.map(data => {
                if (data.id === id) {
                    data.active = true;
                    return data;
                } else {
                    data.active = false;
                    return data;
                }
            });
            handleDocumentArrayState(docsArray);
        }
    }

    private handleUpdateDocsState = (id: string, documentArray: PPTDataType[]): void => {
        const {room, uuid} = this.props;
        const activeData = documentArray.find(data => data.id === id)!;
        if (room.state.globalState.documentArrayState) {
            const documentArrayState: {id: string, isHaveScenes: boolean}[] = room.state.globalState.documentArrayState;
            const activeDoc = documentArrayState.find(doc => doc.id === id);
            if (activeDoc) {
                if (activeDoc.isHaveScenes) {
                    if (activeDoc.id === "init") {
                        room.setScenePath(`/init`);
                    } else {
                        room.setScenePath(`/${uuid}/${activeData.id}/1`);
                    }
                } else {
                    room.putScenes(`/${uuid}/${activeData.id}`, activeData.data);
                    room.setScenePath(`/${uuid}/${activeData.id}/1`);
                }
            }
        }
    }
    public render(): React.ReactNode {
        const {language, handleFileState, documentArray} = this.props;
        const isEnglish = language === LanguageEnum.English;
        let docCells: React.ReactNode;
        if (documentArray && documentArray.length > 0) {
            const documents: PPTDataType[] = documentArray;
            docCells = documents.map(data => {
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
                } else if (data.pptType === PPTType.dynamic) {
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
                } else {
                    return <div
                        key={`${data.id}`}
                        onClick={() => this.selectDoc(data.id)}
                        className="menu-ppt-inner-cell">
                        <div
                            style={{backgroundColor: data.active ? "#f2f2f2" : "#ffffff"}}
                            className="menu-ppt-image-box">
                            <div className="menu-ppt-image-box-inner">
                                <img src={default_cover_home}/>
                                <div>
                                    {isEnglish ? "Home Docs" : "主页文档"}
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

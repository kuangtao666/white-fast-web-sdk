import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";
import BraftEditor, {EditorState} from "braft-editor";
import iframe_close from "../assets/image/iframe_close.svg";
import iframe_min from "../assets/image/iframe_min.svg";
import iframe_max from "../assets/image/iframe_max.svg";
import fix_icon from "../assets/image/fix_icon.svg";
import editor_icon from "../assets/image/editor_icon.svg";
import uneditor_icon from "../assets/image/uneditor_icon.svg";
import "./Editor.less";
import "braft-editor/dist/index.css";

export type EditorProps = PluginComponentProps & {
    editorState: any;
};

export type EditorStates = {
    selfEditorState: EditorState;
    isClickDisable: boolean;
};


export class Editor extends React.Component<EditorProps, EditorStates> {

    public static readonly protocol: string = "editor";
    public static readonly backgroundProps: Partial<EditorProps> = {editorState: "<p>Hello <b>World!</b></p>"};

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public constructor(props: EditorProps) {
        super(props);
        this.state = {
            selfEditorState: BraftEditor.createEditorState("<p>Hello <b>World!</b></p>"),
            isClickDisable: false,
        };
    }
    public UNSAFE_componentWillReceiveProps(nextProps: EditorProps): void {
        const selfEditorStateData = this.state.selfEditorState.toRAW();
        if (nextProps.editorState !== this.props.editorState) {
            if (nextProps.editorState !== selfEditorStateData) {
                this.setState({selfEditorState: BraftEditor.createEditorState(nextProps.editorState)});
            }
        }
    }

    public componentDidMount(): void {
        const selfEditorState = this.props.editorState;
        this.setState({selfEditorState: BraftEditor.createEditorState(selfEditorState)});
    }

    private handleChange = async (editorState: EditorState): Promise<void> => {
        await this.setState({selfEditorState: editorState});
        this.props.setProps(this.props.uuid, {
            editorState: editorState.toRAW(),
        });
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        const {selfEditorState, isClickDisable} = this.state;
        return (
            <CNode kind={CNodeKind.HTML}>
                <div style={{width: width, height: height}} className="editor-out-box">
                    <div className="iframe-box" style={{width: width, height: height}}>
                        <div className="iframe-box-nav">
                            <div className="iframe-box-nav-left">
                                <div className="iframe-box-nav-close">
                                    <img style={{width: 7.2}} src={iframe_close}/>
                                </div>
                                <div className="iframe-box-nav-min">
                                    <img src={iframe_min}/>
                                </div>
                                <div className="iframe-box-nav-max">
                                    <img  style={{width: 6}} src={iframe_max}/>
                                </div>
                            </div>
                            <div className="iframe-box-nav-right">
                                <div className="iframe-box-nav-right-btn">
                                    <img src={fix_icon}/>
                                </div>
                                <div onClick={() => this.setState({isClickDisable: !this.state.isClickDisable})} className="iframe-box-nav-right-btn">
                                    {isClickDisable ? <img src={editor_icon}/> : <img src={uneditor_icon}/>}
                                </div>
                            </div>
                        </div>
                        <div className="iframe-box-body">
                            <BraftEditor
                                className="editor-box-active"
                                value={selfEditorState}
                                onChange={this.handleChange}
                            />
                        </div>
                    </div>
                </div>
            </CNode>
        );
    }
}

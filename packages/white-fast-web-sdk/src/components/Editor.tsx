import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";
import BraftEditor, {EditorState} from "braft-editor";
import "./Editor.less";
import "braft-editor/dist/index.css";

export type EditorProps = PluginComponentProps & {
    editorState: EditorState;
};

export type EditorStates = {
    selfEditorState: EditorState;
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
        };
    }
    public componentWillReceiveProps(nextProps: EditorProps): void {
        if (nextProps.editorState !== this.props.editorState) {
            this.setState({selfEditorState: nextProps.editorState});
        }
    }

    private handleChange = (editorState: EditorState): void => {
        this.props.setProps(this.props.uuid, {
            editorState: editorState,
        });
        this.setState({selfEditorState: editorState});
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        const {selfEditorState} = this.state;
        return (
            <CNode kind={CNodeKind.HTML}>
                <div style={{width: width, height: height}} className="editor-out-box">
                    <BraftEditor
                        className="editor-box-active"
                        value={selfEditorState}
                        onChange={this.handleChange}
                    />
                </div>
            </CNode>
        );
    }
}

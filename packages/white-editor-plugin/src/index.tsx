import * as React from "react";
import {CNode, CNodeKind, Player, PluginComponentProps, Room} from "white-web-sdk";
import BraftEditor, {EditorState} from "braft-editor";
import "./index.less";
import "braft-editor/dist/index.css";
export type SelfUserInf = {
    userId: number, identity: IdentityType,
};
export type WhiteEditorPluginProps = PluginComponentProps & {
    editorState: any;
};

export type WhiteEditorPluginStates = {
    selfEditorState: EditorState;
};


export class WhiteEditorPlugin extends React.Component<WhiteEditorPluginProps, WhiteEditorPluginStates> {

    public static readonly protocol: string = "white-editor-plugin";
    public static readonly backgroundProps: Partial<WhiteEditorPluginProps> = {editorState: "<p>Hello <b>World!</b></p>"};
    private selfUserInf: SelfUserInf | null = null;
    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public constructor(props: WhiteEditorPluginProps) {
        super(props);
        this.state = {
            selfEditorState: BraftEditor.createEditorState("<p>Hello <b>World!</b></p>"),
            isClickDisable: false,
        };
    }
    public UNSAFE_componentWillReceiveProps(nextProps: WhiteEditorPluginProps): void {
        if (nextProps.editorState !== this.props.editorState) {
            if (this.selfUserInf && this.selfUserInf.identity !== IdentityType.host) {
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
        this.props.operator.setProps(this.props.uuid, {
            editorState: editorState.toRAW(),
        });
    }

    private setMyIdentityRoom = (room: Room): void => {
        const observerId = room.observerId;
        const roomMember = room.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                userId: roomMember.payload.userId,
                identity: roomMember.payload.identity,
            };
        }
    }

    private setMyIdentityPlay = (play: Player): void => {
        const observerId = play.observerId;
        const roomMember = play.state.roomMembers.find(roomMember => observerId === roomMember.memberId);
        if (roomMember && roomMember.payload) {
            this.selfUserInf = {
                userId: roomMember.payload.userId,
                identity: roomMember.payload.identity,
            };
        }
    }

    public render(): React.ReactNode {
        const {width, height} = this.props;
        const {selfEditorState} = this.state;
        return (
            <CNode kind={CNodeKind.HTML}>
                <RoomConsumer>
                    {(room: Room | undefined) => {
                        if (room) {
                            this.room = room;
                            this.setMyIdentityRoom(room);
                            return (
                                <div className="plugin-box" style={{width: width, height: height}}>
                                    <div className="plugin-box-nav">
                                        Editor
                                    </div>
                                    <div className="plugin-box-body">
                                        <BraftEditor
                                            className="editor-box-active"
                                            value={selfEditorState}
                                            onChange={this.handleChange}
                                        />
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </RoomConsumer>
                <PlayerConsumer>
                    {(play: Player | undefined) => {
                        if (play) {
                            this.play = play;
                            this.setMyIdentityPlay(play);
                            return (
                                <div className="plugin-box" style={{width: width, height: height}}>
                                    <div className="plugin-box-nav">
                                        Editor
                                    </div>
                                    <div className="plugin-box-body">
                                        <BraftEditor
                                            className="editor-box-active"
                                            value={this.props.selfEditorState}
                                        />
                                    </div>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    }}
                </PlayerConsumer>
            </CNode>
        );
    }
}

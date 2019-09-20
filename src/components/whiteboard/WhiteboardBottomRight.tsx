import * as React from "react";
import * as annex_box from "../../assets/image/annex_box.svg";
import * as left_arrow from "../../assets/image/left_arrow.svg";
import * as right_arrow from "../../assets/image/right_arrow.svg";
import * as chat from "../../assets/image/chat.svg";
import "./WhiteboardBottomRight.less";
import {Badge, Tooltip} from "antd";
import {Room, Scene, RoomState} from "white-web-sdk";

export type MessageType = {
    name: string,
    avatar: string,
    id: string,
    messageInner: string[],
};



export type hotkeyTooltipState = {
    hotkeyTooltipDisplay: boolean,
    annexBoxTooltipDisplay: boolean,
    messages:  MessageType[],
    seenMessagesLength: number,
};

export type WhiteboardBottomRightProps = {
    room: Room;
    roomState: RoomState;
    handleAnnexBoxMenuState: () => void;
    chatState?: boolean;
    handleChatState: () => void;
};

export default class WhiteboardBottomRight extends React.Component<WhiteboardBottomRightProps, hotkeyTooltipState> {

    public constructor(props: WhiteboardBottomRightProps) {
        super(props);
        this.state = {
            hotkeyTooltipDisplay: false,
            annexBoxTooltipDisplay: false,
            messages: [],
            seenMessagesLength: 0,
        };
        this.renderAnnexBox = this.renderAnnexBox.bind(this);
    }

    public componentDidMount(): void {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
    }

    public componentWillReceiveProps(nextProps: WhiteboardBottomRightProps): void {
        if (this.props.chatState !== nextProps.chatState && nextProps.chatState === false) {
            this.setState({seenMessagesLength: this.state.messages.length});
        }
    }
    private renderAnnexBox(): React.ReactNode {
        const {roomState, room} = this.props;
        const activeIndex = roomState.sceneState.index;
        const scenes = roomState.sceneState.scenes;
        return (
            <div>
                {scenes.length > 1 ?
                    <div className="whiteboard-annex-box">
                        <div
                            onClick={() => room.pptPreviousStep()}
                            className="whiteboard-annex-arrow-left">
                            <img src={left_arrow}/>
                        </div>
                        <Tooltip placement="top" title={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                            <div
                                onMouseEnter={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: true,
                                    });
                                }}
                                onMouseLeave={() => {
                                    this.setState({
                                        annexBoxTooltipDisplay: false,
                                    });
                                }}
                                onClick={this.props.handleAnnexBoxMenuState}
                                className="whiteboard-annex-arrow-mid">
                                <div className="whiteboard-annex-img-box">
                                    <img src={annex_box}/>
                                </div>
                                <div className="whiteboard-annex-arrow-page">
                                    {activeIndex + 1} / {scenes.length}
                                </div>
                            </div>
                        </Tooltip>
                        <div
                            onClick={() => room.pptNextStep()}
                            className="whiteboard-annex-arrow-right">
                            <img src={right_arrow}/>
                        </div>
                    </div> :
                    <Tooltip placement="topRight" title={"附件资料"} visible={this.state.annexBoxTooltipDisplay}>
                        <div
                            onMouseEnter={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: true,
                                });
                            }}
                            onMouseLeave={() => {
                                this.setState({
                                    annexBoxTooltipDisplay: false,
                                });
                            }}
                            onClick={this.props.handleAnnexBoxMenuState}
                            className="whiteboard-bottom-right-cell">
                            <img src={annex_box}/>
                        </div>
                    </Tooltip>}
            </div>
        );
    }

    public render(): React.ReactNode {
        return (
            <div className="whiteboard-box-bottom-right">
                <div className="whiteboard-box-bottom-right-mid">
                    {this.renderAnnexBox()}
                    <Badge overflowCount={99} offset={[-3, 6]} count={this.props.chatState ? 0 : (this.state.messages.length - this.state.seenMessagesLength)}>
                        <div onClick={this.props.handleChatState} className="whiteboard-box-bottom-left-chart">
                            <img src={chat}/>
                        </div>
                    </Badge>
                </div>
            </div>
        );
    }
}

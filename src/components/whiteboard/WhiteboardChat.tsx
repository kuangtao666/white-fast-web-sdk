import * as React from "react";
import "./WhiteboardChat.less";
import {
    ThemeProvider,
    MessageGroup,
    Message,
    MessageText,
    MessageList,
    TextComposer,
    Row,
    TextInput,
    SendButton,
} from "@livechat/ui-kit";
import {Room} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import {UserType} from "../RealTime";
import * as empty from "../../assets/image/empty.svg";
import * as close from "../../assets/image/close.svg";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type WhiteboardChatProps = {
    room: Room;
    userInf: UserType;
    isChatOpen?: boolean;
    handleChatState: () => void;
};

export type WhiteboardChatStates = {
    messages: MessageType[];
    url: string;
};


export default class WhiteboardChat extends React.Component<WhiteboardChatProps, WhiteboardChatStates> {

    private messagesEnd: HTMLDivElement | null = null;

    public constructor(props: WhiteboardChatProps) {
        super(props);
        this.state = {
            messages: [],
            url: "",
        };
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    private scrollToBottom(): void {
        this.messagesEnd!.scrollIntoView({behavior: "smooth"});
    }

    public async componentDidMount(): Promise<void> {
        const {room} = this.props;
        room.addMagixEventListener("message",  event => {
            this.setState({messages: [...this.state.messages, event.payload]});
        });
        await timeout(0);
        this.scrollToBottom();
        const canvasArray: any = document.getElementsByClassName("identicon").item(0);
        const url = canvasArray.toDataURL();
        this.setState({url: url});
    }

    public async componentWillReceiveProps(): Promise<void> {
        await timeout(0);
        this.scrollToBottom();
    }

    public render(): React.ReactNode {
        const messages: MessageType[] = this.state.messages; // 有很多内容
        if (messages.length > 0) {
            let previousName = messages[0].name;
            let previousId = messages[0].id;

            for (let i = 1; i < messages.length; ++ i) {
                const message = messages[i];
                if (previousName === message.name && previousId === message.id) {
                    console.log(messages);
                    messages[i - 1].messageInner.push(...message.messageInner);
                    messages.splice(i, 1);
                    i --;
                }
                previousName = message.name;
                previousId = message.id;
            }
        }
        let messageNodes: React.ReactNode = null;
        if (messages.length > 0) {
            messageNodes = messages.map((data: MessageType, index: number) => {
                const messageTextNode = data.messageInner.map((inner: string, index: number) => {
                    return (
                        <Message key={`${index}`}
                                 isOwn={this.props.userInf.id === data.id} authorName={data.name}
                        >
                            <MessageText>{inner}</MessageText>
                        </Message>
                    );
                });
                return (
                    <MessageGroup
                        key={`${index}`}
                        avatar={data.avatar}
                        isOwn={this.props.userInf.id === data.id}
                        onlyFirstWithMeta
                    >
                        {messageTextNode}
                    </MessageGroup>
                );
            });
        }
        if (this.props.isChatOpen) {
            return (
                <div className="chat-box">
                    <ThemeProvider
                        theme={{
                            vars: {
                                "avatar-border-color": "#005BF6",
                            },
                            FixedWrapperMaximized: {
                                css: {
                                    boxShadow: "0 0 1em rgba(0, 0, 0, 0.1)",
                                },
                            },
                            Message: {},
                            MessageText: {
                                css: {
                                    backgroundColor: "#F8F8F8",
                                    borderRadius: 8,
                                },
                            },
                            Avatar: {
                                size: "32px", // special Avatar's property, supported by this component
                                css: { // css object with any CSS properties
                                    borderColor: "blue",
                                },
                            },
                            TextComposer: {
                                css: {
                                    "color": "#000",
                                },
                            },
                        }}
                    >
                        <div className="chat-inner-box">
                            <div className="chat-box-title">
                                <div className="chat-box-name">
                                    <span>聊天室</span>
                                </div>
                                <div onClick={this.props.handleChatState} className="chat-box-close">
                                    <img src={close}/>
                                </div>
                            </div>
                            <div className="chat-box-message">
                                {messageNodes !== null ? <MessageList>
                                    {messageNodes}
                                </MessageList> : <div className="chat-box-message-empty">
                                    <img src={empty}/>
                                    <div>
                                        暂无聊天记录~
                                    </div>
                                </div>}
                                <div className="under-cell" ref={ref => this.messagesEnd = ref}/>
                            </div>
                            <div className="chat-box-input">
                                <TextComposer
                                    onSend={(event: any) => {
                                        this.props.room.dispatchMagixEvent("message", {
                                            name: this.props.userInf.name,
                                            avatar: this.props.userInf.avatar,
                                            id: this.props.userInf.id,
                                            messageInner: [event],
                                        });
                                    }}
                                >
                                    <Row align="center">
                                        <TextInput placeholder={"输入聊天内容~"} fill="true"/>
                                        <SendButton fit />
                                    </Row>
                                </TextComposer>
                            </div>
                        </div>
                    </ThemeProvider>
                </div>
            );
        } else {
            return null;
        }
    }
}

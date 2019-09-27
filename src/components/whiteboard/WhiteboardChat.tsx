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
import {Room, Player} from "white-web-sdk";
import {MessageType} from "./WhiteboardBottomRight";
import * as empty from "../../assets/image/empty.svg";
import * as close from "../../assets/image/close.svg";
import {LanguageEnum} from "../../pages/NetlessRoom";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type WhiteboardChatProps = {
    userId: string;
    handleChatState: () => void;
    userAvatarUrl?: string;
    userName?: string;
    room?: Room;
    player?: Player;
    isChatOpen?: boolean;
    language?: LanguageEnum;
};

export type WhiteboardChatStates = {
    messages: MessageType[];
    url: string;
    isLandscape: boolean;
};


export default class WhiteboardChat extends React.Component<WhiteboardChatProps, WhiteboardChatStates> {

    private messagesEnd: HTMLDivElement | null = null;

    public constructor(props: WhiteboardChatProps) {
        super(props);
        this.state = {
            messages: [],
            url: "",
            isLandscape: true,
        };
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    private scrollToBottom(): void {
        if (this.messagesEnd) {
            this.messagesEnd.scrollIntoView({behavior: "smooth"});
        }
    }

    public componentWillMount(): void {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const isLandscape = (width / height) >= 1;
        this.setState({isLandscape: isLandscape});
    }

    public async componentDidMount(): Promise<void> {
        const {room, player} = this.props;
        if (room) {
            room.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        } else if (player) {
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
        await timeout(0);
        this.scrollToBottom();
        const canvasArray: any = document.getElementsByClassName("identicon").item(0);
        if (canvasArray) {
            const url = canvasArray.toDataURL();
            this.setState({url: url});
        }
    }

    public async componentWillReceiveProps(): Promise<void> {
        await timeout(0);
        this.scrollToBottom();
    }

    public render(): React.ReactNode {
        const messages: MessageType[] = this.state.messages;
        const {isChatOpen, language} = this.props;
        const isEnglish = language === LanguageEnum.English;
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
                                 isOwn={this.props.userId === data.id} authorName={data.name}
                        >
                            <MessageText>{inner}</MessageText>
                        </Message>
                    );
                });
                return (
                    <MessageGroup
                        key={`${index}`}
                        avatar={data.avatar}
                        isOwn={this.props.userId === data.id}
                        onlyFirstWithMeta
                    >
                        {messageTextNode}
                    </MessageGroup>
                );
            });
        }
        if (isChatOpen) {
            return (
                <div className={this.state.isLandscape ? "chat-box" : "chat-box-mask"}>
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
                                    <span>{isEnglish ? "Chatroom" : "聊天室"}</span>
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
                                        {isEnglish ? "No chat history ~" : "暂无聊天记录~"}
                                    </div>
                                </div>}
                            </div>
                            {this.props.room &&
                            <div className="chat-box-input">
                                <TextComposer
                                    onSend={(event: any) => {
                                        if (this.props.room) {
                                            this.props.room.dispatchMagixEvent("message", {
                                                name: this.props.userName,
                                                avatar: this.props.userAvatarUrl,
                                                id: this.props.userId,
                                                messageInner: [event],
                                            });
                                        }
                                    }}
                                >
                                    <Row align="center">
                                        <TextInput placeholder={"输入聊天内容~"} fill="true"/>
                                        <SendButton fit />
                                    </Row>
                                </TextComposer>
                            </div>}
                        </div>
                    </ThemeProvider>
                </div>
            );
        } else {
            return null;
        }
    }
}

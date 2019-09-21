import * as React from "react";
import {Badge, Icon, Popover} from "antd";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player, Room} from "white-react-sdk";
import * as chat_white from "../assets/image/chat_white.svg";
import "./PlayerPage.less";
import SeekSlider from "@netless/react-seek-slider";
import * as player_stop from "../assets/image/player_stop.svg";
import * as player_begin from "../assets/image/player_begin.svg";
import {displayWatch} from "../tools/WatchDisplayer";
import * as full_screen from "../assets/image/full_screen.svg";
import * as exit_full_screen from "../assets/image/exit_full_screen.svg";
import {message} from "antd";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {MessageType} from "../components/whiteboard/WhiteboardBottomRight";
import WhiteboardChat from "../components/whiteboard/WhiteboardChat";
import {UserType} from "../components/RealTime";
import WhiteboardTopLeft from "../components/whiteboard/WhiteboardTopLeft";

export type PlayerPageProps = {
    uuid: string;
    roomToken: string;
    time: string;
    userInf: UserType;
    duration?: number;
    beginTimestamp?: number,
    room?: string,
    mediaUrl?: string,
    isChatOpen?: boolean;
    logoUrl?: boolean;
};


export type PlayerPageStates = {
    player: Player | null;
    phase: PlayerPhase;
    currentTime: number;
    isFirstScreenReady: boolean;
    isPlayerSeeking: boolean;
    messages: MessageType[];
    seenMessagesLength: number;
    isChatOpen?: boolean;
    isVisible: boolean;
    isFullScreen: boolean;
};

export default class PlayerPage extends React.Component<PlayerPageProps, PlayerPageStates> {
    private scheduleTime: number = 0;
    private readonly cursor: any;

    public constructor(props: PlayerPageProps) {
        super(props);
        this.cursor = new UserCursor();
        this.state = {
            currentTime: 0,
            phase: PlayerPhase.Pause,
            isFirstScreenReady: false,
            player: null,
            isPlayerSeeking: false,
            messages: [],
            seenMessagesLength: 0,
            isChatOpen: this.props.isChatOpen,
            isVisible: false,
            isFullScreen: false,
        };
    }
    public async componentDidMount(): Promise<void> {
        const {uuid, roomToken, beginTimestamp, duration, mediaUrl} = this.props;
        if (uuid && roomToken) {
            const whiteWebSdk = new WhiteWebSdk();
            const player = await whiteWebSdk.replayRoom(
                {
                    beginTimestamp: beginTimestamp,
                    duration: duration,
                    room: uuid,
                    mediaURL: mediaUrl,
                    roomToken: roomToken,
                    cursorAdapter: this.cursor,
                }, {
                onPhaseChanged: phase => {
                    this.setState({phase: phase});
                },
                onLoadFirstFrame: () => {
                    this.setState({isFirstScreenReady: true});
                    if (player.state.roomMembers) {
                        this.cursor.setColorAndAppliance(player.state.roomMembers);
                    }
                },
                onSliceChanged: slice => {
                },
                onPlayerStateChanged: modifyState => {
                    if (modifyState.roomMembers) {
                        this.cursor.setColorAndAppliance(modifyState.roomMembers);
                    }
                },
                onStoppedWithError: error => {
                    message.error("Playback error");
                },
                onScheduleTimeChanged: scheduleTime => {
                    this.setState({currentTime: scheduleTime});
                },
            });
            this.setState({
                player: player,
            });
            player.addMagixEventListener("message",  event => {
                this.setState({messages: [...this.state.messages, event.payload]});
            });
        }
    }
    private onWindowResize = (): void => {
        if (this.state.player) {
            this.state.player.refreshViewSize();
        }
    }
    public componentWillMount(): void {
        window.addEventListener("resize", this.onWindowResize);
    }


    public componentWillUnmount(): void {
        window.removeEventListener("resize", this.onWindowResize);
    }

    private operationButton = (phase: PlayerPhase): React.ReactNode => {
        switch (phase) {
            case PlayerPhase.Playing: {
                return <img src={player_begin}/>;
            }
            case PlayerPhase.Buffering: {
                return <Icon style={{fontSize: 18, color: "white"}} type="loading" />;
            }
            case PlayerPhase.Ended: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
            default: {
                return <img style={{marginLeft: 2}} src={player_stop}/>;
            }
        }
    }

    private getCurrentTime = (scheduleTime: number): number => {
        if (this.state.isPlayerSeeking) {
            this.scheduleTime = scheduleTime;
            return this.state.currentTime;
        } else {
            const isChange = this.scheduleTime !== scheduleTime;
            if (isChange) {
                return scheduleTime;
            } else {
                return this.state.currentTime;
            }
        }
    }

    private onClickOperationButton = (player: Player): void => {
        switch (player.phase) {
            case PlayerPhase.WaitingFirstFrame:
            case PlayerPhase.Pause: {
                player.play();
                break;
            }
            case PlayerPhase.Playing: {
                player.pause();
                break;
            }
            case PlayerPhase.Ended: {
                player.seekToScheduleTime(0);
                break;
            }
        }
    }

    private renderScale = (): React.ReactNode => {
        if (this.state.isFullScreen) {
            return (
                <img src={exit_full_screen}/>
            );
        } else {
            return (
                <img src={full_screen}/>
            );
        }
    }
    private renderScheduleView(): React.ReactNode {
        if (this.state.player && this.state.isVisible) {
            return (
                <div
                    onMouseEnter={() => this.setState({isVisible: true})}
                    // onMouseLeave={() => this.setState({isVisible: false})}
                    className="player-schedule">
                    <div className="player-mid-box">
                        <SeekSlider
                            fullTime={this.state.player.timeDuration}
                            currentTime={this.getCurrentTime(this.state.currentTime)}
                            onChange={(time: number, offsetTime: number) => {
                                if (this.state.player) {
                                    this.setState({currentTime: time});
                                   this.state.player.seekToScheduleTime(time);
                                }
                            }}
                            hideHoverTime={true}
                            limitTimeTooltipBySides={true}/>
                    </div>
                    <div className="player-controller-box">
                        <div className="player-controller-left">
                            <div className="player-left-box">
                                <div
                                    onClick={() => this.onClickOperationButton(this.state.player!)}
                                    className="player-controller">
                                    {this.operationButton(this.state.phase)}
                                </div>
                            </div>
                            <div className="player-mid-box-time">
                                {displayWatch(Math.floor(this.state.player.scheduleTime / 1000))} / {displayWatch(Math.floor(this.state.player.timeDuration / 1000))}
                            </div>
                        </div>
                        <div className="player-controller-left">
                            <div onClick={async () => {
                                const  element = document.getElementById("netless-player");
                                if (this.state.isFullScreen) {
                                    if (document.exitFullscreen) {
                                       await  document.exitFullscreen();
                                        this.setState({isFullScreen: false});
                                    }
                                } else {
                                    if (element) {
                                        if (element.requestFullscreen) {
                                            await element.requestFullscreen();
                                            this.setState({isFullScreen: true});
                                        }
                                    }
                                }
                            }} className="player-controller">
                                {this.renderScale()}
                            </div>
                            <div onClick={this.handleChatState} className="player-controller">
                                <img src={chat_white}/>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    private handleChatState = (): void => {
        this.setState({isChatOpen: !this.state.isChatOpen});
    }

    public render(): React.ReactNode {
        const {player} = this.state;
        const {userInf} = this.props;
        if (player) {
            return (
                <div id="netless-player" className="player-out-box">
                    <WhiteboardTopLeft
                        logoUrl={this.props.logoUrl}/>
                    <div className="player-big-icon">

                    </div>
                    <div className="player-board">
                        {this.renderScheduleView()}
                        <div
                            className={"player-board-inner"}
                            onMouseOver={() => this.setState({isVisible: true})}
                            onMouseLeave={() => this.setState({isVisible: false})}
                        >
                            <PlayerWhiteboard  className="player-box" player={player}/>
                        </div>
                    </div>
                    <WhiteboardChat isChatOpen={this.state.isChatOpen} userInf={userInf} handleChatState={this.handleChatState}/>
                </div>
            );
        } else {
            return null;
        }
    }
}

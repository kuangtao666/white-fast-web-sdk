import * as React from "react";
import {Badge, Icon, Popover} from "antd";
import {WhiteWebSdk, PlayerWhiteboard, PlayerPhase, Player, Room} from "white-react-sdk";
import * as chat from "../assets/image/chat.svg";
import "./PlayerPage.less";
import SeekSlider from "@netless/react-seek-slider";
import * as player_stop from "../assets/image/player_stop.svg";
import * as player_begin from "../assets/image/player_begin.svg";
import {displayWatch} from "../tools/WatchDisplayer";
import * as like from "../assets/image/like.svg";
import {message} from "antd";
import {UserCursor} from "../components/whiteboard/UserCursor";
import {MessageType} from "../components/whiteboard/WhiteboardBottomRight";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type PlayerPageProps = {
    uuid: string;
    roomToken: string;
    userId: string;
    time: string;
    duration?: number;
    beginTimestamp?: number,
    room?: string,
    mediaUrl?: string,
};


export type PlayerPageStates = {
    player: Player | null;
    phase: PlayerPhase;
    currentTime: number;
    isFirstScreenReady: boolean;
    isPlayerSeeking: boolean;
    messages: MessageType[];
    seenMessagesLength: number;
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
                return <Icon style={{fontSize: 18}} type="loading" />;
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
    private renderScheduleView(): React.ReactNode {
        if (this.state.player) {
            return (
                <div
                    style={{display: "flex"}}
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
                        <div>
                            <div
                                onClick={() => this.onClickOperationButton(this.state.player!)}
                                className="player-controller">
                                {this.operationButton(this.state.phase)}
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }
    }

    public render(): React.ReactNode {
        const {player} = this.state;
        if (player) {
            return (
                <div className="player-out-box">
                    <div
                        style={{display: "flex"}}
                        className="player-nav-box">
                        <div className="player-nav-left-box">
                            <div className="player-nav-left">
                            </div>
                        </div>
                    </div>
                    {this.renderScheduleView()}
                    {this.state.player && <PlayerWhiteboard className="player-box" player={this.state.player}/>}
                </div>
            );
        } else {
            return null;
        }
    }
}

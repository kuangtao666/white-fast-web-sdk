import {Room} from "white-react-sdk";
import {IdentityType} from "../components/whiteboard/WhiteboardTopRight";
import {message} from "antd";

export enum ModeType {
    lecture = "lecture",
    handUp = "handUp",
    discuss = "discuss",
}

export class RoomManager {
  private readonly identity?: IdentityType;
  private readonly userAvatarUrl?: string;
  private readonly name?: string;
  private readonly userId: string;
  private readonly room: Room;
  private readonly setReadOnlyState: (state: boolean) => void;
  public constructor(userId: string, room: Room, setReadOnlyState: (state: boolean) => void, userAvatarUrl?: string, identity?: IdentityType, name?: string) {
    this.room = room;
    this.identity = identity;
    this.userId = userId;
    this.setReadOnlyState = setReadOnlyState;
    this.userAvatarUrl = userAvatarUrl;
    this.name = name;
  }

  public start = async (): Promise<void> => {
      if (this.identity === IdentityType.host) {
          const hostInfo = this.room.state.globalState.hostInfo;
          if (hostInfo) {
              if (hostInfo.userId !== this.userId) {
                  message.warning("已经有主持人");
              }
          } else {
              const myHostInfo = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  mode: ModeType.lecture,
              };
              this.room.setGlobalState({hostInfo: myHostInfo});
          }
      } else if (this.identity === IdentityType.listener) {
          await this.room.setWritable(false);
          this.setReadOnlyState(true);
      } else {
          const globalGuestUsers = this.room.state.globalState.guestUsers;
          if (globalGuestUsers === undefined) {
              const guestUser = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  isReadOnly: true,
                  isHandUp: false,
              };
              this.room.setGlobalState({guestUsers: [guestUser]});
              this.setReadOnlyState(true);
              this.room.disableDeviceInputs = true;
          } else {
              const myUser = globalGuestUsers.find((data: any) => data.userId === this.userId);
              if (myUser) {
                  this.setReadOnlyState(myUser.isReadOnly);
                  this.room.disableDeviceInputs = myUser.isReadOnly;
              } else {
                  const guestUser = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      isReadOnly: true,
                  };
                  globalGuestUsers.push(guestUser);
                  this.room.setGlobalState({guestUsers: globalGuestUsers});
                  this.setReadOnlyState(true);
                  this.room.disableDeviceInputs = true;
              }
          }
          this.addGuestInitialize();
          this.addGuestAgree();
      }
  }

  private addGuestAgree = (): void => {
      this.room.addMagixEventListener("agree", event => {
          if (event.payload.userId === this.userId && event.payload.isReadyOnly !== undefined) {
              this.setReadOnlyState(event.payload.isReadyOnly);
              this.room.disableDeviceInputs = false;
              const guestUser = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  isReadOnly: event.payload.isReadyOnly,
              };
              if (this.room.state.globalState.guestUsers) {
                  const userArray = this.room.state.globalState.guestUsers;
                  const myUser = this.room.state.globalState.guestUsers.find((data: any) => data.userId === this.userId);
                  if (myUser) {
                      const users = userArray.map((data: any) => {
                          if (data.userId === myUser.userId) {
                              return {
                                  userId: data.userId,
                                  identity: this.identity,
                                  avatar: this.userAvatarUrl,
                                  name: this.name,
                                  isReadOnly: event.payload.isReadyOnly,
                              };
                          } else {
                              return data;
                          }
                      });
                      this.room.setGlobalState({guestUsers: users});
                  } else {
                      userArray.push(guestUser);
                      this.room.setGlobalState({guestUsers: userArray});
                  }
              } else {
                  this.room.setGlobalState({guestUsers: [guestUser]});
              }
          }
      });
  }

  private addGuestInitialize = (): void => {
      this.room.addMagixEventListener("guest-initialize", () => {
          this.setReadOnlyState(true);
          this.room.disableDeviceInputs = true;
          message.info("主持人收回控制权限");
      });
  }
  public stop = (): void => {
      this.room.removeMagixEventListener("take-back-all");
      this.room.removeMagixEventListener("agree");
  }
}

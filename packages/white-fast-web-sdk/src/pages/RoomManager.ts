import {Room, ViewMode} from "white-react-sdk";
import {IdentityType} from "../components/whiteboard/WhiteboardTopRight";
import {message} from "antd";

export enum ModeType {
    lecture = "lecture",
    handUp = "handUp",
    discuss = "discuss",
}

export type GuestUserType = {
    userId: string,
    identity: IdentityType,
    avatar?: string,
    name?: string,
    isReadOnly: boolean,
    isHandUp: boolean,
    cameraState: ViewMode,
    disableCameraTransform: boolean,
};
export type HostUserType = {
    userId: string,
    identity: IdentityType,
    avatar?: string,
    name?: string,
    isVideoFullScreen?: boolean,
    mode: ModeType,
    cameraState: ViewMode,
    disableCameraTransform: boolean,
};

export class RoomManager {
  private readonly identity: IdentityType;
  private readonly userAvatarUrl?: string;
  private readonly name?: string;
  private readonly userId: string;
  private readonly room: Room;
  private readonly mode?: ModeType;
  public constructor(userId: string, room: Room, userAvatarUrl?: string, identity?: IdentityType, name?: string, mode?: ModeType) {
    this.room = room;
    this.identity = identity ? identity : IdentityType.guest;
    this.userId = userId;
    this.userAvatarUrl = userAvatarUrl;
    this.name = name;
    this.mode = mode;
  }

  private detectIsReadyOnly = (): boolean => {
      const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
      if (hostInfo) {
          return hostInfo.mode !== ModeType.discuss;
      } else {
          return this.mode !== ModeType.discuss;
      }
  }
  public start = async (): Promise<void> => {
      if (this.identity === IdentityType.host) {
          const hostInfo: HostUserType = this.room.state.globalState.hostInfo;
          if (hostInfo) {
              this.room.setViewMode(ViewMode.Broadcaster);
              if (hostInfo.userId !== this.userId) {
                  const myHostInfo: HostUserType = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      mode: this.mode ? this.mode : ModeType.discuss,
                      cameraState: ViewMode.Broadcaster,
                      disableCameraTransform: false,
                  };
                  this.room.disableCameraTransform = false;
                  this.room.setGlobalState({hostInfo: myHostInfo});
                  message.success("您成为主持人");
              }
          } else {
              const myHostInfo: HostUserType = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  mode: this.mode ? this.mode : ModeType.discuss,
                  cameraState: ViewMode.Broadcaster,
                  disableCameraTransform: false,
              };
              this.room.disableCameraTransform = false;
              this.room.setGlobalState({hostInfo: myHostInfo});
              this.room.setViewMode(ViewMode.Broadcaster);
          }
      } else if (this.identity === IdentityType.listener) {
          this.room.setViewMode(ViewMode.Follower);
          this.room.disableCameraTransform = true;
          await this.room.setWritable(false);
      } else {
          const isReadOnly = this.detectIsReadyOnly();
          const globalGuestUsers: GuestUserType[] = this.room.state.globalState.guestUsers;
          if (globalGuestUsers === undefined) {
              const guestUser: GuestUserType = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  isReadOnly: isReadOnly,
                  isHandUp: false,
                  cameraState: ViewMode.Follower,
                  disableCameraTransform: true,
              };
              this.room.disableCameraTransform = true;
              this.room.setGlobalState({guestUsers: [guestUser]});
              this.room.disableDeviceInputs = true;
              this.room.setViewMode(ViewMode.Follower);
          } else {
              const myUser = globalGuestUsers.find((data: GuestUserType) => data.userId === this.userId);
              if (myUser) {
                  this.room.disableDeviceInputs = myUser.isReadOnly;
                  this.room.disableCameraTransform = myUser.disableCameraTransform;
              } else {
                  const guestUser: GuestUserType = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      isReadOnly: isReadOnly,
                      isHandUp: false,
                      cameraState: ViewMode.Follower,
                      disableCameraTransform: true,
                  };
                  this.room.disableCameraTransform = true;
                  globalGuestUsers.push(guestUser);
                  this.room.setGlobalState({guestUsers: globalGuestUsers});
                  this.room.disableDeviceInputs = true;
              }
          }
      }
  }

  public stop = (): void => {
      this.room.removeMagixEventListener("take-back-all");
      this.room.removeMagixEventListener("agree");
  }
}

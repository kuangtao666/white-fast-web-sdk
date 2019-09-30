import {Room, ViewMode} from "white-react-sdk";
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
  public constructor(userId: string, room: Room, userAvatarUrl?: string, identity?: IdentityType, name?: string) {
    this.room = room;
    this.identity = identity;
    this.userId = userId;
    this.userAvatarUrl = userAvatarUrl;
    this.name = name;
  }

  public start = async (): Promise<void> => {
      if (this.identity === IdentityType.host) {
          const hostInfo = this.room.state.globalState.hostInfo;
          if (hostInfo) {
              this.room.setViewMode(ViewMode.Broadcaster);
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
          const globalGuestUsers = this.room.state.globalState.guestUsers;
          if (globalGuestUsers === undefined) {
              const guestUser = {
                  userId: this.userId,
                  identity: this.identity,
                  avatar: this.userAvatarUrl,
                  name: this.name,
                  isReadOnly: true,
                  isHandUp: false,
                  cameraState: ViewMode.Follower,
                  disableCameraTransform: true,
              };
              this.room.disableCameraTransform = true;
              this.room.setGlobalState({guestUsers: [guestUser]});
              this.room.disableDeviceInputs = true;
              this.room.setViewMode(ViewMode.Follower);
          } else {
              const myUser = globalGuestUsers.find((data: any) => data.userId === this.userId);
              if (myUser) {
                  this.room.disableDeviceInputs = myUser.isReadOnly;
                  this.room.disableCameraTransform = myUser.disableCameraTransform;
              } else {
                  const guestUser = {
                      userId: this.userId,
                      identity: this.identity,
                      avatar: this.userAvatarUrl,
                      name: this.name,
                      isReadOnly: true,
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

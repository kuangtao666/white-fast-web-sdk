import {observable} from "mobx";
import {IdentityType} from "../pages/NetlessRoomTypes";

export class RoomStore {
    @observable
    public boardPointerEvents: any = "auto";
    @observable
    public identity: IdentityType = IdentityType.guest;
    @observable
    public h5PptUrl: string = "";
    @observable
    public startRtc: (() => void) | null;
    @observable
    public stopRtc: (() => void) | null;
    @observable
    public startRecord: (() => void) | null;
    @observable
    public stopRecord: (() => void) | null;
    @observable
    public releaseMedia: (() => void) | null;
    @observable
    public isRecording: boolean = false;
    @observable
    public isScreenZoomLock: boolean = false;
    @observable
    public isInputH5Visible: boolean = false;
}
export const roomStore = new RoomStore();

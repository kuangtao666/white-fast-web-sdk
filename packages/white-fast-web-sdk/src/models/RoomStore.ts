import {observable} from "mobx";
import {IdentityType} from "../components/whiteboard/WhiteboardTopRight";

export class RoomStore {
    @observable
    public boardPointerEvents: any = "auto";
    @observable
    public identity: IdentityType = IdentityType.guest;
    @observable
    public h5PptUrl: string = "";
    @observable
    public extendToolState: boolean = false;

    public startRtc(): void {
    }
}
export const roomStore = new RoomStore();

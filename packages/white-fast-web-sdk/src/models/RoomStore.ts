import {observable} from "mobx";
import {IdentityType} from "../pages/NetlessRoomTypes";

export class RoomStore {
    @observable
    public boardPointerEvents: any = "auto";
    @observable
    public identity: IdentityType = IdentityType.guest;
    @observable
    public h5PptUrl: string = "";

}
export const roomStore = new RoomStore();

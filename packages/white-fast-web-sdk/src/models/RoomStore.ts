import {observable} from "mobx";

export class RoomStore {
    @observable
    public boardPointerEvents: any = "auto";
    @observable
    public h5PptUrl: string = "";
    @observable
    public extendToolState: boolean = false;
}
export const roomStore = new RoomStore();

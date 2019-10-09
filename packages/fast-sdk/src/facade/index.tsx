import { RoomFacade, PlayerFacade } from "./Facade";
const WhiteFastSDK: { Room: any, Player: any } = {
    Room: RoomFacade,
    Player: PlayerFacade,
};
(window as any).WhiteFastSDK = WhiteFastSDK;
export default WhiteFastSDK;

import { RoomFacade, PlayerFacade } from "./Facade";
type FastSDK = { Room: any, Player: any };
const WhiteFastSDK: FastSDK = {
    Room: RoomFacade,
    Player: PlayerFacade,
};
(window as any).WhiteFastSDK = WhiteFastSDK;
export default WhiteFastSDK;

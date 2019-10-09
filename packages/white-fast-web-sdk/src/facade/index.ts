import { RoomFacade, PlayerFacade } from "./Facade";
type FastSDK = { Room: any, Player: any , Version: string};
const WhiteFastSDK: FastSDK = {
    Room: RoomFacade,
    Player: PlayerFacade,
    Version: "1.0.3",
};
(window as any).WhiteFastSDK = WhiteFastSDK;
export default WhiteFastSDK;

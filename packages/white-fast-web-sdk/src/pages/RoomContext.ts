import * as React from "react";
import {Room} from "white-react-sdk";
export type RoomContext = {
    whiteboardLayerDownRef: HTMLDivElement;
    room: Room;
    startRtcCallback: (func: () => void) => void;
    stopRtcCallback: (func: () => void) => void;
    onColorArrayChange?: (colorArray: string[]) => void;
    stopRecord?: () => void;
    isRecording: boolean;
};

const context = React.createContext<RoomContext>(undefined as any);

export const RoomContextProvider = context.Provider;
export const RoomContextConsumer = context.Consumer;

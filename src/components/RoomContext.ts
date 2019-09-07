import * as React from "react";
export type RoomContext = {
    // readonly remoteMediaStreams: any[];
    // readonly userId: number;
    // readonly localStream: any;
    // setSliderFloating: () => void;
    // setSliderExtending: () => void;
    // setSliderHiding: () => void;
    onColorArrayChange?: (colorArray: string[]) => void;
    // joinRoomTime: number;
};

const context = React.createContext<RoomContext>(undefined as any);

export const RoomContextProvider = context.Provider;
export const RoomContextConsumer = context.Consumer;

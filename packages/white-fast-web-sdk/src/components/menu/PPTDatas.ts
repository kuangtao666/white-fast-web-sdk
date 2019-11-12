export type PPTDataType = {
    active: boolean,
    pptType: PPTType,
    id: string,
    data: any,
    cover?: string,
    isHaveScenes?: boolean,
};

export enum PPTType {
    dynamic = "dynamic",
    static = "static",
}

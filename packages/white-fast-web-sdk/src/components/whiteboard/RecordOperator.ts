import Fetcher from "@netless/fetch-middleware";

const fetcher = new Fetcher(5000, "https://apiagoraio.herewhite.com");

export class RecordOperator {

    private readonly agoraAppId: string;
    private readonly customerId: string;
    private readonly customerCertificate: string;
    private readonly channelName: string;
    private readonly mode: string;
    private readonly recordingConfig: any;
    private readonly storageConfig: any;

    private recordId?: string;
    public resourceId?: string;
    private readonly uid: string;
    private readonly token: string | null = null;

    public constructor(agoraAppId: string, customerId: string, customerCertificate: string, channelName: string, recordingConfig: any, storageConfig: any, mode: string, token: string | null) {
        this.agoraAppId = agoraAppId;
        this.customerId = customerId;
        this.customerCertificate = customerCertificate;
        this.channelName = channelName;
        this.recordingConfig = recordingConfig;
        this.storageConfig = storageConfig;
        this.mode = mode;
        this.uid = `${Math.floor(Math.random() * 100000)}`;
        this.token = token;
    }

    public async acquire(): Promise<void> {
        const json = await fetcher.post<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/acquire`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
            body: {
                cname: this.channelName,
                uid: this.uid,
                clientRequest: {},
            },
        });
        const res = json as any;
        if (typeof res.resourceId === "string") {
            this.resourceId = res.resourceId;
        } else {
            throw new Error("acquire resource error");
        }
    }

    public async release(): Promise<void> {
        this.resourceId = undefined;
        this.recordId = undefined;
    }


    public async start(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        const json = await fetcher.post<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/mode/${this.mode}/start`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
            body: {
                cname: this.channelName,
                uid: this.uid,
                clientRequest: {token: this.token, recordingConfig: this.recordingConfig, storageConfig: this.storageConfig },
            },
        });
        const res = json as any;
        if (typeof res.sid === "string") {
            this.recordId = res.sid;
        } else {
            throw new Error("start record error");
        }
        return res;
    }

    public async stop(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        try {
            const json = await fetcher.post<any>({
                path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/stop`,
                headers: {
                    Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
                },
                body: {
                    cname: this.channelName,
                    uid: this.uid,
                    clientRequest: {},
                },
            });
            return json as any;
        } catch (err) {
            console.log("stop", err);
        } finally {
            await this.release();
        }
    }

    public async query(): Promise<any> {
        if (this.resourceId === undefined) {
            throw new Error("call 'acquire' method acquire resource");
        }
        if (this.recordId === undefined) {
            throw new Error("call 'start' method start record");
        }
        const json = await fetcher.get<any>({
            path: `v1/apps/${this.agoraAppId}/cloud_recording/resourceid/${this.resourceId}/sid/${this.recordId}/mode/${this.mode}/query`,
            headers: {
                Authorization: this.basicAuthorization(this.customerId, this.customerCertificate),
            },
        });
        return json as any;
    }

    private basicAuthorization(appId: string, appSecret: string): string {
        const plainCredentials = `${appId}:${appSecret}`;
        return `Basic ${btoa(plainCredentials)}`;
    }
}

import * as React from "react";
import { CNode, CNodeKind, PluginComponentProps } from "white-react-sdk";
export type WhiteScaffoldPluginProps = PluginComponentProps & {
    readonly count: number;
};

export default class WhiteScaffoldPlugin extends React.Component<WhiteScaffoldPluginProps> {

    public static readonly protocol: string = "white-scaffold-plugin";
    public static readonly backgroundProps: Partial<WhiteScaffoldPluginProps> = { count: 0 };

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public render(): React.ReactNode {
        return (
            <CNode kind={CNodeKind.HTML}>
                <div>count: {this.props.count}</div>
                <div style={{ pointerEvents: "auto" }}>
                    <button style={{ pointerEvents: "auto" }} onClick={() => {
                        this.props.setProps(this.props.uuid, {
                            count: this.props.count + 1,
                        });
                    }}>
                        increment
                    </button>
                    <button style={{ pointerEvents: "auto" }} onClick={() => {
                        this.props.setProps(this.props.uuid, {
                            count: this.props.count - 1,
                        });
                    }}>
                        decrement
                    </button>
                </div>
            </CNode>
        );
    }
}

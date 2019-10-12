import * as React from "react";
import {CNode, CNodeKind, PluginComponentProps} from "white-web-sdk";

export type CounterComponentProps = PluginComponentProps & {
    readonly count: number;
};

export default class CounterComponent extends React.Component<CounterComponentProps> {

    public static readonly protocol: string = "test";
    public static readonly backgroundProps: Partial<CounterComponentProps> = {count: 0};

    public static willInterruptEvent(props: any, event: any): boolean {
        return true;
    }

    public render(): React.ReactNode {
        return (
            <CNode kind={CNodeKind.HTML}>
                <div>count: {this.props.count}</div>
                <div style={{pointerEvents: "auto"}}>
                    <button style={{pointerEvents: "auto"}} onClick={() => {
                        this.props.setProps(this.props.uuid, {
                            count: this.props.count + 1,
                        });
                    }}>
                        increment
                    </button>
                    <button style={{pointerEvents: "auto"}} onClick={() => {
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

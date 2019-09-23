import * as React from "react";
import {slide as Menu} from "react-burger-menu";
import {MenuInnerType, PagePreviewPositionEnum} from "../../pages/NetlessRoom";

const timeout = (ms: any) => new Promise(res => setTimeout(res, ms));

export type MenuBoxStyleState = {
    menuStyles: any,
};

const styles: any = {
    bmMenu: {
        boxShadow: "0 8px 24px 0 rgba(0,0,0,0.15)",
    },
    bmBurgerButton: {
        display: "none",
    },
};

const styles2: any = {
    bmBurgerButton: {
        display: "none",
    },
};


const styles3: any = {
    bmOverlay: {
        background: "rgba(0, 0, 0, 0.0)",
   },
};


export type MenuBoxProps = {
    isVisible: boolean;
    menuInnerState: MenuInnerType;
    resetMenu: () => void;
    setMenuState: (state: boolean) => void;
    pagePreviewPosition?: PagePreviewPositionEnum;
};


export default class MenuBox extends React.Component<MenuBoxProps, MenuBoxStyleState> {

    public constructor(props: MenuBoxProps) {
        super(props);
        this.state = {
            menuStyles: this.props.isVisible ? styles : styles2,
        };
    }

    private async getMenuStyle(): Promise<void> {

        if (this.props.isVisible) {
            this.setState({
                menuStyles: styles,
            });
        } else {
            await timeout(500);
            this.setState({
                menuStyles: styles2,
            });
        }
    }
    public render(): React.ReactNode {
        const isRight = this.props.pagePreviewPosition === PagePreviewPositionEnum.right;
        return (
            <Menu
                pageWrapId="page-wrap"
                outerContainerId="outer-container"
                noOverlay
                styles={this.state.menuStyles}
                width={280}
                right={isRight}
                isOpen={this.props.isVisible}
                onStateChange={async menuState => {
                    if (!menuState.isOpen) {
                        await timeout(500);
                        this.props.setMenuState(false);
                    }
                    else {
                        this.props.setMenuState(true);
                    }
                    await this.getMenuStyle();
                }}>
                {this.props.children}
            </Menu>
        );
    }
}

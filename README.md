# White Fast Web SDK

English | [简体中文](./README-zh_CN.md) | [日本語](./README-jp.md) 

![GitHub](https://img.shields.io/github/license/netless-io/whiteboard-designer)

⚡ Open source ultra fast white borad web SDK.

## 🎉 Installation

### Use CDN

```html
<script src ="https://sdk.herewhtie.com/fast.js"></script>
```

### Use npm



## 📋 Example code

### Live White Board

```javascript
var userId = `${Math.floor(Math.random() * 100000)}`;
var uuid = "3dac59e714d2443eb733e9de5dc2beb4";
var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWE4ZWIyZWE3ZDliMWJiZDkyNWQ0Yzg4YTgwYjVlYjFiOTQxOTZiYmY6YWRtaW5JZD0xNTgmcm9vbUlkPTNkYWM1OWU3MTRkMjQ0M2ViNzMzZTlkZTVkYzJiZWI0JnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MDEzNTkmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NDQ0MDcmbm9uY2U9MTU2ODk0NDQwNjY0MzAw";
WhiteFastSDK.Room("app-root",{
        uuid: uuid,
        userInf: {
            name: "Netless",
            id: userId,
            avatar: "https://ohuuyffq2.qnssl.com/netless_icon.png",
        },
        roomToken: roomToken,
        logoUrl: "",
        toolBarPosition: "left",
        pagePreviewPosition: "right",
        boardBackgroundColor: "#F2F2F2",
        isReadOnly: false,
        identity: "host",
        defaultColorArray: [
            "#E77345",
            "#005BF6",
            "#F5AD46",
            "#68AB5D",
            "#9E51B6",
            "#1E2023",
        ],
        colorArrayStateCallback: (colorArray) => {
            console.log(colorArray);
        }
    });
});
```

### White Board Player

```javascript
var uuid = "7406e356d813449989560f695d421bea";
var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPThjY2M1MWRlZjg1Y2I3MGJjNDQwMDVlMjEzODUwNmIwOGIxNjc4NzQ6YWRtaW5JZD0xNTgmcm9vbUlkPTc0MDZlMzU2ZDgxMzQ0OTk4OTU2MGY2OTVkNDIxYmVhJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE1OTk3MzA3NjAmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NjgxNzM4MDgmbm9uY2U9MTU2ODE3MzgwODE3NjAw";
WhiteFastSDK.Player("app-root",{
    uuid: uuid,
    userInf: {
        name: "Netless",
        id: "1",
    },
    roomToken: roomToken,
    logoUrl: "",
    toolBarPosition: "left",
    pagePreviewPosition: "left",
    boardBackgroundColor: "#F2F2F2",
    isReadOnly: false,
    defaultColorArray: [
        "#E77345",
        "#005BF6",
        "#F5AD46",
        "#68AB5D",
        "#9E51B6",
        "#1E2023",
    ],
    colorArrayStateCallback: (colorArray) => {
        console.log(colorArray);
    }
});
```

## 🚀 Development

1. Run `yarn dev` in your terminal
2. Live room by open facade/index.html
3. Player by open facade/player.html

## 📖 Documentation

## 👏 Contributing

Please refer to each project's style and contribution guidelines for submitting patches and additions. In general, we follow the "fork-and-pull" Git workflow.

1. Fork the repo on GitHub
2. Clone the project to your own machine
3. Commit changes to your own branch
4. Push your work back up to your fork
5. Submit a Pull request so that we can review your changes
NOTE: Be sure to merge the latest from "upstream" before making a pull request!
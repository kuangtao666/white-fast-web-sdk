# White Fast Web SDK

[English](./README.md) | 简体中文 | [日本語](./README-jp.md)

![GitHub](https://img.shields.io/github/license/netless-io/whiteboard-designer)
![jenkins](http://ci.netless.group/job/fast-sdk-pr/badge/icon)

⚡ 超快的开源白板 SDK

## 🎉 快速开始

### 实时互动白板

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhtie.com/fast.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "7406e356d813449989560f695d421bea";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPThjY2M1MWRlZjg1Y2I3MGJjNDQwMDVlMjEzODUwNmIwOGIxNjc4NzQ6YWRtaW5JZD0xNTgmcm9vbUlkPTc0MDZlMzU2ZDgxMzQ0OTk4OTU2MGY2OTVkNDIxYmVhJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE1OTk3MzA3NjAmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NjgxNzM4MDgmbm9uY2U9MTU2ODE3MzgwODE3NjAw";
        
        WhiteFastSDK.Room("app-root",{
            uuid: uuid,
            roomToken: roomToken,
            userInf: {
                id: userId,
            },
        });
    </script>
</body>
```

### 白板回放播放器

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhtie.com/fast.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "7406e356d813449989560f695d421bea";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPThjY2M1MWRlZjg1Y2I3MGJjNDQwMDVlMjEzODUwNmIwOGIxNjc4NzQ6YWRtaW5JZD0xNTgmcm9vbUlkPTc0MDZlMzU2ZDgxMzQ0OTk4OTU2MGY2OTVkNDIxYmVhJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE1OTk3MzA3NjAmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1NjgxNzM4MDgmbm9uY2U9MTU2ODE3MzgwODE3NjAw";
        
        WhiteFastSDK.Player("app-root",{
            uuid: uuid,
            roomToken: roomToken,
            userInf: {
                id: userId,
            },
        });
    </script>
</body>
```

## 📖 文档

### 实时互动白板

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

### 白板回放播放器

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

## 🚀 开发

1. 在命令行运行 yarn dev
2. 用浏览器打开 facade/index.html 进入互动白板
3. 用浏览器打开 facade/player.html 进入白板播放器

## 👏 开源贡献

请参阅每个项目的样式和贡献指南，以提交补丁和特性。一般来说，我们遵循 “fork-and-pull” Git工作流程。

1. 在GitHub上 Fork 项目
2. 将项目克隆到您自己的计算机上
3. 将更改提交到您自己的分支
4. 将工作推到你的 Fork
5. 提交 Pull Request，我们会尽快进行 Code Review
请在提交 PR 之前拉取并合并上游的最新代码，感谢您的共享

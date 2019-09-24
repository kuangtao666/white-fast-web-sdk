# Ultra Fast WhiteBoard

[English](./README.md) | 简体中文 | [日本語](./README-jp.md)

![GitHub](https://img.shields.io/github/license/netless-io/whiteboard-designer)
![jenkins](http://ci.netless.group/job/fast-sdk-pr/badge/icon)

⚡ 超快的开源白板

## 🎉 快速开始

### 在线尝试

[jsrun#china](http://jsrun.pro/zmbKp/edit)

### 实时互动白板

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhite.com/fast-sdk/index.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "8c2ee602f11e4883a75a9be9dd51b4cd";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWFhODIxMTQ5NjdhZDdmMmVlMzI1NmJhNjUwNmM2OTJmMzFkNGZiODg6YWRtaW5JZD0xNTgmcm9vbUlkPThjMmVlNjAyZjExZTQ4ODNhNzVhOWJlOWRkNTFiNGNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MTI0OTYmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NTU1NDQmbm9uY2U9MTU2ODk1NTU0NDAwMjAw";
        
        WhiteFastSDK.Room("app-root",{
            uuid: uuid, // 必填，需要播放房间的 id
            roomToken: roomToken, // 必填，进入房间的凭证
            userId: userId, // 必填，进入房间的凭证
            userName: "rick", // 选填，名字
            userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png", // 选填，头像
            logoUrl: "", // 选填，头像
            toolBarPosition: "left", // 选填，工具栏位置
            pagePreviewPosition: "right", // 选填，预览侧边的位置
            boardBackgroundColor: "#F2F2F2", // 选填，白板背景图片
            isReadOnly: false, // 选填，订阅者是否可以操作
            identity: "host", // 选填，身份
            defaultColorArray: [
                "#E77345",
                "#005BF6",
                "#F5AD46",
                "#68AB5D",
                "#9E51B6",
                "#1E2023",
            ], // 选填，默认的颜色列表
            roomCallback: (room) => {
                console.log(room);
            }, // 选填，获取 room 对象，方便二次开发
            colorArrayStateCallback: (colorArray) => {
                console.log(colorArray);
            }, // 选填, 新增颜色时给出的回调
        });
    </script>
</body>
```

### 白板回放播放器

```html
<body>
    <div id="app-root"></div>
    <script src="https://sdk.herewhite.com/fast-sdk/index.js"></script>
    <script type="text/javascript">
        var userId = `${Math.floor(Math.random() * 100000)}`;
        var uuid = "8c2ee602f11e4883a75a9be9dd51b4cd";
        var roomToken = "WHITEcGFydG5lcl9pZD0zZHlaZ1BwWUtwWVN2VDVmNGQ4UGI2M2djVGhncENIOXBBeTcmc2lnPWFhODIxMTQ5NjdhZDdmMmVlMzI1NmJhNjUwNmM2OTJmMzFkNGZiODg6YWRtaW5JZD0xNTgmcm9vbUlkPThjMmVlNjAyZjExZTQ4ODNhNzVhOWJlOWRkNTFiNGNkJnRlYW1JZD0yODMmcm9sZT1yb29tJmV4cGlyZV90aW1lPTE2MDA1MTI0OTYmYWs9M2R5WmdQcFlLcFlTdlQ1ZjRkOFBiNjNnY1RoZ3BDSDlwQXk3JmNyZWF0ZV90aW1lPTE1Njg5NTU1NDQmbm9uY2U9MTU2ODk1NTU0NDAwMjAw";
        
        WhiteFastSDK.Player("app-root",{
            uuid: uuid, // 必填，需要播放房间的 id
            roomToken: roomToken,  // 必填，进入房间的凭证
            userId: userId, // 必填，进入房间的凭证
        });
    </script>
</body>
```

## 📖 开发文档

您可以使用多个配置在代码中设置白板小部件，下面将详细介绍所有配置。

### WhiteBoard

要创建白板，请调用`WhiteFastSDK.Room`方法，并填入相关参数。

- element [string] – 包含对白板所在元素的引用
- configs [object] – 配置项

**uuid [string] required**

房间 id，房间的唯一识别标志

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] required**

进入房间的凭证

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] required**

用户 id，用户身份的唯一识别标志

```
userId: "wdqzidmac"
```

**userName [string] optional**

用户名称

```
userName: "rick"
```

**userAvatarUrl [string] optional**

用户头像地址

```
userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png"
```

**logoUrl [url] optional**

产品 logo 的地址

```
logoUrl: "https://path/to/logo.png"
```

**toolBarPosition [string] optional**

产品工具条摆放的位置，默认是放在左侧。可配置为 `left`  `right`  `top`  `bottom`

```
toolBarPosition: "left"
```

**pagePreviewPosition [string] optional**

With the default value as right, Preview view position, value include left, right.

```
pagePreviewPosition: "left"
```

**boardBackgroundColor [color] optional**

With the default value as white, Background color.

```
boardBackgroundColor: "#F2F2F2"
```

**isReadOnly [boolean] optional**

With the default value as false, read-only meaning can not write at board.

```
isReadOnly: false
```

**identity [string] optional**

With the default value as host, value include host, guest, listener.

```
identity: “guest”
```

**defaultColorArray [string[]] optional**

```
defaultColorArray: [
    "#EC3455",
    "#005BF6",
    "#F5AD46",
    "#68AB5D",
    "#9E51B6",
    "#1E2023",
];
```

**roomCallback [(room: Room) => void] optional**

```
roomCallback: (room) => {
                    console.log(room);
                }
```

**colorArrayStateCallback [(colorArray: string[]) => void] optional**

```
colorArrayStateCallback: (colorArray) => {
                    console.log(colorArray);
                }
```



### WhiteBoard Player

To create a player, invoke a ```WhiteFastSDK.Player``` method in which you write the selected element in which you want to add the player and preferred configs.

- element [string] – contains a reference to the element in which whiteboard is
- configs [object] – options object

**uuid [string] required**

Room indentify.

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] required**

Room auth token.

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] required**

User indentify.

```
userId: "wdqzidmac"
```

**userName [string] optional**

User name.

```
userName: "rick"
```

**userAvatarUrl [string] optional**

User avatar url.

```
userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png"
```

**logoUrl [url] optional**

With the default value as undefined, Custom branding logo.

```
logoUrl: "https://path/to/logo.png"
```

**beginTimestamp [number] optional**

UTC time when the player starts playing

```
beginTimestamp: 1569290494106
```

**duration [number] optional**

How long the player plays

```
duration: 94106
```

**mediaUrl [url] optional**

Recorded media

```
mediaUrl: "https://path/to/media.m3u8"
```

**isChatOpen [boolean] optional**

```
isChatOpen: true
```

**boardBackgroundColor [color] optional**

With the default value as white, Background color.

```
boardBackgroundColor: "#F2F2F2"
```

**Callback [(player: Player) => void] optional**

```
playerCallback: (player) => {
                    console.log(player);
                }
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

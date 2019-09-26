![](https://sdk.herewhite.com/fast-sdk/back2.png)

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
            uuid: uuid, // 必须，需要播放房间的 id
            roomToken: roomToken, // 必须，进入房间的凭证
            userId: userId, // 必须，用户 id，用户身份的唯一识别标志
            userName: "netless", // 可选，名字
            userAvatarUrl: "https://ohuuyffq2.qnssl.com/netless_icon.png", // 可选，头像
            logoUrl: "", // 可选，头像
            toolBarPosition: "left", // 可选，工具栏位置
            pagePreviewPosition: "right", // 可选，预览侧边的位置
            boardBackgroundColor: "#F2F2F2", // 可选，白板背景颜色
            isReadOnly: false, // 可选，订阅者是否可以操作
            identity: "host", // 可选，身份
            defaultColorArray: [
                "#E77345",
                "#005BF6",
                "#F5AD46",
                "#68AB5D",
                "#9E51B6",
                "#1E2023",
            ], // 可选，教具颜色列表，可通过界面进行添加新颜色，添加后 colorArrayStateCallback 会回调所有颜色列表
            roomCallback: (room) => {
                console.log(room);
            },  // 可选，底层 SDK Room 对象回调，Room 对象可以用来使用底层 SDK 能力深度使用白板功能。具体参见 https://developer.netless.link
            colorArrayStateCallback: (colorArray) => {
                console.log(colorArray);
            }, // 可选, 教具添加新颜色后回调
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
            userId: userId, // 必填，用户 id，用户身份的唯一识别标志
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

**uuid [string] 必须**

房间 id，房间的唯一识别标志

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] 必须**

进入房间的凭证

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] 必须**

用户 id，用户身份的唯一识别标志

```
userId: "wdqzidmac"
```

**userName [string] 可选**

用户名称

```
userName: "netlss"
```

**userAvatarUrl [string] 可选**

用户头像地址

```
userAvatarUrl: "https://path/to/avatar.png"
```

**logoUrl [url] 可选**

产品 logo 的在线地址

```
logoUrl: "https://path/to/logo.png"
```

**toolBarPosition [string] 可选**

产品工具条摆放的位置，默认是放在左侧。可配置为 `left`  `right`  `top`  `bottom`

```
toolBarPosition: "left"
```

**pagePreviewPosition [string] 可选**

预览侧边的位置，默认是放在右侧。可配置为 `left`  `right` 

```
pagePreviewPosition: "left"
```

**boardBackgroundColor [color] 可选**

白板背景颜色，默认是白色。支持 #开头的 RGB 或类似 red 的字面量

```
boardBackgroundColor: "#F2F2F2"
```

**isReadOnly [boolean] 可选**

是否可以操作，默认为 false，可以操作

```
isReadOnly: false
```

**identity [string] 可选**

用户身份，默认是主播。可配置为 `host`, `guest`, `listener`.

- host 主持人，可以控制其他人的角色，可以在 guest 和 listener 之间进行切换
- guest 嘉宾，可以参与互动（同 isReadOnly = false）
- listener 听众，不可以参与互动（同 isReadOnly = true）

```
identity: “guest”
```

**defaultColorArray [string[]] 可选**

教具颜色列表，可通过界面进行添加新颜色，添加后 colorArrayStateCallback 会回调所有颜色列表

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

**roomCallback [(room: Room) => void] 可选**

底层 SDK Room 对象回调，Room 对象可以用来使用底层 SDK 能力深度使用白板功能。具体参见 https://developer.netless.link

```
roomCallback: (room) => {
                    console.log(room);
                }
```

**colorArrayStateCallback [(colorArray: string[]) => void] 可选**

教具添加新颜色后回调。

```
colorArrayStateCallback: (colorArray) => {
                    console.log(colorArray);
                }
```



### WhiteBoard Player

要创建白板回放器，请调用`WhiteFastSDK.Player`方法，并填入相关参数。

- element [string] – 包含对白板所在元素的引用
- configs [object] – 配置项

**uuid [string] 必须**

房间 id，房间的唯一识别标志

```
uuid: "8c2ee602f11e4883a75a9be9dd51b4cd"
```

**roomToken [string] 必须**

进入房间的凭证

```
roomToken: "WHITEcGFydG5lcl9pZD....TOO...LONG"
```

**userId [string] 必须**

用户 id，用户身份的唯一识别标志

```
userId: "wdqzidmac"
```

**userName [string] 可选**

用户名称

```
userName: "netlss"
```

**userAvatarUrl [string] 可选**

用户头像地址

```
userAvatarUrl: "https://path/to/avatar.png"
```

**logoUrl [url] 可选**

产品 logo 的在线地址

```
logoUrl: "https://path/to/logo.png"
```

**beginTimestamp [number] 可选**

开始播放的 UTC 绝对时间

```
beginTimestamp: 1569290494106
```

**duration [number] 可选**

播放时长

```
duration: 94106
```

**mediaUrl [url] 可选**

外挂媒体资源，如视频、音频

```
mediaUrl: "https://path/to/media.m3u8"
```

**isChatOpen [boolean] 可选**

是否显示聊天窗口

```
isChatOpen: true
```

**boardBackgroundColor [color] 可选**

白板背景颜色，默认是白色。支持 #开头的 RGB 或类似 red 的字面量

```
boardBackgroundColor: "#F2F2F2"
```

**Callback [(player: Player) => void] 可选**

底层 SDK Player 对象回调，Player 对象可以用来使用底层 SDK 能力深度使用白板功能。具体参见 https://developer.netless.link

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

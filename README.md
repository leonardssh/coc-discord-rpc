<p align="center">
    <img src="https://i.imgur.com/gpcIEF4.png" alt="Icon" align="center" width="256">
<p>

<h3 align="center">
    😎 An awesome and fully customizable coc-extension to get Discord Rich Presence integration with <a href="https://neovim.io/"><b>NeoVim</b></a>.
</h3>

<div align="center">
  <p>
    <a href="https://www.npmjs.com/package/coc-discord-rpc">
        <img src="https://img.shields.io/npm/v/coc-discord-rpc.svg?maxAge=3600&color=crimson&logo=npm&style=flat-square" alt="NPM version" />
    </a>
    <a href="https://www.npmjs.com/package/coc-discord-rpc">
        <img src="https://img.shields.io/npm/dt/coc-discord-rpc.svg?maxAge=3600&logo=npm&style=flat-square" alt="NPM downloads" />
    </a>
  </p>
</div>

---

Remember to 🌟 this Github if you 💖 it.

For something in between a [dakyskye/coc-cord](https://github.com/dakyskye/coc-cord), [iCrawl/discord-vscode](https://github.com/iCrawl/discord-vscode/) and a [Satoqz/vscode-discord](https://github.com/Satoqz/vscode-discord).

This may not be the best discord rpc, but it is a discord rpc. 😁

## 📌 Features

-   Shows what you're working on in NeoVim
-   Shows the amount of problems in your workspace
-   Shows the number of lines in your file and which line you're editing
-   Respects Discords 15sec limit when it comes to updating your status
-   Support for over 130+ of the most popular languages
-   Enable/Disable RPC for individual workspaces
-   [coc-explorer] support
-   Custom string support
-   Idle indication when you tab out for a while

> All texts is fully customizable using variables and a multitude of config options

![1](https://cyberpunk.is-a.fail/1SvNnd.png)
![2](https://cyberpunk.is-a.fail/WyHbMu.png)
![3](https://cyberpunk.is-a.fail/pSCKrl.png)
![4](https://cyberpunk.is-a.fail/Vg82G0.png)
![5](https://cyberpunk.is-a.fail/BKX7RK.png)

## 📥 Installation

### Prerequisites

-   [NeoVim](https://neovim.io/) - hyperextensible Vim-based text editor
-   [coc.nvim](https://github.com/neoclide/coc.nvim) - Intellisense engine for Vim8 & Neovim

### Install

```
:CocInstall coc-discord-rpc
```

## 🤖 Commands

| Command          | Description                           |
| ---------------- | ------------------------------------- |
| `rpc.disconnect` | Disconnects you from Discord Gateway  |
| `rpc.reconnect`  | Reconnects you to Discord Gateway     |
| `rpc.version`    | Returns extension's version           |
| `rpc.enable`     | Enables RPC in the current workspace  |
| `rpc.disable`    | Disables RPC in the current workspace |

## 🔧 Settings

#### **rpc.id**

Application ID. Change only if you known exactly what you're doing.

Default: `768090036633206815`

#### **rpc.enabled**

Controls if the Discord Presence should show across all workspaces.

Default: `true`

#### **rpc.ignoreWorkspaces**

List of patterns to match workspace names that should prevent the extension from starting.

Default: `[]`

#### **rpc.workspaceElapsedTime**

Controls if the RPC should display elapsed time for a workspace or a single file.

Default: `false`

#### **rpc.checkIdle**

Whether or not to check if you are still active or idle and react accordingly.

Default: `true`

#### **rpc.idleTimeout**

How long the window should be unfocused (in seconds) to either disable rich presence or display you as idle.

Default: `300`

#### **rpc.idleText**

Custom string of the text displaying if you're idle when hovering over the small icon.

Default: `Idle`

#### **rpc.detailsEditing**

Custom string for the details section of the rich presence.

Default: `{workspace} {problems}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.detailsInExplorer**

Custom string for the details section of the rich presence when browsing the explorer.

Default: `Workspace: {workspace}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.detailsIdle**

Custom string for the details section of the rich presence when idling.

Default: `Idling`

-   `{null}` will be replaced with an empty space.

#### **rpc.detailsViewing**

Custom string for the details section of the rich presence when viewing.

Default: `In {workspace} {problems}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **rpc.lowerDetailsEditing**

Custom string for the state section of the rich presence.

Default: `Working on {filename}:{currentline}:{currentcolumn}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.lowerDetailsInExplorer**

Custom string for the state section of the rich presence when browsing the explorer.

Default: `In explorer`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.lowerDetailsIdle**

Custom string for the state section of the rich presence when idling.

Default: `Idling`

-   `{null}` will be replaced with an empty space.

#### **rpc.lowerDetailsViewing**

Custom string for the state section of the rich presence when viewing.

Default: `Viewing {filename}`

-   `{null}` will be replaced with an empty space
-   `{filename}` will be replaced with the current file name
-   `{workspace}` will be replaced with the current workspace name, if any
-   `{currentcolumn}` will get replaced with the current column of the current line
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number
-   `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace

#### **rpc.largeImage**

Custom string for the largeImageText section of the rich presence.

Default: `Editing a {LANG} file`

-   `{lang}` will be replaced with the lowercased language ID
-   `{Lang}` will be replaced with the language ID, first letter being uppercase
-   `{LANG}` will be replaced with the uppercased language ID.

#### **rpc.largeImageInExplorer**

Custom string for the largeImageText section of the rich presence when browsing the explorer.

Default: `In explorer`

#### **rpc.largeImageIdle**

Custom string for the largeImageText section of the rich presence when idling.

Default: `Idling`

#### **rpc.smallImage**

Custom string for the smallImageText section of the rich presence.

Default: `{appname} v${appversion}`

-   `{appname}` will get replaced with NeoVim text.
-   `{appversion}` will be replaced with the installed version of NeoVim.

#### **rpc.showProblems**

Controls if the RPC should show the count of problems (warnings, errors) present in your workspace.

Default: `true`

#### **rpc.problemsText**

Custom string of the text displaying the amount of problems in your workspace.

Default: `- {count} problems found`

-   `{count}` will be replaced by the respective amount of problems.

#### **rpc.workspaceText**

Custom string for the state section of the rich presence when a workspace is found.

Default: `{workspace}`

-   `{null}` will be replaced with an empty space
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number

#### **rpc.lowerDetailsNotFound**

Custom string for the state section of the rich presence when no workspace is found.

Default: `No workspace.`

-   `{null}` will be replaced with an empty space
-   `{currentline}` will get replaced with the current line number
-   `{totallines}` will get replaced with the total line number

## 👨‍💻 Contributing

To contribute to this repository, feel free to create a new fork of the repository and submit a pull request.

1. Fork / Clone and select the `main` branch.
2. Create a new branch in your fork.
3. Make your changes.
4. Commit your changes, and push them.
5. Submit a Pull Request [here](https://github.com/LeonardSSH/coc-discord-rpc/pulls)!

## 📋 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/LeonardSSH"><img src="https://avatars1.githubusercontent.com/u/35312043?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Narcis B.</b></sub></a><br /><a href="https://github.com/LeonardSSH/coc-discord-rpc/commits?author=LeonardSSH" title="Code">💻</a> <a href="https://github.com/LeonardSSH/coc-discord-rpc/commits?author=LeonardSSH" title="Documentation">📖</a> <a href="#design-LeonardSSH" title="Design">🎨</a> <a href="#ideas-LeonardSSH" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-LeonardSSH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-LeonardSSH" title="Maintenance">🚧</a> <a href="#plugin-LeonardSSH" title="Plugin/utility libraries">🔌</a> <a href="#talk-LeonardSSH" title="Talks">📢</a> <a href="#tutorial-LeonardSSH" title="Tutorials">✅</a> <a href="#example-LeonardSSH" title="Examples">💡</a></td>
    <td align="center"><a href="https://github.com/Vendicated"><img src="https://avatars.githubusercontent.com/u/45497981?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Ven</b></sub></a><br /><a href="https://github.com/LeonardSSH/coc-discord-rpc/commits?author=Vendicated" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[coc-cord]: https://github.com/dakyskye/coc-cord
[discord-vscode]: https://github.com/iCrawl/discord-vscode/
[vscode-discord]: https://github.com/Satoqz/vscode-discord
[coc-explorer]: https://github.com/weirongxu/coc-explorer

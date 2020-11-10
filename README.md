<p align="center">
    <img src="https://i.imgur.com/eNbd9uD.png" alt="Icon" align="center" width="256">
<p>

<h3 align="center">
    😎 An awesome coc-extension to get Discord Rich Presence integration with <a href="https://neovim.io/"><b>NeoVim</b></a>.
</h3>

---

Remember to 🌟 this Github if you 💖 it.

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

[![npm](https://img.shields.io/npm/v/coc-discord-rpc?color=crimson&logo=npm&style=flat-square)](https://www.npmjs.com/package/coc-discord-rpc)

> NOTE: Much of the code in this repository is inspired and based on the ideas from [coc-cord] & [discord-vscode].

## 📌 Features

-   Shows what you are working on in NeoVim
-   Respects Discords 15sec limit when it comes to updating your status
-   Support for over 130+ of the most popular languages
-   Custom string support

## 📥 Installation

### Prerequisites

-   [NeoVim](https://neovim.io/) - hyperextensible Vim-based text editor
-   [coc.nvim](https://github.com/neoclide/coc.nvim) - Intellisense engine for Vim8 & Neovim

### Install

```
:CocInstall coc-discord-rpc
```

## 🤖 Commands

| Command          | Description                          |
| ---------------- | ------------------------------------ |
| `rpc.disconnect` | Disconnects you from Discord Gateway |
| `rpc.reconnect`  | Reconnects you to Discord Gateway    |
| `rpc.version`    | Returns extension's version          |

## 🔧 Settings

#### **rpc.id**
Application ID. Change only if you known exactly what you're doing.

Default: `768090036633206815`

#### **rpc.detailsEditing** 
Custom string for the details section of the rich presence

Default: `Editing {filename} {problems}`

- `{null}` will be replaced with an empty space
- `{filename}` will be replaced with the current file name
- `{workspace}` will be replaced with the current workspace name, if any
- `{currentcolumn}` will get replaced with the current column of the current line
- `{currentline}` will get replaced with the current line number
- `{totallines}` will get replaced with the total line number
- `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.detailsIdle**
Custom string for the details section of the rich presence when idling

Default: `Idling`

- `{null}` will be replaced with an empty space.

#### **rpc.lowerDetailsEditing**
Custom string for the state section of the rich presence

Default: `Workspace: {workspace}`

- `{null}` will be replaced with an empty space
- `{filename}` will be replaced with the current file name
- `{workspace}` will be replaced with the current workspace name, if any
- `{currentcolumn}` will get replaced with the current column of the current line
- `{currentline}` will get replaced with the current line number
- `{totallines}` will get replaced with the total line number
- `{problems}` will be replaced with the count of problems (warnings, errors) present in your workspace.

#### **rpc.lowerDetailsIdle**
Custom string for the state section of the rich presence when idling

Default: `Idling`

- `{null}` will be replaced with an empty space.

#### **rpc.largeImage**
Custom string for the largeImageText section of the rich presence

Default: `Editing a {LANG} file`

- `{lang}` will be replaced with the lowercased language ID
- `{Lang}` will be replaced with the language ID, first letter being uppercase
- `{LANG}` will be replaced with the uppercased language ID.

#### **rpc.largeImageIdle**
Custom string for the largeImageText section of the rich presence when idling

Default: `Idling`

#### **rpc.smallImage**
Custom string for the smallImageText section of the rich presence

Default: `{appname}`

- `{appname}` will get replaced with NeoVim text.

#### **rpc.showProblems**
Controls if the RPC should show the count of problems (warnings, errors) present in your workspace.

Default: `true`

#### **rpc.problemsText**
Custom string of the text displaying the amount of problems in your workspace

Default: `- {count} problems found`

- `{count}` will be replaced by the respective amount of problems.

## 🚧 WIP

![a1](https://i.imgur.com/cx7kcoN.png)
![a2](https://i.imgur.com/9xuxuos.png)
![a3](https://i.imgur.com/FnGi6EU.png)

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
    <td align="center"><a href="https://github.com/LeonardSSH"><img src="https://avatars1.githubusercontent.com/u/35312043?v=4" width="100px;" alt=""/><br /><sub><b>Narcis B.</b></sub></a><br /><a href="https://github.com/LeonardSSH/coc-discord-rpc/commits?author=LeonardSSH" title="Code">💻</a> <a href="https://github.com/LeonardSSH/coc-discord-rpc/commits?author=LeonardSSH" title="Documentation">📖</a> <a href="#design-LeonardSSH" title="Design">🎨</a> <a href="#ideas-LeonardSSH" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-LeonardSSH" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-LeonardSSH" title="Maintenance">🚧</a> <a href="#plugin-LeonardSSH" title="Plugin/utility libraries">🔌</a> <a href="#talk-LeonardSSH" title="Talks">📢</a> <a href="#tutorial-LeonardSSH" title="Tutorials">✅</a> <a href="#example-LeonardSSH" title="Examples">💡</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

[coc-cord]: https://github.com/dakyskye/coc-cord
[discord-vscode]: https://github.com/iCrawl/discord-vscode/

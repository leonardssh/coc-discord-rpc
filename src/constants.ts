export const EMPTY = "" as const;
export const FAKE_EMPTY = "\u200b\u200b" as const;

export const IDLE_IMAGE_KEY = "idle" as const;
export const NEOVIM_IMAGE_KEY = "neovim-logo" as const;
export const NEOVIM_IDLE_IMAGE_KEY = "idle-neovim" as const;

export const SEND_ACTIVITY_TIMEOUT = 5000;

export const enum REPLACE_KEYS {
    AppName = "{app_name}",
    AppVersion = "{app_version}",
    Empty = "{empty}",
    FileName = "{file_name}",
    LanguageLowerCase = "{lang}",
    LanguageTitleCase = "{Lang}",
    LanguageUpperCase = "{LANG}",
    TotalLines = "{total_lines}",
    CurrentLine = "{current_line}",
    CurrentColumn = "{current_column}",
    ProblemsCount = "{count}",
    Problems = "{problems}",
    WorkspaceFolder = "{workspace_folder}"
}

export const enum CONFIG_KEYS {
    ClientId = "clientId",
    Enabled = "enabled",
    DetailsEditing = "detailsEditing",
    DetailsViewing = "detailsViewing",
    DetailsIdling = "detailsIdling",
    LowerDetailsEditing = "lowerDetailsEditing",
    LowerDetailsViewing = "lowerDetailsViewing",
    LowerDetailsIdling = "lowerDetailsIdling",
    LowerDetailsNotFound = "lowerDetailsNotFound",
    LargeImage = "largeImage",
    LargeImageIdling = "largeImageIdling",
    SmallImage = "smallImage",
    ShowProblems = "showProblems",
    ProblemsText = "problemsText",
    WorkspaceElapsedTime = "workspaceElapsedTime",
    IgnoreWorkspaces = "ignoreWorkspaces",
    SuppressNotifications = "suppressNotifications",
    ButtonEnabled = "buttonEnabled",
    ButtonActiveLabel = "buttonActiveLabel",
    ButtonInactiveLabel = "buttonInactiveLabel",
    ButtonInactiveUrl = "buttonInactiveUrl",
    CheckIdle = "checkIdle",
    IdleTimeout = "idleTimeout",
    IdleText = "idleText"
}

import { Document, workspace, WorkspaceConfiguration } from "coc.nvim";
import gitUrlParse from "git-url-parse";
import { exec } from "child_process";
import { promisify } from "util";
import { basename } from "path";
import icon from "./icons.json";

const asyncExec = promisify(exec);

interface WorkspaceExtensionConfiguration extends WorkspaceConfiguration {
    enabled: boolean;
    suppressNotifications: boolean;
    clientId: string;
    detailsEditing: string;
    detailsViewing: string;
    detailsIdling: string;
    lowerDetailsEditing: string;
    lowerDetailsViewing: string;
    lowerDetailsIdling: string;
    lowerDetailsNotFound: string;
    largeImage: string;
    largeImageIdling: string;
    smallImage: string;
    showProblems: boolean;
    problemsText: string;
    workspaceElapsedTime: boolean;
    ignoreWorkspaces: string[];
    buttonEnable: boolean;
    buttonActiveLabel: string;
    buttonInactiveLabel: string;
    buttonInactiveUrl: string;
}

export function getConfig(): WorkspaceExtensionConfiguration {
    return workspace.getConfiguration("rpc") as WorkspaceExtensionConfiguration;
}

export async function getGitRepo(): Promise<string | null> {
    try {
        const isInit = await asyncExec("git rev-parse --git-dir");

        if (!isInit.stdout.trim()) return null;

        const remoteUrl = await asyncExec("git config --get remote.origin.url");

        if (!remoteUrl.stdout) return null;

        return gitUrlParse(remoteUrl.stdout).toString("https").replace(".git", "");
    } catch {
        return null;
    }
}

const knownExtensions: { [key: string]: { image: string } } = icon.knownExtensions;
const knownLanguages: string[] = icon.knownLanguages;

export function resolveFileIcon(document: Document): string {
    const filename = basename(document.uri);
    const { languageId } = document.textDocument;

    const icon =
        knownExtensions[
            Object.keys(knownExtensions).find((key) => {
                if (filename.endsWith(key)) return true;

                const match = /^\/(.*)\/([mgiy]+)$/.exec(key);
                if (!match) return false;

                const regex = new RegExp(match[1], match[2]);
                return regex.test(filename);
            })!
        ] ?? (knownLanguages.includes(languageId) ? languageId : null);

    return icon ? icon.image ?? icon : "text";
}

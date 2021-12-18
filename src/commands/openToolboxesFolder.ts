import * as vscode from "vscode";
import { safeGetGlobalStorageUri } from "../share";

const openToolboxesFolder = async (): Promise<boolean> => {
  vscode.commands.executeCommand(
    "vscode.openFolder",
    await safeGetGlobalStorageUri()
  );

  return true;
};

export default openToolboxesFolder;

export const openToolboxesFolderCommandId = "toolboxes.openToolboxesFolder";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      openToolboxesFolderCommandId,
      openToolboxesFolder
    )
  );
};

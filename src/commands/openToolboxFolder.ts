import * as vscode from "vscode";
import { safeGetGlobalStorageUri } from "../share";

export default async (): Promise<boolean> => {
  vscode.commands.executeCommand(
    "vscode.openFolder",
    await safeGetGlobalStorageUri()
  );

  return true;
};

export const openToolboxesFolderCommandId = "toolboxes.openToolboxesFolder";

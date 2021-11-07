import * as vscode from "vscode";
import { toolboxesService } from "../extension";

export default async (toolboxUri: vscode.Uri): Promise<boolean> => {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select toolbox",
    filters: {
      "All files": ["*"],
    },
  };

  const fileUris = await vscode.window.showOpenDialog(options);
  const fileUri = fileUris?.[0];
  if (fileUri) {
    await toolboxesService.addToolbox({
      path: fileUri.fsPath,
    });
  }

  return true;
};

export const addToolboxCommandId = "toolboxes.addToolbox";

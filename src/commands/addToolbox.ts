import * as vscode from "vscode";
import { toolboxesService } from "../extension";

const addToolbox = async (toolboxUri: vscode.Uri): Promise<boolean> => {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    openLabel: "Select toolbox",
    filters: {
      "All files": ["*"],
    },
  };

  const fileUris = await vscode.window.showOpenDialog(options);
  const fileUri = fileUris?.[0];

  // tool
  if (fileUri) {
    await toolboxesService.addTool(fileUri.fsPath);
  }

  return true;
};

export default addToolbox;

export const addToolboxCommandId = "toolboxes.addToolbox";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(addToolboxCommandId, addToolbox)
  );
};

import * as vscode from "vscode";
import { toolboxesView } from "../extension";

const refreshToolboxes = async (): Promise<boolean> => {
  toolboxesView.refresh();
  return true;
};

export default refreshToolboxes;

export const refreshToolboxesCommandId = "toolboxes.refreshToolboxes";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(refreshToolboxesCommandId, refreshToolboxes)
  );
};

import * as vscode from "vscode";
import { optionsView } from "../extension";

const refreshOptions = async (): Promise<boolean> => {
  optionsView.refresh();
  return true;
};

export default refreshOptions;

export const refreshOptionsCommandId = "toolboxes.refreshOptions";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(refreshOptionsCommandId, refreshOptions)
  );
};

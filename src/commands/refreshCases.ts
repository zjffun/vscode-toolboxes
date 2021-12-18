import * as vscode from "vscode";
import { casesView } from "../extension";

const refreshCases = async (): Promise<boolean> => {
  casesView.refresh();
  return true;
};

export default refreshCases;

export const refreshCasesCommandId = "toolboxes.refreshCases";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(refreshCasesCommandId, refreshCases)
  );
};

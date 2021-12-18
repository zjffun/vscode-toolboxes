import * as vscode from "vscode";
import { toolboxesService } from "../extension";

const runTool = async (): Promise<boolean> => {
  return toolboxesService.runTool({ run: true });
};

export default runTool;

export const runToolCommandId = "toolboxes.runTool";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(runToolCommandId, runTool)
  );
};

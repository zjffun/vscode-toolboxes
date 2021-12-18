import * as vscode from "vscode";
import { ITool } from "..";
import { showInputDoc } from "../core/input";

const showTool = async (
  tool: ITool
): Promise<vscode.TextEditor | undefined> => {
  try {
    if (!tool.uri) {
      return undefined;
    }

    await vscode.commands.executeCommand("toolboxes.showOutput");

    const uri = tool.uri;

    return await showInputDoc(uri);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export default showTool;

export const showToolCommandId = "_toolboxes.showTool";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(showToolCommandId, showTool)
  );
};

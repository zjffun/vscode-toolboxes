import * as vscode from "vscode";
import { ITool } from "..";
import { showInputDoc } from "../core/input";
import { casesService } from "../extension";
import { showCaseCommandId } from "./showCase";
import { showOutputCommandId } from "./showOutput";

const showTool = async (
  tool: ITool
): Promise<vscode.TextEditor | undefined> => {
  try {
    if (!tool.uri) {
      return undefined;
    }

    const builtinToolCase = (await casesService.getBuiltinCases(tool.uri))?.[0];
    if (builtinToolCase) {
      return await vscode.commands.executeCommand(
        showCaseCommandId,
        builtinToolCase
      );
    }

    await vscode.commands.executeCommand(showOutputCommandId);

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

import * as vscode from "vscode";
import { IToolCase } from "..";

const deleteCase = async (toolCase: IToolCase): Promise<boolean> => {
  await vscode.workspace.fs.delete(toolCase.uri);
  return true;
};

export default deleteCase;

export const deleteCaseCommandId = "_toolboxes.deleteCase";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(deleteCaseCommandId, deleteCase)
  );
};

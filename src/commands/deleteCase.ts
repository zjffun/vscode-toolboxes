import * as vscode from "vscode";
import { IToolCase } from "..";

export default async (toolCase: IToolCase): Promise<boolean> => {
  await vscode.workspace.fs.delete(toolCase.uri);
  return true;
};

export const deleteCaseCommandId = "_toolboxes.deleteCase";

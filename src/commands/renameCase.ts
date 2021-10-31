import * as vscode from "vscode";
import { IToolCase } from "..";
import { casesService, casesView } from "../extension";

export default async (toolCase: IToolCase, name?: string): Promise<boolean> => {
  const { uri } = toolCase;
  let _name = name;
  if (_name === undefined || typeof _name !== "string") {
    // TODO: set default value
    _name = await casesService.caseNameInputBox(uri);
  }

  if (!_name) {
    return false;
  }

  try {
    await vscode.workspace.fs.rename(
      uri,
      vscode.Uri.joinPath(uri, "..", _name)
    );
  } catch (error) {
    console.error(error);
    return false;
  }

  casesView.refresh();

  return true;
};

export const renameCaseCommandId = "_toolboxes.renameCase";

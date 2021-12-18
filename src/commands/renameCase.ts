import * as vscode from "vscode";
import { IToolCase } from "..";
import { casesService } from "../extension";
import { stringifyQuery } from "../share";
import refreshCases from "./refreshCases";

const renameCase = async (
  toolCase: IToolCase,
  name?: string
): Promise<boolean> => {
  const { uri } = toolCase;
  let _name = name;
  if (_name === undefined || typeof _name !== "string") {
    _name = await casesService.caseNameInputBox(uri, toolCase.label);
  }

  if (!_name) {
    return false;
  }

  try {
    toolCase.uri = uri.with({ query: stringifyQuery({ case: _name }) });
    await casesService.deleteDiskCase(uri);
    await casesService.upsertDiskCase(toolCase);

    await refreshCases();
  } catch (error) {
    console.error(error);
    return false;
  }

  return true;
};

export default renameCase;

export const renameCaseCommandId = "_toolboxes.renameCase";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(renameCaseCommandId, renameCase)
  );
};

import * as vscode from "vscode";
import { IToolCase } from "..";
import { CaseType } from "../enum";
import { casesService } from "../extension";

/**
 * run case
 * @param arg1
 *   1. from editor/title is vscode.Uri
 *   2. from view/item/context is IToolCase
 *   3. from commandPalette is undefined
 */
const runCase = async (arg1?: IToolCase | vscode.Uri): Promise<boolean> => {
  if ((arg1 as IToolCase)?.uri) {
    const toolCase: IToolCase = arg1 as any;

    if (toolCase?.type === CaseType.BUILTIN) {
      casesService.upsertMemoryCase(toolCase);
    }

    if (toolCase) {
      casesService.setCurrentCase(toolCase);
    }
  }

  return casesService.execCurrentCase({ run: true });
};

export default runCase;

export const runCaseCommandId = "toolboxes.runCase";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(runCaseCommandId, runCase)
  );
};

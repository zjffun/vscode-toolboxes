import * as vscode from "vscode";
import { showOutput } from ".";
import { IToolCase } from "..";
import { showInputDoc } from "../core/input";
import { CaseType } from "../enum";
import { casesService } from "../extension";
import { writeTextDocument } from "../share";

const showCase = async (
  toolCase: IToolCase
): Promise<vscode.TextEditor | undefined> => {
  try {
    if (toolCase.type === CaseType.BUILTIN) {
      casesService.upsertMemoryCase(toolCase);
    }

    const editor = await showInputDoc(toolCase.uri);

    await vscode.commands.executeCommand(showOutput.showOutputCommandId);

    await showInputDoc(toolCase.uri);

    await writeTextDocument(editor.document, toolCase.content || "", {
      save: false,
    });

    return editor;
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export default showCase;

export const showCaseCommandId = "_toolboxes.showCase";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(showCaseCommandId, showCase)
  );
};

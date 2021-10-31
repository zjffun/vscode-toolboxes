import * as vscode from "vscode";
import { casesService, toolboxesService } from "../extension";
import { context } from "../share";
import { getActiveInputDoc } from "./input";

export const outputScheme = "toolboxes-output";

export async function writeOutput() {
  const doc = getActiveInputDoc();
  if (!doc) {
    return;
  }

  const toolCase = casesService.currentToolCase;
  if (!toolCase) {
    return;
  }
  const tool = await toolboxesService.getToolByCaseUri(toolCase.uri);
  if (tool) {
    const optionValues = (await casesService.getCaseByUri(doc.uri))
      ?.optionValues;
    try {
      const { tools } = require(tool.main.replace(
        "$(extensionPath)",
        context.extensionPath
      ));
      const toolFn = tools[tool.name];
      writeOutputTextDocument(await toolFn(doc.getText(), optionValues));
    } catch (error) {
      console.error(error);
    }
  }
}

export const writeOutputTextDocument = async (text: string) => {
  const outputTextDocument = await vscode.workspace.openTextDocument(
    vscode.Uri.file("Tool Output").with({ scheme: "toolboxes-output" })
  );

  const workspaceEdit = new vscode.WorkspaceEdit();

  // Just replace the entire document every time for this example extension.
  // A more complete extension should compute minimal edits instead.
  workspaceEdit.replace(
    outputTextDocument.uri,
    new vscode.Range(0, 0, outputTextDocument.lineCount, 0),
    text
  );

  return vscode.workspace.applyEdit(workspaceEdit);
};

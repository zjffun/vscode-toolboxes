import * as vscode from "vscode";
import { casesService, toolboxesService } from "../extension";
import { getActiveInputDoc } from "./input";

export const outputScheme = "toolboxes-output";

export async function writeOutput({ forceRun }: { forceRun?: boolean } = {}) {
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
    if (tool.autoRun || forceRun) {
      const optionValues = (await casesService.getCaseByUri(doc.uri))
        ?.optionValues;
      try {
        const { output } = await toolboxesService.importTool(tool);
        const result = await output({
          input: doc.getText(),
          options: optionValues,
          tool,
          require,
        });
        writeOutputTextDocument(result);
      } catch (error) {
        console.error(error);
      }
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

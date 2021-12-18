import * as vscode from "vscode";

export const outputScheme = "toolboxes-output";

export const outputUri = vscode.Uri.from({
  path: "/Tool Output",
  scheme: "toolboxes-output",
});

export let outputDoc: vscode.TextDocument | undefined;

export async function showOutputDoc() {
  outputDoc = await vscode.workspace.openTextDocument(outputUri);

  const editor = await vscode.window.showTextDocument(outputDoc, {
    viewColumn: vscode.ViewColumn.Two,
    preview: false,
  });

  return editor;
}

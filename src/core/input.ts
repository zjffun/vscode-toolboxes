import * as vscode from "vscode";

export const inputScheme = "toolboxes-input";

export async function showInputDoc(uri: vscode.Uri) {
  const input = await vscode.workspace.openTextDocument(uri);

  const editor = await vscode.window.showTextDocument(input, {
    viewColumn: vscode.ViewColumn.One,
    preview: false,
  });

  return editor;
}

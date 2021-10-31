import * as vscode from "vscode";

export const inputScheme = "toolboxes-input";

export function getActiveInputDoc() {
  const activeDoc = vscode.window.activeTextEditor?.document;

  if (activeDoc && activeDoc.uri.scheme === inputScheme) {
    return activeDoc;
  }

  return undefined;
}

export async function showInput(uri: vscode.Uri) {
  const input = await vscode.workspace.openTextDocument(uri);

  const editor = await vscode.window.showTextDocument(input, {
    viewColumn: vscode.ViewColumn.One,
    preview: false,
  });

  return editor;
}

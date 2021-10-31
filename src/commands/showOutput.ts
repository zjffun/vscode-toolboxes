import * as vscode from "vscode";

export default async (): Promise<vscode.TextEditor | undefined> => {
  try {
    const outputTextDocument = await vscode.workspace.openTextDocument(
      vscode.Uri.from({
        path: "/Tool Output",
        scheme: "toolboxes-output",
      })
    );

    return vscode.window.showTextDocument(outputTextDocument, {
      viewColumn: vscode.ViewColumn.Two,
      preview: false,
    });
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const showOutputCommandId = "toolboxes.showOutput";

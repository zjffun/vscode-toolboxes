import * as vscode from "vscode";
import { IQuery } from "..";
import { inputScheme } from "../core/input";
import { stringifyQuery } from "../share";

export const testWorkspaceRoot = <vscode.Uri>(
  vscode.workspace.workspaceFolders?.[0]?.uri
);

export const testWorkspaceFolder = vscode.Uri.joinPath(
  testWorkspaceRoot,
  "test"
);

let fileIndex = 0;
export async function createTestFile(
  content: string = "",
  { filename }: { filename?: string } = {}
) {
  const uri = vscode.Uri.joinPath(
    testWorkspaceFolder,
    filename === undefined ? `${fileIndex++}.temp` : filename
  );
  await writeFile(uri, content);
  return uri;
}

export async function createFile(filename: string, content: string) {
  const uri = vscode.Uri.joinPath(testWorkspaceRoot, filename);
  await writeFile(uri, content);
  return uri;
}

export async function writeFile(uri: vscode.Uri, content: string) {
  await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
}

export async function writeTextDocument(
  textDocument: vscode.TextDocument,
  content: string
) {
  const workspaceEdit = new vscode.WorkspaceEdit();

  workspaceEdit.replace(
    textDocument.uri,
    new vscode.Range(0, 0, textDocument.lineCount, 0),
    content
  );

  const res = await vscode.workspace.applyEdit(workspaceEdit);

  if (!res) {
    throw Error("applyEdit failed");
  }

  await textDocument.save();
}

export async function closeAllEditors() {
  return vscode.commands.executeCommand("workbench.action.closeAllEditors");
}

export async function resetTestWorkspace() {
  try {
    await vscode.workspace.fs.delete(testWorkspaceFolder, { recursive: true });
  } catch {
    // ok if file doesn't exist
  }
  await vscode.workspace.fs.createDirectory(testWorkspaceFolder);
}

export const createInputUri = (path: string, query?: IQuery): vscode.Uri => {
  return vscode.Uri.from({
    scheme: inputScheme,
    path: path,
    query: stringifyQuery(query || {}),
  });
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

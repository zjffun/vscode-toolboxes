import * as vscode from "vscode";
import { IQuery } from "..";
import { inputScheme } from "../core/input";
import { stringifyQuery } from "../share";

export const toolbox1Url = "./src/test/toolboxes-test/toolbox1";

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

export const builtinInputUri = createInputUri("/builtin/web/url-encode", {});

export const createToolbox1InputUri = (
  path: string,
  query?: IQuery
): vscode.Uri => {
  const encodedToolbox1URL = encodeURIComponent(toolbox1Url);
  return vscode.Uri.from({
    scheme: inputScheme,
    path: `/${encodedToolbox1URL}${path}`,
    query: stringifyQuery(query || {}),
  });
};

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

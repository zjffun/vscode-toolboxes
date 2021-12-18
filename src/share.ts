import * as qs from "qs";
import * as vscode from "vscode";
import { IQuery } from ".";

export let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => (context = c);

export const safeGetGlobalStorageUri = async () => {
  await vscode.workspace.fs.createDirectory(context.globalStorageUri);
  return context.globalStorageUri;
};

export const safeReadFileContent = async (
  uri: vscode.Uri,
  defaultContent = ""
) => {
  try {
    const content = (await vscode.workspace.fs.readFile(uri)).toString();
    if (content !== "") {
      return content;
    }
    return defaultContent;
  } catch (error) {
    return defaultContent;
  }
};

export const safeJSONparse = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    return undefined;
  }
};

export const parseQuery = (query: string): IQuery => {
  return qs.parse(query);
};

export const stringifyQuery = (query: IQuery): string => {
  return qs.stringify(query);
};

export async function writeTextDocument(
  textDocument: vscode.TextDocument,
  content: string,
  { save }: { save?: boolean } = {}
) {
  const workspaceEdit = new vscode.WorkspaceEdit();

  workspaceEdit.replace(
    textDocument.uri,
    new vscode.Range(0, 0, textDocument.lineCount, 0),
    content
  );

  const res = await vscode.workspace.applyEdit(workspaceEdit);

  if (!res) {
    console.error("applyEdit failed", { textDocument, content });
    throw Error("applyEdit failed");
  }

  if (save) {
    await textDocument.save();
  }
}

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

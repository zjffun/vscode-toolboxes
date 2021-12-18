import * as vscode from "vscode";
import { showOutputDoc } from "../core/output";

const showOutput = async (): Promise<vscode.TextEditor | undefined> => {
  try {
    return await showOutputDoc();
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export default showOutput;

export const showOutputCommandId = "toolboxes.showOutput";

export const regist = (context: vscode.ExtensionContext) => {
  context.subscriptions.push(
    vscode.commands.registerCommand(showOutputCommandId, showOutput)
  );
};

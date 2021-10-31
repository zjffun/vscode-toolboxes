import * as vscode from "vscode";
import { IToolCase } from "..";
import { showInput } from "../core/input";
import { ToolCaseStoreType, ToolCaseType } from "../enum";
import { stringifyQuery } from "../share";

export default async (
  toolCase: IToolCase
): Promise<vscode.TextEditor | undefined> => {
  try {
    await vscode.commands.executeCommand("toolboxes.showOutput");

    const uri = toolCase.uri.with({
      query: stringifyQuery({
        type: ToolCaseType.TOOLCASE,
        storeType: ToolCaseStoreType.MENORY,
      }),
    });

    return await showInput(uri);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const showCaseCommandId = "_toolboxes.showCase";

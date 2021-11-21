import * as vscode from "vscode";
import { ITool } from "..";
import { showInput } from "../core/input";
import { ToolCaseStoreType, ToolCaseType } from "../enum";
import { toolboxesService } from "../extension";
import { stringifyQuery } from "../share";

export default async (tool: ITool): Promise<vscode.TextEditor | undefined> => {
  try {
    await vscode.commands.executeCommand("toolboxes.showOutput");

    const uri = toolboxesService.getToolCaseUri(tool, {
      query: stringifyQuery({
        type: ToolCaseType.TOOL,
        storeType: ToolCaseStoreType.MENORY,
      }),
    });

    return await showInput(uri);
  } catch (error) {
    console.error(error);
  }
  return undefined;
};

export const showToolCommandId = "_toolboxes.showTool";

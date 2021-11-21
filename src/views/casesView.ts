import * as vscode from "vscode";
import { IToolCase } from "..";
import { casesService, toolboxesService } from "../extension";
import { context } from "../share";

export default class CasesView implements vscode.TreeDataProvider<IToolCase> {
  protected _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

  public static viewId = "toolboxes-activitybarView-casesView";
  public static treeItemId = `${CasesView.viewId}-treeItem`;

  protected toolboxesService = toolboxesService;

  protected context = context;

  constructor() {
    vscode.window.createTreeView(CasesView.viewId, {
      treeDataProvider: this,
      showCollapseAll: true,
    });
  }

  public refresh(): any {
    this._onDidChangeTreeData.fire(null);
  }

  public getTreeItem(element: IToolCase): vscode.TreeItem {
    const showCaseCommand = {
      command: "_toolboxes.showCase",
      title: "",
      arguments: [element],
    };

    return {
      label: element.label,
      command: showCaseCommand,
      collapsibleState: undefined,
      resourceUri: element.uri,
      contextValue: CasesView.treeItemId,
    };
  }

  public async getChildren(element?: IToolCase): Promise<IToolCase[]> {
    if (element) {
      return [];
    }
    const toolCase = await casesService.currentToolCase;
    if (!toolCase) {
      return [];
    }
    const tool = await toolboxesService.getToolByCaseUri(toolCase.uri);
    if (!tool || !tool.uri) {
      return [];
    }

    return casesService.getCasesByToolUri(tool.uri);
  }
}

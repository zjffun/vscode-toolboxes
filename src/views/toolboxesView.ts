import * as vscode from "vscode";
import { ITool } from "..";
import { ToolboxesService } from "../core/toolboxesService";
import { context } from "../share";

export default class ToolboxesView implements vscode.TreeDataProvider<ITool> {
  protected _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

  public static viewId = "toolboxes-activitybarView-toolboxesView";

  protected toolboxesService = new ToolboxesService();

  protected context: vscode.ExtensionContext;

  constructor() {
    this.context = context;

    vscode.window.createTreeView(ToolboxesView.viewId, {
      treeDataProvider: this,
      showCollapseAll: true,
    });
  }

  public refresh(): any {
    this._onDidChangeTreeData.fire(null);
  }

  public getTreeItem(element: ITool): vscode.TreeItem {
    const isContainer = element.children || element.type === "toolbox";

    const showToolCommand = {
      command: "_toolboxes.showTool",
      title: "",
      arguments: [element],
    };

    return {
      label: element.label,
      command: !isContainer ? showToolCommand : undefined,
      collapsibleState: isContainer
        ? vscode.TreeItemCollapsibleState.Collapsed
        : undefined,
      resourceUri: element.uri,
    };
  }

  public getChildren(element?: ITool): ITool[] | Thenable<ITool[]> {
    return element
      ? this.getTreeElement(element)
      : this.toolboxesService.getToolboxes();
  }

  protected getTreeElement = async (element: ITool) => {
    if (!element?.children) {
      return [];
    }

    return element.children;
  };
}

import * as vscode from "vscode";
import { ITool, IToolContainer } from "..";
import { ToolboxesService } from "../core/toolboxesService";

export default class ToolboxesView
  implements vscode.TreeDataProvider<ITool | IToolContainer>
{
  protected _onDidChangeTreeData: vscode.EventEmitter<any> =
    new vscode.EventEmitter<any>();
  readonly onDidChangeTreeData: vscode.Event<any> =
    this._onDidChangeTreeData.event;

  public static viewId = "toolboxes-activitybarView-toolboxesView";

  protected toolboxesService = new ToolboxesService();

  protected context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;

    vscode.window.createTreeView(ToolboxesView.viewId, {
      treeDataProvider: this,
      showCollapseAll: true,
    });
  }

  public refresh(): any {
    this._onDidChangeTreeData.fire(null);
  }

  public getTreeItem(element: ITool | IToolContainer): vscode.TreeItem {
    const { children: isContainer } = <IToolContainer>element;

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

  public getChildren(
    element?: ITool | IToolContainer
  ): (ITool | IToolContainer)[] | Thenable<(ITool | IToolContainer)[]> {
    return element
      ? this.getTreeElement(element)
      : this.toolboxesService.getToolboxesTree();
  }

  protected getTreeElement = (element: ITool | IToolContainer) => {
    const _element = <IToolContainer>element;

    if (!_element?.children) {
      return [];
    }

    return _element.children;
  };
}

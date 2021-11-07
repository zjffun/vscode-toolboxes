import * as path from "path";
import * as vscode from "vscode";
import { ITool, IToolboxMetadata, IToolContainer } from "..";
import { ToolCaseType } from "../enum";
import { casesService } from "../extension";
import {
  context,
  parseQuery,
  safeGetGlobalStorageUri,
  safeReadFileContent,
} from "../share";
import { inputScheme } from "./input";

export class ToolboxesService {
  private toolboxesUri: Promise<vscode.Uri>;
  constructor({ toolboxesUri }: { toolboxesUri?: vscode.Uri } = {}) {
    this.toolboxesUri = this.getToolboxesUri(toolboxesUri);
  }
  private currentTool: ITool | null = null;

  setCurrentTool(tool: ITool): void {
    this.currentTool = tool;
  }

  getCurrentTool() {
    return this.currentTool;
  }

  async getToolboxesUri(toolboxesUri?: vscode.Uri) {
    if (toolboxesUri) {
      return toolboxesUri;
    }

    const globalStorageUri = await safeGetGlobalStorageUri();

    return vscode.Uri.joinPath(globalStorageUri, "toolboxes.json");
  }

  async getToolboxesMetadata(): Promise<IToolboxMetadata[]> {
    const toolboxesUri = await this.toolboxesUri;
    let toolboxesJSONContent = await safeReadFileContent(toolboxesUri);

    if (!toolboxesJSONContent) {
      const defaultToolboxesJSONContent = await vscode.workspace.fs.readFile(
        vscode.Uri.joinPath(context.extensionUri, "toolboxes.json")
      );
      await vscode.workspace.fs.writeFile(
        toolboxesUri,
        defaultToolboxesJSONContent
      );
      toolboxesJSONContent = defaultToolboxesJSONContent.toString();
    }

    const toolboxes = JSON.parse(toolboxesJSONContent);

    return toolboxes;
  }

  async getToolByCaseUri(caseUri: vscode.Uri): Promise<ITool | undefined> {
    const query = parseQuery(caseUri.query);

    let toolPath;
    if (query.type === ToolCaseType.TOOL) {
      toolPath = caseUri.path;
    } else {
      toolPath = casesService.getToolUri(caseUri).path;
    }

    const toolboxesTree = await this.getToolboxesTree();
    for (const toolbox of toolboxesTree) {
      if (toolbox.children) {
        for (const t of toolbox.children) {
          const _t = t as ITool;
          if (_t.uri.path === toolPath) {
            return _t;
          }
        }
      }
    }
    return undefined;
  }

  getToolFilePath(mainPath: string, toolboxUri: vscode.Uri) {
    return path.resolve(
      toolboxUri.fsPath,
      "../",
      mainPath.replace("$(extensionPath)", context.extensionPath)
    );
  }

  async getToolbox(toolboxMetadata: IToolboxMetadata): Promise<IToolContainer> {
    const uri = vscode.Uri.file(
      toolboxMetadata.path.replace("$(extensionPath)", context.extensionPath)
    );

    let toolbox: IToolContainer;

    const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();

    const toolboxJSON = JSON.parse(fileContent);

    const toolboxUri = vscode.Uri.from({
      scheme: inputScheme,
      path: `/${toolboxJSON.name}`,
    });

    toolbox = {
      name: toolboxJSON.name,
      label: toolboxJSON.label,
      uri: toolboxUri,
      children: toolboxJSON.tools?.map?.((tool: ITool) => {
        const { name, label, options, optionCategories } = tool;
        return {
          ...tool,
          name,
          label,
          uri: vscode.Uri.joinPath(toolboxUri, name),
          optionCategories,
          options,
          main: this.getToolFilePath(toolboxJSON.main, uri),
        };
      }),
    };

    return toolbox;
  }

  async getToolboxesTree(): Promise<IToolContainer[]> {
    const toolboxesTree: IToolContainer[] = [];

    const toolboxConfigs = await this.getToolboxesMetadata();

    for (const toolboxConfig of toolboxConfigs) {
      try {
        const toolbox = await this.getToolbox(toolboxConfig);
        toolboxesTree.push(toolbox);
      } catch (error) {
        console.error(error);
      }
    }

    return toolboxesTree;
  }

  async addToolbox(
    toolboxMetadata: IToolboxMetadata
  ): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesUri;
    const toolboxes = await this.getToolboxesMetadata();
    toolboxes.push(toolboxMetadata);

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }

  async deleteToolbox(
    toolboxMetadata: IToolboxMetadata
  ): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesUri;
    let toolboxes = await this.getToolboxesMetadata();
    toolboxes = toolboxes.filter(
      (toolbox) => toolbox.path !== toolboxMetadata.path
    );

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }
}

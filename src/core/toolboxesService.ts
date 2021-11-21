import * as fse from "fs-extra";
import * as path from "path";
import * as vscode from "vscode";
import { ITool, IToolboxMetadata, IToolConfig } from "..";
import {
  context,
  safeGetGlobalStorageUri,
  safeJSONparse,
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

  async getToolboxesConfig(): Promise<IToolboxMetadata[]> {
    const toolboxesUri = await this.toolboxesUri;
    let toolboxesJSONContent = await safeReadFileContent(toolboxesUri);

    if (!toolboxesJSONContent) {
      toolboxesJSONContent = "[]";
      await vscode.workspace.fs.writeFile(
        toolboxesUri,
        Buffer.from(toolboxesJSONContent)
      );
      await this.addDefaultToolboxes();
      toolboxesJSONContent = await safeReadFileContent(toolboxesUri);
    }

    const toolboxes = JSON.parse(toolboxesJSONContent);

    return toolboxes;
  }

  async getToolboxes(): Promise<ITool[]> {
    const toolboxesConfig = await this.getToolboxesConfig();

    return toolboxesConfig.map((c) => {
      return {
        type: "toolbox",
        ...c,
      };
    });
  }

  async getToolboxConfigByUrl(
    url: string
  ): Promise<IToolboxMetadata | undefined> {
    let toolboxConfigs = await this.getToolboxesConfig();

    return toolboxConfigs.find((toolbox) => toolbox.url === url);
  }

  async getToolsByUrl(url: string): Promise<ITool[]> {
    const tools: ITool[] = [];

    await this.recursiveToolbox(url, (tool: ITool) => {
      tools.push(tool);
    });

    return tools;
  }

  async innerRecursiveToolbox(
    json: any,
    {
      url,
      main,
      fn,
    }: {
      url: string;
      main: string;
      fn?: any;
    }
  ) {
    let toolbox: ITool;

    let children;

    if (json.tools) {
      children = [];
      for (const toolConfig of json.tools) {
        toolbox = await this.innerRecursiveToolbox(toolConfig, {
          url,
          main,
          fn,
        });
        children.push(toolbox);
      }
    }

    toolbox = {
      ...json,
      url: json.url || url,
      main: json.main || main,
      children,
    };

    fn?.(toolbox);

    return toolbox;
  }

  async recursiveToolbox(url: string, fn: any) {
    const fileUri = await this.getToolboxJsonUri(url);
    const fileContent = await vscode.workspace.fs.readFile(fileUri);
    const json = safeJSONparse(fileContent.toString());

    await this.innerRecursiveToolbox(json, {
      url: json.url,
      main: json.main,
      fn,
    });
  }

  async getToolByUrlAndId(url: string, id: string) {
    const tools = await this.getToolsByUrl(url);

    return tools.find((tool) => tool.id === id);
  }

  async getToolboxJsonUri(url: string) {
    return vscode.Uri.joinPath(await this.getToolboxUri(url), "toolbox.json");
  }

  async getToolboxUri(url: string) {
    const toolboxesUri = await this.toolboxesUri;

    return vscode.Uri.joinPath(
      toolboxesUri,
      "../",
      "toolboxes",
      encodeURIComponent(url)
    );
  }

  getToolCaseUri(tool: ITool, other: any = {}) {
    let path = `/${encodeURIComponent(tool.url)}`;
    if (tool.id) {
      path += `/${tool.id}`;
    }
    return vscode.Uri.from({
      scheme: inputScheme,
      path,
      ...other,
    });
  }

  async importTool(tool: ITool) {
    if (!tool.url || !tool.main) {
      throw new Error(
        "Can't import tool. Url or main file of the tool isn't set."
      );
    }

    const toolUri = await this.getToolboxUri(tool.url);
    const toolMainUri = vscode.Uri.joinPath(toolUri, tool.main);

    return import(toolMainUri.fsPath);
  }

  async getToolByCaseUri(caseUri: vscode.Uri): Promise<ITool | undefined> {
    const paths = caseUri.path.split(path.sep);

    const toolUrl = decodeURIComponent(paths[1]);

    const toolboxConfig = await this.getToolboxConfigByUrl(toolUrl);

    if (!toolboxConfig) {
      return undefined;
    }

    if (toolboxConfig.type === "tool") {
      return this.importTool(toolboxConfig);
    }

    return await this.getToolByUrlAndId(toolboxConfig.url, paths[2]);
  }

  getToolFilePath(mainPath: string, toolboxUri: vscode.Uri) {
    return path.resolve(
      toolboxUri.fsPath,
      "../",
      mainPath.replace("$(extensionPath)", context.extensionPath)
    );
  }

  async getToolboxTree(url: string): Promise<ITool> {
    const uri = await this.getToolboxJsonUri(url);

    const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();

    const toolboxJSON = JSON.parse(fileContent);

    const toolbox = await this.innerRecursiveToolbox(toolboxJSON, {
      url: toolboxJSON.url,
      main: toolboxJSON.main,
    });

    return toolbox;
  }

  async getToolsetOrTool(
    tool: IToolConfig,
    url: string,
    main: string
  ): Promise<ITool> {
    const {
      url: toolUrl,
      main: toolMain,
      label,
      options,
      optionCategories,
    } = tool;
    const _url = toolUrl || url;
    const _main = toolMain || main;
    return {
      ...tool,
      url: _url,
      label,
      optionCategories,
      options,
      main: _main,
    };
  }

  // async getToolboxesTree(): Promise<ITool[]> {
  //   const toolboxesTree: ITool[] = [];

  //   const toolboxConfigs = await this.getToolboxConfigs();

  //   for (const toolboxConfig of toolboxConfigs) {
  //     try {
  //       const toolbox = await this.getTool(toolboxConfig.url);
  //       toolboxesTree.push(toolbox);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }

  //   return toolboxesTree;
  // }

  async addToolbox(
    toolboxMetadata: IToolboxMetadata
  ): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesUri;
    const toolboxes = await this.getToolboxesConfig();
    toolboxes.push(toolboxMetadata);

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }

  async deleteToolbox(url: string): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesUri;
    let toolboxes = await this.getToolboxesConfig();
    toolboxes = toolboxes.filter((toolbox) => toolbox.url !== url);

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }

  async addDefaultToolboxes(): Promise<boolean> {
    for (const toolboxDir of ["toolboxes/web", "toolboxes/conversion"]) {
      const url = path.join(context.extensionPath, toolboxDir);
      await this.addToolboxDir(url);
    }

    return true;
  }

  async addToolboxDir(url: string) {
    const fileUri = vscode.Uri.joinPath(vscode.Uri.parse(url), "toolbox.json");

    const fileContent = await vscode.workspace.fs.readFile(fileUri);

    const json = safeJSONparse(fileContent.toString());

    const _url = json.url || url;

    const destUri = await this.getToolboxUri(_url);

    fse.copySync(url, destUri.fsPath);

    await this.addToolbox({
      label: json.label,
      url: _url,
    });

    return true;
  }

  async addTool(url: string): Promise<boolean> {
    const res = await import(url);

    const toolboxesUri = await this.toolboxesUri;
    const toolboxes = await this.getToolboxesConfig();

    const uri = vscode.Uri.parse(url);

    const _url = res.url || url;

    const destUri = vscode.Uri.joinPath(
      toolboxesUri,
      `../toolboxes/${encodeURIComponent(_url)}`
    );

    vscode.workspace.fs.copy(uri, destUri);

    toolboxes.push({
      type: "tool",
      label: res.label,
      url: _url,
    });

    return true;
  }
}

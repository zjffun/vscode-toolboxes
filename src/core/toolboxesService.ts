import * as vscode from "vscode";
import { ITool, IToolboxConfig } from "..";
import {
  context,
  safeGetGlobalStorageUri,
  safeJSONparse,
  safeReadFileContent,
} from "../share";
import { inputScheme } from "./input";

const builtinToolboxNames = [
  "web",
  "conversion",
  "video",
  "image",
  "npm",
  "pip",
  "crypto",
  "brew",
  "network",
];

type RecursiveConfig = {
  before: (rawTool: any) => ITool;
  each?: (data: {
    tool: ITool;
    rawTool: any;
    beforeData: any;
  }) => boolean | void;
};

export class ToolboxesService {
  private toolboxesJsonUri: Promise<vscode.Uri>;

  constructor({ toolboxesJsonUri }: { toolboxesJsonUri?: vscode.Uri } = {}) {
    this.toolboxesJsonUri = this.getToolboxesJsonUri(toolboxesJsonUri);
  }

  async getToolboxesJsonUri(toolboxesJsonUri?: vscode.Uri) {
    if (toolboxesJsonUri) {
      return toolboxesJsonUri;
    }

    const globalStorageUri = await safeGetGlobalStorageUri();

    return vscode.Uri.joinPath(globalStorageUri, "toolboxes.json");
  }

  getBuiltinToolboxSrcUri(name: string) {
    return vscode.Uri.joinPath(context.extensionUri, "src", "toolboxes", name);
  }

  getBuiltinToolboxOutUri(name: string) {
    return vscode.Uri.joinPath(context.extensionUri, "out", "toolboxes", name);
  }

  async getBuiltinToolbox(name: string): Promise<ITool | undefined> {
    const jsonUri = vscode.Uri.joinPath(
      this.getBuiltinToolboxSrcUri(name),
      "toolbox.json"
    );

    const uri = vscode.Uri.from({
      scheme: inputScheme,
      path: `/builtin/${name}`,
    });

    const toolbox = this.recursiveToolbox(jsonUri, {
      before(rawTool) {
        return {
          ...rawTool,
          uri: rawTool.id ? vscode.Uri.joinPath(uri, rawTool.id) : undefined,
        };
      },
      each({ tool, beforeData }) {
        if (!beforeData.children) {
          beforeData.children = [];
        }
        beforeData.children.push(tool);
      },
    });

    return toolbox;
  }

  async getBuiltinToolboxes() {
    const toolboxes = [];

    for (const name of builtinToolboxNames) {
      const toolbox = await this.getBuiltinToolbox(name);
      if (toolbox) {
        toolboxes.push(toolbox);
      }
    }

    return toolboxes;
  }

  async getBuiltinTools(name: string): Promise<ITool[]> {
    const jsonUri = vscode.Uri.joinPath(
      this.getBuiltinToolboxSrcUri(name),
      "toolbox.json"
    );

    const uri = vscode.Uri.from({
      scheme: inputScheme,
      path: `/builtin/${name}`,
    });

    const tools: ITool[] = [];

    await this.recursiveToolbox(jsonUri, {
      before(rawTool) {
        const tool = {
          ...rawTool,
          uri: rawTool.id ? vscode.Uri.joinPath(uri, rawTool.id) : undefined,
        };
        tools.push(tool);
        return tool;
      },
    });

    return tools;
  }

  async getBuiltinTool(name: string, toolId: string) {
    const tools = await this.getBuiltinTools(name);
    return tools.find((tool) => tool.id === toolId);
  }

  private innerRecursiveToolbox(
    rawTool: any,
    recursiveConfig: RecursiveConfig
  ) {
    const beforeData = recursiveConfig.before(rawTool);

    if (rawTool.tools) {
      for (const childRawTool of rawTool.tools) {
        const tool = this.innerRecursiveToolbox(childRawTool, recursiveConfig);
        recursiveConfig?.each?.({ tool, rawTool: childRawTool, beforeData });
      }
    }

    return beforeData;
  }

  async recursiveToolbox(uri: vscode.Uri, recursiveConfig: RecursiveConfig) {
    const fileContent = (await vscode.workspace.fs.readFile(uri)).toString();
    const rawTool = safeJSONparse(fileContent);

    return this.innerRecursiveToolbox(rawTool, recursiveConfig);
  }

  async getToolboxesConfig(): Promise<IToolboxConfig[]> {
    const toolboxesJsonUri = await this.toolboxesJsonUri;
    let toolboxesJSONContent = await safeReadFileContent(toolboxesJsonUri);

    if (!toolboxesJSONContent) {
      toolboxesJSONContent = "[]";
      await vscode.workspace.fs.writeFile(
        toolboxesJsonUri,
        Buffer.from(toolboxesJSONContent)
      );
    }

    const toolboxes = JSON.parse(toolboxesJSONContent);

    return toolboxes;
  }

  async getToolboxes(): Promise<ITool[]> {
    const toolboxesConfig = await this.getToolboxesConfig();
    const builtinToolboxes = await this.getBuiltinToolboxes();

    return [
      ...builtinToolboxes,
      ...toolboxesConfig.map((c) => {
        return {
          type: "toolbox",
          ...c,
        };
      }),
    ];
  }

  getInfo(uri: vscode.Uri) {
    // always "/" not path.sep
    const paths = uri.path.split("/");

    const [_, type, name, id] = paths;

    return {
      type,
      name,
      id,
    };
  }

  async importTool(tool: ITool) {
    if (!tool.uri) {
      return undefined;
    }

    const { type, name } = this.getInfo(tool.uri);

    if (type === "builtin") {
      const toolUri = this.getBuiltinToolboxOutUri(name);
      const toolMainUri = vscode.Uri.joinPath(toolUri, tool.main || "index.js");

      let result;
      try {
        result = require(toolMainUri.fsPath);
      } catch (error) {
        console.error(error);
      }

      return result;
    }
  }

  async getTool(uri: vscode.Uri): Promise<ITool | undefined> {
    const { type, name, id } = this.getInfo(uri);

    if (type === "builtin") {
      return this.getBuiltinTool(name, id);
    }
  }

  async addToolbox(toolboxConfig: IToolboxConfig): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesJsonUri;
    const toolboxes = await this.getToolboxesConfig();
    toolboxes.push(toolboxConfig);

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }

  async deleteToolbox(url: string): Promise<ToolboxesService> {
    const toolboxesUri = await this.toolboxesJsonUri;
    let toolboxes = await this.getToolboxesConfig();
    toolboxes = toolboxes.filter((toolbox) => toolbox.url !== url);

    await vscode.workspace.fs.writeFile(
      toolboxesUri,
      Buffer.from(JSON.stringify(toolboxes))
    );

    return this;
  }

  async addTool(url: string): Promise<boolean> {
    const res = await import(url);

    const toolboxesUri = await this.toolboxesJsonUri;
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

import * as vscode from "vscode";
import { ITool, IToolCase } from ".";
import { CasesService } from "./core/casesService";
import deleteCase from "./commands/deleteCase";
import renameCase from "./commands/renameCase";
import showCase from "./commands/showCase";
import showOutput from "./commands/showOutput";
import showTool from "./commands/showTool";
import EmptyFileSystemProvider from "./core/emptyFileSystemProvider";
import { inputScheme } from "./core/input";
import { outputScheme, writeOutput } from "./core/output";
import ToolFileSystemProvider from "./core/toolFileSystemProvider";
import { setContext } from "./share";
import CasesView from "./views/casesView";
import { registerHelpAndFeedbackView } from "./views/helpAndFeedbackView";
import OptionsView from "./views/optionsView";
import ToolboxesView from "./views/toolboxesView";
import { ToolboxesService } from "./core/toolboxesService";
import addToolbox, { addToolboxCommandId } from "./commands/addToolbox";
import runTool, { runToolCommandId } from "./commands/runTool";
import openToolboxesFolder, {
  openToolboxesFolderCommandId,
} from "./commands/openToolboxFolder";

export let toolboxesView: ToolboxesView;
export let optionsView: OptionsView;
export let casesView: CasesView;
export let casesService: CasesService;
export let toolboxesService: ToolboxesService;
export let activePromise: Promise<void>;

export function activate(context: vscode.ExtensionContext) {
  activePromise = (async () => {
    setContext(context);

    if (!toolboxesService) {
      toolboxesService = new ToolboxesService();
      if ((await toolboxesService.getToolboxesConfig()).length === 0) {
        await toolboxesService.addDefaultToolboxes();
      }
    }

    if (!casesService) {
      casesService = new CasesService();
    }

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme !== inputScheme) {
        return;
      }
      writeOutput();
    });

    vscode.workspace.registerFileSystemProvider(
      inputScheme,
      new ToolFileSystemProvider()
    );

    vscode.workspace.registerFileSystemProvider(
      outputScheme,
      new EmptyFileSystemProvider(),
      { isReadonly: true }
    );

    toolboxesView = new ToolboxesView(context);

    optionsView = new OptionsView();

    context.subscriptions.push(
      vscode.window.registerWebviewViewProvider(OptionsView.viewId, optionsView)
    );

    casesView = new CasesView();

    context.subscriptions.push(
      vscode.commands.registerCommand(runToolCommandId, runTool)
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(addToolboxCommandId, addToolbox)
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "toolboxes.refreshToolboxes",
        async () => {
          return toolboxesView.refresh();
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("toolboxes.refreshOptions", async () => {
        return optionsView.refresh();
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("toolboxes.refreshCases", async () => {
        return casesView.refresh();
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand("toolboxes.showOutput", async () => {
        return showOutput();
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        openToolboxesFolderCommandId,
        openToolboxesFolder
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "_toolboxes.showTool",
        async (tool: ITool) => {
          return showTool(tool);
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "_toolboxes.showCase",
        async (toolCase: IToolCase) => {
          return showCase(toolCase);
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "_toolboxes.renameCase",
        async (toolCase: IToolCase, name?: string) => {
          return renameCase(toolCase, name);
        }
      )
    );

    context.subscriptions.push(
      vscode.commands.registerCommand(
        "_toolboxes.deleteCase",
        async (toolCase: IToolCase) => {
          return deleteCase(toolCase);
        }
      )
    );

    registerHelpAndFeedbackView(context);
  })();
}

export function deactivate() {}

export function setCaseService(service: CasesService) {
  casesService = service;
}

export function setToolboxesService(service: ToolboxesService) {
  toolboxesService = service;
}

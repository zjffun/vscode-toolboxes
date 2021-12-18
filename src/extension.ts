import * as vscode from "vscode";
import * as commands from "./commands";
import { CasesService } from "./core/casesService";
import EmptyFileSystemProvider from "./core/emptyFileSystemProvider";
import { inputScheme } from "./core/input";
import { outputScheme } from "./core/output";
import { ToolboxesService } from "./core/toolboxesService";
import ToolFileSystemProvider from "./core/toolFileSystemProvider";
import { setContext } from "./share";
import CasesView from "./views/casesView";
import { registerHelpAndFeedbackView } from "./views/helpAndFeedbackView";
import OptionsView from "./views/optionsView";
import ToolboxesView from "./views/toolboxesView";

export let toolboxesView: ToolboxesView;
export let optionsView: OptionsView;
export let casesView: CasesView;
export let casesService: CasesService;
export let toolboxesService: ToolboxesService;
export let activePromise: Promise<void>;
export const toolFileSystemProvider = new ToolFileSystemProvider();

export function activate(context: vscode.ExtensionContext) {
  activePromise = (async () => {
    setContext(context);

    if (!toolboxesService) {
      toolboxesService = new ToolboxesService();
    }

    if (!casesService) {
      casesService = new CasesService();
    }

    vscode.workspace.registerFileSystemProvider(
      inputScheme,
      toolFileSystemProvider
    );

    vscode.workspace.registerFileSystemProvider(
      outputScheme,
      new EmptyFileSystemProvider(),
      { isReadonly: true }
    );

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme !== inputScheme) {
        return;
      }

      casesService.upsertMemoryCaseContent(e.document);
    });

    toolboxesView = new ToolboxesView();

    optionsView = new OptionsView();

    casesView = new CasesView();

    Object.values(commands).forEach((command) => {
      command?.regist?.(context);
    });

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

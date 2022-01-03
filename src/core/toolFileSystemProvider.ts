import * as vscode from "vscode";
import refreshCases from "../commands/refreshCases";
import refreshOptions from "../commands/refreshOptions";
import { casesService, toolboxesService } from "../extension";
import { parseQuery, stringifyQuery } from "../share";

export default class ToolFileSystemProvider
  implements vscode.FileSystemProvider
{
  private static readonly runableToolContextKey =
    "toolboxesToolFileSystemProviderRunableTool";

  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    const toolCase = await casesService.getCase(uri);
    if (!toolCase) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return {
      type: vscode.FileType.File,
      ctime: 0,
      // TODO: fire file change (current using writeTextDocument)
      // mtime: toolCase.mtime,
      mtime: 0,
      size: 0,
    };
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    return [];
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const toolCase = await casesService.getCase(uri);
    return new Uint8Array(Buffer.from(toolCase?.content || ""));
  }

  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): Promise<void> {
    const query = parseQuery(uri.query);
    let toolCase = {
      uri,
      content: content.toString(),
      optionValues: (await casesService.getCase(uri))?.optionValues,
      mtime: Date.now(),
    };

    let caseName = query?.case;
    if (caseName === undefined || typeof caseName !== "string") {
      caseName = await casesService.caseNameInputBox(uri);
    }

    if (caseName) {
      toolCase.uri = toolCase.uri.with({
        query: stringifyQuery({ case: caseName }),
      });
      await casesService.upsertDiskCase(toolCase);

      refreshCases();
    }
  }

  // --- manage files/folders
  async rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): Promise<void> {}

  async delete(uri: vscode.Uri): Promise<void> {
    await casesService.deleteDiskCase(uri);

    refreshCases();
  }

  createDirectory(uri: vscode.Uri): void {}

  // --- manage file events

  emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this.emitter.event;

  async doWatch(uri: vscode.Uri) {
    let toolCase = await casesService.getCase(uri);

    if (!toolCase) {
      return;
    }

    casesService.setCurrentCase(toolCase);

    const tool = await toolboxesService.getTool(toolCase.uri);

    await vscode.commands.executeCommand(
      "setContext",
      ToolFileSystemProvider.runableToolContextKey,
      !!tool?.run
    );

    refreshOptions();
    refreshCases();

    await casesService.execCurrentCase();
  }

  watch(uri: vscode.Uri): vscode.Disposable {
    this.doWatch(uri);
    return new vscode.Disposable(() => {});
  }
}

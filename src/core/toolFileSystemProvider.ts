import * as vscode from "vscode";
import { ToolCaseStoreType, ToolCaseType } from "../enum";
import {
  casesService,
  casesView,
  optionsView,
  toolboxesService,
} from "../extension";
import { parseQuery } from "../share";
import { writeOutput } from "./output";

export default class ToolFileSystemProvider
  implements vscode.FileSystemProvider
{
  async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
    const query = parseQuery(uri.query);

    if (
      query?.storeType !== ToolCaseStoreType.MENORY &&
      !(await casesService.getCaseByUri(uri))
    ) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }

    return {
      type: vscode.FileType.File,
      ctime: 0,
      mtime: 0,
      size: 0,
    };
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] {
    return [];
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    const toolCase = await casesService.getOrUpsertCaseByUri(uri);
    return new Uint8Array(Buffer.from(toolCase?.content || ""));
  }

  async writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): Promise<void> {
    const query = parseQuery(uri.query);
    let _uri = uri.with({ query: "" });
    let toolCase = {
      uri: _uri,
      content: content.toString(),
      optionValues: (await casesService.getCaseByUri(uri))?.optionValues,
    };

    if (query?.type === ToolCaseType.TOOLCASE) {
      await casesService.upsertCase(toolCase);

      casesView.refresh();

      return;
    }

    if (query?.type === ToolCaseType.TOOL) {
      let name = query?.caseName;
      if (name === undefined || typeof name !== "string") {
        name = await casesService.caseNameInputBox(_uri);
      }

      if (name) {
        toolCase.uri = vscode.Uri.joinPath(_uri, name);
        await casesService.upsertCase(toolCase);

        casesView.refresh();
      }

      return;
    }
  }

  // --- manage files/folders
  async rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): Promise<void> {
    const toolCase = await casesService.getCaseByUri(oldUri);
    if (toolCase) {
      toolCase.uri = newUri;
      await casesService.upsertCase(toolCase, oldUri);
    } else {
      throw Error(`Can't find case.`);
    }
  }

  async delete(uri: vscode.Uri): Promise<void> {
    await casesService.deleteCase(uri);

    casesView.refresh();
  }

  createDirectory(uri: vscode.Uri): void {}

  // --- manage file events

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._emitter.event;

  async setData(uri: vscode.Uri) {
    let toolCase = await casesService.getOrUpsertCaseByUri(uri);

    casesService.currentToolCase = toolCase;

    optionsView.refresh();
    casesView.refresh();
    writeOutput();
  }

  watch(uri: vscode.Uri): vscode.Disposable {
    this.setData(uri);
    return new vscode.Disposable(() => {});
  }
}

import * as vscode from "vscode";

export default class EmptyFileSystemProvider
  implements vscode.FileSystemProvider
{
  stat(uri: vscode.Uri) {
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

  readFile(uri: vscode.Uri) {
    return new Uint8Array();
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean }
  ): void {}

  // --- manage files/folders

  rename(
    oldUri: vscode.Uri,
    newUri: vscode.Uri,
    options: { overwrite: boolean }
  ): void {}

  delete(uri: vscode.Uri): void {}

  createDirectory(uri: vscode.Uri): void {}

  // --- manage file events

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> =
    this._emitter.event;

  watch(uri: vscode.Uri): vscode.Disposable {
    return new vscode.Disposable(() => {});
  }
}

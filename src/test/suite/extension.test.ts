import * as assert from "assert";
import * as vscode from "vscode";
import {
  closeAllEditors,
  resetTestWorkspace,
  testWorkspaceFolder,
} from "../util";

assert.ok(testWorkspaceFolder);

suite("Extension", () => {
  const extensionID = "zjffun.toolboxes";
  const extensionShortName = "toolboxes";

  let extension: vscode.Extension<any> | undefined;

  extension = vscode.extensions.getExtension(extensionID);

  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  test("All package.json commands should be registered in extension", (done) => {
    if (!extension) {
      throw Error("can't find extension");
    }

    const packageCommands = extension.packageJSON.contributes.commands.map(
      (c: any) => c.command
    );

    // get all extension commands excluding internal commands.
    vscode.commands.getCommands(true).then((allCommands) => {
      const activeCommands = allCommands.filter((c) =>
        c.startsWith(`${extensionShortName}.`)
      );

      activeCommands.forEach((command) => {
        const result = packageCommands.some((c: any) => c === command);
        assert.ok(result);
      });

      done();
    });
  });
});

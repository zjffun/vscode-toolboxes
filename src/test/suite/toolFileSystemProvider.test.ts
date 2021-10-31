import * as assert from "assert";
import * as vscode from "vscode";
import { ToolCaseStoreType, ToolCaseType } from "../../enum";
import { casesService, toolboxesService } from "../../extension";
import {
  closeAllEditors,
  createInputUri,
  resetTestWorkspace,
  sleep,
  writeTextDocument,
} from "../util";

const toolboxPath = "$(extensionPath)/src/test/toolboxes-test/toolbox1.json";

suite("ToolFileSystemProvider", () => {
  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  test(`writeFile should work`, async () => {
    const path = "/toolbox1/tool1";
    let uri = createInputUri(path, {
      type: ToolCaseType.TOOL,
      storeType: ToolCaseStoreType.MENORY,
      caseName: "/writeFile-case1",
    });

    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
    await writeTextDocument(doc, "foo");

    uri = createInputUri(`${path}/writeFile-case1`);

    let toolCase = await casesService.getCaseByUri(uri);

    assert.notStrictEqual(toolCase, null);
  });

  test(`readFile should work`, async () => {
    const path = "/toolbox1/tool1/readFile-case1";
    let uri = createInputUri(path);

    await casesService.upsertCase({
      uri,
      content: "foo",
    });

    const doc = await vscode.workspace.openTextDocument(
      createInputUri(path, {
        type: ToolCaseType.TOOLCASE,
        storeType: ToolCaseStoreType.MENORY,
      })
    );
    await vscode.window.showTextDocument(doc);

    assert.strictEqual(doc.getText(), "foo");
  });
});

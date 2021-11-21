import * as assert from "assert";
import * as vscode from "vscode";
import { ToolCaseStoreType, ToolCaseType } from "../../enum";
import { casesService } from "../../extension";
import {
  closeAllEditors,
  createToolbox1InputUri,
  resetTestWorkspace,
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
    let uri = createToolbox1InputUri(path, {
      type: ToolCaseType.TOOL,
      storeType: ToolCaseStoreType.MENORY,
      caseName: "/writeFile-case1",
    });

    const doc = await vscode.workspace.openTextDocument(uri);
    await vscode.window.showTextDocument(doc);
    await writeTextDocument(doc, "foo");

    uri = createToolbox1InputUri(`${path}/writeFile-case1`);

    let toolCase = await casesService.getCaseByUri(uri);

    assert.notStrictEqual(toolCase, null);
  });

  test(`readFile should work`, async () => {
    const path = "/toolbox1/tool1/readFile-case1";
    let uri = createToolbox1InputUri(path);

    await casesService.upsertCase({
      uri,
      content: "foo",
    });

    const doc = await vscode.workspace.openTextDocument(
      createToolbox1InputUri(path, {
        type: ToolCaseType.TOOLCASE,
        storeType: ToolCaseStoreType.MENORY,
      })
    );
    await vscode.window.showTextDocument(doc);

    assert.strictEqual(doc.getText(), "foo");
  });
});

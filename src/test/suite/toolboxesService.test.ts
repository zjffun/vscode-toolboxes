import * as assert from "assert";
import * as vscode from "vscode";
import { ToolboxesService } from "../../core/toolboxesService";
import { toolboxesService } from "../../extension";
import {
  closeAllEditors,
  createInputUri,
  resetTestWorkspace,
  testWorkspaceFolder,
} from "../util";

suite("ToolboxesService", () => {
  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  suite("getTool", () => {
    test("get builtin tool should work", async () => {
      const uri = createInputUri("/builtin/web/url-encode", {});
      const tool = await toolboxesService.getTool(uri);
      assert.strictEqual(tool?.id, "url-encode");
    });
  });

  test("getToolboxes should work", async () => {
    const toolboxes = await toolboxesService.getToolboxes();

    assert.ok(toolboxes.length);
  });

  suite("getToolboxConfigs", () => {
    test("should get config if exist", async () => {
      const toolboxesConfig = await toolboxesService.getToolboxesConfig();
      assert.ok(toolboxesConfig.length);
    });

    test("should set an empty array if not exist", async () => {
      const toolboxesJsonUri = vscode.Uri.joinPath(
        testWorkspaceFolder,
        "not-exist-toolboxes.json"
      );
      const toolboxesService = new ToolboxesService({
        toolboxesJsonUri,
      });
      const toolboxesConfig = await toolboxesService.getToolboxesConfig();
      assert.strictEqual(toolboxesConfig.length, 0);
      assert.ok(await vscode.workspace.fs.readFile(toolboxesJsonUri));
    });
  });
});

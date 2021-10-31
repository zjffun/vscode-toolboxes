import * as assert from "assert";
import * as vscode from "vscode";
import { toolboxesMetadata } from ".";
import { ToolboxesService } from "../../core/toolboxesService";
import { ToolCaseType } from "../../enum";
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

  suite("getToolboxConfigs", () => {
    test("should get config if exist", async () => {
      const metadata = await toolboxesService.getToolboxesMetadata();
      assert.strictEqual(metadata.length, toolboxesMetadata.length);
    });

    test("should set default if not exist", async () => {
      const toolboxesUri = vscode.Uri.joinPath(
        testWorkspaceFolder,
        "not-exist-toolboxes.json"
      );
      const toolboxesService = new ToolboxesService({
        toolboxesUri: toolboxesUri,
      });
      const metadata = await toolboxesService.getToolboxesMetadata();
      assert.ok(metadata.length);
      assert.ok(await vscode.workspace.fs.readFile(toolboxesUri));
    });
  });

  suite("getToolByCaseUri", () => {
    test("get tool by TOOLCASE type case should work", async () => {
      const uri = createInputUri("/toolbox1/tool1/case1", {
        type: ToolCaseType.TOOLCASE,
      });
      const tool = await toolboxesService.getToolByCaseUri(uri);
      assert.strictEqual(tool?.name, "tool1");
    });

    test("get tool by TOOL type case should work", async () => {
      const uri = createInputUri("/toolbox1/tool2", {
        type: ToolCaseType.TOOL,
      });
      const tool = await toolboxesService.getToolByCaseUri(uri);
      assert.strictEqual(tool?.name, "tool2");
    });
  });

  test("getToolbox should work", async () => {
    const metadata = await toolboxesService.getToolboxesMetadata();
    const toolbox = await toolboxesService.getToolbox(metadata[0]);

    assert.strictEqual(toolbox.name, "toolbox1");
    assert.strictEqual(toolbox.children[0].name, "tool1");
  });

  test("getToolboxesTree should work", async () => {
    const notExistToolboxPath =
      "$(extensionPath)/src/test/toolboxes-test/not-exist-toolbox.json";

    await toolboxesService.addToolbox({
      path: notExistToolboxPath,
    });
    let toolboxesTree = await toolboxesService.getToolboxesTree();

    assert.strictEqual(toolboxesTree.length, toolboxesMetadata.length);

    await toolboxesService.deleteToolbox({
      path: notExistToolboxPath,
    });
    toolboxesTree = await toolboxesService.getToolboxesTree();

    assert.strictEqual(toolboxesTree.length, toolboxesMetadata.length);
  });
});

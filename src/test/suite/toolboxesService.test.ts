import * as assert from "assert";
import * as vscode from "vscode";
import { ToolboxesService } from "../../core/toolboxesService";
import { ToolCaseType } from "../../enum";
import { toolboxesService } from "../../extension";
import {
  closeAllEditors,
  createToolbox1InputUri,
  resetTestWorkspace,
  testWorkspaceFolder,
  toolbox1Url,
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
      const toolboxesConfig = await toolboxesService.getToolboxesConfig();
      assert.ok(toolboxesConfig.length > 0);
    });

    test("should set default if not exist", async () => {
      const toolboxesUri = vscode.Uri.joinPath(
        testWorkspaceFolder,
        "not-exist-toolboxes.json"
      );
      const toolboxesService = new ToolboxesService({
        toolboxesUri: toolboxesUri,
      });
      const toolboxesConfig = await toolboxesService.getToolboxesConfig();
      assert.ok(toolboxesConfig.length);
      assert.ok(await vscode.workspace.fs.readFile(toolboxesUri));
    });
  });

  suite("getToolByCaseUri", () => {
    test("get tool by TOOLCASE type case should work", async () => {
      const uri = createToolbox1InputUri("/tool1/case1", {
        type: ToolCaseType.TOOLCASE,
      });
      const tool = await toolboxesService.getToolByCaseUri(uri);
      assert.strictEqual(tool?.id, "tool1");
    });

    test("get tool by TOOL type case should work", async () => {
      const uri = createToolbox1InputUri("/tool2", {
        type: ToolCaseType.TOOL,
      });
      const tool = await toolboxesService.getToolByCaseUri(uri);
      assert.strictEqual(tool?.id, "tool2");
    });

    test("get same id tool should work", async () => {
      const uri = createToolbox1InputUri("/sametoolid", {
        type: ToolCaseType.TOOL,
      });
      const tool = await toolboxesService.getToolByCaseUri(uri);
      assert.ok(tool?.label);
    });
  });

  test("getToolbox should work", async () => {
    const toolboxConfigs = await toolboxesService.getToolboxesConfig();
    const toolbox = await toolboxesService.getToolboxTree(
      toolboxConfigs[0].url
    );

    assert.strictEqual(toolbox.url, toolbox1Url);
    assert.strictEqual(toolbox?.children?.[0]?.url, toolbox1Url);
    assert.strictEqual(toolbox?.children?.[0]?.label, "tool1");
  });
});

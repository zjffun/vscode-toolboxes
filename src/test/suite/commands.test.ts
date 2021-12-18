import * as assert from "assert";
import * as vscode from "vscode";
import { ITool, IToolCase } from "../..";
import { deleteCaseCommandId } from "../../commands/deleteCase";
import { renameCaseCommandId } from "../../commands/renameCase";
import { showOutputCommandId } from "../../commands/showOutput";
import { showToolCommandId } from "../../commands/showTool";
import { casesService } from "../../extension";
import {
  builtinInputUri,
  closeAllEditors,
  createToolbox1InputUri,
  resetTestWorkspace,
} from "../util";

suite("Commands", () => {
  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  test(`${showToolCommandId} should work`, async () => {
    const tool: ITool = {
      label: "",
      uri: builtinInputUri,
    };

    const editor = await vscode.commands.executeCommand<vscode.TextEditor>(
      showToolCommandId,
      tool
    );

    assert.ok(editor?.document?.uri?.path, builtinInputUri.path);
  });

  test(`${showOutputCommandId} should work`, async () => {
    const editor = await vscode.commands.executeCommand(showOutputCommandId);

    assert.ok(editor);
  });

  test(`${renameCaseCommandId} should work`, async () => {
    let uri = createToolbox1InputUri("/tool1", { case: "renamecase1" });
    let toolCase: IToolCase | undefined = {
      uri,
      content: "foo",
      mtime: Date.now(),
    };

    assert.ok(await casesService.upsertDiskCase(toolCase));

    const caseName = "new-renamecase1";

    assert.ok(
      await vscode.commands.executeCommand(
        renameCaseCommandId,
        toolCase,
        caseName
      )
    );

    toolCase = await casesService.getDiskCase(
      createToolbox1InputUri("/tool1", { case: caseName })
    );

    assert.strictEqual(toolCase?.content, "foo");
  });

  test(`${deleteCaseCommandId} should work`, async () => {
    let uri = createToolbox1InputUri("/tool1", { case: "deletecase1" });
    let toolCase: IToolCase | undefined = {
      uri,
      mtime: Date.now(),
    };

    assert.ok(await casesService.upsertDiskCase(toolCase));

    assert.ok(
      await vscode.commands.executeCommand(deleteCaseCommandId, toolCase)
    );

    toolCase = await casesService.getDiskCase(uri);

    assert.strictEqual(toolCase, undefined);
  });
});

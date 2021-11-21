import * as assert from "assert";
import * as vscode from "vscode";
import { ITool, IToolCase } from "../..";
import { deleteCaseCommandId } from "../../commands/deleteCase";
import { renameCaseCommandId } from "../../commands/renameCase";
import { showCaseCommandId } from "../../commands/showCase";
import { showOutputCommandId } from "../../commands/showOutput";
import { showToolCommandId } from "../../commands/showTool";
import { casesService, toolboxesService } from "../../extension";
import * as toolbox1 from "../toolboxes-test/toolbox1/toolbox.json";
import {
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
      id: toolbox1.tools[0].id,
      url: toolbox1.url,
      label: "",
      main: "",
    };

    const editor = await vscode.commands.executeCommand<vscode.TextEditor>(
      showToolCommandId,
      tool
    );

    const toolUri = toolboxesService.getToolCaseUri(tool);

    assert.ok(editor?.document?.uri?.path, toolUri.path);
  });

  test(`${showOutputCommandId} should work`, async () => {
    const editor = await vscode.commands.executeCommand(showOutputCommandId);

    assert.ok(editor);
  });

  test(`${renameCaseCommandId} should work`, async () => {
    let uri = createToolbox1InputUri("/tool1/renamecase1");
    let toolCase: IToolCase | null = {
      uri,
    };

    assert.ok(
      await casesService.upsertCase({
        uri: uri,
        content: "foo",
      })
    );

    const caseName = "new-renamecase1";

    assert.ok(
      await vscode.commands.executeCommand(
        renameCaseCommandId,
        toolCase,
        caseName
      )
    );

    uri = vscode.Uri.joinPath(uri, "../", caseName);
    toolCase = await casesService.getCaseByUri(uri);

    assert.strictEqual(toolCase?.content, "foo");
  });

  test(`${deleteCaseCommandId} should work`, async () => {
    let uri = createToolbox1InputUri("/tool1/deletecase1");
    let toolCase: IToolCase | null = {
      uri,
    };

    assert.ok(await casesService.upsertCase(toolCase));

    assert.ok(
      await vscode.commands.executeCommand(deleteCaseCommandId, toolCase)
    );

    toolCase = await casesService.getCaseByUri(uri);

    assert.strictEqual(toolCase, null);
  });
});

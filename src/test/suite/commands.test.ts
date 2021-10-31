import * as assert from "assert";
import * as vscode from "vscode";
import { ITool, IToolCase } from "../..";
import { deleteCaseCommandId } from "../../commands/deleteCase";
import { renameCaseCommandId } from "../../commands/renameCase";
import { showCaseCommandId } from "../../commands/showCase";
import { showOutputCommandId } from "../../commands/showOutput";
import { showToolCommandId } from "../../commands/showTool";
import { casesService } from "../../extension";
import { closeAllEditors, createInputUri, resetTestWorkspace } from "../util";

suite("Commands", () => {
  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  test(`${showCaseCommandId} should work`, async () => {
    const path = "/toolbox1/tool1/case1";
    const toolCase: IToolCase = {
      uri: createInputUri(path),
    };

    const editor = await vscode.commands.executeCommand<vscode.TextEditor>(
      showCaseCommandId,
      toolCase
    );

    assert.strictEqual(editor?.document?.uri?.path, path);
  });

  test(`${showToolCommandId} should work`, async () => {
    const path = "/toolbox1/tool1";
    const tool: ITool = {
      uri: createInputUri(path),
      name: "",
      label: "",
      main: "",
    };

    const editor = await vscode.commands.executeCommand<vscode.TextEditor>(
      showToolCommandId,
      tool
    );

    assert.ok(editor?.document?.uri?.path, path);
  });

  test(`${showOutputCommandId} should work`, async () => {
    const editor = await vscode.commands.executeCommand(showOutputCommandId);

    assert.ok(editor);
  });

  test(`${renameCaseCommandId} should work`, async () => {
    let uri = createInputUri("/toolbox1/tool1/renamecase1");
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
    let uri = createInputUri("/toolbox1/tool1/deletecase1");
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

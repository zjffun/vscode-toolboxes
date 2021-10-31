import * as assert from "assert";
import * as vscode from "vscode";
import { ToolCaseStoreType } from "../../enum";
import { casesService } from "../../extension";
import { closeAllEditors, createInputUri, resetTestWorkspace } from "../util";

suite("CasesService", () => {
  setup(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  teardown(async () => {
    await closeAllEditors();
    await resetTestWorkspace();
  });

  suite("upsertCase", () => {
    async function upsertCase(uri: vscode.Uri) {
      let toolCase;

      toolCase = await casesService.getCaseByUri(uri);
      assert.strictEqual(toolCase, null);

      assert.ok(
        await casesService.upsertCase({
          uri: uri,
          content: "foo",
        })
      );
      toolCase = await casesService.getCaseByUri(uri);
      assert.strictEqual(toolCase?.content, "foo");

      assert.ok(
        await casesService.upsertCase({
          uri: uri,
          content: "bar",
        })
      );
      toolCase = await casesService.getCaseByUri(uri);
      assert.strictEqual(toolCase?.content, "bar");
    }

    test("upsert file case should work", async () => {
      await upsertCase(
        createInputUri("/test/upsertCase", {
          storeType: ToolCaseStoreType.FILE,
        })
      );
    });

    test("upsert memory case should work", async () => {
      await upsertCase(
        createInputUri("/test/upsertCase", {
          storeType: ToolCaseStoreType.MENORY,
        })
      );
    });
  });

  suite("deleteCase", () => {
    async function deleteCase(uri: vscode.Uri) {
      let toolCase;
      await casesService.upsertCase({
        uri: uri,
        content: "bar",
      });

      assert.ok(await casesService.deleteCase(uri));

      toolCase = await casesService.getCaseByUri(uri);
      assert.strictEqual(toolCase, null);
    }

    test("delete memory case should work", async () => {
      await deleteCase(
        createInputUri("/test/deleteCase", {
          storeType: ToolCaseStoreType.MENORY,
        })
      );
    });

    test("delete file case should work", async () => {
      await deleteCase(
        createInputUri("/test/deleteCase", {
          storeType: ToolCaseStoreType.FILE,
        })
      );
    });
  });
});

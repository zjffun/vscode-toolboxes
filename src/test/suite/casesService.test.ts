import * as assert from "assert";
import * as vscode from "vscode";
import { casesService } from "../../extension";
import {
  closeAllEditors,
  createToolbox1InputUri,
  resetTestWorkspace,
} from "../util";

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
    async function upsertCase(uri: vscode.Uri) {}

    test("upsert disk case should work", async () => {
      const uri = createToolbox1InputUri("/test", { case: "upsertDiskCase" });

      let toolCase;

      toolCase = await casesService.getDiskCase(uri);
      assert.strictEqual(toolCase, undefined);

      assert.ok(
        await casesService.upsertDiskCase({
          uri: uri,
          content: "foo",
          mtime: Date.now(),
        })
      );
      toolCase = await casesService.getDiskCase(uri);
      assert.strictEqual(toolCase?.content, "foo");

      assert.ok(
        await casesService.upsertDiskCase({
          uri: uri,
          content: "bar",
          mtime: Date.now(),
        })
      );
      toolCase = await casesService.getDiskCase(uri);
      assert.strictEqual(toolCase?.content, "bar");
    });

    test("upsert memory case should work", async () => {
      const uri = createToolbox1InputUri("/test", { case: "upsertMemoryCase" });

      let toolCase;

      assert.ok(
        await casesService.upsertMemoryCase({
          uri: uri,
          content: "foo",
          mtime: Date.now(),
        })
      );
      toolCase = await casesService.getCase(uri);
      assert.strictEqual(toolCase?.content, "foo");

      assert.ok(
        await casesService.upsertMemoryCase({
          uri: uri,
          content: "bar",
          mtime: Date.now(),
        })
      );
      toolCase = await casesService.getCase(uri);
      assert.strictEqual(toolCase?.content, "bar");
    });
  });

  suite("deleteCase", () => {
    test("delete disk case should work", async () => {
      const uri = createToolbox1InputUri("/test", { case: "deleteCase" });

      let toolCase;
      await casesService.upsertDiskCase({
        uri: uri,
        content: "bar",
        mtime: Date.now(),
      });

      assert.ok(await casesService.deleteDiskCase(uri));

      toolCase = await casesService.getDiskCase(uri);
      assert.strictEqual(toolCase, undefined);
    });
  });
});

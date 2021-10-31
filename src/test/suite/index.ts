import * as glob from "glob";
import * as Mocha from "mocha";
import * as path from "path";
import { CasesService } from "../../core/casesService";
import { ToolboxesService } from "../../core/toolboxesService";
import { setCaseService, setToolboxesService } from "../../extension";
import { createFile } from "../util";

export const toolboxesMetadata = [
  {
    path: "$(extensionPath)/src/test/toolboxes-test/toolbox1.json",
  },
  {
    path: "$(extensionPath)/src/test/toolboxes-test/toolbox2.json",
  },
];

export function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 60 * 1000,
  });

  const testsRoot = path.resolve(__dirname, "..");

  return new Promise((c, e) => {
    init().then(() => {
      glob("**/**.test.js", { cwd: testsRoot }, (err, files) => {
        if (err) {
          return e(err);
        }

        // Add files to the test suite
        files.forEach((f) => mocha.addFile(path.resolve(testsRoot, f)));

        try {
          // Run the mocha test
          mocha.run((failures) => {
            if (failures > 0) {
              e(new Error(`${failures} tests failed.`));
            } else {
              c();
            }
          });
        } catch (err) {
          console.error(err);
          e(err);
        }
      });
    });
  });
}

async function init() {
  const casesUri = await createFile("test-cases.json", "");
  setCaseService(new CasesService({ casesUri }));

  const toolboxesUri = await createFile(
    "test-toolboxes.json",
    JSON.stringify(toolboxesMetadata)
  );
  setToolboxesService(new ToolboxesService({ toolboxesUri }));
}

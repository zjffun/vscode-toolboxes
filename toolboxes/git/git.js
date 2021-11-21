const path = require("path");
const { spawn, exec } = require("child_process");
const fs = require("fs");

function getOutput(toolId) {
  return async (input, options) => {
    try {
      let result;
      switch (toolId) {
        case "statistic":
          const author = options.author;

          const dirs = fs.readdirSync(options.folder);

          execResult = await new Promise((resolve, reject) => {
            let result = "";
            let error = "";
            Promise.all(
              dirs.map((d) => {
                return new Promise((res) => {
                  try {
                    const cmd = `git log --shortstat --author="${author}" | grep -E "fil(e|es) changed" | awk '{files+=$1; inserted+=$4; deleted+=$6} END {print "commits: ", NR, "files changed: ", files, "lines inserted: ", inserted, "lines deleted: ", deleted }'`;
                    const execOptions = {
                      shell: "/bin/sh",
                      cwd: path.join(options.folder, d),
                    };
                    exec(cmd, execOptions, (error, stdout, stderr) => {
                      if (error) {
                        error += `exec error: ${error.message}\n`;
                        res();
                        return;
                      }
                      if (stderr) {
                        error += `std error: ${stderr}\n`;
                        res();
                        return;
                      }
                      if (
                        stdout ===
                        "files changed:   lines inserted:   lines deleted:  \n"
                      ) {
                        res();
                        return;
                      }
                      result += `${d}\n ${stdout}\n`;
                      res();
                    });
                  } catch (e) {
                    error += `catch error: ${e.message}\n`;
                    res();
                  }
                });
              })
            ).then(() => {
              resolve({ result, error });
            });
          });

          result = `result: ${execResult.result}\nerror: ${execResult.error}`;

          break;
        default:
          result = "";
          break;
      }
      return result;
    } catch (error) {
      return error?.toString() || "unknow error";
    }
  };
}

exports.tools = new Proxy(
  {},
  {
    get(target, p) {
      return getOutput(p);
    },
  }
);

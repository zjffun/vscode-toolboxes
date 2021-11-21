const path = require("path");
const { spawn } = require("child_process");

function getOutput(toolId) {
  return async (input, options) => {
    try {
      let result;
      switch (toolId) {
        case "cutCropGif":
          if (!options.videoFile) {
            throw new Error("Please select a video.");
          }

          const extname = path.extname(options.videoFile);
          const basename = path.basename(options.videoFile, extname);
          const outputExtname = options.enableGif ? ".gif" : extname;
          const outputOption = [
            path.join(
              options.videoFile,
              "../",
              // `${basename}-${Date.now()}${extname}`
              `${basename}-${Date.now()}${outputExtname}`
            ),
          ];

          const inputOption = ["-i", options.videoFile];
          let cutOptions1 = [];
          let cutOptions2 = [];
          let filterOption = [];
          let loopOption = [];
          let filters = [];

          if (options.enableCut) {
            cutOptions1 = ["-ss", options.start];
            cutOptions2 = ["-t", options.end];
          }

          if (options.enableCrop) {
            filters = filters.concat([
              `crop=${options.x2 - options.x1}:${options.y2 - options.y1}:${
                options.x1
              }:${options.y1}`,
            ]);
          }

          if (options.enableGif) {
            filters = filters.concat(
              `fps=${options.gifFps}`,
              `scale=${options.gifWidth}:${options.gifHeight}:flags=lanczos`
              // Strange use palettegen and paletteuse will make size more large
              // "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
            );
          }

          if (filters.length) {
            filterOption = ["-vf", filters.join(",")];
          }

          if (options.enableGif) {
            loopOption = ["-loop", options.gifLoop];
          }

          const args = [
            ...cutOptions1,
            ...inputOption,
            ...cutOptions2,
            ...filterOption,
            ...loopOption,
            ...outputOption,
          ];

          let cmd = `ffmpeg ${args.join(" ")}`;
          result = await new Promise((resolve, reject) => {
            const p = spawn("ffmpeg", args);
            let data = "";
            p.stderr.on("data", (d) => {
              data += d.toString();
            });
            p.on("close", () => {
              resolve(data);
            });
          });

          result = `command: ${cmd}
command result: ${result}`;

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

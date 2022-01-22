import * as path from "path";

function output({ input, options, tool }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "conversion":
        if (!options.video) {
          throw new Error("Please select a video.");
        }

        const extname = path.extname(options.video);
        const basename = path.basename(options.video, extname);
        const outputExtname = `.${options.type}`;
        const outputOption = [
          path.join(
            options.video,
            "../",
            `${basename}-${Date.now()}${outputExtname}`
          ),
        ];

        const inputOption = ["-i", options.video];
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

        if (options.enableScale) {
          filters = filters.concat(
            `scale=${options.width}:${options.height}:flags=lanczos`
            // Strange use palettegen and paletteuse will make size more large
            // "split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse"
          );
        }

        if (options.enableFps) {
          filters = filters.concat(`fps=${options.fps}`);
        }

        if (filters.length) {
          filterOption = ["-vf", filters.join(",")];
        }

        if (options.enableLoop) {
          loopOption = ["-loop", options.loop];
        }

        const args = [
          ...cutOptions1,
          ...inputOption,
          ...cutOptions2,
          ...filterOption,
          ...loopOption,
          ...outputOption,
        ];

        result = `ffmpeg ${args.join(" ")}`;
        break;
      default:
        result = "";
        break;
    }
    return result;
  } catch (error) {
    return (error && error.toString()) || "unknow error";
  }
}

export default output;

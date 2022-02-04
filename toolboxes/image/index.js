import * as path from "path";

function output({ input, options, tool }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "conversion":
        if (!options.image) {
          throw new Error("Please select an image.");
        }

        const extname = path.extname(options.image);
        const basename = path.basename(options.image, extname);
        const outputExtname = `.${options.type}`;
        const outputOption = [
          path.join(
            options.image,
            "../",
            `${basename}-${Date.now()}${outputExtname}`
          ),
        ];

        const inputOption = [options.image];

        if (options.quality) {
          inputOption.push("--quality", options.quality);
        }

        const args = [...inputOption, ...outputOption];

        result = `magick ${args.join(" ")}`;
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

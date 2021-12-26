

import hash from "./tool/hash";

async function output({ input, options, tool, type }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "hash":
        result = hash(input);
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

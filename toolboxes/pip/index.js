import setRegistry from "./tool/setRegistry";

async function output({ input, options, tool, type }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "set-registry":
        if (type === "code") {
          result = setRegistry.getCode(input);
        } else {
          result = setRegistry.getCode(input);
        }
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

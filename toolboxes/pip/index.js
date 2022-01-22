import setRegistry from "./tool/setRegistry";

async function output({ input, options, tool }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "set-registry":
        result = setRegistry(input);
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

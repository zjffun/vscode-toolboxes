import convertData from "./tools/convertData.js";
import convertVariableName from "./tools/convertVariableName.js";

async function output({ input, options, tool }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "convert-data":
        console.log(convertData(input, options));
        return convertData(input, options);
      case "convert-variable-name":
        return convertVariableName(input, options);
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

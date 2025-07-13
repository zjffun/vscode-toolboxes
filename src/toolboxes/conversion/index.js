import convertData from "./tools/convertData.js";
import convertDate from "./tools/convertDate.js";
import convertVariableName from "./tools/convertVariableName.js";

async function output({ input, options, tool }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "convert-data":
        return convertData(input, options);
      case "convert-date":
        return await convertDate(input, options);
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

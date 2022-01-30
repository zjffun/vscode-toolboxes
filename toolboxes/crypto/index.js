import hash from "./tool/hash";
import cipher from "./tool/cipher";
import decipher from "./tool/decipher";

async function output({ input, options, tool, type }) {
  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "hash":
        result = hash(input);
        break;
      case "cipher":
        result = cipher(input, options);
        break;
      case "decipher":
        result = decipher(input, options);
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

import { execSync } from "child_process";

function output({ input, options, tool }) {
  const toolId = tool.id;
  const _input = input.trim();

  try {
    let result;
    switch (toolId) {
      case "ping":
        result = `ping ${_input}`;
        break;
      case "telnet":
        result = `telnet ${options.ip} ${options.port}`;
        break;
      case "ifconfig":
        result = execSync("ifconfig").toString();
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

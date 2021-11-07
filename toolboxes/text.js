function getOutput(toolId) {
  return async (input, options) => {
    try {
      let result;
      switch (toolId) {
        case "replace":
          let find;
          switch (options.type) {
            case "Text":
              find = options.find;
              break;
            case "RegExp":
              find = new RegExp(options.find, "g");
              break;
          }
          result = input.replaceAll(find, options.replace);
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

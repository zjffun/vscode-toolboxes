async function output({ input, options, tool, require: outerRequire }) {
  const XMLJS = outerRequire("xml-js");
  const YAML = outerRequire("YAML");
  const JSON5 = outerRequire("json5");

  // TypeError [ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING]: A dynamic import callback was not specified.
  // let d3dsv = import("d3-dsv");
  const d3dsv = require("./pkgs/d3-dsv.js");

  const CSV = {
    async parse(csv) {
      return (await d3dsv).csvParse(csv);
    },
    async stringify(obj) {
      return (await d3dsv).csvFormat(obj);
    },
  };

  const TSV = {
    async parse(tsv) {
      return (await d3dsv).tsvParse(tsv);
    },
    async stringify(obj) {
      return (await d3dsv).tsvFormat(obj);
    },
  };

  const XML = {
    parse(xml, options) {
      return XMLJS.xml2js(xml, options);
    },
    stringify(obj, options) {
      return XMLJS.js2xml(obj, { ...options, compact: true });
    },
  };

  const convert = { JSON5, JSON, YAML, XML, CSV, TSV };

  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "convert":
        const from = await convert[options.from];
        const to = await convert[options.to];
        result = to.stringify(from.parse(input));
        break;
      default:
        result = "";
        break;
    }
    return result;
  } catch (error) {
    return error?.toString() || "unknow error";
  }
}

exports.output = output;

const XMLJS = require("xml-js");
const YAML = require("YAML");
const JSON5 = require("json5");

// TypeError [ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING]: A dynamic import callback was not specified.
// let d3dsv = import("d3-dsv");
const d3dsv = require("../pkgs/d3-dsv.js");

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

const JSONString = {
  parse(string) {
    return JSON.parse(JSON.parse(string));
  },
  stringify(obj) {
    return JSON.stringify(JSON.stringify(obj));
  },
};

const convert = { JSON5, JSON, YAML, XML, CSV, TSV, JSONString };

export default async (input, options) => {
  const from = convert[options.from];
  const to = convert[options.to];
  return await to.stringify(await from.parse(input));
};

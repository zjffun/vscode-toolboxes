import cssToJs from "./tool/cssToJs";
import htmlToJsx from "./tool/htmlToJsx";
import tsToJs from "./tool/tsToJs";

function output({ input, options, tool }) {
  const { encode, decode } = require("html-entities");

  const prettier = require("prettier/standalone");
  const parsers = [
    require("prettier/parser-angular"),
    require("prettier/parser-babel"),
    require("prettier/parser-espree"),
    require("prettier/parser-flow"),
    require("prettier/parser-glimmer"),
    require("prettier/parser-graphql"),
    require("prettier/parser-html"),
    require("prettier/parser-markdown"),
    require("prettier/parser-meriyah"),
    require("prettier/parser-postcss"),
    require("prettier/parser-typescript"),
    require("prettier/parser-yaml"),
  ];

  const parseURI = (_url) => {
    const urlObj = new URL(_url);

    return `protocol: ${urlObj.protocol}
  username: ${urlObj.username}
  password: ${urlObj.password}
  port: ${urlObj.port}
  hostname: ${urlObj.hostname}
  host: ${urlObj.host}
  origin: ${urlObj.origin}
  pathname: ${urlObj.pathname}
  search: ${urlObj.search}
  hash: ${urlObj.hash}
  href: ${urlObj.href}`;
  };

  const btoa = function (str) {
    return Buffer.from(str).toString("base64");
  };

  const atob = function (b64) {
    return Buffer.from(b64, "base64").toString("utf8");
  };

  const toolId = tool.id;

  try {
    let result;
    switch (toolId) {
      case "url-encode":
        switch (options.type) {
          case "encodeURIComponent":
            result = encodeURIComponent(input);
            break;
          case "encodeURI":
            result = encodeURI(input);
            break;
        }
        break;
      case "url-decode":
        switch (options.type) {
          case "decodeURIComponent":
            result = decodeURIComponent(input);
            break;
          case "decodeURI":
            result = decodeURI(input);
            break;
        }
        break;
      case "url-parse":
        result = parseURI(input);
        break;
      case "html-encode":
        result = encode(input);
        break;
      case "html-decode":
        result = decode(input);
        break;
      case "base64-encode":
        result = btoa(input);
        break;
      case "base64-decode":
        result = atob(input);
        break;
      case "prettier":
        result = prettier.format(input, {
          ...(options || {}),
          plugins: [...parsers],
        });
        break;
      case "css-to-js":
        result = cssToJs(input);
        break;
      case "html-to-jsx":
        result = htmlToJsx(input);
        break;
      case "ts-to-js":
        result = tsToJs({ input, options });
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

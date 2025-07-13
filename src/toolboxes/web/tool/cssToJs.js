import postcssJs from "postcss-js";
import postcss from "postcss";

export default function (input) {
  const root = postcss.parse(input);

  return JSON.stringify(postcssJs.objectify(root), null, 2);
}

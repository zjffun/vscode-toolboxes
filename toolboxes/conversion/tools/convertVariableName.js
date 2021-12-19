import { split, join } from "split-split";

const pascalCaseParse = (str) => {
  const strs = str.split(/(?=[A-Z])/);
  if (strs[0] === "") {
    strs.pop();
  }
  return strs.map((s) => s.toLowerCase());
};

const convert = {
  camelCase: {
    parse: pascalCaseParse,
    stringify(strs) {
      return strs
        .map((s, i) => {
          if (s === "" || i === 0) {
            return s;
          }
          return s[0].toUpperCase() + s.substring(1);
        })
        .join("");
    },
  },
  "kebab-case": {
    parse(str) {
      return str.toLowerCase().split("-");
    },
    stringify(strs) {
      return strs.join("-");
    },
  },
  PascalCase: {
    parse: pascalCaseParse,
    stringify(strs) {
      return strs
        .map((s) => {
          if (s === "") {
            return s;
          }
          return s[0].toUpperCase() + s.substring(1);
        })
        .join("");
    },
  },
};

export default function (input, options) {
  const [substrings, separators] = split(input, /[^a-zA-Z\d\-]/);
  const from = convert[options.from];
  const to = convert[options.to];

  for (let i = 0; i < substrings.length; i++) {
    substrings[i] = to.stringify(from.parse(substrings[i]));
  }
  return join(substrings, separators);
}

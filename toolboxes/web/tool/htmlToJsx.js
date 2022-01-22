import HTMLtoJSX from "htmltojsx";

export default function (input) {
  const converter = new HTMLtoJSX({
    createClass: false,
  });
  return converter.convert(input);
}

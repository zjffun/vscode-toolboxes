import * as ts from "typescript";

export default function ({ input, options }) {
  console.log(options);
  const { outputText, diagnostics } = ts.transpileModule(input, {
    compilerOptions: {
      target: ts.ScriptTarget[options.target],
      module: ts.ModuleKind[options.module],
      jsx: ts.JsxEmit[options.jsx],
    },
  });

  return outputText;
}

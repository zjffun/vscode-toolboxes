exports.execute = async (args) => {
  const vscode = args.require("vscode");

  const { activeTextEditor } = vscode.window;
  const selection = activeTextEditor.selection;
  const text = activeTextEditor.document.getText(selection);

  const output = vscode.window.createOutputChannel("get default values");

  const options = JSON.parse(text);
  
  const values = {};
  for (const option of options) {
    values[option.name] = option.default;
  }

  output.appendLine(JSON.stringify(values));
};

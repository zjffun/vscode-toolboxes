const replaceSelections = async (replaceFn, vscode) => {
  const { activeTextEditor } = vscode.window;
  if (!activeTextEditor?.document) {
    return false;
  }

  const workspaceEdit = new vscode.WorkspaceEdit();

  for (const selection of activeTextEditor.selections) {
    const text = activeTextEditor.document.getText(selection);

    workspaceEdit.replace(
      activeTextEditor.document.uri,
      selection,
      replaceFn(text)
    );
  }

  return await vscode.workspace.applyEdit(workspaceEdit);
};

exports.execute = async (args) => {
  const vscode = args.require("vscode");

  replaceSelections((text) => {
    return JSON.stringify(text.split("\n"), null, 2);
  }, vscode);
};

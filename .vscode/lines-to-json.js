/**
  {
    "key": "cmd+5 l",
    "command": "script.run",
    "args": {
      "script": "[this file path]"
    }
  }
 */
export default ({ vscodeExtra }) => {
  const { replaceSelections } = vscodeExtra;
  replaceSelections((text) => {
    return JSON.stringify(text.split("\n"), null, 2);
  });
};

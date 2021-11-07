import getVsCode from "./getVsCode";

const vscode = getVsCode();

let showOpenDialogPromiseRes, showOpenDialogPromiseRej;

window.addEventListener("message", (event) => {
  const message = event.data;
  switch (message?.type) {
    case "showOpenDialogResult":
      showOpenDialogPromiseRes(message?.payload?.fsPath);
      break;
  }
});

export default (options = {}) => {
  return new Promise((res, rej) => {
    showOpenDialogPromiseRes = res;
    showOpenDialogPromiseRej = rej;
    vscode.postMessage({
      type: "showOpenDialog",
      payload: {
        options,
      },
    });
  });
};

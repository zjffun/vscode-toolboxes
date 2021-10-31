import * as _ from "lodash";
import * as vscode from "vscode";
import { writeOutput } from "../core/output";
import { casesService, toolboxesService } from "../extension";
import { context } from "../share";
import { getNonce } from "../util";

export function getValues(options: any, values: any) {
  const result: any = {};

  for (const { name, default: defaultVal } of options) {
    result[name] = defaultVal;
  }

  return { ...result, ...values };
}

export default class OptionsView implements vscode.WebviewViewProvider {
  public static viewId = "toolboxes-activitybarView-optionsView";

  protected toolboxesService = toolboxesService;
  protected context: vscode.ExtensionContext = context;
  protected webview: vscode.Webview | undefined;

  public async refresh() {
    const toolCase = casesService.currentToolCase;
    if (toolCase) {
      const tool = await toolboxesService.getToolByCaseUri(toolCase.uri);

      if (tool) {
        this.webview?.postMessage({
          type: "setOptions",
          payload: {
            categories: tool.optionCategories,
            options: tool.options,
          },
        });
        this.webview?.postMessage({
          type: "setValues",
          payload: await toolCase.optionValues,
        });
      }
    }
  }

  public async setValues(values: any) {
    const toolCase = casesService.currentToolCase;
    if (toolCase) {
      await casesService.upsertCase({ ...toolCase, optionValues: values });
      writeOutput();
    }
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this.webview = webviewView.webview;

    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.onDidChangeVisibility(() => {
      if (webviewView.visible) {
        this.refresh();
      }
    });

    webviewView.webview.onDidReceiveMessage((data) => {
      switch (data.type) {
        case "setValues": {
          this.setValues(data.payload);
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const toolkitUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js"
      )
    );

    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out-view", "main.css")
    );

    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this.context.extensionUri, "out-view", "main.js")
    );

    // Use a nonce to only allow a specific script to be run.
    const nonce = getNonce();

    return `<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<!--
					Use a content security policy to only allow loading images from https or from our extension directory,
					and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'nonce-${nonce}'; script-src 'nonce-${nonce}';">
        <meta property="csp-nonce" content="${nonce}" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleUri}" rel="stylesheet" />

				<script nonce="${nonce}" type="module" src="${toolkitUri}"></script>
				
				<title>Options</title>
			</head>
			<body>
        <div id="root">
          <vscode-progress-ring></vscode-progress-ring>
        </div>
        
				<script nonce="${nonce}" type="module" src="${scriptUri}" defer></script>
			</body>
			</html>`;
  }
}

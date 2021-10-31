import * as _ from "lodash";
import * as vscode from "vscode";
import { IToolCase, IToolCaseRaw } from "..";
import { ToolCaseStoreType, ToolCaseType } from "../enum";
import { toolboxesService } from "../extension";
import {
  parseQuery,
  safeGetGlobalStorageUri,
  safeJSONparse as safeJSONParse,
  safeReadFileContent,
} from "../share";

export class CasesService {
  public currentToolCase: IToolCase | null = null;

  private casesUri: Promise<vscode.Uri>;

  private memoryCases = new Map<string, IToolCase>();

  constructor({ casesUri }: { casesUri?: vscode.Uri } = {}) {
    this.casesUri = this.getCasesUri(casesUri);
  }

  public async caseNameInputBox(
    toolUri: vscode.Uri,
    value: string = ""
  ): Promise<string | undefined> {
    return await vscode.window.showInputBox({
      title: "Case Name",
      value,
      prompt: "Enter case name",
      validateInput: async (value: string) => {
        if (!value) {
          return "Pleaes input case name.";
        }

        if (!/^[\w -()\[\].]*$/.test(value)) {
          return "Invalid character. Please enter 0-9, a-z, A-Z or '_ -()[].'";
        }

        const uri = vscode.Uri.joinPath(toolUri, value);
        if (await this.getCaseByUri(uri)) {
          return "A case already exists. Please choose a different name.";
        }

        return;
      },
    });
  }

  public getDefaultCaseOptionValues(options: any): any {
    if (!options) {
      return undefined;
    }

    const values: { [key: string]: any } = {};
    for (const option of options) {
      values[option.name] = option.default;
    }
    return values;
  }

  public async getCasesUri(casesUri?: vscode.Uri) {
    if (casesUri) {
      return casesUri;
    }

    const globalStorageUri = await safeGetGlobalStorageUri();
    return vscode.Uri.joinPath(globalStorageUri, "cases.json");
  }

  public async getCasesRaw(): Promise<IToolCaseRaw[]> {
    const casesUri = await this.casesUri;
    const casesContent = await safeReadFileContent(casesUri, "[]");
    const cases = safeJSONParse(casesContent);
    return cases;
  }

  public async getCases(): Promise<IToolCase[]> {
    const cases = (await this.getCasesRaw()).map((c: any) => ({
      ...c,
      uri: vscode.Uri.parse(c.uri),
      type: ToolCaseType.TOOLCASE,
      storeType: ToolCaseStoreType.FILE,
    }));
    return cases;
  }

  public async getCaseByUri(uri: vscode.Uri): Promise<IToolCase | null> {
    // memory case
    const query = parseQuery(uri.query);
    if (query.storeType === ToolCaseStoreType.MENORY) {
      return (await this.memoryCases.get(uri.toString())) || null;
    }

    // file case
    const cases = await this.getCases();
    const uriPath = uri.path;
    for (const toolCase of cases) {
      if (uriPath === toolCase.uri.path) {
        return toolCase;
      }
    }

    return null;
  }

  public async getOrUpsertCaseByUri(uri: vscode.Uri): Promise<IToolCase> {
    // memory case
    const query = parseQuery(uri.query);
    if (query.storeType === ToolCaseStoreType.MENORY) {
      const toolCase = await this.memoryCases.get(uri.toString());
      if (toolCase) {
        return toolCase;
      }
    }

    // file case
    const cases = await this.getCases();
    const uriPath = uri.path;
    for (const toolCase of cases) {
      if (uriPath === toolCase.uri.path) {
        await this.upsertCase({ ...toolCase, uri });
        return toolCase;
      }
    }

    // default case config
    const tool = await toolboxesService.getToolByCaseUri(uri);
    let toolCase: IToolCase = {
      uri: uri,
      content: "",
      optionValues: this.getDefaultCaseOptionValues(tool?.options),
    };

    await this.upsertCase(toolCase);

    return toolCase;
  }

  public async deleteCase(uri: vscode.Uri) {
    // memory case
    const query = parseQuery(uri.query);
    if (query.storeType === ToolCaseStoreType.MENORY) {
      await this.memoryCases.delete(uri.toString());
      return true;
    }

    // file case
    const casesUri = await this.casesUri;
    const toolCasePath = uri.path;
    const cases = await this.getCases();

    const casesResult: IToolCaseRaw[] = [];
    cases.forEach((toolCase) => {
      const uriPath = toolCase.uri.path;
      if (uriPath === toolCasePath) {
        return;
      }
      casesResult.push({
        ...toolCase,
        uri: toolCase.uri.toString(),
      });
    });

    await vscode.workspace.fs.writeFile(
      casesUri,
      Buffer.from(JSON.stringify(casesResult))
    );

    return true;
  }

  public async upsertCase(toolCase: IToolCase, uri?: vscode.Uri) {
    // memory case
    const query = parseQuery(toolCase.uri.query);
    if (query.storeType === ToolCaseStoreType.MENORY) {
      await this.memoryCases.set(toolCase.uri.toString(), toolCase);
      return true;
    }

    // file case
    const casesUri = await this.casesUri;
    const updateToolCaseUriPath = (uri || toolCase.uri).path;
    const cases = await this.getCases();

    let isUpdate = false;
    const casesJSON = cases.map((c) => {
      const uriPath = c.uri.path;
      if (uriPath === updateToolCaseUriPath) {
        isUpdate = true;
        return { ...toolCase, uri: toolCase.uri.toString() };
      }
      return { ...c, uri: c.uri.toString() };
    });

    if (!isUpdate) {
      casesJSON.push({ ...toolCase, uri: toolCase.uri.toString() });
    }

    await vscode.workspace.fs.writeFile(
      casesUri,
      Buffer.from(JSON.stringify(casesJSON))
    );

    return true;
  }

  public async getCasesByToolUri(toolUri: vscode.Uri): Promise<IToolCase[]> {
    const cases = await this.getCases();
    const result: IToolCase[] = [];
    const toolPath = toolUri.path;

    for (const toolCase of cases) {
      const caseToolPath = this.getToolUri(toolCase.uri).path;
      if (caseToolPath === toolPath) {
        result.push(toolCase);
      }
    }

    return result;
  }

  public getToolUri(caseUri: vscode.Uri) {
    return vscode.Uri.joinPath(caseUri, "..");
  }
}

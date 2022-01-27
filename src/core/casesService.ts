import * as vscode from "vscode";
import { IToolCase, IToolCaseRaw } from "..";
import { CaseType, RunType } from "../enum";
import { toolboxesService } from "../extension";
import {
  parseQuery,
  runInTerminal,
  safeGetGlobalStorageUri,
  safeJSONparse as safeJSONParse,
  safeReadFileContent,
  stringifyQuery,
  writeTextDocument,
} from "../share";
import { outputDoc } from "./output";

export class CasesService {
  private _currentCase: IToolCase | undefined;

  private casesUri: Promise<vscode.Uri>;

  private memoryCases = new Map<string, IToolCase>();

  constructor({ casesUri }: { casesUri?: vscode.Uri } = {}) {
    this.casesUri = this.getCasesUri(casesUri);
  }

  async execCurrentCase({ run }: { run?: boolean } = {}): Promise<boolean> {
    const toolCase = await this.getCurrentCase();
    if (!toolCase) {
      return false;
    }

    const tool = await toolboxesService.getTool(toolCase.uri);
    if (!tool) {
      return false;
    }

    const optionValues = toolCase.optionValues;
    try {
      const importedTool = await toolboxesService.importTool(tool);
      const result = await importedTool.default({
        input: toolCase.content,
        options: optionValues,
        tool,
        require,
      });

      if (run) {
        if (tool.run === RunType.TERMINAL) {
          runInTerminal(result);
          return true;
        }

        if (tool.run === RunType.NEWTERMINAL) {
          runInTerminal(result, { newTerminal: true });
          return true;
        }

        console.error("Unknow RunType.");
        return false;
      }

      outputDoc && writeTextDocument(outputDoc, result, { save: false });
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  }

  async getCurrentCase(uri?: vscode.Uri): Promise<IToolCase | undefined> {
    let _uri = uri || this._currentCase?.uri;

    if (!_uri) {
      return undefined;
    }

    return this.getCase(_uri);
  }

  setCurrentCase(toolCase: IToolCase) {
    this._currentCase = toolCase;
  }

  async getCasesUri(casesUri?: vscode.Uri) {
    if (casesUri) {
      return casesUri;
    }

    const globalStorageUri = await safeGetGlobalStorageUri();
    return vscode.Uri.joinPath(globalStorageUri, "cases.json");
  }

  getCaseId(uri: vscode.Uri): string {
    const query = parseQuery(uri.query);
    return vscode.Uri.joinPath(uri, query.case || "").path;
  }

  async caseNameInputBox(
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

        const uri = toolUri.with({ query: stringifyQuery({ case: value }) });
        if (await this.getDiskCase(uri)) {
          return "A case already exists. Please choose a different name.";
        }

        return;
      },
    });
  }

  async getCase(uri: vscode.Uri): Promise<IToolCase | undefined> {
    const caseId = this.getCaseId(uri);

    // memory case
    let toolCase = await this.memoryCases.get(caseId);

    if (toolCase) {
      return toolCase;
    }

    // disk case
    toolCase = await this.getDiskCase(uri);

    // default case config
    if (!toolCase) {
      const tool = await toolboxesService.getTool(uri);
      toolCase = {
        uri: uri,
        content: "",
        optionValues: this.getDefaultCaseOptionValues(tool?.options),
        mtime: Date.now(),
      };
    }

    if (toolCase) {
      this.memoryCases.set(caseId, toolCase);
    }

    return toolCase;
  }

  async getDiskCases(uri?: vscode.Uri): Promise<IToolCase[]> {
    const casesUri = await this.casesUri;
    const casesContent = await safeReadFileContent(casesUri, "[]");
    const rawCases = safeJSONParse(casesContent);

    const cases = rawCases.map((rawCase: any) => {
      const uri = vscode.Uri.parse(rawCase.uri);
      const label = parseQuery(uri.query).case;

      return {
        ...rawCase,
        label,
        uri,
      };
    });

    if (uri) {
      const casePath = uri.path;
      return cases.filter(
        (toolCase: IToolCase) => casePath === toolCase.uri.path
      );
    }

    return cases;
  }

  async getDiskCase(uri: vscode.Uri): Promise<IToolCase | undefined> {
    const caseId = this.getCaseId(uri);

    const cases = await this.getDiskCases();
    for (const toolCase of cases) {
      if (caseId === this.getCaseId(toolCase.uri)) {
        return toolCase;
      }
    }

    return undefined;
  }

  getDefaultCaseOptionValues(options: any): any {
    if (!options) {
      return undefined;
    }

    const values: { [key: string]: any } = {};
    for (const option of options) {
      values[option.name] = option.default;
    }

    return values;
  }

  // memory case
  // const query = parseQuery(uri.query);
  // if (query.storeType === ToolCaseStoreType.MENORY) {
  //   await this.memoryCases.delete(caseId);
  //   return true;
  // }

  async deleteDiskCase(uri: vscode.Uri) {
    const caseId = this.getCaseId(uri);

    const casesUri = await this.casesUri;
    const cases = await this.getDiskCases();

    const casesResult: IToolCaseRaw[] = [];
    cases.forEach((toolCase) => {
      if (caseId === this.getCaseId(toolCase.uri)) {
        return;
      }
      casesResult.push(this.getRawCase(toolCase));
    });

    await vscode.workspace.fs.writeFile(
      casesUri,
      Buffer.from(JSON.stringify(casesResult))
    );

    return true;
  }

  async upsertMemoryCase(toolCase: IToolCase) {
    this.memoryCases.set(this.getCaseId(toolCase.uri), {
      ...toolCase,
      mtime: Date.now(),
    });

    // TODO: fire file change (current using writeTextDocument)
    // toolFileSystemProvider.emitter.fire([
    //   {
    //     type: 1,
    //     uri: toolCase.uri,
    //   },
    // ]);

    await this.execCurrentCase();

    return true;
  }

  async upsertMemoryCaseContent(doc: vscode.TextDocument) {
    const toolCase = await this.getCase(doc.uri);

    if (!toolCase) {
      return false;
    }

    await this.upsertMemoryCase({
      ...toolCase,
      content: doc.getText(),
    });

    return true;
  }

  async upsertDiskCase(toolCase: IToolCase) {
    const caseId = this.getCaseId(toolCase.uri);

    const casesUri = await this.casesUri;
    const diskCases = await this.getDiskCases();

    let isUpdate = false;
    const resultCases = diskCases.map((diskCase) => {
      if (caseId === this.getCaseId(diskCase.uri)) {
        isUpdate = true;
        return this.getRawCase(toolCase, { updateMtime: true });
      }
      return this.getRawCase(diskCase, { updateMtime: true });
    });

    if (!isUpdate) {
      resultCases.push(this.getRawCase(toolCase, { updateMtime: true }));
    }

    await vscode.workspace.fs.writeFile(
      casesUri,
      Buffer.from(JSON.stringify(resultCases))
    );

    return true;
  }

  async getBuiltinCases(uri: vscode.Uri): Promise<IToolCase[]> {
    const tool = await toolboxesService.getTool(uri);

    if (!tool) {
      return [];
    }

    if (!Array.isArray(tool.cases)) {
      return [];
    }

    return tool.cases.map((caseObj) => {
      return {
        ...caseObj,
        content: this._getContent(caseObj.content),
        uri: tool.uri,
        type: CaseType.BUILTIN,
      };
    });
  }

  getRawCase(
    toolCase: IToolCase,
    { updateMtime }: { updateMtime?: boolean } = {}
  ) {
    return {
      ...toolCase,
      uri: toolCase.uri.toString(),
      mtime: updateMtime ? Date.now() : toolCase.mtime,
    };
  }

  async getCurrentCases(): Promise<IToolCase[]> {
    const toolCase = await this.getCurrentCase();
    if (!toolCase) {
      return [];
    }

    const tool = await toolboxesService.getTool(toolCase.uri);
    if (!tool || !tool.uri) {
      return [];
    }

    const cases = await this.getCases(tool.uri);

    return cases;
  }

  async getCases(uri: vscode.Uri): Promise<IToolCase[]> {
    const builtinCases: IToolCase[] = await this.getBuiltinCases(uri);

    const diskCases = await this.getDiskCases(uri);

    return [...builtinCases, ...diskCases];
  }

  private _getContent(rawContent: string | string[]) {
    if (typeof rawContent === "string") {
      return rawContent;
    }

    if (Array.isArray(rawContent)) {
      return rawContent.join("\n");
    }

    return "";
  }
}

import * as vscode from "vscode";
import { ToolCaseStoreType, ToolCaseType } from "./enum";
interface IToolCommon {
  name: string;
  label: string;
  uri: vscode.Uri;
}
export interface ITool extends IToolCommon {
  main: string;
  autoRun?: boolean;
  optionCategories?: string[];
  options?: any[];
}

export interface IToolContainer extends IToolCommon {
  children: (IToolContainer | ITool)[];
}

export interface IToolCaseBase {
  content?: string;
  label?: string;
  optionValues?: any;
}

export interface IToolCase extends IToolCaseBase {
  uri: vscode.Uri;
}

export interface IToolCaseRaw extends IToolCaseBase {
  uri: string;
}

export interface IQuery {
  type?: ToolCaseType;
  // caseName when type is TOOL for test
  caseName?: string;
  storeType?: ToolCaseStoreType;
}

export interface IToolboxMetadata {
  path: string;
}

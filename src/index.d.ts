import * as vscode from "vscode";
import { ToolCaseStoreType, ToolCaseType } from "./enum";

export interface ITool {
  label: string;
  // For downloading and locating tools.
  url: string;
  // The id must be unique in the toolbox
  id?: string;
  main?: string;
  autoRun?: boolean;
  optionCategories?: string[];
  options?: any[];
  children?: ITool[];
  // For uniquely identify tools and cases.
  uri?: vscode.Uri;
  type?: string;
}
export interface IToolConfig {
  label: string;
  url?: string;
  id?: string;
  main?: string;
  autoRun?: boolean;
  optionCategories?: string[];
  options?: any[];
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
  type?: string;
  label: string;
  url: string;
}

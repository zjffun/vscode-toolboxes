import * as vscode from "vscode";
import { CaseType } from "./enum";

export interface ITool {
  label: string;
  // The id must be unique in the toolbox
  id?: string;
  // deafult index.js
  main?: string;
  autoRun?: boolean;
  optionCategories?: string[];
  options?: any[];
  children?: ITool[];
  // For uniquely identify tools and cases.
  uri?: vscode.Uri;
  type?: string;
  cases?: any[];

  // For downloading and locating tools.
  url?: string;
}
export interface IToolConfig {
  label: string;
  id?: string;
  main?: string;
  autoRun?: boolean;
  optionCategories?: string[];
  options?: any[];

  url?: string;
}

export interface IToolCaseBase {
  content?: string;
  label?: string;
  optionValues?: any;
}

export interface IToolCase extends IToolCaseBase {
  uri: vscode.Uri;
  mtime: number;
  type?: CaseType;
}

export interface IToolCaseRaw extends IToolCaseBase {
  uri: string;
  mtime: number;
}

export interface IQuery {
  case?: string;
}

export interface IToolboxConfig {
  type?: string;
  label: string;
  url: string;
}

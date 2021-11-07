import { writeOutput } from "../core/output";

export default async (): Promise<boolean> => {
  await writeOutput({ forceRun: true });

  return true;
};

export const runToolCommandId = "toolboxes.runTool";

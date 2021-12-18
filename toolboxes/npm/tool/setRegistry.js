import { exec } from "child_process";

function setRegistry(input) {
  return exec(setRegistry.getCode({ input }));
}

setRegistry.getCode = (input) => {
  return `npm config set registry ${input}`;
};

export default setRegistry;

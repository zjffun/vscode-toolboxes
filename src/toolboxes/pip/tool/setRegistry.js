function setRegistry(input) {
  const cmd = process.platform === "win32" ? "py" : "python";

  const _input = input.trim();

  const commands = [
    `${cmd} -m pip config set global.index-url ${_input}`,
    `${cmd} -m pip config set install.trusted-host ${new URL(_input).host}`,
  ];

  return commands.join("\n");
}

export default setRegistry;

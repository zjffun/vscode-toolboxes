function setRegistry(input) {
  const _input = input.trim();
  return `npm config set registry ${_input}`;
}

export default setRegistry;

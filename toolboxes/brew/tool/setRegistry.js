import { exec } from "child_process";

function setRegistry(input) {
  return exec(setRegistry.getCode({ input }));
}

setRegistry.getCode = (input) => {
  return `# brew.git
git -C "$(brew --repo)" remote set-url origin ${input}brew.git

# homebrew-core.git
git -C "$(brew --repo homebrew/core)" remote set-url origin ${input}homebrew-core.git

# zsh brew bintray
echo 'export HOMEBREW_BOTTLE_DOMAIN=${input}homebrew-bottles' >> ~/.zshrc
source ~/.zshrc

# bash brew bintray
echo 'export HOMEBREW_BOTTLE_DOMAIN=${input}homebrew-bottles' >> ~/.bash_profile
source ~/.bash_profile`;
};

export default setRegistry;

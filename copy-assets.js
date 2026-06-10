// FitHub Treino - Script de cópia de assets para compilação mobile
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'www');

// Função recursiva para copiar diretórios
function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) {
    fs.mkdirSync(to, { recursive: true });
  }
  fs.readdirSync(from).forEach(element => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

// 1. Limpar diretório www antigo se existir
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}

// 2. Criar diretório www limpo
fs.mkdirSync(targetDir, { recursive: true });

// 3. Copiar arquivos principais
const filesToCopy = ['index.html', 'style.css', 'icon.png'];
filesToCopy.forEach(file => {
  const srcPath = path.join(__dirname, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetDir, file));
  }
});

// 4. Copiar pastas do projeto (src e assets)
const foldersToCopy = ['src', 'assets'];
foldersToCopy.forEach(folder => {
  const srcFolderPath = path.join(__dirname, folder);
  const destFolderPath = path.join(targetDir, folder);
  copyFolderSync(srcFolderPath, destFolderPath);
});

console.log('✓ Assets copiados com sucesso para o diretório "www"!');

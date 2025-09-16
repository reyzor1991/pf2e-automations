// cp main.css CHANGELOG.md README.md module.json LICENSE dist/ && cp -r templates dist && cp -r lang dist && mkdir dist/rules
import fs from "fs";

let files_for_copy = ['main.css', 'CHANGELOG.md', 'README.md', 'module.json', 'LICENSE']
let dirs_for_copy = ['templates', 'lang']

for (let f of files_for_copy) {
    fs.copyFileSync(f, `dist/${f}`);
}

for (let f of dirs_for_copy) {
    fs.cpSync(f, `dist/${f}`, {recursive: true});
}
const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;
            
            // Determinar la ruta relativa al css
            let relPath = 'css/dark-mode.css';
            if (dir.includes(path.join('frontend', 'admin'))) {
                relPath = '../css/dark-mode.css';
            }
            
            // Inject CSS si no existe
            if (!content.includes('dark-mode.css')) {
                const linkTag = `<link rel="stylesheet" href="${relPath}">`;
                content = content.replace('</head>', `    ${linkTag}\n</head>`);
                modified = true;
                console.log(`Injected CSS into ${file}`);
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
            }
        }
    }
}

processDir(frontendDir);
console.log('Done!');

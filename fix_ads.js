const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.html')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let newContent = content.replace(/if\s*\(\!u\s*\|\|\s*u\.rol\s*!==\s*'admin'\)\s*\{/g, "if (!u || (u.rol !== 'admin' && (!u.premium_hasta || new Date() >= new Date(u.premium_hasta)))) {");
            if (content !== newContent) {
                fs.writeFileSync(fullPath, newContent, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'frontend'));

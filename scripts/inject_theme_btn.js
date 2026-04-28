const fs = require('fs');
const path = require('path');

const frontendDir = path.join(__dirname, '..', 'frontend');
const btnHTML = `\n                <button class="theme-toggle-btn" aria-label="Cambiar tema" title="Alternar Modo Oscuro" onclick="toggleDarkMode()" style="background:transparent; border:none; color:inherit; cursor:pointer; font-size:1.2rem; margin-right:15px;"><i class="fas fa-moon"></i></button>\n`;

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
            
            // Si ya tiene el boton, saltar
            if (content.includes('toggleDarkMode()')) {
                continue;
            }

            // Dependiendo del archivo, inyectarlo en un lugar seguro
            if (content.includes('<div class="navbar-links">')) {
                content = content.replace('<div class="navbar-links">', `<div class="navbar-links">${btnHTML}`);
                modified = true;
            } else if (content.includes('<div class="dashboard-header">')) {
                content = content.replace('<div>\n        <a href="dashboard.html"', `<div style="display:flex; align-items:center;">${btnHTML}        <a href="dashboard.html"`);
                modified = true;
            } else if (content.includes('<button id="btn-volver-cuenta"')) {
                content = content.replace('<button id="btn-volver-cuenta"', `${btnHTML}            <button id="btn-volver-cuenta"`);
                modified = true;
            } else if (content.includes('<ul class="nav-links">')) {
                content = content.replace('<ul class="nav-links">', `<ul class="nav-links">${btnHTML}`);
                modified = true;
            }
            
            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Injected button into ${file}`);
            }
        }
    }
}

processDir(frontendDir);
console.log('Done!');

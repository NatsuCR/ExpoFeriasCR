const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            replaceInDir(p);
        } else if (p.endsWith('.html')) {
            let c = fs.readFileSync(p, 'utf8');
            let newC = c.split('<link rel="icon" type="image/x-icon" href="/assets/images/IconoOficialExpoFeriasCR/LogoExpoFeriasCR1.ico">')
                        .join('<link rel="icon" type="image/png" href="/assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png">');
            
            // Also handle without leading slash if it exists
            newC = newC.split('<link rel="icon" type="image/x-icon" href="assets/images/IconoOficialExpoFeriasCR/LogoExpoFeriasCR1.ico">')
                       .join('<link rel="icon" type="image/png" href="assets/images/IconoOficialExpoFeriasCR/expoferiascrLogoOficial.png">');
                       
            if (c !== newC) {
                fs.writeFileSync(p, newC);
                console.log('Updated ' + p);
            }
        }
    });
}

replaceInDir('./frontend');

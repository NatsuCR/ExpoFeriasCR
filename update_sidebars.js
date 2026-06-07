const fs = require('fs');
['eventos-pendientes.html', 'baneados.html', 'stats.html'].forEach(f => { 
    let p = 'frontend/admin/' + f; 
    if(fs.existsSync(p)) { 
        let c = fs.readFileSync(p, 'utf8'); 
        c = c.replace('<a href="usuarios.html" class="nav-link"><i class="fas fa-users"></i> Usuarios</a>', '<a href="usuarios.html" class="nav-link"><i class="fas fa-users"></i> Usuarios</a>\n                <a href="usuarios-premium.html" class="nav-link"><i class="fas fa-crown"></i> Usuarios Premium</a>'); 
        fs.writeFileSync(p, c); 
    } 
});

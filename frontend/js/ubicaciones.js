/**
 * ubicaciones.js - Data de Provincias, Cantones y Distritos de Costa Rica
 */
const UBICACIONES_CR = {
    "San José": {
        "San José": ["Carmen", "Merced", "Hospital", "Catedral", "Zapote", "San Francisco de Dos Ríos", "Uruca", "Mata Redonda", "Pavas", "Hatillo", "San Sebastián"],
        "Escazú": ["Escazú Centro", "San Antonio", "San Rafael"],
        "Desamparados": ["Desamparados", "San Miguel", "San Juan de Dios", "San Rafael Arriba", "San Rafael Abajo", "Gravilias", "Damas"],
        "Puriscal": ["Santiago", "Mercedes Sur", "Barbacoas", "Grifo Alto", "San Rafael", "Candelarita"],
        "Tarrazú": ["San Marcos", "San Lorenzo", "San Carlos"],
        "Aserrí": ["Aserrí Centro", "Tarbaca", "Vuelta de Jorco", "San Gabriel", "Legua", "Monterrey", "Salitrillos"],
        "Mora": ["Ciudad Colón", "Guayabo", "Tabarcia", "Piedras Negras", "Picagres", "Jaris"],
        "Goicoechea": ["Guadalupe Centro", "San Francisco", "Calle Blancos", "Mata de Plátano", "Ipís", "Rancho Redondo", "Purral"],
        "Santa Ana": ["Santa Ana Centro", "Salitral", "Pozos", "Uruca", "Piedades", "Brasil"],
        "Alajuelita": ["Alajuelita Centro", "San Josecito", "San Antonio", "Concepción", "San Felipe"],
        "Vázquez de Coronado": ["San Isidro", "San Rafael", "Dulce Nombre de Jesús", "Patalillo", "Cascajal"],
        "Acosta": ["San Ignacio", "Guaitil", "Palmichal", "Cangrejal", "Sabanillas"],
        "Tibás": ["San Juan Centro", "Cinco Esquinas", "Anselmo Llorente", "León XIII", "Colima"],
        "Moravia": ["San Vicente Centro", "San Jerónimo", "La Trinidad"],
        "Montes de Oca": ["San Pedro Centro", "Sabanilla", "Mercedes", "San Rafael"],
        "Turrubares": ["San Pablo", "San Pedro", "San Juan de Mata", "Carara"],
        "Dota": ["Santa María Centro", "Jardín", "Copey"],
        "Curridabat": ["Curridabat Centro", "Granadilla", "Sánchez", "Tirrases"],
        "Pérez Zeledón": ["San Isidro de El General Centro", "General", "Daniel Flores", "Rivas", "San Pedro", "Platanares", "Pejibaye", "Cajón", "Barú", "Río Nuevo", "Páramo", "La Amistad"],
        "León Cortés Castro": ["San Pablo", "San Andrés", "Llano Bonito", "San Isidro", "Santa Cruz", "San Antonio"]
    },
    "Alajuela": {
        "Alajuela": ["Alajuela Centro", "San José", "Carrizal", "San Antonio", "Guácima", "San Isidro", "Sabanilla", "San Rafael", "Río Segundo", "Desamparados", "Turrucares", "Tambor", "Garita", "Sarapiquí"],
        "San Ramón": ["San Ramón Centro", "Santiago", "San Juan", "Piedades Norte", "Piedades Sur", "San Rafael", "San Isidro", "Ángeles", "Alfaro", "Volio", "Concepción", "Zapotal", "Peñas Blancas", "San Lorenzo"],
        "Grecia": ["Grecia Centro", "San Isidro", "San José", "San Roque", "Tacares", "Puente de Piedra", "Bolívar"],
        "San Mateo": ["San Mateo Centro", "Desmonte", "Jesús María", "Labrador"],
        "Atenas": ["Atenas Centro", "Jesús", "Mercedes", "San Isidro", "Concepción", "San José", "Santa Eulalia", "Escobal"],
        "Naranjo": ["Naranjo Centro", "San Juan", "San José", "San Miguel", "Rosario", "San Jerónimo", "San Cirilo"],
        "Palmares": ["Palmares Centro", "Zaragoza", "Buenos Aires", "Santiago", "Candelaria", "Esquipulas", "La Granja"],
        "Poás": ["San Pedro Centro", "San Juan", "San Rafael", "Carrillos", "Sabana Redonda"],
        "Orotina": ["Orotina Centro", "Mastate", "Hacienda Vieja", "Coyolar", "Ceiba"],
        "San Carlos": ["Quesada", "Florencia", "Buenavista", "Aguas Zarcas", "Venecia", "Pital", "La Fortuna", "La Tigra", "La Palmera", "Venado", "Cutris", "Monterrey", "Pococosol"],
        "Zarcero": ["Zarcero Centro", "Laguna", "Tapesco", "Guadalupe", "Palmira", "Zapote", "Brisas"],
        "Sarchí": ["Sarchí Norte", "Sarchí Sur", "Toro Amarillo", "San Pedro", "Rodríguez"],
        "Upala": ["Upala Centro", "Aguas Claras", "San José", "Bijagua", "Delicias", "Dos Ríos", "Yolillal", "Canalete"],
        "Los Chiles": ["Los Chiles Centro", "Caño Negro", "El Amparo", "San Jorge"],
        "Guatuso": ["San Rafael Centro", "Buenavista", "Cote", "Katira"],
        "Río Cuarto": ["Río Cuarto", "Santa Isabel", "Santa Rita"]
    },
    "Cartago": {
        "Cartago": ["Oriental", "Occidental", "Carmen", "San Nicolás", "Aguacaliente", "Guadalupe", "Quebradilla", "Tierra Blanca", "Dulce Nombre", "Llano Grande", "San Francisco"],
        "Paraíso": ["Paraíso Centro", "Santiago", "Orosi", "Cachí", "Llanos de Santa Lucía"],
        "La Unión": ["Tres Ríos", "San Diego", "San Juan", "San Rafael", "Concepción", "Dulce Nombre", "San Ramón", "Rio Azul"],
        "Jiménez": ["Juan Viñas", "Tucurrique", "Pejibaye"],
        "Turrialba": ["Turrialba Centro", "La Suiza", "Peralta", "Santa Cruz", "Santa Teresita", "Pavones", "Tuis", "Tayutic", "Santa Rosa", "Tres Equis", "La Isabel", "Chirripó"],
        "Alvarado": ["Pacayas", "Cervantes", "Capellades"],
        "Oreamuno": ["San Rafael", "Cot", "Potrero Cerrado", "Cipreses", "Santa Rosa"],
        "El Guarco": ["El Tejar", "San Isidro", "Bermúdez", "Patio de Agua"]
    },
    "Heredia": {
        "Heredia": ["Heredia Centro", "Mercedes", "San Francisco", "Ulloa", "Vara Blanca"],
        "Barva": ["Barva Centro", "San Pedro", "San Pablo", "San Roque", "Santa Lucía", "San José de la Montaña"],
        "Santo Domingo": ["Santo Domingo Centro", "Vicente", "San Miguel", "Paracito", "Santo Tomás", "Santa Rosa", "Tures", "Pará"],
        "Santa Bárbara": ["Santa Bárbara Centro", "San Pedro", "San Juan", "Jesús", "Santo Domingo", "Purabá"],
        "San Rafael": ["San Rafael Centro", "San Josecito", "Santiago", "Ángeles", "Concepción"],
        "San Isidro": ["San Isidro Centro", "San José", "Concepción", "San Francisco"],
        "Belén": ["San Antonio Centro", "La Ribera", "La Asunción"],
        "Flores": ["San Joaquín Centro", "Barrantes", "Llorente"],
        "San Pablo": ["San Pablo Centro", "Rincón de Sabanilla"],
        "Sarapiquí": ["Puerto Viejo Centro", "La Virgen", "Horquetas", "Llanuras del Gaspar", "Cureña"]
    },
    "Guanacaste": {
        "Liberia": ["Liberia Centro", "Cañas Dulces", "Mayorga", "Nacascolo", "Curubandé"],
        "Nicoya": ["Nicoya Centro", "Mansión", "San Antonio", "Quebrada Honda", "Sámara", "Nosara", "Belén de Nosarita"],
        "Santa Cruz": ["Santa Cruz Centro", "Bolsón", "Veintisiete de Abril", "Tempate", "Cartagena", "Cuajiniquil", "Diriá", "Cabo Velas", "Tamarindo"],
        "Bagaces": ["Bagaces Centro", "Fortuna", "Mogote", "Río Naranjo"],
        "Carrillo": ["Filadelfia Centro", "Palmira", "Sardinal", "Belén"],
        "Cañas": ["Cañas Centro", "Palmira", "San Miguel", "Bebedero", "Porozal"],
        "Abangares": ["Las Juntas Centro", "Sierra", "San Juan", "Colorado"],
        "Tilarán": ["Tilarán Centro", "Quebrada Grande", "Tronadora", "Santa Rosa", "Líbano", "Tierras Morenas", "Arenal", "Cabeceras"],
        "Nandayure": ["Carmona Centro", "Santa Rita", "Zapotal", "San Pablo", "Porvenir", "Bejuco"],
        "La Cruz": ["La Cruz Centro", "Santa Cecilia", "La Garita", "Santa Elena"],
        "Hojancha": ["Hojancha Centro", "Monte Romo", "Puerto Carrillo", "Huacas"]
    },
    "Puntarenas": {
        "Puntarenas": ["Puntarenas Centro", "Lepanto", "Paquera", "Cóbano", "Jicaral", "Isla del Coco", "Chira"],
        "Esparza": ["Espíritu Santo", "San Juan Grande", "Macacona", "San Rafael", "San Jerónimo", "Caldera"],
        "Buenos Aires": ["Buenos Aires Centro", "Volcán", "Potrero Grande", "Boruca", "Pilas", "Colinas", "Chánguena", "Biolley", "Brunka"],
        "Montes de Oro": ["Miramar Centro", "La Unión", "San Isidro"],
        "Osa": ["Puerto Cortés Centro", "Palmar", "Sierpe", "Bahía Ballena", "Piedras Blancas", "Bahía Drake"],
        "Quepos": ["Quepos Centro", "Savegre", "Naranjito"],
        "Golfito": ["Golfito Centro", "Puerto Jiménez", "Guaycará", "Pavón"],
        "Coto Brus": ["San Vito Centro", "Aguabuena", "Limoncito", "Pittier", "Gutiérrez Brown"],
        "Parrita": ["Parrita Centro"],
        "Corredores": ["Ciudad Neily Centro", "La Cuesta", "Paso Canoas", "Laurel"],
        "Garabito": ["Jacó Centro", "Tárcoles"],
        "Monteverde": ["Monteverde"],
        "Puerto Jiménez": ["Puerto Jiménez"]
    },
    "Limón": {
        "Limón": ["Limón Centro", "Valle de La Estrella", "Matama"],
        "Pococí": ["Guápiles Centro", "Jiménez", "Rita", "Roxana", "Cariari", "Colorado", "La Colonia"],
        "Siquirres": ["Siquirres Centro", "Pacuarito", "Florida", "Germania", "El Cairo", "Alegría"],
        "Talamanca": ["Bratsi Centro", "Sixaola", "Cahuita", "Telire"],
        "Matina": ["Matina Centro", "Batán", "Carrandí"],
        "Guácimo": ["Guácimo Centro", "Mercedes", "Pocora", "Río Jiménez", "Duacarí"]
    }
};

window.UBICACIONES_CR = UBICACIONES_CR;




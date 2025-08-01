const bcrypt = require('bcryptjs');
const hash = '$2b$10$1BUCC9LfMcRaRZiDDb9RO.j/EUT0KwavXcHuI9LpuU0bQD9Iq9pUO';
console.log('¿Coincide "admin123" con el hash?', bcrypt.compareSync('admin123', hash));
console.log('¿Coincide "123" con el hash?', bcrypt.compareSync('123', hash));
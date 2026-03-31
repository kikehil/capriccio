const fs = require('fs');
const path = require('path');

const projectDir = '/var/www/html/capriccio/capriccio';

// 1. Fix server.js port
const serverPath = path.join(projectDir, 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');
serverContent = serverContent.replace(/const PORT = 3006;/g, 'const PORT = 3008;');
fs.writeFileSync(serverPath, serverContent);
console.log('✅ Fixed server.js port to 3008');

// 2. Fix db.js filename
const dbPath = path.join(projectDir, 'db.js');
let dbContent = fs.readFileSync(dbPath, 'utf8');
dbContent = dbContent.replace(/filename: .*,/g, "filename: path.join(__dirname, 'database.sqlite'),");
fs.writeFileSync(dbPath, dbContent);
console.log('✅ Fixed db.js database path');

// 3. Fix .env
const envPath = path.join(projectDir, '.env');
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(/PORT=3006/g, 'PORT=3000');
fs.writeFileSync(envPath, envContent);
console.log('✅ Fixed .env file');

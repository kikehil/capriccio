const fs = require('fs');
const filePath = '/var/www/html/capriccio/capriccio/src/components/admin/AdminLayout.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const newFilter = `    ].filter(item => {
        const userRole = typeof window !== 'undefined' ? localStorage.getItem('capriccio_user_role') : '';
        const businessName = typeof window !== 'undefined' ? localStorage.getItem('capriccio_negocio_nombre') : '';
        
        // 1. SI ES DUEÑO DE PLATAFORMA (SUPER ADMIN / ROLE PLATFORM)
        if (userRole === 'platform' || businessName === 'Admin Demo') {
            return item.id === 'platform';
        }

        // 2. SI ES UN ADMIN DE NEGOCIO NORMAL
        if (item.id === 'platform') return false;

        // 3. FILTRO POR PLAN
        if (plan === 'basico' && userRole !== 'admin') {
            const allowed = ['stats', 'products', 'promos', 'corte', 'reports', 'settings'];
            return allowed.includes(item.id);
        }

        return true;
    });`;

content = content.replace(/\.filter\(item => \{[\s\S]*?\}\);/, newFilter);
fs.writeFileSync(filePath, content);
console.log('✅ AdminLayout.tsx patched on VPS');

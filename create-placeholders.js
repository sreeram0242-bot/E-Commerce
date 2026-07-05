const fs = require('fs');
const path = require('path');

const pages = ['categories', 'customers', 'coupons', 'reviews', 'settings'];
const baseDir = path.join(__dirname, 'apps/admin/src/app');

for (const p of pages) {
  const dir = path.join(baseDir, p);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  const content = `export default function ${p.charAt(0).toUpperCase() + p.slice(1)}Page() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-brand-text-primary capitalize">${p}</h1>
      </div>
      <div className="bg-brand-surface border border-brand-border rounded-xl p-12 text-center text-brand-text-secondary">
        <svg className="w-12 h-12 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h2 className="text-lg font-medium text-brand-text-primary mb-2">Coming Soon</h2>
        <p>This module is scheduled for development in Phase 2.</p>
      </div>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
}
console.log('Created placeholder pages.');

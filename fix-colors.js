const fs = require('fs');
const path = require('path');

function hexToRgbTuple(hex) {
  // Remove #
  hex = hex.replace('#', '');
  // Parse r,g,b
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

const cssFiles = [
  'apps/admin/src/app/globals.css',
  'apps/storefront/src/app/globals.css'
];

for (const file of cssFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace hex colors like #E8B95E with their RGB tuples
  content = content.replace(/#([0-9A-Fa-f]{6})/g, (match) => {
    return hexToRgbTuple(match);
  });
  
  // also handle rgba
  content = content.replace(/rgba\(0, 0, 0, 0\.7\)/g, '0 0 0');
  content = content.replace(/rgba\(0, 0, 0, 0\.5\)/g, '0 0 0');
  
  fs.writeFileSync(filePath, content);
}

const tailwindFiles = [
  'apps/admin/tailwind.config.ts',
  'apps/storefront/tailwind.config.ts'
];

for (const file of tailwindFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace 'var(--color-...)' with 'rgb(var(--color-...) / <alpha-value>)'
  content = content.replace(/'var\((--color-[^)]+)\)'/g, "'rgb(var($1) / <alpha-value>)'");
  
  fs.writeFileSync(filePath, content);
}

console.log("Colors updated!");

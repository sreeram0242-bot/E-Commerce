const fs = require('fs');
const path = require('path');

const cssFiles = [
  'apps/admin/src/app/globals.css',
  'apps/storefront/src/app/globals.css'
];

for (const file of cssFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  const lines = fs.readFileSync(filePath, 'utf8').split('\n');
  const newLines = lines.map(line => {
    // Only target lines that are NOT CSS variable definitions
    if (!line.trim().startsWith('--color-') && !line.includes('--shadow-')) {
      // Replace var(--color-xyz) with rgb(var(--color-xyz))
      // But avoid double wrapping rgb(rgb(var(...)))
      let replaced = line.replace(/([^a-zA-Z0-9\-])var\((--color-[a-zA-Z0-9-]+)\)/g, (match, prefix, varName) => {
        // if already wrapped in rgb or rgba, don't wrap again
        if (prefix === 'b(' || prefix === 'a(' || prefix.endsWith('rgb(')) {
          return match;
        }
        return `${prefix}rgb(var(${varName}))`;
      });
      // specific fix if it starts the line
      replaced = replaced.replace(/^var\((--color-[a-zA-Z0-9-]+)\)/g, 'rgb(var($1))');
      return replaced;
    }
    return line;
  });
  
  fs.writeFileSync(filePath, newLines.join('\n'));
}

console.log("CSS usages wrapped in rgb()!");

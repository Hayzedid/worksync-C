const fs = require('fs');
const path = require('path');
const cwd = process.cwd();
const candidates = ['babel.config.js','babel.config.cjs','babel.config.mjs'];
const found = candidates.filter(f => fs.existsSync(path.join(cwd,f)));
if (found.length > 1) {
  // Prefer babel.config.js if present. Remove empty or placeholder duplicates silently, and back up empty .cjs
  const prefer = 'babel.config.js';
  if (found.includes(prefer)) {
    for (const f of found) {
      if (f === prefer) continue;
      const p = path.join(cwd, f);
      try {
        const stat = fs.statSync(p);
        if (stat.size === 0) {
          // If it's .cjs, move to backup; otherwise remove
          if (f.endsWith('.cjs')) {
            const bak = p + '.backup';
            try { fs.renameSync(p, bak); console.log('Backed up empty', f, '->', path.basename(bak)); }
            catch (e) { fs.unlinkSync(p); console.log('Removed empty duplicate Babel config:', f); }
          } else {
            fs.unlinkSync(p);
            console.log('Removed empty duplicate Babel config:', f);
          }
        } else {
          console.warn('Leaving non-empty Babel config (manual review needed):', f);
        }
      } catch (err) {
        console.warn('Could not process', f, err && err.message);
      }
    }
    process.exit(0);
  }

  console.error('Multiple Babel config files found in', cwd);
  console.error('Found:', found.join(', '));
  console.error('Please keep only one Babel config file (prefer .js) or remove extras.');
  process.exit(2);
}
process.exit(0);

const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'security.html', 'blog.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // CSS updates
  content = content.replace(
    /\.footer-tagline \{ font-size: 11px; color: rgba\(255,255,255,\.32\); line-height: 1\.6; \}/g,
    '.footer-tagline { font-size: 11px; color: rgba(255,255,255,.32); line-height: 1.6; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n.footer-co-logo { display: inline-flex; align-items: center; }\n.footer-co-logo img { height: 12px; width: auto; opacity: 0.7; transition: opacity .14s; }\n.footer-co-logo:hover img { opacity: 1; }'
  );

  // Footer Logo (index.html, contact.html)
  content = content.replace(
    /<div class="footer-tagline">by <a href="#" class="footer-co">Intercompany\.io<\/a>&nbsp;·&nbsp;<span data-i18n="footer\.tagline">Independent Treasury Intelligence\.<\/span><\/div>/g,
    '<div class="footer-tagline">by <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> <span data-i18n="footer.tagline">Independent Treasury Intelligence.</span></div>'
  );

  // Footer Logo (about.html)
  content = content.replace(
    /<div class="footer-tagline"><span data-i18n="footer\.by">by<\/span> <a href="\/about\.html" class="footer-co">Intercompany\.io<\/a>&nbsp;·&nbsp;<span data-i18n="footer\.tagline">Independent Treasury Intelligence\.<\/span><\/div>/g,
    '<div class="footer-tagline"><span data-i18n="footer.by">by</span> <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> <span data-i18n="footer.tagline">Independent Treasury Intelligence.</span></div>'
  );

  // Footer Logo (security.html, blog.html)
  content = content.replace(
    /<div class="footer-tagline">by <a href="#" class="footer-co">Intercompany\.io<\/a>&nbsp;·&nbsp;Independent Treasury Intelligence\.<\/div>/g,
    '<div class="footer-tagline">by <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> Independent Treasury Intelligence.</div>'
  );

  fs.writeFileSync(file, content, 'utf-8');
});
console.log('Update done');

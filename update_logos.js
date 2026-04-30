const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'security.html', 'blog.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // CSS updates
  content = content.replace(
    /\.logo-sub \{ font-size: 11px; color: var\(--ink-lt\); font-weight: 400; letter-spacing: \.2px; font-family: var\(--sans\); margin-top: 3px; line-height: 1; \}/g,
    '.logo-sub { font-size: 11px; color: var(--ink-lt); font-weight: 400; letter-spacing: .2px; font-family: var(--sans); margin-top: 3px; line-height: 1; display: flex; align-items: center; gap: 4px; }\n.nav-ic-logo { height: 10px; width: auto; opacity: 0.85; }'
  );

  content = content.replace(
    /\.footer-tagline \{ font-size: 11px; color: rgba\(255,255,255,\.32\); line-height: 1\.6; \}/g,
    '.footer-tagline { font-size: 11px; color: rgba(255,255,255,.32); line-height: 1.6; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }\n.footer-co-logo { display: inline-flex; align-items: center; }\n.footer-co-logo img { height: 12px; width: auto; opacity: 0.7; transition: opacity .14s; }\n.footer-co-logo:hover img { opacity: 1; }'
  );

  // Nav Logo
  content = content.replace(
    /<div class="logo-sub">by Intercompany\.io<\/div>/g,
    '<div class="logo-sub">by <img src="/Intercompany_logo.svg" alt="Intercompany.io" class="nav-ic-logo"></div>'
  );

  // Footer Logo (with i18n)
  content = content.replace(
    /<div class="footer-tagline"><span data-i18n="footer\.by">by<\/span> <a href="[^"]*" class="footer-co">Intercompany\.io<\/a>&nbsp;·&nbsp;<span data-i18n="footer\.tagline">Independent Treasury Intelligence\.<\/span><\/div>/g,
    '<div class="footer-tagline"><span data-i18n="footer.by">by</span> <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> <span data-i18n="footer.tagline">Independent Treasury Intelligence.</span></div>'
  );

  // Footer Logo (without i18n - security.html & blog.html)
  content = content.replace(
    /<div class="footer-tagline">by <a href="[^"]*" class="footer-co">Intercompany\.io<\/a>&nbsp;·&nbsp;Independent Treasury Intelligence\.<\/div>/g,
    '<div class="footer-tagline">by <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> Independent Treasury Intelligence.</div>'
  );

  // Contact.html sidebar logo
  if (file === 'contact.html') {
    content = content.replace(
      /<div class="ic-logo">IC<\/div>/g,
      '<div class="ic-logo" style="background: transparent; border: 1px solid var(--rule);"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io" style="width: 24px; height: auto;"></div>'
    );
  }

  // About.html integration
  if (file === 'about.html') {
    content = content.replace(
      /<div class="founder-role" data-i18n="founder\.role">Founder & Principal Advisor, Intercompany\.io<\/div>/g,
      '<div class="founder-role" data-i18n="founder.role">Founder & Principal Advisor</div>\n        <div style="margin-bottom: 18px;"><img src="/Intercompany_logo.svg" alt="Intercompany.io" style="height: 14px; opacity: 0.85;"></div>'
    );
  }

  fs.writeFileSync(file, content, 'utf-8');
});
console.log('Update done');

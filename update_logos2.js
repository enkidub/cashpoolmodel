const fs = require('fs');
const files = ['index.html', 'about.html', 'contact.html', 'security.html', 'blog.html'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');

  // Replace footer tagline with the golden logo
  content = content.replace(
    /<div class="footer-tagline">[\s\S]*?Independent Treasury Intelligence\.[\s\S]*?<\/div>/g,
    '<div class="footer-tagline"><span data-i18n="footer.by">by</span> <a href="/about.html" class="footer-co footer-co-logo"><img src="/Intercompany.io_logo_gold.svg" alt="Intercompany.io"></a> <span style="opacity: 0.5;">·</span> <span data-i18n="footer.tagline">Independent Treasury Intelligence.</span></div>'
  );

  // About page founder-role update
  if (file === 'about.html') {
    content = content.replace(
      /<div class="founder-role" data-i18n="founder\.role">Founder & Principal Advisor, Intercompany\.io<\/div>/g,
      '<div class="founder-role" data-i18n="founder.role">Founder & Principal Advisor</div>\n        <div style="margin-bottom: 24px;"><img src="/Intercompany_logo.svg" alt="Intercompany.io" style="height: 16px; opacity: 0.85;"></div>'
    );
  }

  fs.writeFileSync(file, content, 'utf-8');
});
console.log('Update done');

IMMORTAL RIDERS — SPOTLIGHT QUICK START

1. Extract this zip.
2. Copy files into your repo root.
3. Replace data/spotlight.json to edit content.
4. Run:

   git add .
   git commit -m "Update spotlight"
   git push

Netlify will auto-deploy.

NETLIFY + GODADDY (CUSTOM DOMAIN)

Yes — you can link a GoDaddy domain to Netlify.

Recommended setup:
1. Add your GoDaddy domain in Netlify: Site settings -> Domain management -> Add domain.
2. In GoDaddy DNS, point your domain to Netlify:
   - Apex/root domain (@): use Netlify DNS records (A records from Netlify or delegate nameservers to Netlify).
   - www subdomain: set CNAME to your-site-name.netlify.app.
3. Wait for DNS propagation (usually minutes to 24 hours).
4. In Netlify, verify the domain and enable HTTPS (Netlify provisions SSL automatically once DNS is correct).

Tip: Using Netlify nameservers is often the easiest long-term setup because Netlify can manage all required DNS records directly.


# Agora Demos — deployment checklist

## Gmail
- Create/use a dedicated Agora Demos Gmail mailbox.
- Enable 2-Step Verification.
- Create a Google App Password for SMTP.
- Put that App Password only in Railway -> Variables -> SMTP_PASSWORD.
- Never commit it to GitHub.

## Railway
Backend service:
- DATABASE_URL = Railway PostgreSQL connection string
- FRONTEND_ORIGIN = https://agorademos.com
- SMTP_HOST = smtp.gmail.com
- SMTP_PORT = 587
- SMTP_USERNAME = your Agora Demos Gmail
- SMTP_PASSWORD = Google App Password
- NEWSLETTER_FROM = Agora Demos <your Agora Demos Gmail>
- ADMIN_KEY = a separate strong admin password

## GitHub
- Push frontend/ to your repository.
- GitHub Settings -> Pages -> GitHub Actions.
- Add Actions variable VITE_API_URL = https://YOUR-RAILWAY-DOMAIN/api.
- Push to main.

## Domain
- In the domain registrar DNS, follow GitHub Pages' current custom-domain instructions.
- Keep `public/CNAME` containing exactly: agorademos.com
- Enable HTTPS after DNS resolves.

## Search
- Verify https://agorademos.com/
- Add the property to Google Search Console.
- Submit https://agorademos.com/sitemap.xml
- Search indexing can take time; the CNAME/SEO files do not guarantee instant indexing.

## Monthly newsletter
- Create a Railway Cron Job.
- Run once a month.
- It should POST to:
  /api/admin/send-newsletter
- Send header:
  X-Admin-Key: <your ADMIN_KEY>
- Never expose that key in frontend source.

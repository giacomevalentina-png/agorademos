
# Agora Demos

A student-friendly finance + economics + QRM + PSIR newsroom with interactive explainers.

## Architecture

- `frontend/` — React + Vite, designed to live in a GitHub repository and deploy to GitHub Pages (a workflow is included).
- `backend/` — Flask + PostgreSQL API, designed for Railway.
- Newsletter — Gmail SMTP using a Google App Password.
- Monthly newsletter — call `POST /api/admin/send-newsletter` once a month from a Railway Cron Job.

## 1. Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 2. Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python app.py
```

The frontend defaults to `http://localhost:5000/api`.

## 3. Gmail newsletter setup

Use a dedicated Gmail account for Agora Demos. Turn on 2-Step Verification and create a Google **App Password** for SMTP. Do not put the App Password in GitHub.

Set these Railway variables:

- `SMTP_HOST=smtp.gmail.com`
- `SMTP_PORT=587`
- `SMTP_USERNAME=yournewsletter@gmail.com`
- `SMTP_PASSWORD=your_google_app_password`
- `NEWSLETTER_FROM=Agora Demos <yournewsletter@gmail.com>`

The backend sends:
1. a welcome email immediately after subscription;
2. a monthly digest when the admin newsletter endpoint is triggered.

## 4. Railway database

Create a PostgreSQL service in the same Railway project and connect its `DATABASE_URL` to the backend service.

The app creates the `Subscriber` and `Article` tables automatically on startup for this starter project.

## 5. Railway monthly newsletter

Create a Railway Cron Job that makes an authenticated POST request to:

`https://YOUR-BACKEND/api/admin/send-newsletter`

with:

`X-Admin-Key: YOUR_ADMIN_KEY`

Run it once per month. Keep the endpoint protected and never expose `ADMIN_KEY` in frontend code.

A cron job should invoke the endpoint; the backend itself does not rely on a continuously running scheduler, which keeps deployment simpler.

## 6. Adding articles

For this starter, articles are seeded in `backend/app.py`.

For the production version, move article content into PostgreSQL or a CMS/admin interface. The `interactive` JSON field is intentionally designed so each article can carry its own interactive:

- `hypothesis`
- `compound`
- `quiz`

You can add future types such as:
- `option_payoff`
- `normal_distribution`
- `regression`
- `inflation`
- `fx`
- `portfolio`
- `game_theory`

## Design direction

The UI is intentionally inspired by the uploaded reference's editorial/newspaper structure, but uses Agora Demos' own identity:
white paper, pale pastel blue, black typography, rounded cards, editorial labels, charts, playful details, and a clean student-newsroom feel.


## GitHub Pages frontend

1. Create a GitHub repository and put the contents of `frontend/` in it.
2. In GitHub repository **Settings → Pages**, select **GitHub Actions** as the source.
3. In **Settings → Secrets and variables → Actions → Variables**, create:
   - `VITE_API_URL` = your Railway API URL ending in `/api`
4. Push to `main`. The included workflow builds and deploys the site.

The frontend uses `HashRouter`, so article URLs work on GitHub Pages without server-side rewrite configuration.


## Editor Studio

Open:

`https://agorademos.com/#/studio`

The Studio lets you:
- log in with the server-side `ADMIN_KEY`;
- see registered newsletter emails and registration dates;
- publish articles;
- attach a hypothesis-testing graph, compound-growth tool, quiz, or custom JSON interactive;
- delete articles;
- preview the monthly newsletter;
- manually send the monthly newsletter.

### Security

Do **not** put a Gmail password or the admin key in the GitHub repository.

For Gmail, use a dedicated Agora Demos mailbox and a Google App Password in Railway's `SMTP_PASSWORD`. If the credential you supplied is your normal Gmail password rather than a Google App Password, do not use it for SMTP; create an App Password instead.

The admin password is a separate Railway environment variable called `ADMIN_KEY`.

## agorademos.com

The project now includes:
- `public/CNAME`
- `robots.txt`
- `sitemap.xml`
- SEO/Open Graph metadata

This prepares the site for `agorademos.com`, but the domain cannot become live merely by adding the CNAME file. You must own/control the domain and point its DNS to the hosting service. You should also submit the sitemap in Google Search Console after the site is live.

Because the current GitHub Pages build uses HashRouter, the site will work at the domain immediately, but for stronger long-term SEO, migrate the frontend to a host that supports clean routes (for example, Vercel) once you have the domain connected.

## Custom domain: agorademos.com

The project includes `frontend/public/CNAME` for `agorademos.com`, plus basic SEO files.

Important: `agorademos.com` is already serving an existing Agora website right now. This project does **not** automatically replace the live site. To launch this version at the same domain, first deploy the frontend and then change the domain's DNS / hosting configuration to the new frontend host. Keep the Railway API URL in `VITE_API_URL`.

For search visibility, submit `https://agorademos.com/sitemap.xml` in Google Search Console after the new site is live. Search engines can take time to re-crawl and index a replacement site.

## Visual redesign (September 2026)
The public homepage has been redesigned as an editorial finance/economics magazine rather than a SaaS-style landing page. It now uses a pastel-blue / white / black palette, a newspaper-style masthead and topic ticker, a large editorial hero, headline cards, newsletter block, interactive toolbox, subject desks, and a student-newsroom About section.

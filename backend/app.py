import os
import smtplib
from datetime import datetime, timezone
from email.message import EmailMessage

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv("FRONTEND_ORIGIN", "*").split(","))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///agora.db")
# Railway/Postgres sometimes exposes postgres://; SQLAlchemy expects postgresql://.
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


class Subscriber(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(320), unique=True, nullable=False, index=True)
    active = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))


class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(160), unique=True, nullable=False, index=True)
    title = db.Column(db.String(300), nullable=False)
    category = db.Column(db.String(80), nullable=False)
    excerpt = db.Column(db.Text, nullable=False)
    body = db.Column(db.Text, nullable=False)
    hero_image = db.Column(db.String(500), nullable=True)
    published_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    interactive = db.Column(db.JSON, nullable=True)


def seed_articles():
    if Article.query.count():
        return

    articles = [
        Article(
            slug="hypothesis-testing-without-the-jargon",
            title="Hypothesis Testing Without the Jargon",
            category="QRM",
            excerpt="A visual guide to null hypotheses, p-values, test statistics, and what a result actually tells you.",
            body=(
                "Statistical hypothesis testing is a structured way to compare observed evidence "
                "with a benchmark assumption. The key is to separate the null hypothesis, the test "
                "statistic, and the p-value. A small p-value does not tell us the probability that "
                "the null hypothesis is true; it tells us how unusual the observed result would be "
                "under the null model."
            ),
            interactive={
                "type": "hypothesis",
                "title": "Try a two-sided z-test",
                "defaults": {"sample_mean": 22.64, "null_mean": 20, "std_error": 1.35}
            }
        ),
        Article(
            slug="why-interest-rates-move-asset-prices",
            title="Why Interest Rates Move Asset Prices",
            category="Finance",
            excerpt="A student-friendly tour of discounting, duration, and why a rate change can ripple through markets.",
            body=(
                "Financial assets are valued by comparing future cash flows with what those cash flows "
                "are worth today. When discount rates change, the present value of future cash flows changes. "
                "The sensitivity depends on the timing and structure of those cash flows."
            ),
            interactive={
                "type": "compound",
                "title": "Explore compound growth",
                "defaults": {"principal": 1000, "rate": 5, "years": 10, "contribution": 100}
            }
        ),
        Article(
            slug="institutions-and-global-cooperation",
            title="How International Institutions Coordinate Across Borders",
            category="PSIR",
            excerpt="A neutral introduction to how international organizations, states, and non-state actors coordinate on shared problems.",
            body=(
                "International cooperation can be organized through treaties, international organizations, "
                "informal forums, and repeated interactions among governments and other actors. Different "
                "institutional designs create different incentives, information flows, and enforcement constraints."
            ),
            interactive={
                "type": "quiz",
                "title": "Quick concept check",
                "questions": [
                    {
                        "question": "Which concept focuses on rules and organizations that structure repeated interaction?",
                        "options": ["Institutions", "Inflation", "Duration", "Liquidity"],
                        "answer": 0
                    },
                    {
                        "question": "Which is a useful distinction in studying international cooperation?",
                        "options": ["Actors and institutions", "Only GDP", "Only exchange rates", "Only elections"],
                        "answer": 0
                    }
                ]
            }
        ),
    ]
    db.session.add_all(articles)
    db.session.commit()


@app.get("/api/health")
def health():
    return jsonify({"status": "ok", "service": "Agora Demos API"})


@app.get("/api/articles")
def get_articles():
    category = request.args.get("category")
    query = Article.query.order_by(Article.published_at.desc())
    if category and category.lower() != "all":
        query = query.filter(Article.category.ilike(category))
    articles = query.all()
    return jsonify([{
        "id": a.id,
        "slug": a.slug,
        "title": a.title,
        "category": a.category,
        "excerpt": a.excerpt,
        "hero_image": a.hero_image,
        "published_at": a.published_at.isoformat(),
    } for a in articles])


@app.get("/api/articles/<slug>")
def get_article(slug):
    article = Article.query.filter_by(slug=slug).first_or_404()
    return jsonify({
        "id": article.id,
        "slug": article.slug,
        "title": article.title,
        "category": article.category,
        "excerpt": article.excerpt,
        "body": article.body,
        "hero_image": article.hero_image,
        "published_at": article.published_at.isoformat(),
        "interactive": article.interactive,
    })


@app.post("/api/subscribe")
def subscribe():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if "@" not in email or "." not in email.split("@")[-1]:
        return jsonify({"error": "Please enter a valid email address."}), 400

    existing = Subscriber.query.filter_by(email=email).first()
    if existing:
        existing.active = True
    else:
        db.session.add(Subscriber(email=email))
    db.session.commit()

    # Immediate welcome email. If SMTP isn't configured, subscription still succeeds.
    try:
        send_email(
            to=email,
            subject="Welcome to Agora Demos — you're in.",
            body=(
                "Welcome to Agora Demos.\n\n"
                "You are subscribed to the monthly newsletter featuring new student-friendly "
                "articles and interactive explainers on finance, economics, quantitative reasoning, "
                "political science and international relations.\n\n"
                "Read the newest stories at https://agorademos.com/\n\n"
                "— Agora Demos"
            ),
            html=(
                '<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;color:#101416">'
                '<div style="background:#bfe7ef;padding:28px;border-radius:18px">'
                '<div style="font-size:26px;font-weight:800">AGORA <span style="color:#5ca9b8">DEMOS.</span></div>'
                '<p style="letter-spacing:2px;font-size:11px;font-weight:700">WELCOME TO THE NEWSROOM</p>'
                '</div>'
                '<div style="padding:28px">'
                '<h1 style="font-size:30px">You’re in.</h1>'
                '<p style="line-height:1.7;color:#5e6a70">You’re now subscribed to the Agora Demos monthly brief: new explainers, interactive tools, graphs and quizzes covering finance, economics, QRM and PSIR.</p>'
                '<a href="https://agorademos.com/" style="display:inline-block;background:#101416;color:white;padding:12px 16px;border-radius:7px;text-decoration:none;font-weight:700">READ AGORA DEMOS →</a>'
                '<p style="font-size:12px;color:#879297;margin-top:30px">You can unsubscribe at any time.</p>'
                '</div></div>'
            )
        )
    except Exception as exc:
        app.logger.warning("Welcome email failed: %s", exc)

    return jsonify({"message": "You're subscribed! Check your inbox for a welcome email."})


def send_email(to, subject, body, html=None):
    host = os.environ["SMTP_HOST"]
    port = int(os.getenv("SMTP_PORT", "587"))
    username = os.environ["SMTP_USERNAME"]
    password = os.environ["SMTP_PASSWORD"]
    sender = os.getenv("NEWSLETTER_FROM", username)

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = sender
    msg["To"] = to
    msg.set_content(body)
    if html:
        msg.add_alternative(html, subtype="html")

    with smtplib.SMTP(host, port, timeout=20) as smtp:
        smtp.starttls()
        smtp.login(username, password)
        smtp.send_message(msg)



@app.post("/api/admin/login")
def admin_login():
    data = request.get_json(silent=True) or {}
    password = data.get("password", "")
    expected = os.getenv("ADMIN_KEY", "")
    if not expected or password != expected:
        return jsonify({"error": "Invalid admin password."}), 401
    return jsonify({"ok": True, "message": "Admin access granted."})


def require_admin():
    provided = request.headers.get("X-Admin-Key", "")
    expected = os.getenv("ADMIN_KEY", "")
    return bool(expected) and provided == expected


@app.get("/api/admin/subscribers")
def admin_subscribers():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401
    rows = Subscriber.query.order_by(Subscriber.created_at.desc()).all()
    return jsonify([{
        "id": x.id,
        "email": x.email,
        "active": x.active,
        "created_at": x.created_at.isoformat() if x.created_at else None
    } for x in rows])


@app.get("/api/admin/newsletter-preview")
def admin_newsletter_preview():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401
    articles = Article.query.order_by(Article.published_at.desc()).limit(5).all()
    return jsonify({
        "subject": "Agora Demos — New this month",
        "intro": "New explainers, graphs, quizzes and interactive tools from Agora Demos.",
        "articles": [{"title": a.title, "category": a.category, "excerpt": a.excerpt} for a in articles],
        "closing": "See you in the Agora.\n— Agora Demos"
    })


@app.post("/api/admin/articles")
def admin_create_article():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(silent=True) or {}
    required = ["slug", "title", "category", "excerpt", "body"]
    missing = [k for k in required if not str(data.get(k, "")).strip()]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400

    if Article.query.filter_by(slug=data["slug"].strip()).first():
        return jsonify({"error": "That slug already exists."}), 409

    article = Article(
        slug=data["slug"].strip(),
        title=data["title"].strip(),
        category=data["category"].strip().upper(),
        excerpt=data["excerpt"].strip(),
        body=data["body"].strip(),
        hero_image=(data.get("hero_image") or "").strip() or None,
        interactive=data.get("interactive")
    )
    db.session.add(article)
    db.session.commit()
    return jsonify({"message": "Article published.", "id": article.id}), 201


@app.delete("/api/admin/articles/<slug>")
def admin_delete_article(slug):
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401
    article = Article.query.filter_by(slug=slug).first()
    if not article:
        return jsonify({"error": "Article not found."}), 404
    db.session.delete(article)
    db.session.commit()
    return jsonify({"message": "Article deleted."})


def admin_authorized():
    return bool(os.getenv("ADMIN_KEY")) and request.headers.get("X-Admin-Key", "") == os.getenv("ADMIN_KEY")


def article_payload(a):
    return {
        "id": a.id, "slug": a.slug, "title": a.title, "category": a.category,
        "excerpt": a.excerpt, "body": a.body, "hero_image": a.hero_image,
        "published_at": a.published_at.isoformat() if a.published_at else None,
        "interactive": a.interactive,
    }


@app.get("/api/admin/stats")
def admin_stats():
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({
        "subscribers": Subscriber.query.filter_by(active=True).count(),
        "articles": Article.query.count(),
    })


@app.get("/api/admin/subscribers")
def admin_subscribers():
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    subs = Subscriber.query.order_by(Subscriber.created_at.desc()).all()
    return jsonify([{
        "id": s.id, "email": s.email, "active": s.active,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    } for s in subs])


@app.get("/api/admin/articles")
def admin_articles():
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify([article_payload(a) for a in Article.query.order_by(Article.published_at.desc()).all()])


@app.post("/api/admin/articles")
def admin_create_article():
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    data = request.get_json(silent=True) or {}
    required = ["slug", "title", "category", "excerpt", "body"]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": "Missing: " + ", ".join(missing)}), 400
    if Article.query.filter_by(slug=data["slug"].strip()).first():
        return jsonify({"error": "That slug already exists."}), 409
    a = Article(
        slug=data["slug"].strip(), title=data["title"].strip(), category=data["category"].strip(),
        excerpt=data["excerpt"].strip(), body=data["body"], hero_image=data.get("hero_image"),
        interactive=data.get("interactive")
    )
    db.session.add(a); db.session.commit()
    return jsonify(article_payload(a)), 201


@app.put("/api/admin/articles/<int:article_id>")
def admin_update_article(article_id):
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    a = Article.query.get_or_404(article_id)
    data = request.get_json(silent=True) or {}
    for key in ["slug", "title", "category", "excerpt", "body", "hero_image", "interactive"]:
        if key in data:
            setattr(a, key, data[key])
    db.session.commit()
    return jsonify(article_payload(a))


@app.delete("/api/admin/articles/<int:article_id>")
def admin_delete_article(article_id):
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    a = Article.query.get_or_404(article_id)
    db.session.delete(a); db.session.commit()
    return jsonify({"message": "Deleted"})


@app.get("/api/admin/newsletter-template")
def newsletter_template():
    if not admin_authorized():
        return jsonify({"error": "Unauthorized"}), 401
    articles = Article.query.order_by(Article.published_at.desc()).limit(5).all()
    subject = "Agora Demos — This month's new stories"
    body = "Agora Demos — Monthly Brief\n\nHere are the newest stories from the newsroom:\n\n" + "\n\n".join(
        f"{i+1}. {a.title} [{a.category}]\n{a.excerpt}" for i, a in enumerate(articles)
    ) + "\n\nRead the full stories and try the interactive tools on Agora Demos.\n\n— Agora Demos"
    return jsonify({"subject": subject, "body": body})


@app.post("/api/admin/send-newsletter")
def send_newsletter():
    if not require_admin():
        return jsonify({"error": "Unauthorized"}), 401

    subscribers = Subscriber.query.filter_by(active=True).all()
    articles = Article.query.order_by(Article.published_at.desc()).limit(5).all()

    if not subscribers:
        return jsonify({"message": "No active subscribers.", "sent": 0})

    article_lines = "\n\n".join(
        f"{i+1}. {a.title} [{a.category}]\n{a.excerpt}"
        for i, a in enumerate(articles)
    )
    body = (
        "Agora Demos — Monthly Brief\n\n"
        "New explainers, graphs, quizzes and interactive tools from the Agora Demos newsroom.\n\n"
        f"{article_lines}\n\n"
        "See you in the Agora.\n\n"
        "— Agora Demos"
    )

    sent = 0
    for subscriber in subscribers:
        try:
            cards = "".join(
                f'<div style="border:1px solid #dce5e5;border-radius:12px;padding:16px;margin:12px 0">'
                f'<div style="font-size:10px;font-weight:800;color:#5ca9b8;letter-spacing:1px">{a.category.upper()}</div>'
                f'<h2 style="font-size:20px;margin:7px 0">{a.title}</h2>'
                f'<p style="color:#68757a;line-height:1.5">{a.excerpt}</p></div>' for a in articles
            )
            html = (
                '<div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#101416">'
                '<div style="background:#bfe7ef;padding:28px;border-radius:18px">'
                '<div style="font-size:26px;font-weight:800">AGORA <span style="color:#5ca9b8">DEMOS.</span></div>'
                '<p style="font-weight:700">MONTHLY BRIEF</p></div>'
                f'<div style="padding:24px"><p style="color:#68757a">New from the newsroom:</p>{cards}'
                '<a href="https://agorademos.com/" style="display:inline-block;background:#101416;color:white;padding:12px 16px;border-radius:7px;text-decoration:none;font-weight:700">READ ALL STORIES →</a>'
                '<p style="font-size:11px;color:#879297;margin-top:28px">You’re receiving this because you subscribed to Agora Demos. Unsubscribe anytime.</p>'
                '</div></div>'
            )
            send_email(to=subscriber.email, subject="Agora Demos — New this month", body=body, html=html)
            sent += 1
        except Exception as exc:
            app.logger.warning("Newsletter failed for %s: %s", subscriber.email, exc)

    return jsonify({"message": "Newsletter run complete.", "sent": sent, "total": len(subscribers)})


with app.app_context():
    db.create_all()
    seed_articles()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")))

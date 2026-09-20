
import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import Plot from "react-plotly.js";
import { ArrowRight, BarChart3, ChevronRight, CircleArrowUp, Mail, Menu, Search, Sparkles, X, LockKeyhole, Users, Send, Plus, Trash2 } from "lucide-react";
import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const demoArticles = [
  {
    slug: "hypothesis-testing-without-the-jargon",
    title: "Hypothesis Testing Without the Jargon",
    category: "QRM",
    excerpt: "A visual guide to null hypotheses, p-values, test statistics, and what a result actually tells you.",
    published_at: "2026-09-16T00:00:00Z",
  },
  {
    slug: "why-interest-rates-move-asset-prices",
    title: "Why Interest Rates Move Asset Prices",
    category: "Finance",
    excerpt: "A student-friendly tour of discounting, duration, and why a rate change can ripple through markets.",
    published_at: "2026-09-12T00:00:00Z",
  },
  {
    slug: "institutions-and-global-cooperation",
    title: "How International Institutions Coordinate Across Borders",
    category: "PSIR",
    excerpt: "A neutral introduction to how international organizations, states, and non-state actors coordinate on shared problems.",
    published_at: "2026-09-08T00:00:00Z",
  },
];

function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname, search]);
  return null;
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:slug" element={<ArticlePage />} />
        <Route path="/category/:category" element={<CategoryPage />} />
        <Route path="/topic/:topic" element={<TopicPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/:tool" element={<ToolPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/studio" element={<AdminStudio />} />
      </Routes>
    </>
  );
}

function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function subscribe(e) {
    e.preventDefault();
    setStatus("Subscribing…");
    try {
      const r = await fetch(`${API}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      setStatus(data.message || data.error);
      if (r.ok) setEmail("");
    } catch {
      setStatus("Newsletter server is not connected yet.");
    }
  }

  return (
    <>
      <header className="site-header">
        <div className="masthead page-width">
          <Link to="/" className="brand-lockup">
            <span className="brand-mark">✦</span>
            <span><b>AGORA DEMOS</b><small>FINANCE · ECONOMICS · PSIR · QRM</small></span>
          </Link>
          <nav className={open ? "nav open" : "nav"}>
            <Link to="/" onClick={() => setOpen(false)}>HOME</Link>
            <Link to="/category/finance" onClick={() => setOpen(false)}>FINANCE</Link>
            <Link to="/category/economics" onClick={() => setOpen(false)}>ECONOMICS</Link>
            <Link to="/category/qrm" onClick={() => setOpen(false)}>QRM</Link>
            <Link to="/category/psir" onClick={() => setOpen(false)}>PSIR</Link>
            <Link to="/tools" onClick={() => setOpen(false)}>TOOLS</Link>
            <Link to="/about" onClick={() => setOpen(false)}>ABOUT</Link>
          </nav>
          <SearchBox onNavigate={() => setOpen(false)} menuOpen={open} onMenu={() => setOpen(v => !v)} />
        </div>
        <div className="topic-bar page-width">
          <span className="trending">TRENDING NOW <ArrowRight size={13}/></span>
          {[["Markets","markets"],["Global Economy","global-economy"],["Interest Rates","interest-rates"],["Geopolitics","geopolitics"],["Options","options"],["Data & AI","data-ai"],["Sustainability","sustainability"],["Student Finance","student-finance"]].map(([label,slug]) => (
            <Link className="topic-link" key={slug} to={`/topic/${slug}`}>{label}</Link>
          ))}
          <span className="date-chip">
  {new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })}{" "}
</span>
        </div>
      </header>
      <main>{children}</main>
     <footer id="contact" className="footer">
        <div className="footer-inner page-width">
          <div>
            <div className="brand-lockup footer-brand"><span className="brand-mark">✦</span><span><b>AGORA DEMOS</b><small>FINANCE · ECONOMICS · PSIR · QRM</small></span></div>
            <p>Complex ideas. Clear explanations. A student-built newsroom.</p>
          </div>
          <form onSubmit={subscribe} className="footer-form">
            <strong>GET THE MONTHLY BRIEF.</strong>
            <div className="subscribe-box"><Mail size={16}/><input value={email} onChange={e => setEmail(e.target.value)} type="email" required placeholder="your@email.com"/><button>SUBSCRIBE <ArrowRight size={14}/></button></div>
            <small>{status || "New stories, tools and quizzes once a month."}</small>
            <Link className="admin-link" to="/studio"><LockKeyhole size={12}/> EDITOR STUDIO</Link>
          </form>
        </div>
      </footer>
    </>
  );
}

function Home() {
  const [articles, setArticles] = useState(demoArticles);
  const [active, setActive] = useState("ALL");
  useEffect(() => {
    fetch(`${API}/articles`).then(r => r.ok ? r.json() : Promise.reject()).then(setArticles).catch(() => {});
  }, []);
  const filtered = active === "ALL" ? articles : articles.filter(a => a.category.toUpperCase() === active);

  return (
    <Layout>
      <section className="front-hero page-width">
        <div className="hero-copy">
          <div className="micro-nav"><span>LEARN</span><i>×</i><span>EXPLORE</span><i>×</i><span>GROW</span></div>
          <h1>Finance, Economics<br/><span>& Global Affairs</span><em>made understandable.</em></h1>
          <p>Agora Demos is a student-led publication for people who want to understand markets, economics, political science and quantitative reasoning without having to decode a textbook first.</p>
          <div className="hero-actions"><Link className="primary-btn" to="/articles">EXPLORE ARTICLES <ArrowRight size={16}/></Link><Link className="text-link" to="/about">WHY AGORA? <ChevronRight size={15}/></Link></div>
        </div>
        <div className="editorial-visual" aria-label="Finance and global affairs visual">
          <div className="visual-paper paper-a"><span>MARKETS</span><b>RATES<br/>VOL.</b><div className="tiny-line"></div></div>
          <div className="visual-paper paper-b"><span>QRM / 04</span><div className="candles"><i></i><i></i><i></i><i></i><i></i><i></i></div><small>data tells a story.</small></div>
          <div className="visual-stat"><small>GLOBAL MARKETS</small><strong>01—26</strong><p>prices · policy · people</p></div>
          <div className="visual-note">better<br/>questions<br/>→ better<br/>decisions</div>
          <div className="visual-coin">◎</div>
          <div className="visual-orbit"></div>
        </div>
      </section>

      <section id="latest" className="page-width section editorial-section">
        <div className="section-heading editorial-heading"><div><div className="eyebrow">LATEST STORIES</div><h2>TOP HEADLINES.</h2></div><Link to="/articles" className="view-all">VIEW ALL ARTICLES <ArrowRight size={14}/></Link></div>
        <div className="headline-grid">
          {filtered.slice(0, 4).map((a, i) => <ArticleCard key={a.slug} article={a} featured={i === 0}/>) }
          <NewsletterCard />
        </div>
      </section>

      <section id="tools" className="page-width tools-editorial">
        <div className="tools-title"><div className="eyebrow">LEARN BY DOING</div><h2>THE TOOLBOX.</h2><p>Turn a concept into something you can actually play with.</p></div>
        <div className="tool-cards">
          <Link to="/tools/hypothesis" className="tool-card"><div className="tool-icon"><BarChart3/></div><span>HYPOTHESIS<br/>TESTING</span><small>p-values · confidence intervals</small><ArrowRight/></Link>
          <Link to="/tools/compound" className="tool-card"><div className="tool-icon"><CircleArrowUp/></div><span>COMPOUND<br/>GROWTH</span><small>rates · time · contributions</small><ArrowRight/></Link>
          <Link to="/tools/quiz" className="tool-card"><div className="tool-icon"><Sparkles/></div><span>CONCEPT<br/>QUIZZES</span><small>test what you just learned</small><ArrowRight/></Link>
        </div>
      </section>

      <section className="page-width split-news">
        <CategoryDesk category="FINANCE" title={<>THE MARKET<br/><em>DESK.</em></>} text="Rates, derivatives, volatility and the ideas behind the numbers." />
        <CategoryDesk category="ECONOMICS" title={<>THE BIGGER<br/><em>PICTURE.</em></>} text="Inflation, trade, growth and incentives — without the fog." />
        <CategoryDesk category="QRM" title={<>DATA,<br/><em>EXPLAINED.</em></>} text="Probability, statistics and quantitative reasoning with actual examples." />
        <CategoryDesk category="PSIR" title={<>WORLD<br/><em>AFFAIRS.</em></>} text="Institutions, geopolitics and international cooperation, clearly mapped." />
      </section>

      <section className="page-width about-editorial">
        <div className="about-quote">“Understanding should feel<br/><em>curious, not intimidating.</em>”</div>
        <div><div className="eyebrow">ABOUT AGORA DEMOS</div><h2>A STUDENT NEWSROOM<br/>WITH A <em>QUANT</em> BRAIN.</h2><p>We take the things students are expected to understand — markets, data, economics, institutions — and rebuild them as stories, visual explanations, experiments and small interactive tools.</p><p>Not a textbook. Not a finance bro feed. Just a place to think more clearly.</p><Link className="primary-btn" to="/about">READ ABOUT AGORA <ArrowRight size={15}/></Link></div>
      </section>
    </Layout>
  );
}

function SearchBox({ onNavigate, menuOpen, onMenu }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  function submit(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onNavigate?.();
  }
  return <div className="header-actions">
    <form className="header-search" onSubmit={submit} role="search">
      <Search size={14}/><input aria-label="Search articles and topics" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search articles, topics..." />
    </form>
    <Link className="header-icon" to="/articles" aria-label="Browse articles"><Mail size={15}/></Link>
    <button className="menu-button" onClick={onMenu} aria-label="Menu">{menuOpen ? <X size={18}/> : <Menu size={18}/>}</button>
  </div>;
}

function useArticles() {
  const [articles, setArticles] = useState(demoArticles);
  useEffect(() => {
    fetch(`${API}/articles`).then(r => r.ok ? r.json() : Promise.reject()).then(setArticles).catch(() => {});
  }, []);
  return articles;
}

function ArticlesPage() {
  const articles = useArticles();
  return <Layout><section className="listing-page page-width"><div className="listing-head"><div><div className="eyebrow">AGORA DEMOS / ALL STORIES</div><h1>THE NEWSROOM.</h1><p>Finance, economics, QRM and PSIR — all the stories in one place.</p></div><Link className="text-link" to="/">← BACK HOME</Link></div><div className="article-list-grid">{articles.map(a=><ArticleCard key={a.slug} article={a}/>)}</div></section></Layout>;
}

function CategoryPage() {
  const { category } = useParams();
  const articles = useArticles();
  const label = category.toUpperCase();
  const items = articles.filter(a => a.category?.toUpperCase() === label);
  const descriptions = {
    FINANCE: "Markets, derivatives, volatility, rates and the mechanics behind prices.",
    ECONOMICS: "Inflation, growth, trade, incentives and the forces shaping economies.",
    QRM: "Probability, statistics, econometrics and quantitative reasoning made visual.",
    PSIR: "International institutions, geopolitics, cooperation and global affairs."
  };
  return <Layout><section className="listing-page page-width"><div className="listing-head"><div><div className="eyebrow">AGORA DESK</div><h1>{label}.</h1><p>{descriptions[label] || "Explore stories, explanations and ideas."}</p></div><Link className="text-link" to="/">← BACK HOME</Link></div>{items.length ? <div className="article-list-grid">{items.map(a=><ArticleCard key={a.slug} article={a}/>)}</div> : <EmptyCategory label={label}/>}</section></Layout>;
}

function TopicPage() {
  const { topic } = useParams();
  const articles = useArticles();
  const title = topic.split("-").map(w=>w[0]?.toUpperCase()+w.slice(1)).join(" ");
  const keywords = topic.replaceAll("-", " ").toLowerCase().split(" ");
  const items = articles.filter(a => `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().split(/\s+/).some(word => keywords.includes(word)));
  return <Layout><section className="listing-page page-width"><div className="listing-head"><div><div className="eyebrow">TRENDING NOW / TOPIC</div><h1>{title}.</h1><p>Stories and explainers connected to {title.toLowerCase()}.</p></div><Link className="text-link" to="/">← BACK HOME</Link></div>{items.length ? <div className="article-list-grid">{items.map(a=><ArticleCard key={a.slug} article={a}/>)}</div> : <EmptyCategory label={title}/>}</section></Layout>;
}

function SearchPage() {
  const articles = useArticles();
  const [params] = useSearchParams();
  const q = (params.get("q") || "").trim();
  const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
  const results = articles.filter(a => terms.every(t => `${a.title} ${a.excerpt} ${a.category}`.toLowerCase().includes(t)));
  return <Layout><section className="listing-page page-width"><div className="listing-head"><div><div className="eyebrow">SEARCH RESULTS</div><h1>{q ? `RESULTS FOR “${q}”` : "SEARCH AGORA."}</h1><p>{q ? `${results.length} matching ${results.length === 1 ? "story" : "stories"}.` : "Search the Agora Demos newsroom."}</p></div><Link className="text-link" to="/">← BACK HOME</Link></div>{q && results.length ? <div className="article-list-grid">{results.map(a=><ArticleCard key={a.slug} article={a}/>)}</div> : <div className="empty-state"><Search size={28}/><h2>{q ? "No stories yet." : "Try a topic, title or category."}</h2><p>Try words like options, rates, QRM, institutions or economics.</p></div>}</section></Layout>;
}

function ToolsPage() {
  return <Layout><section className="listing-page page-width"><div className="listing-head"><div><div className="eyebrow">LEARN BY DOING</div><h1>THE TOOLBOX.</h1><p>Interactive labs that let you change the assumptions and see what happens.</p></div><Link className="text-link" to="/">← BACK HOME</Link></div><div className="tool-cards tool-cards-page"><Link to="/tools/hypothesis" className="tool-card"><div className="tool-icon"><BarChart3/></div><span>HYPOTHESIS<br/>TESTING</span><small>Change the sample mean and standard error.</small><ArrowRight/></Link><Link to="/tools/compound" className="tool-card"><div className="tool-icon"><CircleArrowUp/></div><span>COMPOUND<br/>GROWTH</span><small>Play with rates, time and contributions.</small><ArrowRight/></Link><Link to="/tools/quiz" className="tool-card"><div className="tool-icon"><Sparkles/></div><span>CONCEPT<br/>QUIZ</span><small>Test whether the concept actually stuck.</small><ArrowRight/></Link></div></section></Layout>;
}

function ToolPage() {
  const { tool } = useParams();
  const tools = {
    hypothesis: {title:"HYPOTHESIS TESTING LAB", type:"hypothesis"},
    compound: {title:"COMPOUND GROWTH LAB", type:"compound"},
    quiz: {title:"CONCEPT QUIZ", type:"quiz"}
  };
  const config = tools[tool] || tools.hypothesis;
  return <Layout><section className="tool-page page-width"><div className="tool-page-head"><div><div className="eyebrow">INTERACTIVE LAB</div><h1>{config.title}</h1><p>Change the inputs. Watch the result change. Then read the related story.</p></div><Link className="text-link" to="/tools">← BACK TO TOOLS</Link></div><div className="tool-page-grid"><div>{config.type === "hypothesis" && <HypothesisTool title="Explore the test statistic" defaults={{sample_mean:22.64,null_mean:20,std_error:1.35}}/>}{config.type === "compound" && <CompoundTool title="Explore compound growth" defaults={{principal:1000,rate:5,years:10,contribution:100}}/>}{config.type === "quiz" && <QuizTool title="Quant + finance quick check" questions={[{question:"What does a p-value measure?",options:["The probability the null is true","How surprising the data are if the null is true","The size of the sample","The population mean"],answer:1},{question:"What happens to compound growth when the rate rises, holding time fixed?",options:["The final value generally rises","It stays the same","It becomes zero","Only the first contribution changes"],answer:0},{question:"Which is an example of a parameter?",options:["A sample mean","A calculated estimate","The true population mean","A single observation"],answer:2}]}/>}</div><aside className="tool-context"><div className="eyebrow">WHY THIS EXISTS</div><h2>LEARN BY CHANGING THE NUMBERS.</h2><p>Agora Demos tools are meant to sit beside the story, not replace it. Use the lab, notice what changes, then go back to the explanation.</p><Link to="/articles/hypothesis-testing-without-the-jargon" className="read-more">READ A RELATED STORY <ArrowRight size={14}/></Link></aside></div></section></Layout>;
}

function AboutPage() {
  return <Layout><section className="about-page page-width"><Link className="text-link" to="/">← BACK HOME</Link><div className="about-page-hero"><div><div className="eyebrow">ABOUT AGORA DEMOS</div><h1>A STUDENT NEWSROOM<br/>WITH A <em>QUANT</em> BRAIN.</h1></div><div className="about-page-note">Finance. Economics. QRM. PSIR.<br/>Explained with stories, data and things you can actually interact with.</div></div><div className="about-page-grid"><div className="about-quote">“Understanding should feel<br/><em>curious, not intimidating.</em>”</div><div><p>Agora Demos is a student-built publication for people who want to understand the systems around them without having to decode a textbook first.</p><p>We connect financial markets, economics, quantitative reasoning and international affairs through clear writing, visual explanations, small experiments and interactive tools.</p><p>It is intentionally a newsroom rather than a generic productivity platform: stories first, curiosity always.</p></div></div></section></Layout>;
}

function CategoryDesk({category, title, text}) {
  return <div className="mini-column"><div className="eyebrow">{category}</div><h3>{title}</h3><p>{text}</p><Link to={`/category/${category.toLowerCase()}`}>OPEN {category} DESK <ArrowRight size={14}/></Link></div>;
}

function EmptyCategory({label}) {
  return <div className="empty-state"><div className="eyebrow">{label}</div><h2>THE DESK IS QUIET — FOR NOW.</h2><p>More stories will appear here as they are published.</p><Link className="primary-btn" to="/articles">BROWSE ALL STORIES <ArrowRight size={15}/></Link></div>;
}

function NewsletterCard() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  async function submit(e) {
    e.preventDefault(); setStatus("Subscribing…");
    try { const r=await fetch(`${API}/subscribe`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email})}); const d=await r.json(); setStatus(d.message||d.error||"Done."); if(r.ok)setEmail(""); }
    catch { setStatus("Newsletter server is not connected yet."); }
  }
  return <div className="headline-newsletter"><span className="scribble">✦</span><small>STAY IN THE LOOP</small><h3>Choose to receive all<br/>news updates.</h3><form onSubmit={submit}><input aria-label="Email address" value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="EMAIL ADDRESS"/><button aria-label="Subscribe"><ArrowRight size={18}/></button></form><p>{status || "one useful email. no noise."}</p></div>;
}

function ArticleCard({ article, featured }) {
  const number = String(Math.max(1, demoArticles.indexOf(article) + 1)).padStart(2, "0");
  return <Link className={featured ? "headline-card featured" : "headline-card"} to={`/articles/${article.slug}`}>
    <div className="headline-visual"><span className="category-pill">{article.category}</span><div className="visual-grid-lines"></div><div className="headline-chart"><i></i><i></i><i></i><i></i><i></i></div><b>{number}</b></div>
    <div className="headline-copy"><div className="story-meta">{new Date(article.published_at).toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})} · AGORA DESK</div><h3>{article.title}</h3><p>{article.excerpt}</p><span className="read-more">VIEW MORE <ArrowRight size={14}/></span></div>
  </Link>;
}


function Admin() {
  const [key, setKey] = useState(sessionStorage.getItem("agora_admin_key") || "");
  const [authed, setAuthed] = useState(false);
  const [stats, setStats] = useState(null);
  const [subs, setSubs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [message, setMessage] = useState("");
  const blank = {slug:"", title:"", category:"Finance", excerpt:"", body:"", hero_image:"", interactive_json:""};
  const [form, setForm] = useState(blank);

  async function api(path, options={}) {
    const r = await fetch(`${API}${path}`, {...options, headers:{"Content-Type":"application/json", "X-Admin-Key":key, ...(options.headers||{})}});
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Request failed");
    return data;
  }
  async function login(e) {
    e.preventDefault();
    try { const st = await api("/admin/stats"); sessionStorage.setItem("agora_admin_key", key); setStats(st); setAuthed(true); await refresh(); setMessage("Admin access unlocked."); }
    catch { setMessage("Wrong admin key or backend not connected."); }
  }
  async function refresh() {
    try { setStats(await api("/admin/stats")); setSubs(await api("/admin/subscribers")); setArticles(await api("/admin/articles")); } catch(e) { setMessage(e.message); }
  }
  async function saveArticle(e) {
    e.preventDefault();
    try {
      let interactive = null;
      if (form.interactive_json.trim()) interactive = JSON.parse(form.interactive_json);
      const created = await api("/admin/articles", {method:"POST", body:JSON.stringify({...form, interactive, interactive_json:undefined})});
      setArticles([created, ...articles]); setForm(blank); setMessage("Article published to the database.");
    } catch(e) { setMessage(e.message.includes("JSON") ? "Interactive JSON is not valid." : e.message); }
  }
  async function deleteArticle(id) {
    if (!confirm("Delete this article?")) return;
    try { await api(`/admin/articles/${id}`, {method:"DELETE"}); setArticles(articles.filter(a=>a.id!==id)); } catch(e){setMessage(e.message);}
  }
  async function newsletter(send=false) {
    try {
      if (send && !confirm("Send the monthly newsletter to every active subscriber?")) return;
      const data = send ? await api("/admin/send-newsletter", {method:"POST"}) : await api("/admin/newsletter-template");
      if (send) setMessage(`Newsletter sent to ${data.sent} subscribers.`);
      else setMessage(`SUBJECT: ${data.subject}\n\n${data.body}`);
    } catch(e){setMessage(e.message);}
  }
  if (!authed) return <Layout><div className="admin-login page-width"><div className="eyebrow">PRIVATE DASHBOARD</div><h1>AGORA CONTROL ROOM.</h1><p>Only you should have access to subscriber data and publishing tools.</p><form onSubmit={login}><input value={key} onChange={e=>setKey(e.target.value)} type="password" placeholder="Admin key"/><button className="primary-btn">ENTER DASHBOARD</button></form><small>{message}</small></div></Layout>;
  return <Layout><div className="admin page-width">
    <div className="admin-head"><div><div className="eyebrow">PRIVATE DASHBOARD</div><h1>CONTROL ROOM.</h1></div><button className="text-link" onClick={()=>{sessionStorage.removeItem("agora_admin_key");setAuthed(false)}}>LOCK</button></div>
    <div className="admin-stats"><div><small>ACTIVE SUBSCRIBERS</small><strong>{stats?.subscribers ?? 0}</strong></div><div><small>ARTICLES</small><strong>{stats?.articles ?? 0}</strong></div><div><small>MONTHLY EMAIL</small><strong>READY</strong></div></div>
    <div className="admin-grid">
      <section className="admin-panel"><div className="eyebrow">PUBLISH</div><h2>NEW ARTICLE.</h2><form className="admin-form" onSubmit={saveArticle}>
        <input required placeholder="slug e.g. option-payoffs-101" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/>
        <input required placeholder="Headline" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
        <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>Finance</option><option>QRM</option><option>PSIR</option><option>Economics</option><option>Markets</option></select>
        <input required placeholder="Short excerpt" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})}/>
        <textarea required rows="8" placeholder="Article body. Separate paragraphs with blank lines." value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/>
        <input placeholder="Hero image URL (optional)" value={form.hero_image} onChange={e=>setForm({...form,hero_image:e.target.value})}/>
        <textarea rows="8" placeholder={'Optional interactive JSON, e.g. {"type":"quiz","title":"Quick quiz","questions":[...]}' } value={form.interactive_json} onChange={e=>setForm({...form,interactive_json:e.target.value})}/>
        <button className="primary-btn">PUBLISH ARTICLE</button>
      </form></section>
      <section className="admin-panel"><div className="eyebrow">AUDIENCE</div><h2>SUBSCRIBERS.</h2><p className="admin-note">These are the people who opted into the Agora Demos newsletter.</p><div className="subscriber-list">{subs.map(s=><div key={s.id}><span>{s.email}</span><small>{new Date(s.created_at).toLocaleDateString()}</small></div>)}{!subs.length && <p>No subscribers yet.</p>}</div></section>
    </div>
    <section className="admin-panel"><div className="eyebrow">EDITORIAL QUEUE</div><h2>YOUR STORIES.</h2><div className="admin-articles">{articles.map(a=><div className="admin-article" key={a.id}><div><span className="category-pill">{a.category}</span><h3>{a.title}</h3><small>/{a.slug}</small></div><button onClick={()=>deleteArticle(a.id)}>DELETE</button></div>)}</div></section>
    <section className="admin-panel newsletter-panel"><div><div className="eyebrow">NEWSLETTER</div><h2>MONTHLY BRIEF.</h2><p>Preview the generated email or send it to active subscribers.</p></div><div className="newsletter-actions"><button className="filter active" onClick={()=>newsletter(false)}>PREVIEW EMAIL</button><button className="primary-btn" onClick={()=>newsletter(true)}>SEND MONTHLY EMAIL</button></div></section>
    <pre className="admin-message">{message}</pre>
  </div></Layout>;
}

function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    fetch(`${API}/articles/${slug}`).then(r => r.ok ? r.json() : Promise.reject()).then(setArticle).catch(() => {
      const fallback = demoArticles.find(a => a.slug === slug);
      if (fallback) setArticle({...fallback, body: "This demo article is ready for your expanded editorial content.", interactive: null});
    });
  }, [slug]);

  if (!article) return <Layout><div className="loading page-width">Loading story…</div></Layout>;

  return (
    <Layout>
      <article className="article page-width">
        <div className="article-top">
          <Link to="/" className="back">← BACK HOME</Link>
          <span className="category-pill">{article.category}</span>
        </div>
        <div className="eyebrow">AGORA DOSSIER · {new Date(article.published_at).toLocaleDateString()}</div>
        <h1>{article.title}</h1>
        <p className="article-deck">{article.excerpt}</p>
        <div className="article-layout">
          <div className="article-body">
            {article.body.split("\n").map((p, i) => <p key={i}>{p}</p>)}
          </div>
          <InteractiveBlock data={article.interactive}/>
        </div>
      </article>
    </Layout>
  );
}

function InteractiveBlock({ data }) {
  if (!data) return null;
  if (data.type === "hypothesis") return <HypothesisTool defaults={data.defaults} title={data.title}/>;
  if (data.type === "compound") return <CompoundTool defaults={data.defaults} title={data.title}/>;
  if (data.type === "quiz") return <QuizTool questions={data.questions} title={data.title}/>;
  return null;
}

function HypothesisTool({defaults, title}) {
  const [mean, setMean] = useState(defaults.sample_mean);
  const [nullMean, setNullMean] = useState(defaults.null_mean);
  const [se, setSe] = useState(defaults.std_error);
  const z = (mean - nullMean) / se;
  const p = Math.max(0, Math.min(1, 2 * (1 - normalCdf(Math.abs(z)))));
  const x = Array.from({length:81}, (_,i) => -4 + i/10);
  const y = x.map(v => Math.exp(-v*v/2)/Math.sqrt(2*Math.PI));

  return <div className="interactive">
    <div className="interactive-head"><span>INTERACTIVE LAB</span><h3>{title}</h3></div>
    <div className="inputs">
      <label>Sample mean<input type="number" step="0.01" value={mean} onChange={e=>setMean(+e.target.value)}/></label>
      <label>Null mean<input type="number" step="0.01" value={nullMean} onChange={e=>setNullMean(+e.target.value)}/></label>
      <label>Standard error<input type="number" step="0.01" min="0.01" value={se} onChange={e=>setSe(+e.target.value)}/></label>
    </div>
    <div className="result-row"><div><small>Z-STATISTIC</small><strong>{z.toFixed(2)}</strong></div><div><small>TWO-SIDED P-VALUE</small><strong>{p.toFixed(4)}</strong></div><div><small>AT α = .05</small><strong>{p < .05 ? "UNUSUAL" : "NOT UNUSUAL"}</strong></div></div>
    <Plot className="plot" data={[{x,y,type:"scatter",mode:"lines"}]} layout={{height:270,margin:{l:40,r:15,t:20,b:40},paper_bgcolor:"transparent",plot_bgcolor:"transparent",xaxis:{title:"z"},yaxis:{title:"density"},font:{family:"Inter, sans-serif"}}} config={{displayModeBar:false,responsive:true}}/>
    <p className="tool-note">The p-value describes how unusual the observed statistic would be if the null model were true. It is not the probability that the null hypothesis is true.</p>
  </div>;
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}
function erf(x) {
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const t=1/(1+p*x);
  return sign*(1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-x*x));
}

function CompoundTool({defaults,title}) {
  const [principal,setPrincipal]=useState(defaults.principal);
  const [rate,setRate]=useState(defaults.rate);
  const [years,setYears]=useState(defaults.years);
  const [contribution,setContribution]=useState(defaults.contribution);
  const periods = Array.from({length:years+1},(_,i)=>i);
  const values = periods.map(y=>principal*Math.pow(1+rate/100,y)+contribution*((Math.pow(1+rate/100,y)-1)/(rate/100 || 1)));
  return <div className="interactive">
    <div className="interactive-head"><span>INTERACTIVE LAB</span><h3>{title}</h3></div>
    <div className="inputs">
      <label>Starting amount<input type="number" value={principal} onChange={e=>setPrincipal(+e.target.value)}/></label>
      <label>Annual return %<input type="number" step=".1" value={rate} onChange={e=>setRate(+e.target.value)}/></label>
      <label>Years<input type="number" min="1" max="50" value={years} onChange={e=>setYears(+e.target.value)}/></label>
      <label>Annual contribution<input type="number" value={contribution} onChange={e=>setContribution(+e.target.value)}/></label>
    </div>
    <Plot data={[{x:periods,y:values,type:"scatter",mode:"lines+markers"}]} layout={{height:270,margin:{l:55,r:15,t:20,b:40},paper_bgcolor:"transparent",plot_bgcolor:"transparent",xaxis:{title:"years"},yaxis:{title:"value"}}} config={{displayModeBar:false,responsive:true}}/>
    <div className="big-result">≈ {values.at(-1).toLocaleString(undefined,{maximumFractionDigits:0})}</div>
  </div>;
}

function QuizTool({questions,title}) {
  const [selected,setSelected]=useState({});
  const [submitted,setSubmitted]=useState(false);
  const score = questions.reduce((n,q,i)=>n+(selected[i]===q.answer?1:0),0);
  return <div className="interactive">
    <div className="interactive-head"><span>QUICK QUIZ</span><h3>{title}</h3></div>
    {questions.map((q,i)=><div className="quiz-q" key={i}><strong>{i+1}. {q.question}</strong>{q.options.map((o,j)=><button key={j} className={submitted && j===q.answer ? "correct" : submitted && selected[i]===j ? "wrong" : selected[i]===j ? "selected" : ""} onClick={()=>setSelected({...selected,[i]:j})}>{o}</button>)}</div>)}
    <button className="primary-btn quiz-submit" onClick={()=>setSubmitted(true)}>{submitted ? `SCORE: ${score}/${questions.length}` : "CHECK ANSWERS"}</button>
  </div>;
}


function AdminStudio() {
  const [key, setKey] = useState(sessionStorage.getItem("agoraAdminKey") || "");
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState("");
  const [subscribers, setSubscribers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [newsletter, setNewsletter] = useState(null);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({
    slug: "", title: "", category: "FINANCE", excerpt: "", body: "",
    interactiveType: "none", interactiveJSON: ""
  });

  async function login(e) {
    e.preventDefault();
    setError("");
    const r = await fetch(`${API}/admin/login`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({password:key})
    });
    if (!r.ok) { setError("Wrong admin password or ADMIN_KEY is not configured on Railway."); return; }
    sessionStorage.setItem("agoraAdminKey", key);
    setLogged(true);
    loadAdmin(key);
  }

  async function loadAdmin(k=key) {
    const headers = {"X-Admin-Key":k};
    try {
      const [subs, arts, preview] = await Promise.all([
        fetch(`${API}/admin/subscribers`, {headers}),
        fetch(`${API}/articles`),
        fetch(`${API}/admin/newsletter-preview`, {headers})
      ]);
      if (subs.status === 401) { setLogged(false); setError("Admin session expired."); return; }
      setSubscribers(await subs.json());
      setArticles(await arts.json());
      setNewsletter(await preview.json());
    } catch {
      setError("Could not connect to the Railway backend.");
    }
  }

  async function publish(e) {
    e.preventDefault();
    setNotice("");
    let interactive = null;
    if (form.interactiveType !== "none") {
      try { interactive = JSON.parse(form.interactiveJSON); }
      catch { setNotice("Interactive JSON is not valid."); return; }
    }
    const payload = {
      slug: form.slug, title: form.title, category: form.category,
      excerpt: form.excerpt, body: form.body, interactive
    };
    const r = await fetch(`${API}/admin/articles`, {
      method:"POST", headers:{"Content-Type":"application/json","X-Admin-Key":key},
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    setNotice(data.message || data.error);
    if (r.ok) {
      setForm({slug:"",title:"",category:"FINANCE",excerpt:"",body:"",interactiveType:"none",interactiveJSON:""});
      loadAdmin();
    }
  }

  async function remove(slug) {
    if (!confirm(`Delete "${slug}"?`)) return;
    const r = await fetch(`${API}/admin/articles/${slug}`, {
      method:"DELETE", headers:{"X-Admin-Key":key}
    });
    const data = await r.json();
    setNotice(data.message || data.error);
    loadAdmin();
  }

  async function sendNewsletter() {
    if (!confirm("Send the current monthly newsletter to every active subscriber?")) return;
    const r = await fetch(`${API}/admin/send-newsletter`, {
      method:"POST", headers:{"X-Admin-Key":key}
    });
    const data = await r.json();
    setNotice(data.message || data.error);
  }

  const presets = {
    quiz: JSON.stringify({
      type:"quiz", title:"Quick concept check",
      questions:[
        {question:"Your question here?", options:["Option A","Option B","Option C","Option D"], answer:0}
      ]
    }, null, 2),
    hypothesis: JSON.stringify({
      type:"hypothesis", title:"Try the model",
      defaults:{sample_mean:22.64,null_mean:20,std_error:1.35}
    }, null, 2),
    compound: JSON.stringify({
      type:"compound", title:"Explore compound growth",
      defaults:{principal:1000,rate:5,years:10,contribution:100}
    }, null, 2)
  };

  if (!logged) return (
    <Layout>
      <section className="studio-login page-width">
        <div className="studio-lock"><LockKeyhole size={28}/></div>
        <div className="eyebrow">PRIVATE AREA</div>
        <h1>EDITOR STUDIO.</h1>
        <p>Manage articles, interactive tools, quizzes, subscribers and the monthly newsletter.</p>
        <form onSubmit={login}>
          <input type="password" value={key} onChange={e=>setKey(e.target.value)} placeholder="Admin password" autoFocus />
          <button className="primary-btn"><LockKeyhole size={15}/> ENTER STUDIO</button>
        </form>
        {error && <div className="studio-error">{error}</div>}
      </section>
    </Layout>
  );

  return (
    <Layout>
      <section className="studio page-width">
        <div className="studio-head">
          <div><div className="eyebrow">AGORA DEMOS / PRIVATE</div><h1>EDITOR STUDIO.</h1><p>Your control room.</p></div>
          <button className="ghost-btn" onClick={()=>{sessionStorage.removeItem("agoraAdminKey");setLogged(false)}}>LOG OUT</button>
        </div>

        {notice && <div className="studio-notice">{notice}</div>}

        <div className="studio-grid">
          <section className="studio-panel">
            <div className="panel-title"><Plus size={17}/><div><strong>NEW ARTICLE</strong><small>Add a story + optional interactive</small></div></div>
            <form className="article-form" onSubmit={publish}>
              <div className="two"><label>Slug<input required value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} placeholder="my-first-finance-article"/></label><label>Category<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}><option>FINANCE</option><option>ECONOMICS</option><option>QRM</option><option>PSIR</option><option>MARKETS</option></select></label></div>
              <label>Title<input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Why Options Have Value"/></label>
              <label>Excerpt<textarea required rows="2" value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="One or two sentences for the homepage."/></label>
              <label>Article body<textarea required rows="9" value={form.body} onChange={e=>setForm({...form,body:e.target.value})} placeholder="Write the article here. Separate paragraphs with blank lines."/></label>
              <label>Interactive type<select value={form.interactiveType} onChange={e=>{const v=e.target.value;setForm({...form,interactiveType:v,interactiveJSON:v==="none"?"":presets[v]||""})}}><option value="none">No interactive</option><option value="hypothesis">Hypothesis testing graph</option><option value="compound">Compound growth graph</option><option value="quiz">Multiple-choice quiz</option><option value="custom">Custom JSON interactive</option></select></label>
              {form.interactiveType !== "none" && <label>Interactive configuration (JSON)<textarea rows="12" value={form.interactiveJSON} onChange={e=>setForm({...form,interactiveJSON:e.target.value})}/></label>}
              <button className="primary-btn"><Send size={15}/> PUBLISH ARTICLE</button>
            </form>
          </section>

          <section className="studio-panel">
            <div className="panel-title"><Users size={17}/><div><strong>SUBSCRIBERS</strong><small>{subscribers.filter(s=>s.active).length} active registrations</small></div></div>
            <div className="subscriber-list">
              {subscribers.length === 0 ? <p className="empty">No registrations yet.</p> : subscribers.map(s=><div className="subscriber" key={s.id}><span>{s.email}</span><small>{new Date(s.created_at).toLocaleDateString()}</small></div>)}
            </div>
            <div className="panel-actions"><button className="ghost-btn" onClick={()=>loadAdmin()}>REFRESH</button></div>
          </section>

          <section className="studio-panel">
            <div className="panel-title"><Mail size={17}/><div><strong>MONTHLY NEWSLETTER</strong><small>Preview + manual send</small></div></div>
            {newsletter && <div className="newsletter-preview"><div className="newsletter-subject">{newsletter.subject}</div><p>{newsletter.intro}</p>{newsletter.articles.map((a,i)=><div className="newsletter-item" key={i}><b>{a.title}</b><small>{a.category} · {a.excerpt}</small></div>)}<p>{newsletter.closing}</p></div>}
            <button className="primary-btn" onClick={sendNewsletter}><Send size={15}/> SEND TO ACTIVE SUBSCRIBERS</button>
            <p className="small-note">For automatic monthly sending, create a Railway Cron Job that calls the same protected endpoint once a month. Never put the admin key in the public frontend code.</p>
          </section>

          <section className="studio-panel">
            <div className="panel-title"><BarChart3 size={17}/><div><strong>PUBLISHED STORIES</strong><small>Delete from here when needed</small></div></div>
            <div className="subscriber-list">{articles.map(a=><div className="subscriber article-row" key={a.slug}><div><b>{a.title}</b><small>{a.category} · {a.slug}</small></div><button className="icon-delete" onClick={()=>remove(a.slug)} title="Delete"><Trash2 size={15}/></button></div>)}</div>
          </section>
        </div>
      </section>
    </Layout>
  );
}

createRoot(document.getElementById("root")).render(
  <HashRouter><App /></HashRouter>
);

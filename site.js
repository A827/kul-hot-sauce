/* ============================================================
   kül — shared site renderer
   One source of truth for the public site AND the admin preview.
   Exposes window.KUL = { DEFAULT_CONTENT, renderDoc, mountSite, themeCSS }
   ============================================================ */
(function () {
  "use strict";

  /* ---------- DEFAULT CONTENT (fallback when no live data) ---------- */
  const DEFAULT_CONTENT = {
    theme: { bg: "#0a0908", ink: "#f6efe4", ember: "#ff5a1f", ember2: "#ff8a3d", flame: "#ff3b2e", deepRed: "#b3121a", amber: "#f4a83f" },
    seo: {
      title: "kül — small-batch smoked hot sauce, born from ash",
      description: "kül is a small-batch hot sauce forged from fire-roasted, ash-smoked peppers. Four sauces, from a gentle glow to a slow-building inferno.",
      shareImage: ""
    },
    announcement: { on: false, text: "Free shipping on orders over $40 — new batch just dropped.", link: "#sauces", linkText: "Shop now" },
    sections: [
      { key: "marquee", label: "Scrolling marquee", on: true },
      { key: "story", label: "Story", on: true },
      { key: "products", label: "Sauces", on: true },
      { key: "heat", label: "Heat scale", on: true },
      { key: "craft", label: "Craft", on: true },
      { key: "cta", label: "Email call-to-action", on: true }
    ],
    brand: {
      name: "kül", navCta: "Shop Sauces",
      links: [
        { label: "Story", href: "#story" }, { label: "Sauces", href: "#sauces" },
        { label: "Heat", href: "#heat" }, { label: "Craft", href: "#make" }
      ]
    },
    hero: {
      eyebrow: "Small-batch · Fire-roasted · Anatolian roots",
      title: "kül", tagline: "Born from fire.", taglineEm: "Bottled from ash.",
      sub: "Peppers charred over open flame, smoked low and slow, then aged until the heat turns quiet and deep. Four sauces. One obsession with smoke.",
      cta1: "Meet the Sauces →", cta2: "Our Story"
    },
    marquee: ["Fire-Roasted", "No Additives", "Aged in Small Batches", "Vegan & Gluten-Free", "Smoke, Char & Slow Heat"],
    story: {
      eyebrow: "The Origin", heading: "We chase the ember, not the burn.",
      paras: [
        "**kül** — the Turkish word for *ash* — started on a rooftop grill, blistering peppers until their skins went black and their sugars turned to smoke.",
        "Most hot sauces shout. Ours smoulders. We roast every pepper over live fire, fold in charred garlic and toasted spice, then let the batch rest until the heat settles into something you can actually taste. **No thickeners, no shortcuts, no gimmicks.**",
        "Bottled by hand in runs of a few hundred at a time — because the good stuff can't be rushed."
      ],
      stats: [
        { value: "100%", label: "Fire-roasted peppers" },
        { value: "48h", label: "Slow-smoked & aged" },
        { value: "0", label: "Artificial anything" }
      ]
    },
    products: {
      eyebrow: "The Lineup", heading: "Four sauces, one fire",
      sub: "From a gentle glow to a slow-building inferno. Each is roasted, smoked, and bottled by hand.",
      unit: "150ml",
      items: [
        { name: "Ember", type: "Smoked Paprika & Chipotle", label: "#f4a83f", heat: 1, scoville: 2500, price: 12, notes: "The gentle one. Sweet smoke, a whisper of chipotle, warmth that lingers. Goes on everything." },
        { name: "Cinder", type: "Aleppo & Roasted Red", label: "#ff8a3d", heat: 2, scoville: 15000, price: 13, notes: "Earthy Aleppo pepper meets fire-blistered reds. Fruity up front, a proper warm hum on the finish." },
        { name: "Ash", type: "Charred Habanero & Black Garlic", label: "#ff5a1f", heat: 3, scoville: 55000, price: 14, notes: "Where it gets serious. Tropical habanero, umami-deep black garlic, smoke that sticks around." },
        { name: "Kül Noir", type: "Ghost Pepper & Activated Charcoal", label: "#b3121a", heat: 4, scoville: 275000, price: 16, notes: "Jet-black and reckless. Ghost pepper heat wrapped in charcoal smoke. Respect the drop count." }
      ]
    },
    heat: {
      eyebrow: "Know Your Burn", heading: "The heat scale",
      sub: "Measured in Scoville Heat Units. Bars are drawn on a log scale so you can actually see where the gentle glow ends and the trouble begins.",
      legend: ["Mild glow", "Warm", "Serious", "Reckless"]
    },
    craft: {
      eyebrow: "The Craft", heading: "How we build the smoke",
      pillars: [
        { title: "Live-fire roasting", body: "Every pepper is blistered over open flame until the skins char and the flesh sweetens. That black edge is where the flavour lives." },
        { title: "Low & slow smoke", body: "We cold-smoke the mash over oak and vine cuttings, then age it 48 hours so the heat mellows into something deep and rounded." },
        { title: "Bottled by hand", body: "No factory line. Small runs, filled and labelled by hand, batch-numbered so you know exactly which fire your bottle came from." }
      ]
    },
    cta: {
      eyebrow: "Join the Ember Club", heading: "Get first dibs on every batch",
      sub: "New drops sell out fast. Leave your email and we'll warn you before the next fire — plus 10% off your first order.",
      button: "Notify Me"
    },
    footer: {
      tagline: "Small-batch smoked hot sauce, born from ash and bottled by hand. Made for people who taste before they sweat.",
      columns: [
        { title: "Shop", links: [{ label: "All Sauces", href: "#sauces" }, { label: "The Full Set", href: "#sauces" }, { label: "Gift Box", href: "#sauces" }, { label: "Merch", href: "#sauces" }] },
        { title: "Company", links: [{ label: "Our Story", href: "#story" }, { label: "The Craft", href: "#make" }, { label: "Heat Scale", href: "#heat" }, { label: "Stockists", href: "#" }] },
        { title: "Support", links: [{ label: "Shipping", href: "#" }, { label: "Returns", href: "#" }, { label: "FAQ", href: "#" }, { label: "Contact", href: "#" }] }
      ],
      copyright: "© 2026 kül hot sauce co. — All rights reserved. Batch by batch.",
      socials: { instagram: "#", tiktok: "#", x: "#" }
    }
  };

  /* ---------- helpers ---------- */
  function esc(s) { return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function attr(s) { return String(s == null ? "" : s).replace(/"/g, "&quot;"); }
  // tiny markdown: **bold**, *italic*
  function md(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
  }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function merge(base, over) {
    if (base && typeof base === "object" && !Array.isArray(base)) {
      const out = {};
      for (const k in base) out[k] = merge(base[k], over ? over[k] : undefined);
      if (over && typeof over === "object" && !Array.isArray(over)) for (const k in over) if (!(k in out)) out[k] = clone(over[k]);
      return out;
    }
    // arrays + primitives: prefer the override, else the base — always deep-copied so
    // editing never mutates the shared DEFAULT_CONTENT.
    return clone(over != null ? over : base);
  }

  /* ---------- theme -> css vars ---------- */
  function themeCSS(t) {
    t = t || DEFAULT_CONTENT.theme;
    return `:root{
      --bg:${t.bg};--bg-2:#120f0d;--surface:#171310;--surface-2:#1e1813;
      --ink:${t.ink};--muted:#a99c8d;--ash:#6d665f;
      --ember:${t.ember};--ember-2:${t.ember2};--flame:${t.flame};--deep-red:${t.deepRed};--amber:${t.amber};
      --border:rgba(246,239,228,.09);--border-2:rgba(246,239,228,.16);
      --maxw:1180px;--ease:cubic-bezier(.22,.61,.36,1);
    }`;
  }

  /* ---------- static css ---------- */
  const BASE_CSS = `
  *{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth;scroll-padding-top:88px}
  body{background:var(--bg);color:var(--ink);font-family:'Inter',system-ui,-apple-system,Segoe UI,Roboto,sans-serif;line-height:1.6;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(120% 80% at 50% -10%, rgba(255,90,31,.10), transparent 55%),radial-gradient(90% 60% at 100% 110%, rgba(179,18,26,.10), transparent 60%);mix-blend-mode:screen}
  body::after{content:"";position:fixed;inset:0;pointer-events:none;z-index:2;opacity:.05;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
  a{color:inherit;text-decoration:none}
  img,svg{display:block;max-width:100%}
  .wrap{max-width:var(--maxw);margin:0 auto;padding:0 24px;position:relative;z-index:3}
  h1,h2,h3,.display{font-family:'Anton',Impact,sans-serif;font-weight:400;letter-spacing:.01em;line-height:.95;text-transform:uppercase}
  .eyebrow{font-size:12px;letter-spacing:.32em;text-transform:uppercase;color:var(--ember-2);font-weight:700}
  header.nav{position:fixed;top:0;left:0;right:0;z-index:50;transition:background .4s var(--ease),border-color .4s var(--ease),backdrop-filter .4s}
  header.nav.scrolled{background:rgba(10,9,8,.72);backdrop-filter:blur(14px);border-bottom:1px solid var(--border)}
  .nav-in{display:flex;align-items:center;justify-content:space-between;height:72px;max-width:var(--maxw);margin:0 auto;padding:0 24px;position:relative;z-index:4}
  .brand{font-family:'Anton',sans-serif;font-size:30px;letter-spacing:.02em;display:flex;align-items:center;gap:10px}
  .brand .dot{width:9px;height:9px;border-radius:50%;background:var(--ember);box-shadow:0 0 14px 2px var(--ember);animation:pulse 2.4s var(--ease) infinite}
  @keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.8)}}
  .nav-links{display:flex;align-items:center;gap:34px}
  .nav-links a{font-size:13px;letter-spacing:.14em;text-transform:uppercase;font-weight:600;color:var(--muted);transition:color .25s}
  .nav-links a:hover{color:var(--ink)}
  .btn{display:inline-flex;align-items:center;gap:9px;font-weight:700;font-size:13px;letter-spacing:.1em;text-transform:uppercase;padding:12px 22px;border-radius:100px;cursor:pointer;border:1px solid transparent;transition:transform .25s var(--ease),box-shadow .3s,background .3s,color .3s}
  .btn-fire{background:linear-gradient(180deg,var(--ember-2),var(--ember));color:#1a0d05;box-shadow:0 8px 30px -8px rgba(255,90,31,.7)}
  .btn-fire:hover{transform:translateY(-2px);box-shadow:0 14px 40px -8px rgba(255,90,31,.85)}
  .btn-ghost{border-color:var(--border-2);color:var(--ink)}
  .btn-ghost:hover{border-color:var(--ember);color:var(--ember-2);transform:translateY(-2px)}
  .hamb{display:none;flex-direction:column;gap:5px;background:none;border:0;cursor:pointer;padding:8px}
  .hamb span{width:24px;height:2px;background:var(--ink);transition:.3s}
  .mobile-menu{position:fixed;inset:0;z-index:49;background:rgba(10,9,8,.97);backdrop-filter:blur(6px);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;opacity:0;pointer-events:none;transition:opacity .35s}
  .mobile-menu.open{opacity:1;pointer-events:auto}
  .mobile-menu a{font-family:'Anton',sans-serif;font-size:34px;color:var(--ink);text-transform:uppercase}
  .mobile-menu a:hover{color:var(--ember)}
  .anno{position:fixed;top:0;left:0;right:0;min-height:38px;z-index:60;display:flex;align-items:center;justify-content:center;gap:0;background:linear-gradient(90deg,var(--deep-red),var(--ember));color:#fff;font-size:12.5px;font-weight:600;letter-spacing:.02em;padding:7px 44px;text-align:center}
  .anno-in{display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;max-width:var(--maxw)}
  .anno-in a{text-decoration:underline;font-weight:700;white-space:nowrap;color:#fff}
  .anno-x{position:absolute;right:10px;top:50%;transform:translateY(-50%);background:none;border:0;color:#fff;font-size:22px;line-height:1;cursor:pointer;opacity:.85;padding:2px 8px}
  .anno-x:hover{opacity:1}
  body.has-anno header.nav{top:38px}
  .hero{position:relative;min-height:100vh;display:flex;align-items:center;padding:120px 0 80px;overflow:hidden}
  #embers{position:absolute;inset:0;z-index:1}
  .hero-bg{position:absolute;inset:0;z-index:0;background:radial-gradient(60% 55% at 50% 88%, rgba(255,90,31,.28), transparent 62%),radial-gradient(80% 60% at 50% 120%, rgba(179,18,26,.55), transparent 70%),linear-gradient(180deg,var(--bg) 0%, #0c0908 60%, #160b06 100%)}
  .hero-glow{position:absolute;left:50%;bottom:-30%;transform:translateX(-50%);width:900px;height:900px;border-radius:50%;background:radial-gradient(circle,rgba(255,90,31,.35),transparent 60%);filter:blur(30px);z-index:0}
  .hero-in{position:relative;z-index:5;text-align:center;width:100%}
  .hero h1{font-size:clamp(88px,26vw,300px);line-height:.8;letter-spacing:-.01em;background:linear-gradient(180deg,#fff5ea 12%,#ffb066 55%,var(--ember) 88%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 90px rgba(255,90,31,.28);position:relative}
  .hero .tag{margin-top:6px;font-family:'Anton',sans-serif;font-size:clamp(16px,3.4vw,30px);letter-spacing:.28em;text-transform:uppercase;color:var(--ink)}
  .hero .tag em{color:var(--ember-2);font-style:normal}
  .hero p.sub{max-width:560px;margin:26px auto 0;color:var(--muted);font-size:17px}
  .hero .cta{margin-top:38px;display:flex;gap:14px;justify-content:center;flex-wrap:wrap}
  .scroll-hint{position:absolute;bottom:26px;left:50%;transform:translateX(-50%);z-index:5;color:var(--ash);font-size:11px;letter-spacing:.3em;text-transform:uppercase;display:flex;flex-direction:column;align-items:center;gap:10px}
  .scroll-hint .line{width:1px;height:40px;background:linear-gradient(var(--ember),transparent);animation:drop 1.8s var(--ease) infinite}
  @keyframes drop{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}50.1%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}
  .marquee{border-top:1px solid var(--border);border-bottom:1px solid var(--border);background:var(--bg-2);overflow:hidden;padding:16px 0;position:relative;z-index:3}
  .marquee-track{display:flex;gap:44px;white-space:nowrap;width:max-content;animation:scroll 26s linear infinite}
  .marquee-track span{font-family:'Anton',sans-serif;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink);display:flex;align-items:center;gap:44px}
  .marquee-track span::after{content:"";width:8px;height:8px;background:var(--ember);border-radius:50%}
  @keyframes scroll{to{transform:translateX(-50%)}}
  section.block{padding:110px 0;position:relative;z-index:3}
  .sec-head{max-width:680px;margin-bottom:56px}
  .sec-head.center{margin-left:auto;margin-right:auto;text-align:center}
  .sec-head h2{font-size:clamp(38px,6vw,72px);margin:14px 0 0}
  .sec-head p{color:var(--muted);margin-top:18px;font-size:17px}
  .story{background:linear-gradient(180deg,var(--bg),var(--bg-2))}
  .story-grid{display:grid;grid-template-columns:1.1fr .9fr;gap:64px;align-items:center}
  .story-copy p{color:var(--muted);margin-top:18px;font-size:17px}
  .story-copy p strong{color:var(--ink);font-weight:600}
  .stats{display:flex;gap:14px;margin-top:38px;flex-wrap:wrap}
  .stat{flex:1;min-width:120px;border:1px solid var(--border);border-radius:16px;padding:20px;background:rgba(255,255,255,.015)}
  .stat b{font-family:'Anton',sans-serif;font-size:40px;color:var(--ember-2);display:block;line-height:1}
  .stat span{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash);margin-top:8px;display:block}
  .story-art{position:relative;display:flex;justify-content:center}
  .story-art .halo{position:absolute;inset:0;margin:auto;width:78%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,90,31,.28),transparent 66%);filter:blur(14px)}
  .products{background:var(--bg-2)}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:22px}
  .card{position:relative;border:1px solid var(--border);border-radius:20px;padding:30px 24px 26px;background:linear-gradient(180deg,var(--surface),var(--bg-2));overflow:hidden;transition:transform .4s var(--ease),border-color .4s,box-shadow .4s}
  .card::before{content:"";position:absolute;left:0;right:0;top:0;height:150px;background:radial-gradient(60% 100% at 50% 0,var(--label,var(--ember)),transparent 70%);opacity:.16;transition:opacity .4s}
  .card:hover{transform:translateY(-8px);border-color:var(--border-2);box-shadow:0 26px 60px -30px rgba(0,0,0,.9)}
  .card:hover::before{opacity:.3}
  .card .bottle{height:190px;margin:4px auto 18px;filter:drop-shadow(0 18px 26px rgba(0,0,0,.55))}
  .card .heat-badge{position:absolute;top:18px;right:18px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 11px;border-radius:100px;border:1px solid var(--border-2);color:var(--ink);background:rgba(0,0,0,.35);display:flex;gap:5px;align-items:center}
  .flames{display:inline-flex;gap:1px}
  .flames small{width:6px;height:6px;border-radius:50%;background:var(--ash)}
  .flames small.on{background:var(--ember);box-shadow:0 0 6px var(--ember)}
  .card h3{font-size:30px;margin-top:2px}
  .card .type{font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:var(--ember-2);font-weight:700;margin-top:6px}
  .card .notes{color:var(--muted);font-size:14px;margin-top:14px;min-height:60px}
  .card .row{display:flex;align-items:center;justify-content:space-between;margin-top:20px;padding-top:18px;border-top:1px solid var(--border)}
  .card .price{font-family:'Anton',sans-serif;font-size:26px}
  .card .price small{font-family:'Inter';font-size:12px;color:var(--ash);font-weight:500}
  .add{background:none;border:1px solid var(--border-2);color:var(--ink);font-weight:700;font-size:12px;letter-spacing:.08em;text-transform:uppercase;padding:10px 16px;border-radius:100px;cursor:pointer;transition:.25s}
  .add:hover{background:var(--ember);border-color:var(--ember);color:#1a0d05}
  .add.added{background:var(--deep-red);border-color:var(--deep-red);color:#fff}
  .heat{background:linear-gradient(180deg,var(--bg-2),var(--bg))}
  .scale{display:flex;flex-direction:column;gap:22px;margin-top:14px}
  .scale-row{display:grid;grid-template-columns:150px 1fr 110px;align-items:center;gap:20px}
  .scale-row .name{font-family:'Anton',sans-serif;font-size:22px}
  .scale-row .name em{display:block;font-family:'Inter';font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ash);font-weight:600;font-style:normal;margin-top:2px}
  .bar{height:14px;border-radius:100px;background:rgba(255,255,255,.06);overflow:hidden;position:relative}
  .bar i{position:absolute;inset:0;width:0;border-radius:100px;background:linear-gradient(90deg,var(--amber),var(--ember) 55%,var(--deep-red));transition:width 1.3s var(--ease)}
  .scale-row .scoville{text-align:right;font-family:'Anton',sans-serif;font-size:18px;color:var(--ember-2)}
  .scale-row .scoville em{display:block;font-family:'Inter';font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--ash);font-style:normal;font-weight:600}
  .scale-legend{display:flex;justify-content:space-between;margin-top:28px;color:var(--ash);font-size:11px;letter-spacing:.16em;text-transform:uppercase}
  .pillars{display:grid;grid-template-columns:repeat(3,1fr);gap:22px;margin-top:10px}
  .pillar{border:1px solid var(--border);border-radius:18px;padding:30px;background:rgba(255,255,255,.015)}
  .pillar .ic{width:46px;height:46px;border-radius:12px;display:grid;place-items:center;background:rgba(255,90,31,.12);color:var(--ember-2);margin-bottom:18px}
  .pillar h3{font-family:'Inter';font-weight:800;font-size:19px;text-transform:none;letter-spacing:0}
  .pillar p{color:var(--muted);font-size:14px;margin-top:10px}
  .cta-band{position:relative;border-radius:28px;overflow:hidden;padding:70px 40px;text-align:center;background:linear-gradient(140deg,#1a0d06,#2a0f08 55%,#12100e);border:1px solid var(--border)}
  .cta-band::before{content:"";position:absolute;inset:0;background:radial-gradient(60% 120% at 50% 0,rgba(255,90,31,.3),transparent 60%)}
  .cta-band>*{position:relative;z-index:2}
  .cta-band h2{font-size:clamp(34px,5.6vw,60px)}
  .cta-band p{color:var(--muted);margin:16px auto 0;max-width:500px}
  .form{display:flex;gap:10px;max-width:460px;margin:32px auto 0}
  .form input{flex:1;background:rgba(0,0,0,.4);border:1px solid var(--border-2);border-radius:100px;padding:15px 22px;color:var(--ink);font-size:15px;outline:none;transition:.25s}
  .form input:focus{border-color:var(--ember)}
  .form .msg{color:var(--ember-2);font-weight:600;margin-top:16px;height:20px;font-size:14px}
  footer.site{border-top:1px solid var(--border);background:var(--bg-2);padding:64px 0 30px;position:relative;z-index:3}
  .foot-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr 1fr;gap:40px}
  .foot-brand .brand{font-size:38px;margin-bottom:14px}
  .foot-brand p{color:var(--muted);font-size:14px;max-width:260px}
  .foot-col h4{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--ash);margin-bottom:16px}
  .foot-col a{display:block;color:var(--muted);font-size:14px;margin-bottom:11px;transition:color .2s}
  .foot-col a:hover{color:var(--ember-2)}
  .foot-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:52px;padding-top:24px;border-top:1px solid var(--border);color:var(--ash);font-size:13px;flex-wrap:wrap;gap:12px}
  .foot-bottom .socials{display:flex;gap:16px}
  .foot-bottom .socials a{width:36px;height:36px;border:1px solid var(--border-2);border-radius:50%;display:grid;place-items:center;color:var(--muted);transition:.25s}
  .foot-bottom .socials a:hover{border-color:var(--ember);color:var(--ember)}
  html.js .reveal{opacity:0}
  html.js .reveal.in{animation-name:kul-reveal;animation-duration:.8s;animation-timing-function:var(--ease);animation-fill-mode:both}
  @keyframes kul-reveal{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
  .pimg{height:190px;width:100%;object-fit:contain;margin:4px auto 18px;filter:drop-shadow(0 18px 26px rgba(0,0,0,.55))}
  .brand-logo{height:30px;width:auto;display:block}
  .foot-brand .brand-logo{height:38px}
  .reveal.d1{animation-delay:.08s}.reveal.d2{animation-delay:.16s}.reveal.d3{animation-delay:.24s}.reveal.d4{animation-delay:.32s}
  @media(max-width:960px){.story-grid{grid-template-columns:1fr;gap:40px}.grid{grid-template-columns:repeat(2,1fr)}.pillars{grid-template-columns:1fr}.foot-grid{grid-template-columns:1fr 1fr;gap:32px}.scale-row{grid-template-columns:110px 1fr 90px;gap:12px}}
  @media(max-width:640px){.nav-links{display:none}.hamb{display:flex}.nav-in .btn-fire{display:none}section.block{padding:80px 0}.grid{grid-template-columns:1fr}.foot-grid{grid-template-columns:1fr}.form{flex-direction:column;border-radius:20px}.form input,.form .btn{width:100%;justify-content:center}.scale-row{grid-template-columns:1fr;gap:8px}.scale-row .scoville{text-align:left}}
  @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}html.js .reveal{opacity:1!important;transform:none!important}}
  `;

  /* ---------- svg bits ---------- */
  function bottle(label) {
    return `<svg class="bottle" viewBox="0 0 120 260" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="44" y="6" width="32" height="20" rx="4" fill="#0f0b09"/>
      <rect x="41" y="24" width="38" height="10" rx="3" fill="#181310"/>
      <rect x="50" y="34" width="20" height="20" fill="#241a14"/>
      <path d="M34 62 Q34 54 50 52 L70 52 Q86 54 86 62 L86 242 Q86 254 74 254 L46 254 Q34 254 34 242 Z" fill="#2c221b" stroke="rgba(255,255,255,.06)"/>
      <path d="M40 62 Q40 58 50 58 L57 58 L57 250 L46 250 Q40 250 40 242 Z" fill="rgba(255,255,255,.07)"/>
      <rect x="42" y="96" width="36" height="132" rx="6" fill="#171210" stroke="${attr(label)}" stroke-opacity=".5"/>
      <path d="M60 118 C52 128 55 138 60 143 C65 138 68 128 60 118 Z" fill="${attr(label)}"/>
      <rect x="48" y="156" width="24" height="2.5" fill="${attr(label)}" opacity=".85"/>
      <text x="60" y="182" text-anchor="middle" font-family="Anton, sans-serif" font-size="22" fill="#f6efe4">kül</text>
      <text x="60" y="210" text-anchor="middle" font-family="Inter, sans-serif" font-size="5.5" letter-spacing="1.6" fill="#a99c8d">SMOKED HOT SAUCE</text>
    </svg>`;
  }
  function flameDots(n) { let s = '<span class="flames">'; for (let i = 1; i <= 4; i++) s += `<small class="${i <= n ? "on" : ""}"></small>`; return s + "</span>"; }
  const PILLAR_ICONS = [
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3c2 3 4 4 4 7a4 4 0 1 1-8 0c0-1 .5-2 1-3"/><path d="M12 21a5 5 0 0 0 5-5c0-2-1-3-2-4"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 3c0 2-1 3-1 5s1 3 1 5"/><path d="M12 3c0 2-1 3-1 5s1 3 1 5"/><path d="M16 3c0 2-1 3-1 5s1 3 1 5"/><path d="M4 17h16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"/></svg>',
    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 8h14l-1 11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>'
  ];
  const HEAT_WORDS = ["", "Mild", "Medium", "Hot", "Extreme"];

  /* ---------- body renderer ---------- */
  function renderBody(c) {
    c = merge(DEFAULT_CONTENT, c || {});
    const nav = `
    <header class="nav" id="nav"><div class="nav-in">
      <a href="#top" class="brand">${c.brand.logo ? `<img class="brand-logo" src="${attr(c.brand.logo)}" alt="${attr(c.brand.name)}">` : esc(c.brand.name)}<span class="dot"></span></a>
      <nav class="nav-links">${c.brand.links.map(l => `<a href="${attr(l.href)}">${esc(l.label)}</a>`).join("")}</nav>
      <a href="#sauces" class="btn btn-fire">${esc(c.brand.navCta)}</a>
      <button class="hamb" id="hamb" aria-label="Menu"><span></span><span></span><span></span></button>
    </div></header>
    <div class="mobile-menu" id="mobileMenu">
      ${c.brand.links.map(l => `<a href="${attr(l.href)}">${esc(l.label)}</a>`).join("")}
      <a href="#sauces" style="color:var(--ember)">${esc(c.brand.navCta)}</a>
    </div>`;

    const hero = `
    <section class="hero" id="top">
      <div class="hero-bg"></div><div class="hero-glow"></div><canvas id="embers"></canvas>
      <div class="wrap hero-in">
        <div class="eyebrow reveal">${esc(c.hero.eyebrow)}</div>
        <h1 class="reveal d1">${esc(c.hero.title)}</h1>
        <div class="tag reveal d2">${esc(c.hero.tagline)} <em>${esc(c.hero.taglineEm)}</em></div>
        <p class="sub reveal d3">${esc(c.hero.sub)}</p>
        <div class="cta reveal d4">
          <a href="#sauces" class="btn btn-fire">${esc(c.hero.cta1)}</a>
          <a href="#story" class="btn btn-ghost">${esc(c.hero.cta2)}</a>
        </div>
      </div>
      <div class="scroll-hint"><span>Scroll</span><span class="line"></span></div>
    </section>`;

    const mq = c.marquee.map(m => `<span>${esc(m)}<span></span></span>`).join("");
    const marquee = `<div class="marquee" aria-hidden="true"><div class="marquee-track">${mq}${mq}</div></div>`;

    const story = `
    <section class="block story" id="story"><div class="wrap story-grid">
      <div class="story-copy">
        <div class="eyebrow reveal">${esc(c.story.eyebrow)}</div>
        <h2 class="reveal d1" style="font-size:clamp(38px,6vw,68px);margin-top:14px">${esc(c.story.heading)}</h2>
        ${c.story.paras.map((p, i) => `<p class="reveal d${Math.min(i + 2, 4)}">${md(p)}</p>`).join("")}
        <div class="stats reveal d3">
          ${c.story.stats.map(s => `<div class="stat"><b>${esc(s.value)}</b><span>${esc(s.label)}</span></div>`).join("")}
        </div>
      </div>
      <div class="story-art reveal d2"><div class="halo"></div>
        <svg viewBox="0 0 200 420" style="height:420px;position:relative;filter:drop-shadow(0 30px 40px rgba(0,0,0,.6))" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="kül hot sauce bottle">
          <defs>
            <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2a211b"/><stop offset=".5" stop-color="#3b2c22"/><stop offset="1" stop-color="#20140d"/></linearGradient>
            <linearGradient id="lbl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#161210"/><stop offset="1" stop-color="#241a14"/></linearGradient>
            <linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb457"/><stop offset=".5" stop-color="#ff5a1f"/><stop offset="1" stop-color="#b3121a"/></linearGradient>
          </defs>
          <rect x="74" y="8" width="52" height="30" rx="6" fill="#0f0b09"/>
          <rect x="70" y="36" width="60" height="14" rx="4" fill="#181310"/>
          <rect x="82" y="50" width="36" height="34" fill="#241a14"/>
          <path d="M60 96 Q60 84 82 82 L118 82 Q140 84 140 96 L140 388 Q140 408 120 408 L80 408 Q60 408 60 388 Z" fill="url(#glass)" stroke="rgba(255,255,255,.06)"/>
          <path d="M70 96 Q70 90 84 90 L96 90 L96 404 L80 404 Q70 404 70 392 Z" fill="rgba(255,255,255,.06)"/>
          <rect x="74" y="150" width="52" height="220" rx="8" fill="url(#lbl)" stroke="rgba(255,90,31,.35)"/>
          <path d="M100 196 C88 210 92 224 100 232 C108 224 112 210 100 196 Z" fill="url(#fl)"/>
          <text x="100" y="290" text-anchor="middle" font-family="Anton, sans-serif" font-size="42" fill="#f6efe4">${esc(c.brand.name)}</text>
          <rect x="86" y="316" width="28" height="3" fill="var(--ember)" opacity=".8"/>
          <text x="100" y="342" text-anchor="middle" font-family="Inter, sans-serif" font-size="8" letter-spacing="3" fill="#a99c8d">SMOKED HOT SAUCE</text>
        </svg>
      </div>
    </div></section>`;

    const cards = c.products.items.map((s, i) => `
      <article class="card reveal d${(i % 4) + 1}" style="--label:${attr(s.label)}">
        <div class="heat-badge">${flameDots(s.heat)} ${esc(HEAT_WORDS[s.heat] || "")}</div>
        ${s.image ? `<img class="pimg" src="${attr(s.image)}" alt="${attr(s.name)}" loading="lazy">` : bottle(s.label)}
        <div class="type">${esc(s.type)}</div>
        <h3>${esc(s.name)}</h3>
        <p class="notes">${esc(s.notes)}</p>
        <div class="row"><div class="price">$${esc(s.price)}<small> /${esc(c.products.unit)}</small></div>
          <button class="add" data-name="${attr(s.name)}">Add +</button></div>
      </article>`).join("");
    const products = `
    <section class="block products" id="sauces"><div class="wrap">
      <div class="sec-head center">
        <div class="eyebrow reveal">${esc(c.products.eyebrow)}</div>
        <h2 class="reveal d1">${esc(c.products.heading)}</h2>
        <p class="reveal d2">${esc(c.products.sub)}</p>
      </div>
      <div class="grid">${cards}</div>
    </div></section>`;

    const maxLog = Math.log10(Math.max.apply(null, c.products.items.map(i => i.scoville).concat([10])));
    const scaleRows = c.products.items.map(s => {
      const w = Math.max(6, (Math.log10(Math.max(s.scoville, 10)) / maxLog) * 100).toFixed(1);
      return `<div class="scale-row">
        <div class="name">${esc(s.name)}<em>${esc(String(s.type).split("&")[0].trim())}</em></div>
        <div class="bar"><i data-w="${w}"></i></div>
        <div class="scoville">${Number(s.scoville).toLocaleString()}<em>SHU</em></div>
      </div>`;
    }).join("");
    const heat = `
    <section class="block heat" id="heat"><div class="wrap">
      <div class="sec-head">
        <div class="eyebrow reveal">${esc(c.heat.eyebrow)}</div>
        <h2 class="reveal d1">${esc(c.heat.heading)}</h2>
        <p class="reveal d2">${esc(c.heat.sub)}</p>
      </div>
      <div class="scale reveal d2">${scaleRows}</div>
      <div class="scale-legend reveal d3">${c.heat.legend.map(l => `<span>${esc(l)}</span>`).join("")}</div>
    </div></section>`;

    const pillars = c.craft.pillars.map((p, i) => `
      <div class="pillar reveal d${(i % 3) + 1}"><div class="ic">${PILLAR_ICONS[i % PILLAR_ICONS.length]}</div>
        <h3>${esc(p.title)}</h3><p>${esc(p.body)}</p></div>`).join("");
    const craft = `
    <section class="block" id="make" style="background:var(--bg)"><div class="wrap">
      <div class="sec-head center"><div class="eyebrow reveal">${esc(c.craft.eyebrow)}</div><h2 class="reveal d1">${esc(c.craft.heading)}</h2></div>
      <div class="pillars">${pillars}</div>
    </div></section>`;

    const cta = `
    <section class="block" style="background:var(--bg-2);padding-top:0"><div class="wrap">
      <div class="cta-band reveal">
        <div class="eyebrow">${esc(c.cta.eyebrow)}</div>
        <h2>${esc(c.cta.heading)}</h2>
        <p>${esc(c.cta.sub)}</p>
        <form class="form" id="signup" novalidate>
          <input type="email" id="email" placeholder="you@email.com" aria-label="Email address" required />
          <button type="submit" class="btn btn-fire">${esc(c.cta.button)}</button>
        </form>
        <div class="msg" id="formMsg"></div>
      </div>
    </div></section>`;

    const ig = c.footer.socials.instagram || "#", tk = c.footer.socials.tiktok || "#", xx = c.footer.socials.x || "#";
    const footer = `
    <footer class="site"><div class="wrap">
      <div class="foot-grid">
        <div class="foot-brand"><div class="brand">${c.brand.logo ? `<img class="brand-logo" src="${attr(c.brand.logo)}" alt="${attr(c.brand.name)}">` : esc(c.brand.name)}<span class="dot" style="animation:none"></span></div><p>${esc(c.footer.tagline)}</p></div>
        ${c.footer.columns.map(col => `<div class="foot-col"><h4>${esc(col.title)}</h4>${col.links.map(l => `<a href="${attr(l.href)}">${esc(l.label)}</a>`).join("")}</div>`).join("")}
      </div>
      <div class="foot-bottom">
        <span>${esc(c.footer.copyright)}</span>
        <div class="socials">
          <a href="${attr(ig)}" aria-label="Instagram"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1" fill="currentColor" stroke="none"/></svg></a>
          <a href="${attr(tk)}" aria-label="TikTok"><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 12a4 4 0 1 0 4 4V4c1 2 3 3 5 3"/></svg></a>
          <a href="${attr(xx)}" aria-label="X"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 3h3l-7 8 8 10h-6l-5-6-5 6H3l7-9L2 3h6l4 5z"/></svg></a>
        </div>
      </div>
    </div></footer>`;

    const an = c.announcement || {};
    const announcement = an.on ? `<div class="anno" role="region" aria-label="Announcement"><div class="anno-in"><span>${esc(an.text)}</span>${an.link ? `<a href="${attr(an.link)}">${esc(an.linkText || "Shop")} →</a>` : ""}</div><button class="anno-x" aria-label="Dismiss">&times;</button></div>` : "";

    const sectionMap = { marquee, story, products, heat, craft, cta };
    const order = (c.sections && c.sections.length) ? c.sections : DEFAULT_CONTENT.sections;
    const mid = order.filter(s => s && s.on !== false && sectionMap[s.key]).map(s => sectionMap[s.key]).join("");
    return announcement + nav + hero + mid + footer;
  }

  /* ---------- runtime (runs in main page OR injected into iframe) ---------- */
  function siteRuntime() {
    document.documentElement.classList.add("js");
    const nav = document.getElementById("nav");
    if (nav) addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40));
    const anno = document.querySelector(".anno");
    if (anno) { document.body.classList.add("has-anno"); const ax = anno.querySelector(".anno-x"); if (ax) ax.addEventListener("click", () => { anno.remove(); document.body.classList.remove("has-anno"); }); }
    const hamb = document.getElementById("hamb"), mm = document.getElementById("mobileMenu");
    if (hamb && mm) { hamb.addEventListener("click", () => mm.classList.toggle("open")); mm.querySelectorAll("a").forEach(a => a.addEventListener("click", () => mm.classList.remove("open"))); }
    const grid = document.querySelector(".grid");
    if (grid) grid.addEventListener("click", e => { const b = e.target.closest(".add"); if (!b) return; b.textContent = "Added ✓"; b.classList.add("added"); setTimeout(() => { b.textContent = "Add +"; b.classList.remove("added"); }, 1400); });
    const su = document.getElementById("signup");
    if (su) su.addEventListener("submit", e => { e.preventDefault(); const em = (document.getElementById("email").value || "").trim(); const msg = document.getElementById("formMsg"); if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { msg.textContent = "You're on the list — welcome to the Ember Club. 🔥"; document.getElementById("email").value = ""; } else { msg.textContent = "Hmm, that email doesn't look right."; } });
    const io = new IntersectionObserver(ents => { ents.forEach(en => { if (en.isIntersecting) { en.target.classList.add("in"); const bars = en.target.querySelectorAll ? en.target.querySelectorAll(".bar i") : []; bars.forEach(b => b.style.width = b.dataset.w + "%"); io.unobserve(en.target); } }); }, { threshold: .14 });
    document.querySelectorAll(".reveal").forEach(el => io.observe(el));
    const heatSec = document.getElementById("heat"); if (heatSec) io.observe(heatSec);
    // embers
    const c = document.getElementById("embers"); if (!c || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
    const x = c.getContext("2d"); let w, h, parts = [];
    function size() { const r = c.parentElement.getBoundingClientRect(); w = c.width = r.width; h = c.height = r.height; }
    size(); addEventListener("resize", size);
    function spawn() { return { x: Math.random() * w, y: h + 10, r: Math.random() * 2.2 + .6, vy: -(Math.random() * .7 + .25), vx: (Math.random() - .5) * .35, life: Math.random() * 140 + 80, age: 0 }; }
    for (let i = 0; i < 70; i++) { const p = spawn(); p.y = Math.random() * h; p.age = Math.random() * p.life; parts.push(p); }
    (function tick() {
      x.clearRect(0, 0, w, h);
      parts.forEach((p, i) => { p.age++; p.x += p.vx; p.y += p.vy; p.vx += (Math.random() - .5) * .02; const t = 1 - p.age / p.life, a = Math.max(0, t) * .85; const g = x.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3); g.addColorStop(0, `rgba(255,180,90,${a})`); g.addColorStop(.5, `rgba(255,90,31,${a * .6})`); g.addColorStop(1, "rgba(255,60,40,0)"); x.fillStyle = g; x.beginPath(); x.arc(p.x, p.y, p.r * 3, 0, 7); x.fill(); if (p.age >= p.life || p.y < -20) parts[i] = spawn(); });
      requestAnimationFrame(tick);
    })();
  }

  /* ---------- full standalone document (for admin iframe preview) ---------- */
  function renderDoc(c) {
    c = merge(DEFAULT_CONTENT, c || {});
    return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<style>${themeCSS(c.theme)}${BASE_CSS}</style></head>
<body>${renderBody(c)}<script>(${siteRuntime.toString()})();<\/script></body></html>`;
  }

  /* ---------- mount into the current page (for index.html) ---------- */
  function mountSite(c) {
    c = merge(DEFAULT_CONTENT, c || {});
    let st = document.getElementById("kul-theme");
    if (!st) { st = document.createElement("style"); st.id = "kul-theme"; document.head.appendChild(st); }
    st.textContent = themeCSS(c.theme) + BASE_CSS;
    document.body.innerHTML = renderBody(c);
    applySEO(c);
    siteRuntime();
  }

  /* ---------- SEO: structured data + meta (crawlable defaults are baked into index.html) ---------- */
  const SITE_URL = "https://kul-hot-sauce.vercel.app";
  function buildJSONLD(c) {
    c = merge(DEFAULT_CONTENT, c || {});
    const org = { "@context": "https://schema.org", "@type": "Organization", name: c.brand.name, url: SITE_URL + "/", description: c.footer.tagline };
    if (c.brand.logo) org.logo = c.brand.logo;
    const list = {
      "@context": "https://schema.org", "@type": "ItemList",
      itemListElement: c.products.items.map((s, i) => ({
        "@type": "ListItem", position: i + 1,
        item: {
          "@type": "Product", name: c.brand.name + " — " + s.name, description: s.notes, category: "Hot Sauce",
          ...(s.image ? { image: s.image } : {}),
          offers: { "@type": "Offer", price: String(s.price), priceCurrency: "USD", availability: "https://schema.org/InStock" }
        }
      }))
    };
    return [org, list];
  }
  function setMetaTag(kind, key, val) {
    if (val == null) return;
    let m = document.head.querySelector("meta[" + kind + '="' + key + '"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute(kind, key); document.head.appendChild(m); }
    m.setAttribute("content", val);
  }
  function applySEO(c) {
    c = merge(DEFAULT_CONTENT, c || {});
    const s = c.seo || {};
    if (s.title) { document.title = s.title; setMetaTag("property", "og:title", s.title); setMetaTag("name", "twitter:title", s.title); }
    if (s.description) { setMetaTag("name", "description", s.description); setMetaTag("property", "og:description", s.description); setMetaTag("name", "twitter:description", s.description); }
    if (s.shareImage) { setMetaTag("property", "og:image", s.shareImage); setMetaTag("name", "twitter:image", s.shareImage); }
    let j = document.getElementById("kul-jsonld");
    if (!j) { j = document.createElement("script"); j.type = "application/ld+json"; j.id = "kul-jsonld"; document.head.appendChild(j); }
    j.textContent = JSON.stringify(buildJSONLD(c));
  }

  function fullCSS(theme) { return themeCSS(theme) + BASE_CSS; }
  window.KUL = { DEFAULT_CONTENT, renderBody, renderDoc, mountSite, themeCSS, fullCSS, hydrate: siteRuntime, merge, buildJSONLD, applySEO };
})();

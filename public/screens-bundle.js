// ===== landing.js =====

// ============= LANDING =============

const landingMobile = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">01</span>Landing</h2>
  <div class="screen-goal">Hook in 5 seconds. <b>"Where did your salary go?"</b> — then one button to find out.</div>
</div>

<div class="variations cols-3">

  <!-- Variation A: Big question, minimal -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">The Question</span>
      <span class="desc">typography-led, one big ask</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:16px;padding-top:30px">
          <div class="row between" style="padding-top:8px">
            <span class="hand" style="font-size:20px;color:var(--blue);font-weight:700">FixMyFinance</span>
            <span class="hand sub">help?</span>
          </div>

          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:10px 0">
            <div class="hand" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-bottom:14px">A simple question</div>
            <div class="h1" style="font-size:34px;line-height:1.05">
              Where did your <span class="marker">salary</span><br/>
              go last month?
            </div>
            <div class="hand" style="font-size:17px;color:var(--ink-2);margin-top:18px;line-height:1.4">
              Upload your bank statement.<br/>
              Get answers in <b>30 seconds.</b>
            </div>
          </div>

          <a href="#" class="btn wide" style="font-size:15px">Analyze My Money →</a>

          <div class="row" style="gap:8px;justify-content:center;flex-wrap:wrap;font-size:10px;color:var(--muted)">
            <span>🔒 No login</span><span>·</span>
            <span>No data stored</span><span>·</span>
            <span>All banks</span>
          </div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Clean & direct. Question is the hero. Single clear CTA. Trust line sits quiet.
    </div>
  </div>

  <!-- Variation B: Before/After teaser -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">B</span>
      <span class="name">The Receipt</span>
      <span class="desc">shows what they'll get</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:14px;padding-top:26px">
          <span class="hand" style="font-size:18px;color:var(--blue);font-weight:700">FixMyFinance</span>

          <div class="h1" style="font-size:26px">
            Your salary, <span class="marker-yellow">diagnosed.</span>
          </div>
          <div class="hand sub" style="font-size:15px">Upload statement → get a money report card.</div>

          <!-- Teaser preview card -->
          <div class="card" style="padding:12px;background:var(--paper-2);transform:rotate(-1.5deg);margin:6px 0">
            <div class="row between">
              <span class="h3" style="font-size:10px">Health Score</span>
              <span class="pill warn">Needs work</span>
            </div>
            <div class="row" style="align-items:baseline;gap:6px;margin:6px 0 8px">
              <span class="big-num" style="font-size:40px">62</span>
              <span class="sub">/100</span>
            </div>
            <div class="sub" style="font-size:11px">Food is eating 42% of your income.</div>
          </div>
          <div class="card" style="padding:10px 12px;transform:rotate(1deg);margin-top:-4px">
            <span class="chip food"><span class="d"></span>Food</span>
            <span class="chip shop"><span class="d"></span>Shopping</span>
            <span class="chip trans"><span class="d"></span>Transport</span>
            <div class="sub" style="font-size:11px;margin-top:6px">18 food orders · ₹650 late fees</div>
          </div>

          <div style="flex:1"></div>
          <a href="#" class="btn wide">Analyze My Money →</a>
          <div class="row" style="gap:8px;justify-content:center;font-size:10px;color:var(--muted)">
            🔒 No login · not stored · PDF/CSV/image
          </div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Shows sample of the payoff <b>before</b> the upload. Good for skeptical users.
    </div>
  </div>

  <!-- Variation C: Chat opener -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">C</span>
      <span class="name">Smart Friend</span>
      <span class="desc">chat-like welcome</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:12px;padding-top:30px">
          <span class="hand" style="font-size:18px;color:var(--blue);font-weight:700">FixMyFinance</span>

          <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:10px">
            <div class="card" style="max-width:80%;border-radius:16px 16px 16px 4px;padding:10px 12px">
              <div class="hand" style="font-size:15px">Hey 👋 I'm your money buddy.</div>
            </div>
            <div class="card" style="max-width:85%;border-radius:16px 16px 16px 4px;padding:10px 12px">
              <div class="hand" style="font-size:15px">Upload last month's statement and I'll tell you <b>exactly</b> where it went.</div>
            </div>
            <div class="card hero-blue" style="max-width:70%;align-self:flex-end;border-radius:16px 16px 4px 16px;padding:8px 12px">
              <div class="hand" style="font-size:14px;color:#fff">Sure, show me</div>
            </div>
            <div class="card" style="max-width:90%;border-radius:16px 16px 16px 4px;padding:10px 12px">
              <div class="hand" style="font-size:14px">Takes 30 sec. No login. Nothing saved.</div>
            </div>
          </div>

          <a href="#" class="btn wide" style="margin-top:8px">📎 Upload statement</a>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Conversational. Makes it feel like texting a friend, not using a tool.
    </div>
  </div>

</div>

<div class="notes">
  <b>Recommendation:</b> Start with <b>A — The Question</b>. It tests the core emotional hook with minimum bias. Keep B as a landing-page scroll section below ("what you'll get"), and keep C for a future returning-user flow.
  <ul>
    <li>All three: trust strip stays tiny & low. No badges, no stock logos.</li>
    <li>CTA copy: "Analyze My Money" (active voice) > "Get Started".</li>
    <li>Keep headline under 7 words, subtext under 12.</li>
  </ul>
</div>
`;

const landingDesktop = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">01</span>Landing — Desktop</h2>
  <div class="screen-goal">Same hook, more room. Use the horizontal space to <b>preview the payoff</b> without scrolling.</div>
</div>

<div class="variations cols-1">

  <!-- Desktop A: Split hook + preview -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">Hook + Preview</span>
      <span class="desc">left asks, right teases report</span>
    </div>

    <div class="desktop">
      <div class="desktop-bar">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">fixmyfinance.app</div>
      </div>
      <div class="desktop-body" style="padding-top:20px">
        <!-- nav -->
        <div class="row between" style="margin-bottom:40px">
          <div class="row" style="gap:24px">
            <span class="hand" style="font-size:24px;font-weight:700;color:var(--blue)">FixMyFinance</span>
            <span class="hand sub" style="font-size:14px">how it works · privacy · FAQ</span>
          </div>
          <a href="#" class="btn sm ghost">GitHub ↗</a>
        </div>

        <div style="display:grid;grid-template-columns:1.05fr 1fr;gap:60px;align-items:center">
          <!-- LEFT: hook -->
          <div>
            <div class="hand" style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:var(--blue);margin-bottom:14px">Money diagnosis · 30 seconds</div>
            <h1 class="h1" style="font-size:58px;letter-spacing:-1.5px;line-height:1.02">
              Where did your<br/>
              <span class="marker">salary</span> go<br/>
              last month?
            </h1>
            <p class="hand" style="font-size:20px;color:var(--ink-2);max-width:420px;margin:24px 0 28px;line-height:1.4">
              Upload your bank statement. Get a full money diagnosis in under a minute. No login. Nothing saved.
            </p>
            <div class="row" style="gap:12px">
              <a href="#" class="btn" style="font-size:15px;padding:14px 22px">Analyze My Money →</a>
              <a href="#" class="btn ghost sm">See sample report</a>
            </div>
            <div class="row" style="gap:18px;margin-top:22px;font-size:12px;color:var(--muted)">
              <span>🔒 No login required</span>
              <span>· No data stored</span>
              <span>· PDF, CSV, Image</span>
              <span>· Works with all banks</span>
            </div>
          </div>

          <!-- RIGHT: report preview stack -->
          <div style="position:relative;min-height:420px">
            <div class="card" style="position:absolute;top:0;left:40px;width:260px;transform:rotate(-4deg);padding:16px">
              <div class="row between"><span class="h3" style="font-size:10px">Health Score</span><span class="pill warn">Needs work</span></div>
              <div class="row" style="align-items:baseline;gap:8px;margin:8px 0">
                <span class="big-num" style="font-size:52px">62</span><span class="sub">/100</span>
              </div>
              <div class="sub" style="font-size:12px">Food is 42% of income — about 2× the healthy range.</div>
            </div>
            <div class="card alert" style="position:absolute;top:120px;right:0;width:260px;transform:rotate(3deg);padding:14px">
              <div class="h3" style="font-size:10px;color:var(--risk)">⚠ Biggest leak</div>
              <div class="h2" style="color:var(--risk);margin-top:4px">₹18,400<span class="sub" style="color:var(--risk)">/mo on food</span></div>
              <div class="sub" style="font-size:11px;margin-top:4px">Potential save: ₹8,200/mo</div>
            </div>
            <div class="card" style="position:absolute;top:260px;left:0;width:280px;transform:rotate(-2deg);padding:14px">
              <div class="row" style="gap:14px;align-items:center">
                <div class="donut" style="width:90px;height:90px"></div>
                <div style="flex:1">
                  <div class="h3" style="font-size:10px">Spending mix</div>
                  <div class="legend" style="margin-top:4px">
                    <div class="li"><span class="d" style="background:#E8A54B"></span>Food 42%</div>
                    <div class="li"><span class="d" style="background:#8A5CF6"></span>Shop 18%</div>
                    <div class="li"><span class="d" style="background:#3BA8C6"></span>Transport 9%</div>
                  </div>
                </div>
              </div>
            </div>
            <div class="callout" style="top:-10px;right:10px;transform:rotate(-4deg)">
              ← exactly what<br/>you'll get ↓
            </div>
          </div>
        </div>

        <!-- trust strip -->
        <div class="row" style="gap:30px;margin-top:50px;padding-top:24px;border-top:1px dashed var(--line-soft);justify-content:space-between;flex-wrap:wrap">
          <div class="hand sub"><b style="color:var(--ink)">1.</b> Upload statement (PDF / CSV / image)</div>
          <div class="hand sub"><b style="color:var(--ink)">2.</b> We read it on your device</div>
          <div class="hand sub"><b style="color:var(--ink)">3.</b> You get a money diagnosis</div>
          <div class="hand sub"><b style="color:var(--ink)">4.</b> We forget it forever</div>
        </div>
      </div>
    </div>
    <div class="notes">
      Desktop uses the extra width for a <b>floating report preview</b> on the right — same hook, but users see the payoff without scrolling. 4-step strip lives below, optional.
    </div>
  </div>

</div>
`;


// ===== upload.js =====

// ============= UPLOAD =============

const uploadMobile = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">02</span>Upload</h2>
  <div class="screen-goal">Zero friction. Drop the file, done. <b>Privacy is the feature</b>, not a footnote.</div>
</div>

<div class="variations cols-3">

  <!-- A: Classic dropzone -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">Classic Drop</span>
      <span class="desc">standard dropzone, trust below</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:16px;padding-top:28px">
          <div class="row" style="gap:8px"><span class="hand sub">←</span><span class="hand" style="font-weight:700">Upload statement</span></div>

          <div class="h1" style="font-size:24px">Drop it here.<br/>We'll do the rest.</div>
          <div class="hand sub" style="font-size:14px">Works with any bank. PDF, CSV, or a photo of your e-statement.</div>

          <div class="scribble-dashed" style="flex:1;min-height:220px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:24px;text-align:center">
            <svg class="ico" viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--blue);stroke-width:1.4"><path d="M12 3v14M6 9l6-6 6 6M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
            <div class="hand" style="font-size:18px;color:var(--blue);font-weight:700">Drop file here</div>
            <div class="hand sub" style="font-size:13px">or <u>tap to browse</u></div>
            <div class="row" style="gap:6px;margin-top:8px">
              <span class="chip"><span class="d"></span>PDF</span>
              <span class="chip"><span class="d"></span>CSV</span>
              <span class="chip"><span class="d"></span>Image</span>
            </div>
          </div>

          <div class="card" style="padding:10px 12px;background:var(--paper-2);font-size:11px;display:flex;gap:8px;align-items:flex-start">
            <span style="font-size:16px">🔒</span>
            <div class="hand" style="font-size:13px;line-height:1.3;color:var(--ink-2)">
              <b>Processed on your device.</b> Nothing is uploaded to a server.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Familiar pattern. Works. Privacy line earns its own small card — not footnote-sized.
    </div>
  </div>

  <!-- B: File-first BIG button -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">B</span>
      <span class="name">One Big Button</span>
      <span class="desc">mobile-native, tap-first</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:14px;padding-top:28px">
          <div class="row between">
            <span class="hand sub">← back</span>
            <span class="hand sub">step 1 of 3</span>
          </div>

          <div class="h1" style="font-size:26px;text-align:center;margin-top:10px">Pick your file</div>
          <div class="hand sub" style="text-align:center;font-size:13px">We'll analyze it right on your phone.</div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:10px">
            <button class="card" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
              <span style="font-size:28px">📄</span>
              <div class="hand" style="font-size:14px;font-weight:700">PDF</div>
              <div class="sub" style="font-size:10px">bank statement</div>
            </button>
            <button class="card" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
              <span style="font-size:28px">📊</span>
              <div class="hand" style="font-size:14px;font-weight:700">CSV</div>
              <div class="sub" style="font-size:10px">export file</div>
            </button>
            <button class="card" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
              <span style="font-size:28px">📷</span>
              <div class="hand" style="font-size:14px;font-weight:700">Camera</div>
              <div class="sub" style="font-size:10px">scan paper</div>
            </button>
            <button class="card" style="padding:18px 10px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer">
              <span style="font-size:28px">🖼️</span>
              <div class="hand" style="font-size:14px;font-weight:700">Image</div>
              <div class="sub" style="font-size:10px">screenshot</div>
            </button>
          </div>

          <div style="flex:1"></div>

          <button class="btn ghost wide" style="border-style:dashed">Try with sample data</button>

          <div class="sub" style="text-align:center;font-size:10px">🔒 runs on-device · nothing saved · no account</div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Better on mobile: big tap targets, no tiny "browse" link. Sample data option = frictionless preview.
    </div>
  </div>

  <!-- C: Picked file state -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">C</span>
      <span class="name">Post-pick state</span>
      <span class="desc">after they chose a file</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:14px;padding-top:28px">
          <div class="row between">
            <span class="hand sub">← back</span>
            <span class="hand sub">step 1 of 3</span>
          </div>
          <div class="h1" style="font-size:22px">Got it. Ready?</div>

          <div class="card" style="padding:12px;display:flex;gap:12px;align-items:center">
            <div style="width:46px;height:58px;border:1.5px solid var(--ink);border-radius:4px;background:var(--paper-2);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📄</div>
            <div style="flex:1;min-width:0">
              <div class="mono" style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">HDFC_Oct_2025.pdf</div>
              <div class="sub" style="font-size:11px">2.4 MB · detected 147 transactions</div>
            </div>
            <button style="background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer">✕</button>
          </div>

          <div class="card" style="padding:10px 12px;background:var(--ok-soft);border-color:var(--ok)">
            <div class="row" style="gap:6px;align-items:center;font-size:12px;color:var(--ok)">
              <span>✓</span><b>Looks like a valid bank statement</b>
            </div>
          </div>

          <div class="block">
            <div class="h3" style="font-size:10px;margin-bottom:6px">One more thing</div>
            <label class="row" style="gap:8px;font-size:12px;cursor:pointer">
              <span style="width:16px;height:16px;border:1.5px solid var(--ink);border-radius:3px;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px">✓</span>
              Include recurring payments (subscriptions)
            </label>
            <label class="row" style="gap:8px;font-size:12px;margin-top:6px;cursor:pointer">
              <span style="width:16px;height:16px;border:1.5px solid var(--ink);border-radius:3px;background:var(--blue);color:#fff;display:flex;align-items:center;justify-content:center;font-size:11px">✓</span>
              Detect late-payment fees
            </label>
          </div>

          <div style="flex:1"></div>
          <a href="#" class="btn wide">Analyze →</a>
          <div class="sub" style="text-align:center;font-size:10px">This file will not leave your device.</div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Shows parsed preview + validation before committing. Removes "did it work?" anxiety.
    </div>
  </div>

</div>

<div class="notes">
  <b>Flow:</b> Variation B → Variation C. User picks file type (B), we parse quickly, show validated preview (C), then they tap "Analyze" to go to Processing.
  <ul>
    <li>Show the trust message early — but as a <b>feature</b>, not a disclaimer.</li>
    <li>Always offer "Try with sample data" — huge for conversion on a new tool.</li>
    <li>Detect the bank automatically if possible and echo it back ("Looks like HDFC"), never ask.</li>
  </ul>
</div>
`;

const uploadDesktop = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">02</span>Upload — Desktop</h2>
  <div class="screen-goal">Drag-and-drop takes center stage. Side panel shows <b>how it works</b> so users don't feel it's a black box.</div>
</div>

<div class="variations cols-1">

  <div class="variation">
    <div class="desktop">
      <div class="desktop-bar">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">fixmyfinance.app/upload</div>
      </div>
      <div class="desktop-body">
        <div class="row between" style="margin-bottom:24px">
          <span class="hand" style="font-size:22px;font-weight:700;color:var(--blue)">FixMyFinance</span>
          <span class="hand sub">step 1 of 3 · upload → process → diagnose</span>
        </div>

        <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:40px;align-items:stretch">
          <!-- LEFT: huge dropzone -->
          <div>
            <h1 class="h1" style="font-size:42px;margin:0 0 6px">Drop your statement.</h1>
            <p class="hand sub" style="font-size:16px;margin:0 0 20px">PDF, CSV, or an image. We handle the rest.</p>
            <div class="scribble-dashed" style="min-height:320px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:40px;text-align:center;border-width:2.5px">
              <svg class="ico" viewBox="0 0 24 24" style="width:64px;height:64px;stroke:var(--blue);stroke-width:1.2"><path d="M12 3v14M6 9l6-6 6 6M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
              <div class="hand" style="font-size:26px;color:var(--blue);font-weight:700">Drag your file here</div>
              <div class="hand sub" style="font-size:15px">or <u>click to browse</u></div>
              <div class="row" style="gap:8px;margin-top:10px">
                <span class="chip"><span class="d"></span>PDF</span>
                <span class="chip"><span class="d"></span>CSV</span>
                <span class="chip"><span class="d"></span>Image / Scan</span>
                <span class="chip"><span class="d"></span>ZIP</span>
              </div>
              <div class="sub" style="margin-top:14px;font-size:11px">Max 20MB · any bank · any country</div>
            </div>
            <div class="row" style="gap:10px;margin-top:14px">
              <a href="#" class="btn ghost sm">Try with sample (HDFC)</a>
              <a href="#" class="btn ghost sm">How to export statement</a>
            </div>
          </div>

          <!-- RIGHT: trust / how it works -->
          <div style="display:flex;flex-direction:column;gap:12px">
            <div class="card" style="padding:16px">
              <div class="h3">🔒 Privacy</div>
              <div class="hand" style="font-size:15px;color:var(--ink-2);margin-top:6px;line-height:1.4">
                Parsing happens entirely in your browser. Your statement never touches our servers.
              </div>
            </div>

            <div class="card" style="padding:16px">
              <div class="h3">What we look for</div>
              <div class="col" style="gap:8px;margin-top:8px">
                <div class="row" style="gap:10px;font-size:13px"><span style="color:var(--blue);font-weight:700">01</span> Spending categories</div>
                <div class="row" style="gap:10px;font-size:13px"><span style="color:var(--blue);font-weight:700">02</span> Recurring subscriptions</div>
                <div class="row" style="gap:10px;font-size:13px"><span style="color:var(--blue);font-weight:700">03</span> Biggest money leaks</div>
                <div class="row" style="gap:10px;font-size:13px"><span style="color:var(--blue);font-weight:700">04</span> Fees, late charges, surprises</div>
                <div class="row" style="gap:10px;font-size:13px"><span style="color:var(--blue);font-weight:700">05</span> A health score out of 100</div>
              </div>
            </div>

            <div class="card" style="padding:16px;background:var(--ink);color:var(--paper);border-color:var(--ink)">
              <div class="h3" style="color:var(--paper)">New here?</div>
              <div class="hand" style="font-size:14px;line-height:1.4;margin-top:6px;color:var(--paper)">
                You don't need an account. You don't need to trust us. <b style="color:#fff;background:var(--blue);padding:0 4px">Nothing leaves your browser.</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="notes">
      Dropzone is huge and impossible to miss. Right-hand column is pure trust-building + sets expectations for the report ("what we look for").
    </div>
  </div>

</div>
`;


// ===== processing.js =====

// ============= PROCESSING =============

const processingMobile = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">03</span>Processing</h2>
  <div class="screen-goal">No spinner. Show the <b>work being done</b>. Each step builds a little more trust and anticipation.</div>
</div>

<div class="variations cols-3">

  <!-- A: Step list -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">Step list</span>
      <span class="desc">classic, readable</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:16px;padding-top:30px">
          <div class="h1" style="font-size:24px;margin-top:10px">Reading your money story…</div>
          <div class="hand sub" style="font-size:14px">Usually takes ~30 seconds.</div>

          <div class="card" style="padding:10px 14px;margin-top:10px" data-animate-steps="1">
            <div class="step done">
              <span class="num">✓</span>
              <div>
                <div class="label">File decoded</div>
                <div class="sub">147 rows found in HDFC_Oct_2025.pdf</div>
              </div>
            </div>
            <div class="step active">
              <span class="num">2</span>
              <div>
                <div class="label">Reading transactions</div>
                <div class="sub">merchant names, amounts, dates</div>
              </div>
            </div>
            <div class="step">
              <span class="num">3</span>
              <div>
                <div class="label">Understanding spending</div>
                <div class="sub">matching to categories</div>
              </div>
            </div>
            <div class="step">
              <span class="num">4</span>
              <div>
                <div class="label">Spotting patterns</div>
                <div class="sub">subscriptions, fees, habits</div>
              </div>
            </div>
            <div class="step">
              <span class="num">5</span>
              <div>
                <div class="label">Generating insights</div>
                <div class="sub">your diagnosis</div>
              </div>
            </div>
          </div>

          <div style="flex:1"></div>

          <div class="card" style="padding:10px 12px;background:var(--paper-2);font-size:11px">
            <div class="hand" style="font-size:13px">💡 <b>Did you know?</b></div>
            <div class="hand" style="font-size:13px;line-height:1.3;color:var(--ink-2);margin-top:3px">
              Most Indians spend 35–40% of their income on food and convenience.
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Most legible. "Did you know" card buys attention while the engine works.
    </div>
  </div>

  <!-- B: Scanning receipt animation -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">B</span>
      <span class="name">Receipt scan</span>
      <span class="desc">metaphor-forward</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:12px;padding-top:30px;align-items:center">
          <div class="h1" style="font-size:22px;text-align:center">Scanning 147 transactions…</div>

          <!-- Receipt visual -->
          <div style="position:relative;width:220px;height:340px;margin-top:14px">
            <div class="card" style="width:100%;height:100%;padding:16px;background:var(--paper);font-family:var(--mono);font-size:10px;overflow:hidden;position:relative">
              <div style="text-align:center;font-weight:700;margin-bottom:6px;font-family:var(--hand);font-size:14px">HDFC BANK</div>
              <div style="text-align:center;margin-bottom:8px">—— OCT 2025 ——</div>
              ${Array.from({length: 14}).map((_,i) => `
                <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                  <span style="color:var(--muted)">0${i+1}/10</span>
                  <span style="flex:1;margin:0 4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${['SWIGGY','ZOMATO','UBER','AMAZON','NETFLIX','SALARY','RENT','DMART','STARBUCKS','BLINKIT','IRCTC','FLIPKART','MYNTRA','BESCOM'][i]}</span>
                  <span>₹${[420,680,185,2499,649,'75K',18500,1250,385,460,950,1899,2300,540][i]}</span>
                </div>
              `).join('')}
            </div>
            <!-- scan line -->
            <div style="position:absolute;left:0;right:0;height:3px;background:var(--blue);box-shadow:0 0 8px var(--blue);animation:scan 2.2s ease-in-out infinite"></div>
            <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent, rgba(47,47,228,0.08), transparent);animation:scan 2.2s ease-in-out infinite;pointer-events:none"></div>
          </div>

          <div class="hand" style="font-size:14px;color:var(--blue);text-align:center;margin-top:10px">
            <span class="marker">Reading…</span>
          </div>
          <div class="sub" style="font-size:12px;text-align:center">tagging categories · finding patterns</div>

          <div style="flex:1"></div>
          <div class="gauge" style="width:100%"><div class="fill" style="width:62%;background:var(--blue)"></div></div>
          <div class="sub" style="font-size:11px">62% · just a moment…</div>
        </div>
      </div>
    </div>
    <style>@keyframes scan { 0%,100%{top:20%} 50%{top:80%} }</style>

    <div class="notes" style="max-width:340px">
      Receipt scan metaphor is delightful. Slight risk: feels like theatre if it runs for only 3 seconds.
    </div>
  </div>

  <!-- C: Early insights teaser -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">C</span>
      <span class="name">Live tease</span>
      <span class="desc">insights appear as they're found</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="display:flex;flex-direction:column;gap:12px;padding-top:30px">
          <div class="h1" style="font-size:22px">Finding things…</div>
          <div class="hand sub" style="font-size:13px">Stay here. This is the good part.</div>

          <div class="gauge" style="margin-top:6px"><div class="fill" style="width:68%"></div></div>

          <div style="flex:1;display:flex;flex-direction:column;gap:10px;margin-top:10px;overflow:hidden">

            <div class="card" style="padding:10px 12px;background:var(--paper);animation:pop 0.4s">
              <div class="row" style="gap:8px;align-items:center">
                <span style="font-size:18px">🍜</span>
                <div style="flex:1">
                  <div class="mono" style="font-size:10px;color:var(--muted)">found</div>
                  <div class="hand" style="font-size:14px"><b>18 food orders</b> this month</div>
                </div>
              </div>
            </div>

            <div class="card" style="padding:10px 12px;animation:pop 0.4s">
              <div class="row" style="gap:8px;align-items:center">
                <span style="font-size:18px">🔁</span>
                <div style="flex:1">
                  <div class="mono" style="font-size:10px;color:var(--muted)">found</div>
                  <div class="hand" style="font-size:14px"><b>7 subscriptions</b>, ₹2,840/mo</div>
                </div>
              </div>
            </div>

            <div class="card" style="padding:10px 12px;animation:pop 0.4s">
              <div class="row" style="gap:8px;align-items:center">
                <span style="font-size:18px">⚠️</span>
                <div style="flex:1">
                  <div class="mono" style="font-size:10px;color:var(--muted)">found</div>
                  <div class="hand" style="font-size:14px"><b>₹650 in late fees</b></div>
                </div>
              </div>
            </div>

            <div class="card" style="padding:10px 12px;opacity:0.55;border-style:dashed">
              <div class="row" style="gap:8px;align-items:center">
                <span style="font-size:18px">…</span>
                <div class="hand sub" style="font-size:13px">calculating health score</div>
              </div>
            </div>
          </div>

          <div class="sub" style="font-size:10px;text-align:center">~10 seconds left</div>
        </div>
      </div>
    </div>
    <style>@keyframes pop { from { opacity:0; transform:translateY(8px)} to { opacity:1; transform:none} }</style>

    <div class="notes" style="max-width:340px">
      Best dopamine hit — real findings surface live. Turns processing into <b>content</b>.
    </div>
  </div>

</div>

<div class="notes">
  <b>Recommendation:</b> Go with <b>C — Live tease</b>. Processing becomes the first taste of the product, not a blocker. Keep A as fallback for slow devices (need deterministic layout).
</div>
`;

const processingDesktop = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">03</span>Processing — Desktop</h2>
  <div class="screen-goal">Horizontal timeline. Left shows the steps, right shows findings appearing live.</div>
</div>

<div class="variations cols-1">
  <div class="variation">
    <div class="desktop">
      <div class="desktop-bar">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">fixmyfinance.app/analyze</div>
      </div>
      <div class="desktop-body">
        <div class="row between" style="margin-bottom:20px">
          <span class="hand" style="font-size:22px;font-weight:700;color:var(--blue)">FixMyFinance</span>
          <span class="hand sub">step 2 of 3 · analyzing</span>
        </div>

        <h1 class="h1" style="font-size:42px;margin:0 0 6px">Analyzing your money…</h1>
        <p class="hand sub" style="font-size:16px;margin:0 0 24px">147 transactions · HDFC_Oct_2025.pdf · processed locally</p>

        <!-- horizontal step bar -->
        <div class="card" style="padding:18px 20px;margin-bottom:20px">
          <div style="position:relative">
            <div style="height:3px;background:var(--paper-3);position:absolute;top:14px;left:16px;right:16px;border-radius:2px"></div>
            <div style="height:3px;background:var(--blue);position:absolute;top:14px;left:16px;width:45%;border-radius:2px"></div>
            <div class="row between" style="position:relative">
              ${['File decoded','Reading transactions','Understanding spending','Spotting patterns','Generating insights'].map((t,i) => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:6px;flex:1">
                  <div style="width:28px;height:28px;border-radius:50%;border:1.5px solid var(--ink);background:${i<=1?'var(--blue)':'var(--paper)'};color:${i<=1?'#fff':'var(--ink)'};display:flex;align-items:center;justify-content:center;font-family:var(--ui);font-weight:700;font-size:12px;position:relative;z-index:2">${i<=1?'✓':i+1}</div>
                  <div class="hand" style="font-size:13px;font-weight:${i===2?700:400};color:${i<=2?'var(--ink)':'var(--muted)'};text-align:center">${t}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
          <!-- live findings -->
          <div>
            <div class="h3" style="margin-bottom:10px">Findings so far <span class="sub" style="text-transform:none;letter-spacing:0;font-size:11px">· live</span></div>
            <div class="col" style="gap:10px">
              <div class="card" style="padding:12px 14px"><div class="row" style="gap:10px"><span style="font-size:22px">🍜</span><div><div class="mono sub" style="font-size:10px">category leader</div><div class="hand" style="font-size:15px"><b>Food & dining</b> — ₹18,400, 42% of spend</div></div></div></div>
              <div class="card" style="padding:12px 14px"><div class="row" style="gap:10px"><span style="font-size:22px">🔁</span><div><div class="mono sub" style="font-size:10px">recurring</div><div class="hand" style="font-size:15px"><b>7 subscriptions</b> — ₹2,840 monthly</div></div></div></div>
              <div class="card" style="padding:12px 14px"><div class="row" style="gap:10px"><span style="font-size:22px">⚠️</span><div><div class="mono sub" style="font-size:10px">surprise</div><div class="hand" style="font-size:15px"><b>₹650 in late-payment fees</b></div></div></div></div>
              <div class="card" style="padding:12px 14px;border-style:dashed;opacity:0.55"><div class="row" style="gap:10px"><span style="font-size:22px">…</span><div class="hand sub" style="font-size:14px">calculating health score</div></div></div>
            </div>
          </div>

          <!-- did you know -->
          <div>
            <div class="h3" style="margin-bottom:10px">While we work</div>
            <div class="card" style="padding:18px;background:var(--ink);color:var(--paper);border-color:var(--ink)">
              <div class="hand" style="font-size:11px;letter-spacing:2px;color:var(--blue-soft);text-transform:uppercase">Did you know</div>
              <div class="hand" style="font-size:22px;line-height:1.35;margin-top:8px;color:#fff">
                A typical Indian urban household spends <span class="marker-yellow" style="color:var(--ink)">35–40%</span> of income on food & convenience.
              </div>
              <div class="hand sub" style="font-size:13px;margin-top:10px;color:#C8C4F0">Your report will tell you exactly where you land.</div>
            </div>
            <div class="sub" style="font-size:12px;margin-top:12px">⏱ about 12 seconds left</div>
          </div>
        </div>
      </div>
    </div>

    <div class="notes">
      Horizontal step timeline + live findings panel. The "Did you know" slot rotates content — keeps people engaged without faking progress.
    </div>
  </div>
</div>
`;


// ===== txn.js =====

// ============= TRANSACTIONS =============

const txnMobile = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">04</span>Transaction Review</h2>
  <div class="screen-goal">Give user <b>control</b>. Scan, correct categories, move on. Don't make this feel like homework.</div>
</div>

<div class="variations cols-3">

  <!-- A: Card list (default) -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">Card list</span>
      <span class="desc">touch-first, category tags</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body scrollable" style="padding-top:24px">
          <div class="row between" style="margin-bottom:10px">
            <span class="hand sub">← back</span>
            <span class="hand sub">step 3 of 3</span>
          </div>
          <div class="h1" style="font-size:22px">147 transactions</div>
          <div class="hand sub" style="font-size:13px;margin-bottom:10px">Tap any category to fix it.</div>

          <!-- filter bar -->
          <div class="row" style="gap:6px;margin-bottom:10px;overflow-x:auto">
            <span class="chip" style="background:var(--ink);color:#fff"><span class="d" style="background:#fff"></span>All</span>
            <span class="chip food"><span class="d"></span>Food</span>
            <span class="chip shop"><span class="d"></span>Shop</span>
            <span class="chip trans"><span class="d"></span>Transport</span>
            <span class="chip bills"><span class="d"></span>Bills</span>
          </div>

          <!-- date group -->
          <div class="sub mono" style="font-size:10px;margin-top:6px;margin-bottom:4px">MON 06 OCT</div>
          <div class="card" style="padding:10px 12px;margin-bottom:6px">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Swiggy</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip food"><span class="d"></span>Food ▾</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--risk)">-₹420</div><div class="sub" style="font-size:10px">UPI</div></div></div>
          </div>
          <div class="card" style="padding:10px 12px;margin-bottom:6px">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Uber</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip trans"><span class="d"></span>Transport ▾</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--risk)">-₹185</div><div class="sub" style="font-size:10px">card</div></div></div>
          </div>

          <div class="sub mono" style="font-size:10px;margin-top:10px;margin-bottom:4px">SAT 04 OCT</div>
          <div class="card" style="padding:10px 12px;margin-bottom:6px;border-color:var(--blue);background:var(--blue-soft)">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Amazon</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip shop" style="border-style:dashed"><span class="d"></span>Shopping ▾</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--risk)">-₹2,499</div><div class="sub" style="font-size:10px">card</div></div></div>
            <div class="sub" style="font-size:10px;margin-top:6px;color:var(--blue)">↑ tap to change category</div>
          </div>
          <div class="card" style="padding:10px 12px;margin-bottom:6px">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Netflix</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip ent"><span class="d"></span>Entertainment ▾</span><span class="chip" style="font-size:10px">🔁</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--risk)">-₹649</div><div class="sub" style="font-size:10px">auto</div></div></div>
          </div>

          <div class="sub mono" style="font-size:10px;margin-top:10px;margin-bottom:4px">FRI 03 OCT</div>
          <div class="card" style="padding:10px 12px;margin-bottom:6px;background:var(--ok-soft);border-color:var(--ok)">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Salary — TCS</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip salary"><span class="d"></span>Income</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--ok)">+₹75,000</div><div class="sub" style="font-size:10px">NEFT</div></div></div>
          </div>
          <div class="card" style="padding:10px 12px">
            <div class="row between"><div><div class="hand" style="font-size:14px;font-weight:600">Zomato</div><div class="row" style="gap:6px;margin-top:2px"><span class="chip food"><span class="d"></span>Food ▾</span></div></div><div style="text-align:right"><div class="mono" style="font-weight:700;font-size:13px;color:var(--risk)">-₹680</div><div class="sub" style="font-size:10px">UPI</div></div></div>
          </div>

        </div>
        <!-- sticky CTA -->
        <div style="border-top:1.5px solid var(--ink);padding:10px 18px;background:var(--paper);display:flex;align-items:center;gap:10px">
          <div style="flex:1"><div class="sub" style="font-size:10px">done reviewing?</div><div class="hand" style="font-size:13px;font-weight:700">142/147 categorized</div></div>
          <a href="#" class="btn sm">Show insights →</a>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Grouped by day. One uncertain txn highlighted to invite correction. 🔁 marks recurring. Sticky CTA stays reachable.
    </div>
  </div>

  <!-- B: Category-first view -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">B</span>
      <span class="name">By category</span>
      <span class="desc">spend-first, collapsible</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body scrollable" style="padding-top:24px">
          <div class="h1" style="font-size:22px">Where it went</div>
          <div class="hand sub" style="font-size:13px;margin-bottom:12px">Grouped by category. Tap to expand.</div>

          <!-- Category block: Food (expanded) -->
          <div class="card" style="padding:0;margin-bottom:10px;overflow:hidden">
            <div style="padding:12px 14px;background:var(--paper-2);display:flex;align-items:center;gap:10px;border-bottom:1.5px solid var(--ink)">
              <span style="font-size:20px">🍜</span>
              <div style="flex:1">
                <div class="hand" style="font-size:15px;font-weight:700">Food & Dining</div>
                <div class="sub" style="font-size:11px">18 transactions · 42% of spend</div>
              </div>
              <div class="mono" style="font-weight:800;font-size:16px;color:var(--risk)">₹18,400</div>
              <span class="sub">▾</span>
            </div>
            <div style="padding:6px 12px">
              <div class="txn" style="padding:6px 0"><div class="mono sub" style="font-size:10px">06<br/>Oct</div><div><div class="merchant">Swiggy</div><div class="sub" style="font-size:10px">biryani</div></div><div class="amount neg">-₹420</div></div>
              <div class="txn" style="padding:6px 0"><div class="mono sub" style="font-size:10px">04<br/>Oct</div><div><div class="merchant">Zomato</div></div><div class="amount neg">-₹680</div></div>
              <div class="txn" style="padding:6px 0"><div class="mono sub" style="font-size:10px">02<br/>Oct</div><div><div class="merchant">Starbucks</div></div><div class="amount neg">-₹385</div></div>
              <div class="sub" style="font-size:11px;text-align:center;padding:8px;color:var(--blue)">+ 15 more</div>
            </div>
          </div>

          <!-- Shopping (collapsed) -->
          <div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🛍</span>
            <div style="flex:1"><div class="hand" style="font-size:15px;font-weight:700">Shopping</div><div class="sub" style="font-size:11px">12 txns · 18%</div></div>
            <div class="mono" style="font-weight:800;font-size:15px;color:var(--risk)">₹7,900</div>
            <span class="sub">▸</span>
          </div>

          <div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🚗</span>
            <div style="flex:1"><div class="hand" style="font-size:15px;font-weight:700">Transport</div><div class="sub" style="font-size:11px">24 txns · 9%</div></div>
            <div class="mono" style="font-weight:800;font-size:15px;color:var(--risk)">₹3,940</div>
            <span class="sub">▸</span>
          </div>

          <div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🧾</span>
            <div style="flex:1"><div class="hand" style="font-size:15px;font-weight:700">Bills & utilities</div><div class="sub" style="font-size:11px">6 txns · 15%</div></div>
            <div class="mono" style="font-weight:800;font-size:15px;color:var(--risk)">₹6,580</div>
            <span class="sub">▸</span>
          </div>

          <div class="card" style="padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">🎬</span>
            <div style="flex:1"><div class="hand" style="font-size:15px;font-weight:700">Entertainment</div><div class="sub" style="font-size:11px">7 subs · 6%</div></div>
            <div class="mono" style="font-weight:800;font-size:15px;color:var(--risk)">₹2,840</div>
            <span class="sub">▸</span>
          </div>

          <div class="card" style="padding:12px 14px;background:var(--ok-soft);border-color:var(--ok);display:flex;align-items:center;gap:10px">
            <span style="font-size:20px">💰</span>
            <div style="flex:1"><div class="hand" style="font-size:15px;font-weight:700">Income</div><div class="sub" style="font-size:11px">2 deposits</div></div>
            <div class="mono" style="font-weight:800;font-size:15px;color:var(--ok)">+₹76,500</div>
          </div>

        </div>
        <div style="border-top:1.5px solid var(--ink);padding:10px 18px;background:var(--paper);display:flex;align-items:center;gap:10px">
          <div style="flex:1"><div class="sub" style="font-size:10px">all looking right?</div><div class="hand" style="font-size:13px;font-weight:700">Review & continue</div></div>
          <a href="#" class="btn sm">Show insights →</a>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      For scan-don't-edit users. Expand only what you care about. Natural segue to insights.
    </div>
  </div>

  <!-- C: Edit category bottom sheet -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">C</span>
      <span class="name">Edit sheet</span>
      <span class="desc">category picker modal</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="padding-top:24px;position:relative;overflow:hidden">
          <div style="opacity:0.35">
            <div class="h1" style="font-size:22px">147 transactions</div>
            <div class="card" style="padding:10px 12px;margin-top:10px">
              <div class="row between"><div><div class="hand" style="font-size:14px">Amazon</div></div><div class="mono">-₹2,499</div></div>
            </div>
            <div class="card" style="padding:10px 12px;margin-top:6px">
              <div class="row between"><div><div class="hand" style="font-size:14px">Swiggy</div></div><div class="mono">-₹420</div></div>
            </div>
          </div>

          <!-- bottom sheet -->
          <div style="position:absolute;left:0;right:0;bottom:0;background:var(--paper);border-top:2px solid var(--ink);border-radius:24px 24px 0 0;padding:14px 18px 18px;box-shadow:0 -6px 14px rgba(0,0,0,0.08)">
            <div style="width:40px;height:4px;background:var(--line-soft);border-radius:4px;margin:0 auto 10px"></div>
            <div class="row between">
              <div><div class="hand" style="font-size:14px;font-weight:700">Amazon · ₹2,499</div><div class="sub" style="font-size:11px">04 Oct · card</div></div>
              <span class="sub" style="font-size:18px">✕</span>
            </div>
            <div class="h3" style="margin-top:12px">Category</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px;border:1.5px solid var(--blue);background:var(--blue-soft)"><span>🛍</span><span class="hand" style="font-size:13px;font-weight:700">Shopping</span></button>
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px"><span>🍜</span><span class="hand" style="font-size:13px">Food</span></button>
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px"><span>🎁</span><span class="hand" style="font-size:13px">Gifts</span></button>
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px"><span>🏠</span><span class="hand" style="font-size:13px">Home</span></button>
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px"><span>📚</span><span class="hand" style="font-size:13px">Books</span></button>
              <button class="block" style="display:flex;gap:6px;align-items:center;padding:8px 10px"><span>＋</span><span class="hand" style="font-size:13px">New…</span></button>
            </div>

            <div class="card" style="padding:8px 10px;margin-top:10px;background:var(--paper-2)">
              <label class="row" style="gap:8px;font-size:12px;cursor:pointer">
                <span style="width:14px;height:14px;border:1.2px solid var(--ink);border-radius:3px;background:var(--blue)"></span>
                Also re-tag future <b>Amazon</b> as Shopping
              </label>
            </div>

            <a href="#" class="btn wide" style="margin-top:10px">Save</a>
          </div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Bottom sheet for editing one txn. The "re-tag future" check removes the need to edit 15 times.
    </div>
  </div>

</div>

<div class="notes">
  <b>Flow:</b> User lands on A or B. Uncertain/low-confidence categories are flagged (dashed border). Tapping opens C. Most users skip editing entirely → CTA "Show insights" is always one tap away.
  <ul>
    <li>Auto-categorization must be 90%+ right. Edit UI is for fixing the exceptions, not as the main job.</li>
    <li>Never force the user to finish reviewing — always let them skip.</li>
  </ul>
</div>
`;

const txnDesktop = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">04</span>Transaction Review — Desktop</h2>
  <div class="screen-goal">Spreadsheet-density, but friendlier. Left nav by category, main area a scannable table.</div>
</div>

<div class="variations cols-1">
  <div class="variation">
    <div class="desktop">
      <div class="desktop-bar">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">fixmyfinance.app/review</div>
      </div>
      <div class="desktop-body" style="padding:0">
        <!-- top header -->
        <div class="row between" style="padding:18px 28px;border-bottom:1.5px solid var(--ink)">
          <div class="row" style="gap:20px;align-items:baseline">
            <span class="hand" style="font-size:22px;font-weight:700;color:var(--blue)">FixMyFinance</span>
            <span class="hand sub">Oct 2025 · HDFC · 147 txns</span>
          </div>
          <div class="row" style="gap:8px"><a class="btn ghost sm">Export CSV</a><a class="btn sm">Show insights →</a></div>
        </div>

        <div style="display:grid;grid-template-columns:240px 1fr 260px;min-height:540px">
          <!-- sidebar categories -->
          <aside style="padding:18px 16px;border-right:1px dashed var(--line-soft)">
            <div class="h3" style="margin-bottom:8px">Categories</div>
            <div class="col" style="gap:4px">
              <div class="row between" style="padding:6px 8px;border-radius:8px;background:var(--ink);color:var(--paper);font-size:13px;cursor:pointer"><span>All</span><span class="mono">147</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>🍜 Food</span><span class="mono">18</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>🛍 Shopping</span><span class="mono">12</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>🚗 Transport</span><span class="mono">24</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>🧾 Bills</span><span class="mono">6</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>🎬 Entertainment</span><span class="mono">7</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer"><span>💰 Income</span><span class="mono">2</span></div>
              <div class="row between" style="padding:6px 8px;font-size:13px;cursor:pointer;color:var(--warn-soft);background:var(--warn-soft);color:#7a4b00"><span>? Uncertain</span><span class="mono">5</span></div>
            </div>

            <div class="h3" style="margin:16px 0 6px">Filters</div>
            <div class="col" style="gap:6px;font-size:12px">
              <label class="row" style="gap:6px"><input type="checkbox" checked/>Show recurring only</label>
              <label class="row" style="gap:6px"><input type="checkbox"/>Hide under ₹100</label>
              <label class="row" style="gap:6px"><input type="checkbox"/>Flagged only</label>
            </div>
          </aside>

          <!-- table -->
          <main style="padding:18px 22px">
            <div class="row between" style="margin-bottom:10px">
              <div><div class="h2">147 transactions</div><div class="sub">142 auto-categorized · 5 need review</div></div>
              <div class="row" style="gap:8px"><span class="sub">Search</span><div class="block" style="padding:4px 10px;min-width:160px"><span class="sub mono" style="font-size:11px">type merchant…</span></div></div>
            </div>

            <!-- table headers -->
            <div style="display:grid;grid-template-columns:70px 1.4fr 1fr 100px 110px;gap:10px;padding:8px 10px;border-bottom:1.5px solid var(--ink);font-family:var(--ui);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--muted)">
              <div>Date</div><div>Merchant</div><div>Category</div><div style="text-align:right">Amount</div><div style="text-align:center">Type</div>
            </div>

            ${[
              ['06 Oct','Swiggy — biryani','food','-420','UPI',''],
              ['06 Oct','Uber','trans','-185','Card',''],
              ['05 Oct','Starbucks','food','-385','Card',''],
              ['05 Oct','Blinkit','food','-460','UPI',''],
              ['04 Oct','Amazon','shop','-2499','Card','uncertain'],
              ['04 Oct','Netflix','ent','-649','Auto','recurring'],
              ['03 Oct','Salary — TCS','salary','+75000','NEFT','income'],
              ['03 Oct','Zomato','food','-680','UPI',''],
              ['02 Oct','BESCOM electricity','bills','-1540','Auto','recurring'],
              ['02 Oct','Myntra','shop','-2300','Card',''],
              ['01 Oct','Gym membership','bills','-899','Auto','recurring'],
              ['01 Oct','Rent','bills','-18500','NEFT','']
            ].map(([d,m,c,a,t,flag]) => {
              const cls = {food:'food',shop:'shop',trans:'trans',bills:'bills',ent:'ent',salary:'salary'}[c];
              const cname = {food:'Food',shop:'Shopping',trans:'Transport',bills:'Bills',ent:'Entertainment',salary:'Income'}[c];
              const amtCls = parseInt(a) > 0 ? 'pos' : 'neg';
              const rowBg = flag === 'uncertain' ? 'background:var(--warn-soft)' : '';
              return `<div style="display:grid;grid-template-columns:70px 1.4fr 1fr 100px 110px;gap:10px;padding:10px;border-bottom:1px dashed var(--line-soft);align-items:center;font-size:13px;${rowBg}">
                <div class="mono sub">${d}</div>
                <div style="font-weight:600">${m} ${flag==='recurring'?'<span class="chip" style="font-size:10px;margin-left:4px">🔁</span>':''}</div>
                <div><span class="chip ${cls}${flag==='uncertain'?' ' : ''}" style="${flag==='uncertain'?'border-style:dashed':''}"><span class="d"></span>${cname} ▾</span></div>
                <div class="mono" style="text-align:right;font-weight:700;color:var(--${amtCls==='pos'?'ok':'risk'})">₹${a}</div>
                <div style="text-align:center"><span class="sub" style="font-size:11px">${t}</span></div>
              </div>`;
            }).join('')}

            <div class="sub" style="text-align:center;padding:14px;font-size:11px">showing 12 of 147 · scroll for more</div>
          </main>

          <!-- right drawer: detail -->
          <aside style="padding:18px 16px;border-left:1px dashed var(--line-soft);background:var(--paper-2)">
            <div class="h3" style="margin-bottom:8px">Selected</div>
            <div class="card" style="padding:12px">
              <div class="sub mono" style="font-size:10px">04 OCT 2025 · CARD</div>
              <div class="h2" style="font-size:20px;margin:2px 0 8px">Amazon</div>
              <div class="mono" style="font-size:22px;font-weight:800;color:var(--risk)">-₹2,499</div>
              <div class="h3" style="margin-top:12px;font-size:10px">Category</div>
              <select style="width:100%;padding:6px 8px;font-family:var(--ui);font-size:13px;border:1.5px solid var(--ink);border-radius:6px;margin-top:4px">
                <option>🛍 Shopping</option><option>🍜 Food</option><option>🏠 Home</option><option>🎁 Gifts</option>
              </select>
              <label class="row" style="gap:6px;font-size:11px;margin-top:10px"><input type="checkbox" checked/>Re-tag future Amazon as Shopping</label>
              <a class="btn sm wide" style="margin-top:10px">Save</a>
            </div>

            <div class="card" style="padding:12px;margin-top:10px;background:var(--blue-soft);border-color:var(--blue)">
              <div class="hand" style="font-size:13px;color:var(--ink-2);line-height:1.35">
                <b>Heads up:</b> we're 68% sure this is Shopping. Your call.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
    <div class="notes">
      Desktop gets all three panes at once: sidebar filters, dense table, edit drawer. Uncertain rows get amber background; confidence line sits in the drawer.
    </div>
  </div>
</div>
`;


// ===== insights.js =====

// ============= INSIGHTS (the star) =============

const insightsMobile = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">05</span>Insights Dashboard ★</h2>
  <div class="screen-goal"><b>The most important screen.</b> Answer "where is my money going wrong?" in 5 seconds, then offer depth for those who want it.</div>
</div>

<div class="variations cols-3">

  <!-- A: Single-scroll (canonical) -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">A</span>
      <span class="name">Long scroll</span>
      <span class="desc">health-score first, all cards stacked</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body scrollable" style="padding-top:22px;padding-bottom:16px">
          <!-- header -->
          <div class="row between" style="margin-bottom:10px">
            <div><div class="sub mono" style="font-size:10px">OCT 2025 · HDFC</div><div class="hand" style="font-size:19px;font-weight:700">Your money diagnosis</div></div>
            <span class="sub" style="font-size:16px">↗</span>
          </div>

          <!-- 1. HEALTH SCORE -->
          <div class="card" style="padding:16px;background:var(--ink);color:var(--paper);border-color:var(--ink);margin-bottom:10px">
            <div class="row between"><span class="h3" style="color:var(--blue-soft);font-size:10px">Health Score</span><span class="pill warn">Needs work</span></div>
            <div class="row" style="align-items:baseline;gap:6px;margin:6px 0 6px"><span class="big-num" style="font-size:56px;color:#fff">62</span><span style="color:#C8C4F0">/100</span></div>
            <div class="hand" style="font-size:14px;line-height:1.35;color:#E8E8FF">You're spending 42% on food. That's <b style="color:#fff;background:var(--blue);padding:0 3px">2× the healthy range.</b></div>
            <!-- mini gauge -->
            <div style="margin-top:10px;height:6px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden">
              <div style="height:100%;width:62%;background:linear-gradient(90deg,var(--risk),var(--warn),var(--blue))"></div>
            </div>
          </div>

          <!-- 2. METRICS ROW -->
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:10px">
            <div class="mini-card"><div class="kicker">Income</div><div class="num" style="color:var(--ok)">76.5k</div><div class="sub" style="font-size:10px">₹76,500</div></div>
            <div class="mini-card"><div class="kicker">Expenses</div><div class="num" style="color:var(--risk)">43.8k</div><div class="sub" style="font-size:10px">₹43,760</div></div>
            <div class="mini-card"><div class="kicker">Saved</div><div class="num" style="color:var(--ink)">32.7k</div><div class="sub" style="font-size:10px">43% ↑</div></div>
          </div>

          <!-- 3. DONUT -->
          <div class="card" style="padding:12px;margin-bottom:10px">
            <div class="h3" style="margin-bottom:10px">Where it went</div>
            <div class="row" style="gap:14px;align-items:center">
              <div class="donut" style="width:120px;height:120px"><div class="center">₹43.8k<small>spent</small></div></div>
              <div class="legend" style="flex:1">
                <div class="li"><span class="d" style="background:#E8A54B"></span>Food <b style="margin-left:auto">42%</b></div>
                <div class="li"><span class="d" style="background:#8A5CF6"></span>Shop <b style="margin-left:auto">18%</b></div>
                <div class="li"><span class="d" style="background:#D1324B"></span>Bills <b style="margin-left:auto">15%</b></div>
                <div class="li"><span class="d" style="background:#3BA8C6"></span>Transport <b style="margin-left:auto">9%</b></div>
                <div class="li"><span class="d" style="background:#E457A5"></span>Ent <b style="margin-left:auto">6%</b></div>
                <div class="li"><span class="d" style="background:#2B9348"></span>Other <b style="margin-left:auto">10%</b></div>
              </div>
            </div>
          </div>

          <!-- 4. BIGGEST LEAK (LOUD) -->
          <div class="card alert" style="padding:14px;margin-bottom:10px;position:relative">
            <div class="row between"><span class="h3" style="color:var(--risk);font-size:10px">⚠ Biggest Money Leak</span><span class="pill risk">2× over</span></div>
            <div class="hand" style="font-size:22px;line-height:1.15;margin:6px 0;color:var(--risk);font-weight:700">Food is eating ₹18,400/month.</div>
            <div class="row" style="gap:12px;margin-top:6px">
              <div><div class="sub" style="font-size:10px">You</div><div class="mono" style="font-weight:800;color:var(--risk)">42%</div></div>
              <div style="color:var(--muted);font-size:20px;align-self:center">→</div>
              <div><div class="sub" style="font-size:10px">Healthy</div><div class="mono" style="font-weight:800;color:var(--ok)">20%</div></div>
              <div style="flex:1"></div>
              <div style="text-align:right"><div class="sub" style="font-size:10px">Save up to</div><div class="mono" style="font-weight:800;color:var(--blue)">₹8,200/mo</div></div>
            </div>
          </div>

          <!-- 5. SMART INSIGHTS -->
          <div class="h3" style="margin:12px 4px 6px">Things we noticed</div>
          <div class="col" style="gap:6px;margin-bottom:10px">
            <div class="card" style="padding:10px 12px"><div class="row" style="gap:8px"><span style="font-size:18px">🍜</span><div class="hand" style="font-size:14px;flex:1">You ordered food <b>18 times</b> this month.</div></div></div>
            <div class="card" style="padding:10px 12px"><div class="row" style="gap:8px"><span style="font-size:18px">📈</span><div class="hand" style="font-size:14px;flex:1">Biggest spend day: <b>Sat Oct 4</b> — ₹4,200.</div></div></div>
            <div class="card" style="padding:10px 12px"><div class="row" style="gap:8px"><span style="font-size:18px">⚠️</span><div class="hand" style="font-size:14px;flex:1">You paid <b style="color:var(--risk)">₹650 in late fees.</b> Avoidable.</div></div></div>
            <div class="card" style="padding:10px 12px"><div class="row" style="gap:8px"><span style="font-size:18px">🌙</span><div class="hand" style="font-size:14px;flex:1"><b>68%</b> of food orders were after 10 PM.</div></div></div>
          </div>

          <!-- 6. WHAT-IF SIMULATOR (multi-slider) -->
          <div class="card" style="padding:14px;margin-bottom:10px">
            <div class="row between"><span class="h3">What if…</span><span class="sub" style="font-size:11px">live</span></div>
            <div class="hand sub" style="font-size:12px;margin:2px 0 10px">Drag the sliders. See savings appear.</div>
            <div class="slider-row">
              <span class="lbl">🍜 Food</span>
              <div class="slider-track" style="flex:2"><div class="fill" style="width:30%"></div><div class="thumb" style="left:30%"></div></div>
              <span class="val" style="color:var(--risk)">-30%</span>
            </div>
            <div class="slider-row">
              <span class="lbl">🛍 Shop</span>
              <div class="slider-track" style="flex:2"><div class="fill" style="width:50%"></div><div class="thumb" style="left:50%"></div></div>
              <span class="val" style="color:var(--risk)">-50%</span>
            </div>
            <div class="slider-row">
              <span class="lbl">🎬 Subs</span>
              <div class="slider-track" style="flex:2"><div class="fill" style="width:20%"></div><div class="thumb" style="left:20%"></div></div>
              <span class="val" style="color:var(--risk)">-20%</span>
            </div>
            <div class="row between" style="margin-top:10px;padding-top:10px;border-top:1px dashed var(--line-soft)">
              <div><div class="sub" style="font-size:10px">You save</div><div class="mono" style="font-weight:800;font-size:18px;color:var(--ok)">₹9,430/mo</div></div>
              <div style="text-align:right"><div class="sub" style="font-size:10px">In a year</div><div class="mono" style="font-weight:800;font-size:18px;color:var(--blue)">₹1.13 L</div></div>
            </div>
          </div>

          <!-- 7. SUBSCRIPTIONS -->
          <div class="card" style="padding:14px;margin-bottom:10px">
            <div class="row between"><span class="h3">🔁 Subscriptions</span><span class="sub" style="font-size:11px">7 found</span></div>
            <div class="col" style="gap:4px;margin-top:8px">
              <div class="row between" style="font-size:12px"><span>Netflix</span><span class="mono">₹649</span></div>
              <div class="row between" style="font-size:12px"><span>Spotify Family</span><span class="mono">₹179</span></div>
              <div class="row between" style="font-size:12px"><span>Amazon Prime</span><span class="mono">₹179</span></div>
              <div class="row between" style="font-size:12px;color:var(--muted)"><span>Gym — "Cult.fit"</span><span class="mono strike">₹899</span></div>
              <div class="sub" style="font-size:10px;margin-top:4px">+3 more · <span style="color:var(--blue)">see all</span></div>
            </div>
            <div style="border-top:1px dashed var(--line-soft);margin-top:8px;padding-top:8px"><div class="row between"><span class="hand" style="font-size:13px;font-weight:700">Total / month</span><span class="mono" style="font-weight:800">₹2,840</span></div></div>
          </div>

          <!-- 8. EMERGENCY FUND -->
          <div class="card" style="padding:14px;margin-bottom:10px">
            <div class="row between"><span class="h3">🛟 Emergency cushion</span></div>
            <div class="row" style="align-items:baseline;gap:6px;margin:6px 0"><span class="big-num" style="font-size:36px">1.4</span><span class="sub">months</span></div>
            <div class="hand sub" style="font-size:12px;margin-bottom:8px">You'd last ~6 weeks with zero income. Target: 3–6 months.</div>
            <div class="gauge warn"><div class="fill" style="width:23%"></div></div>
            <div class="row between" style="margin-top:4px"><span class="sub mono" style="font-size:9px">0</span><span class="sub mono" style="font-size:9px">thin ·</span><span class="sub mono" style="font-size:9px">safe</span><span class="sub mono" style="font-size:9px">6mo</span></div>
          </div>

          <!-- 9. PERSONA -->
          <div class="card" style="padding:14px;margin-bottom:10px;background:var(--blue);color:#fff;border-color:var(--ink)">
            <div class="hand" style="font-size:11px;letter-spacing:2px;text-transform:uppercase;opacity:0.7">Your spending persona</div>
            <div class="persona-art" style="margin:8px 0 10px;aspect-ratio:2.2/1"></div>
            <div class="hand" style="font-size:22px;font-weight:700" data-persona-title>You love good food</div>
            <div class="hand" style="font-size:14px;opacity:0.9;margin-top:4px;line-height:1.35" data-persona-sub>4 in 10 rupees went to eating out and delivery.</div>
            <div class="row" style="gap:8px;margin-top:12px">
              <a class="btn sm ghost" style="background:#fff;color:var(--ink)">Share 📤</a>
              <a class="btn sm" style="background:var(--ink);color:#fff;border-color:#fff">See full report</a>
            </div>
          </div>

          <div class="sub" style="font-size:10px;text-align:center;padding:10px">Your statement was not saved. Reload to start over.</div>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Canonical mobile dashboard. Score first, leak loud, actions at the bottom. Every card is standalone.
    </div>
  </div>

  <!-- B: Swipe story (Tinder-style cards) -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">B</span>
      <span class="name">Swipe-story</span>
      <span class="desc">one insight at a time, like stories</span>
    </div>

    <div class="phone">
      <div class="phone-screen" style="background:var(--ink);color:var(--paper)">
        <div class="phone-status" style="color:#fff"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body" style="padding:16px 20px;display:flex;flex-direction:column;gap:10px">
          <!-- story bars -->
          <div class="row" style="gap:4px">
            ${Array.from({length:8}).map((_,i) => `<div style="flex:1;height:3px;background:${i<4?'#fff':'rgba(255,255,255,0.25)'};border-radius:2px"></div>`).join('')}
          </div>

          <div class="row between" style="color:#C8C4F0;font-size:11px">
            <span class="hand" style="font-weight:700;color:#fff">FixMyFinance</span>
            <span>4 / 8</span>
          </div>

          <div style="flex:1;display:flex;flex-direction:column;justify-content:center;padding:30px 0 20px">
            <div class="hand" style="font-size:12px;letter-spacing:3px;color:var(--blue-soft);text-transform:uppercase;margin-bottom:12px">Biggest leak</div>
            <div class="h1" style="font-size:42px;line-height:1.05;color:#fff;letter-spacing:-1px">
              Food ate <span style="color:#ff6c82">42%</span> of your salary.
            </div>
            <div class="hand" style="font-size:16px;color:#E8E8FF;margin-top:18px;line-height:1.4">
              The healthy range is about 20%. You're ₹8,200 over, every single month.
            </div>

            <!-- mini viz -->
            <div style="margin-top:24px">
              <div style="display:flex;gap:2px;height:28px;border-radius:6px;overflow:hidden">
                <div style="flex:42;background:#ff6c82;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700">YOU 42%</div>
                <div style="flex:58;background:rgba(255,255,255,0.15)"></div>
              </div>
              <div style="display:flex;gap:2px;height:28px;border-radius:6px;overflow:hidden;margin-top:6px">
                <div style="flex:20;background:#2B9348;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:700">HEALTHY 20%</div>
                <div style="flex:80;background:rgba(255,255,255,0.15)"></div>
              </div>
            </div>
          </div>

          <div class="row between" style="color:#C8C4F0;font-size:11px;align-items:center">
            <span>← score</span>
            <div class="row" style="gap:8px;align-items:center">
              <span style="width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%"></span>
              <span style="width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%"></span>
              <span style="width:6px;height:6px;background:#fff;border-radius:50%"></span>
              <span style="width:6px;height:6px;background:rgba(255,255,255,0.3);border-radius:50%"></span>
            </div>
            <span style="color:#fff">subs →</span>
          </div>

          <a href="#" class="btn wide" style="background:#fff;color:var(--ink);border-color:#fff">See full dashboard</a>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Insights as a Story. Each card is one tap worth of truth. Heavy emotional punch. Great for sharing.
    </div>
  </div>

  <!-- C: Narrative / chat report -->
  <div class="variation">
    <div class="variation-label">
      <span class="tag">C</span>
      <span class="name">Smart friend</span>
      <span class="desc">prose report, not dashboard</span>
    </div>

    <div class="phone">
      <div class="phone-screen">
        <div class="phone-status"><span>9:41</span><span>●●●● 5G</span></div>
        <div class="phone-body scrollable" style="padding-top:24px;padding-bottom:16px">
          <div class="hand sub" style="font-size:11px;letter-spacing:2px;text-transform:uppercase">Your money report</div>
          <div class="h1" style="font-size:26px;margin:2px 0 14px">Ok, here's the deal.</div>

          <div class="hand" style="font-size:17px;line-height:1.5;color:var(--ink)">
            You earned <b class="marker">₹76,500</b> in October and spent <b>₹43,760</b>. That's a <b style="color:var(--ok)">43% savings rate</b> — genuinely good.
          </div>

          <div class="card alert" style="padding:12px;margin:14px 0">
            <div class="hand" style="font-size:16px;line-height:1.45">
              <b style="color:var(--risk)">But:</b> <b>₹18,400 went to food</b> — delivery, restaurants, coffee. That's <b>2× the healthy range</b>. If food stays this loud, you'll leak <b>~₹98k a year</b>.
            </div>
          </div>

          <div class="hand" style="font-size:16px;line-height:1.5;margin-bottom:14px">
            A few smaller things worth knowing:
          </div>

          <div class="col" style="gap:8px;margin-bottom:14px">
            <div class="row" style="gap:8px;align-items:flex-start"><span style="font-size:18px">•</span><div class="hand" style="font-size:15px;line-height:1.4"><b>68%</b> of food orders came in after 10 PM. That's a pattern, not just a month.</div></div>
            <div class="row" style="gap:8px;align-items:flex-start"><span style="font-size:18px">•</span><div class="hand" style="font-size:15px;line-height:1.4">You paid <b style="color:var(--risk)">₹650 in late fees</b>. An auto-debit would fix this.</div></div>
            <div class="row" style="gap:8px;align-items:flex-start"><span style="font-size:18px">•</span><div class="hand" style="font-size:15px;line-height:1.4">Your "Cult.fit" subscription hasn't been used in <b>83 days</b>.</div></div>
          </div>

          <div class="h3" style="margin:14px 0 6px">Score</div>
          <div class="card hero-ink" style="padding:14px;display:flex;gap:14px;align-items:center">
            <div><div class="big-num" style="color:#fff;font-size:46px">62</div><div class="sub" style="color:#C8C4F0;font-size:10px">/ 100</div></div>
            <div class="hand" style="font-size:14px;color:#E8E8FF;line-height:1.35">Not bad. <b style="color:#fff">Fix food.</b> Watch subs. Build a cushion — you're at 1.4 months, aim for 3.</div>
          </div>

          <div class="h3" style="margin:14px 0 6px">Try this</div>
          <div class="col" style="gap:6px">
            <div class="card" style="padding:10px 12px;display:flex;gap:8px;align-items:center"><span>🔪</span><div class="hand" style="font-size:13px;flex:1">Cut food by 30% → save <b>₹5,520</b></div><span class="sub">apply</span></div>
            <div class="card" style="padding:10px 12px;display:flex;gap:8px;align-items:center"><span>✂️</span><div class="hand" style="font-size:13px;flex:1">Cancel Cult.fit → save <b>₹899</b></div><span class="sub">apply</span></div>
            <div class="card" style="padding:10px 12px;display:flex;gap:8px;align-items:center"><span>🔔</span><div class="hand" style="font-size:13px;flex:1">Auto-pay rent → save <b>₹650</b> in fees</div><span class="sub">apply</span></div>
          </div>

          <a class="btn wide" style="margin-top:14px">See the full numbers</a>
        </div>
      </div>
    </div>

    <div class="notes" style="max-width:340px">
      Feels like a friend explaining it. No charts unless needed. "Try this" turns insights into buttons.
    </div>
  </div>

</div>

<div class="notes">
  <b>Recommendation:</b> Ship <b>A (long scroll)</b> as default but use <b>B (swipe-story)</b> as the <i>shareable</i> view and <b>C (narrative)</b> as a "summary mode" toggle at the top. Users who want density stay on A; users who don't care about charts get C. B exists to be screenshotted.
  <ul>
    <li>Health score = first impression. Anchor on a single number + status pill.</li>
    <li>Biggest leak stays LOUD (red) — no softening.</li>
    <li>What-if sliders must update the "you save" readout live, or it's dead weight.</li>
    <li>Persona card is shareable — it's the viral loop.</li>
  </ul>
</div>
`;

const insightsDesktop = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">05</span>Insights Dashboard — Desktop ★</h2>
  <div class="screen-goal">Two-column layout. Left = diagnosis at a glance. Right = deep modules the user can scroll.</div>
</div>

<div class="variations cols-1">

  <div class="variation">
    <div class="desktop" style="max-width:1200px">
      <div class="desktop-bar">
        <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        <div class="url">fixmyfinance.app/report</div>
      </div>
      <div class="desktop-body" style="padding:0;background:var(--paper-2)">
        <!-- header -->
        <div class="row between" style="padding:18px 28px;border-bottom:1.5px solid var(--ink);background:var(--paper)">
          <div class="row" style="gap:20px;align-items:baseline">
            <span class="hand" style="font-size:22px;font-weight:700;color:var(--blue)">FixMyFinance</span>
            <span class="hand sub">Oct 2025 · HDFC · 147 txns · processed locally</span>
          </div>
          <div class="row" style="gap:8px">
            <a class="btn ghost sm">🖨 Print</a>
            <a class="btn ghost sm">📤 Share persona</a>
            <a class="btn sm">Analyze another month</a>
          </div>
        </div>

        <!-- hero strip -->
        <div style="padding:24px 28px;background:var(--ink);color:#fff;display:grid;grid-template-columns:1.2fr 1fr 1fr 1fr;gap:20px;align-items:center">
          <div>
            <div class="h3" style="color:var(--blue-soft);font-size:10px">Health Score</div>
            <div class="row" style="align-items:baseline;gap:8px;margin-top:4px"><span class="big-num" style="font-size:72px;color:#fff">62</span><span style="color:#C8C4F0">/100</span><span class="pill warn" style="margin-left:8px">Needs work</span></div>
            <div class="hand" style="font-size:15px;color:#E8E8FF;margin-top:4px;max-width:380px">Food is eating 42% of your income — about 2× the healthy range.</div>
          </div>
          <div>
            <div class="h3" style="color:var(--blue-soft);font-size:10px">Income</div>
            <div class="big-num" style="font-size:32px;color:#fff">₹76.5k</div>
            <div class="sub" style="font-size:11px;color:#C8C4F0">salary · ₹75k</div>
          </div>
          <div>
            <div class="h3" style="color:var(--blue-soft);font-size:10px">Expenses</div>
            <div class="big-num" style="font-size:32px;color:#ff6c82">₹43.8k</div>
            <div class="sub" style="font-size:11px;color:#C8C4F0">57% of income</div>
          </div>
          <div>
            <div class="h3" style="color:var(--blue-soft);font-size:10px">Saved</div>
            <div class="big-num" style="font-size:32px;color:#7ed956">₹32.7k</div>
            <div class="sub" style="font-size:11px;color:#C8C4F0">43% rate ↑</div>
          </div>
        </div>

        <!-- BIGGEST LEAK - FULL WIDTH LOUD CARD -->
        <div style="padding:20px 28px;background:#fff3f4;border-top:2px solid var(--risk);border-bottom:2px solid var(--risk);display:grid;grid-template-columns:1.6fr 1fr 1fr;gap:24px;align-items:center">
          <div>
            <div class="h3" style="color:var(--risk);font-size:11px">⚠ Biggest Money Leak</div>
            <div class="h1" style="font-size:40px;color:var(--risk);margin-top:4px;line-height:1.05">Food is eating ₹18,400/month.</div>
          </div>
          <div>
            <div class="sub" style="font-size:10px">YOUR SHARE</div>
            <div class="mono" style="font-weight:800;font-size:32px;color:var(--risk)">42%</div>
            <div class="sub" style="font-size:11px">vs 20% recommended</div>
          </div>
          <div style="text-align:right">
            <div class="sub" style="font-size:10px">POTENTIAL SAVE</div>
            <div class="mono" style="font-weight:800;font-size:32px;color:var(--blue)">₹8,200/mo</div>
            <div class="sub" style="font-size:11px">₹98k per year</div>
          </div>
        </div>

        <!-- 3-COL BODY -->
        <div style="padding:24px 28px;display:grid;grid-template-columns:1.1fr 1fr 1fr;gap:18px">

          <!-- COL 1: chart + insights -->
          <div class="col" style="gap:14px">
            <div class="card" style="padding:16px">
              <div class="h3" style="margin-bottom:10px">Where it went</div>
              <div class="row" style="gap:16px;align-items:center">
                <div class="donut" style="width:150px;height:150px"><div class="center">₹43.8k<small>spent</small></div></div>
                <div class="legend" style="flex:1">
                  <div class="li"><span class="d" style="background:#E8A54B"></span>Food <b style="margin-left:auto">42%</b></div>
                  <div class="li"><span class="d" style="background:#8A5CF6"></span>Shopping <b style="margin-left:auto">18%</b></div>
                  <div class="li"><span class="d" style="background:#D1324B"></span>Bills <b style="margin-left:auto">15%</b></div>
                  <div class="li"><span class="d" style="background:#3BA8C6"></span>Transport <b style="margin-left:auto">9%</b></div>
                  <div class="li"><span class="d" style="background:#E457A5"></span>Entertainment <b style="margin-left:auto">6%</b></div>
                  <div class="li"><span class="d" style="background:#2B9348"></span>Other <b style="margin-left:auto">10%</b></div>
                </div>
              </div>
            </div>

            <div class="card" style="padding:16px">
              <div class="h3" style="margin-bottom:10px">Things we noticed</div>
              <div class="col" style="gap:8px">
                <div class="row" style="gap:10px"><span style="font-size:20px">🍜</span><div class="hand" style="font-size:15px">You ordered food <b>18 times</b> this month.</div></div>
                <div class="row" style="gap:10px"><span style="font-size:20px">🌙</span><div class="hand" style="font-size:15px"><b>68%</b> of orders came after 10 PM.</div></div>
                <div class="row" style="gap:10px"><span style="font-size:20px">📈</span><div class="hand" style="font-size:15px">Biggest day: <b>Sat Oct 4 — ₹4,200.</b></div></div>
                <div class="row" style="gap:10px"><span style="font-size:20px">⚠️</span><div class="hand" style="font-size:15px">You paid <b style="color:var(--risk)">₹650 in late fees.</b></div></div>
                <div class="row" style="gap:10px"><span style="font-size:20px">🏋️</span><div class="hand" style="font-size:15px">Cult.fit unused for <b>83 days.</b></div></div>
              </div>
            </div>
          </div>

          <!-- COL 2: simulator + subs -->
          <div class="col" style="gap:14px">
            <div class="card" style="padding:16px;background:var(--blue);color:#fff;border-color:var(--ink)">
              <div class="h3" style="color:var(--blue-soft)">What if…</div>
              <div class="hand" style="font-size:12px;color:#E8E8FF;margin:2px 0 12px">Drag any slider. Watch savings change.</div>
              <div class="slider-row"><span class="lbl" style="color:#fff">🍜 Food</span><div class="slider-track" style="background:rgba(255,255,255,0.2);border-color:#fff"><div class="fill" style="width:30%;background:#fff"></div><div class="thumb" style="left:30%;background:#fff;border-color:var(--ink)"></div></div><span class="val" style="color:#fff">-30%</span></div>
              <div class="slider-row"><span class="lbl" style="color:#fff">🛍 Shop</span><div class="slider-track" style="background:rgba(255,255,255,0.2);border-color:#fff"><div class="fill" style="width:50%;background:#fff"></div><div class="thumb" style="left:50%;background:#fff;border-color:var(--ink)"></div></div><span class="val" style="color:#fff">-50%</span></div>
              <div class="slider-row"><span class="lbl" style="color:#fff">🎬 Subs</span><div class="slider-track" style="background:rgba(255,255,255,0.2);border-color:#fff"><div class="fill" style="width:100%;background:#fff"></div><div class="thumb" style="left:100%;background:#fff;border-color:var(--ink)"></div></div><span class="val" style="color:#fff">-100%</span></div>
              <div class="row between" style="margin-top:12px;padding-top:12px;border-top:1px dashed rgba(255,255,255,0.3)">
                <div><div class="sub" style="font-size:10px;color:#E8E8FF">Per month</div><div class="mono" style="font-weight:800;font-size:22px;color:#fff">₹12,270</div></div>
                <div style="text-align:right"><div class="sub" style="font-size:10px;color:#E8E8FF">Per year</div><div class="mono" style="font-weight:800;font-size:22px;color:#fff">₹1.47 L</div></div>
              </div>
            </div>

            <div class="card" style="padding:16px">
              <div class="row between"><span class="h3">🔁 Subscriptions</span><span class="sub" style="font-size:11px">7 found</span></div>
              <div class="col" style="gap:6px;margin-top:10px">
                <div class="row between" style="font-size:13px"><span>Netflix</span><span class="mono">₹649</span></div>
                <div class="row between" style="font-size:13px"><span>Spotify Family</span><span class="mono">₹179</span></div>
                <div class="row between" style="font-size:13px"><span>Amazon Prime</span><span class="mono">₹179</span></div>
                <div class="row between" style="font-size:13px"><span>Disney+ Hotstar</span><span class="mono">₹299</span></div>
                <div class="row between" style="font-size:13px;color:var(--muted)"><span>Cult.fit <span class="pill risk" style="font-size:8px">unused 83d</span></span><span class="mono strike">₹899</span></div>
                <div class="row between" style="font-size:13px"><span>iCloud 200GB</span><span class="mono">₹219</span></div>
                <div class="row between" style="font-size:13px"><span>Times Prime</span><span class="mono">₹416</span></div>
              </div>
              <div style="border-top:1px dashed var(--line-soft);margin-top:10px;padding-top:8px" class="row between"><span class="hand" style="font-size:14px;font-weight:700">Total / month</span><span class="mono" style="font-weight:800">₹2,840</span></div>
            </div>
          </div>

          <!-- COL 3: emergency + persona -->
          <div class="col" style="gap:14px">
            <div class="card" style="padding:16px">
              <div class="h3">🛟 Emergency cushion</div>
              <div class="row" style="align-items:baseline;gap:6px;margin:6px 0 4px"><span class="big-num" style="font-size:42px">1.4</span><span class="sub">months</span></div>
              <div class="hand sub" style="font-size:13px;margin-bottom:10px">You'd last ~6 weeks with zero income. Target: 3–6 months.</div>
              <div class="gauge warn"><div class="fill" style="width:23%"></div></div>
              <div class="row between" style="margin-top:4px"><span class="sub mono" style="font-size:9px">0</span><span class="sub mono" style="font-size:9px">thin</span><span class="sub mono" style="font-size:9px">safe</span><span class="sub mono" style="font-size:9px">6mo</span></div>
              <div class="card" style="padding:8px 10px;margin-top:10px;background:var(--paper-2);border-style:dashed"><div class="hand sub" style="font-size:12px">Add <b style="color:var(--blue)">₹6,000/mo</b> to reach 3 months in one year.</div></div>
            </div>

            <div class="card" style="padding:16px;background:var(--blue);color:#fff;border-color:var(--ink)">
              <div class="h3" style="color:var(--blue-soft)">Your persona</div>
              <div class="persona-art" style="margin:10px 0;aspect-ratio:2/1"></div>
              <div class="hand" style="font-size:22px;font-weight:700;color:#fff" data-persona-title>You love good food</div>
              <div class="hand" style="font-size:14px;margin-top:4px;color:#E8E8FF;line-height:1.4" data-persona-sub>4 in 10 rupees went to eating out and delivery.</div>
              <div class="row" style="gap:8px;margin-top:14px">
                <a class="btn sm ghost" style="background:#fff;color:var(--ink)">📤 Share card</a>
                <a class="btn sm" style="background:var(--ink);color:#fff;border-color:#fff">See others</a>
              </div>
            </div>
          </div>
        </div>

        <div class="sub" style="font-size:11px;text-align:center;padding:20px">Your statement was processed in your browser. We kept no copy. Close this tab to erase.</div>
      </div>
    </div>

    <div class="notes">
      Desktop gets a dark <b>hero strip</b> (score + 3 numbers), a full-width alarming <b>leak banner</b>, then a 3-column body: <i>what + why</i> · <i>what if + subs</i> · <i>cushion + persona</i>. Keeps the emotional beats in the same order as mobile A.
    </div>
  </div>

</div>
`;


// ===== system.js =====

// ============= SYSTEM NOTES =============

const systemNotes = `
<div class="screen-header">
  <h2 class="screen-title"><span class="num">00</span>System Notes</h2>
  <div class="screen-goal">Palette, type, and the visual vocabulary shared by every screen. <b>Not a brand kit</b> — just what this set of wireframes assumes.</div>
</div>

<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px">
  <div class="card" style="padding:18px">
    <div class="h3">Palette (from your Colorhunt link)</div>
    <div class="col" style="gap:8px;margin-top:12px">
      <div class="row" style="gap:10px;align-items:center"><div style="width:56px;height:36px;background:#2F2FE4;border:1.5px solid var(--ink);border-radius:6px"></div><div><div class="mono" style="font-size:13px;font-weight:700">#2F2FE4</div><div class="sub" style="font-size:11px">Electric blue — primary CTA, accents, links, simulator</div></div></div>
      <div class="row" style="gap:10px;align-items:center"><div style="width:56px;height:36px;background:#162E93;border:1.5px solid var(--ink);border-radius:6px"></div><div><div class="mono" style="font-size:13px;font-weight:700">#162E93</div><div class="sub" style="font-size:11px">Indigo — supporting text, secondary headings</div></div></div>
      <div class="row" style="gap:10px;align-items:center"><div style="width:56px;height:36px;background:#1A1953;border:1.5px solid var(--ink);border-radius:6px"></div><div><div class="mono" style="font-size:13px;font-weight:700">#1A1953</div><div class="sub" style="font-size:11px">Navy — muted headers</div></div></div>
      <div class="row" style="gap:10px;align-items:center"><div style="width:56px;height:36px;background:#080616;border:1.5px solid var(--ink);border-radius:6px"></div><div><div class="mono" style="font-size:13px;font-weight:700">#080616</div><div class="sub" style="font-size:11px">Near-black — primary ink, hero cards, dark mode base</div></div></div>
    </div>
    <div class="h3" style="margin-top:18px">Diagnostic status</div>
    <div class="row" style="gap:6px;margin-top:8px">
      <span class="pill ok">Healthy</span>
      <span class="pill warn">Needs work</span>
      <span class="pill risk">Critical</span>
    </div>
    <div class="hand sub" style="font-size:12px;margin-top:8px">Green / amber / red reserved for diagnosis ONLY. Never decorative.</div>
  </div>

  <div class="card" style="padding:18px">
    <div class="h3">Type</div>
    <div class="col" style="gap:10px;margin-top:10px">
      <div>
        <div class="sub mono" style="font-size:10px">HANDWRITTEN · Kalam</div>
        <div class="hand" style="font-size:32px;font-weight:700">Where did your salary go?</div>
        <div class="sub" style="font-size:11px">Used for headlines, questions, wireframe callouts — the "smart friend" voice.</div>
      </div>
      <div>
        <div class="sub mono" style="font-size:10px">UI · Inter</div>
        <div style="font-family:var(--ui);font-size:24px;font-weight:800">₹18,400 <span style="font-weight:500;font-size:14px;color:var(--muted)">Big numbers stay sharp</span></div>
        <div class="sub" style="font-size:11px">Body, numbers, form controls. Weight 400/600/800.</div>
      </div>
      <div>
        <div class="sub mono" style="font-size:10px">MONO · JetBrains Mono</div>
        <div class="mono" style="font-size:13px">06 OCT · UPI · -₹420</div>
        <div class="sub" style="font-size:11px">Dates, transaction metadata, tiny labels.</div>
      </div>
    </div>
  </div>
</div>

<div class="card" style="padding:18px;margin-bottom:24px">
  <div class="h3">Component vocabulary</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:14px">
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">BUTTONS</div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><a class="btn sm">Primary</a><a class="btn ghost sm">Ghost</a></div>
    </div>
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">CHIPS</div>
      <div class="row" style="gap:4px;flex-wrap:wrap"><span class="chip food"><span class="d"></span>Food</span><span class="chip shop"><span class="d"></span>Shop</span><span class="chip trans"><span class="d"></span>Transport</span></div>
    </div>
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">GAUGES</div>
      <div class="gauge risk" style="margin-top:4px"><div class="fill" style="width:22%"></div></div>
      <div class="gauge warn" style="margin-top:4px"><div class="fill" style="width:50%"></div></div>
      <div class="gauge ok" style="margin-top:4px"><div class="fill" style="width:82%"></div></div>
    </div>
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">CARDS</div>
      <div class="card" style="padding:8px 10px;margin-top:4px"><div class="hand" style="font-size:12px">default</div></div>
      <div class="card alert" style="padding:8px 10px;margin-top:4px"><div class="hand" style="font-size:12px;color:var(--risk)">alert</div></div>
      <div class="card hero-ink" style="padding:8px 10px;margin-top:4px"><div class="hand" style="font-size:12px;color:var(--paper)">hero-ink</div></div>
    </div>
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">HIGHLIGHTS</div>
      <div class="hand" style="font-size:14px;margin-top:4px">Ink-blue <span class="marker">marker</span></div>
      <div class="hand" style="font-size:14px">Yellow <span class="marker-yellow">marker</span></div>
      <div class="hand" style="font-size:14px">Struck-through: <span class="strike">₹899</span></div>
    </div>
    <div>
      <div class="sub mono" style="font-size:10px;margin-bottom:4px">SLIDERS</div>
      <div class="slider-row"><span class="lbl">Food</span><div class="slider-track"><div class="fill" style="width:40%"></div><div class="thumb" style="left:40%"></div></div><span class="val">-40%</span></div>
    </div>
  </div>
</div>

<div class="notes">
  <b>Voice rules.</b>
  <ul>
    <li>Headlines = questions or plain statements. Never exhortations ("Start saving today!").</li>
    <li>Numbers ALWAYS in Inter, never handwritten. Numbers need to look <i>real</i>.</li>
    <li>Handwritten type = the friend. Use it for "here's the deal" moments, never for critical actions or legal.</li>
    <li>Don't say "financial wellness". Say "your money". Don't say "expenditure". Say "what you spent".</li>
    <li>When in doubt, lead with the ₹ number, follow with one sentence.</li>
  </ul>
  <b>What's still missing / to decide.</b>
  <ul>
    <li>Onboarding for returning users (we assume no-login — what does "second visit" look like?)</li>
    <li>Multi-month trends (out of scope for v1, but the health-score card will need a sparkline eventually)</li>
    <li>Couple / household mode — upload two statements, compare</li>
    <li>Shareable persona card — needs real artwork, not the placeholder</li>
  </ul>
</div>
`;


const IMAGE_ROOT     = "assets/letters";
const ORIGINALS_ROOT = "assets/originals";  
const MANIFEST_URL   = "assets/manifest.json";
const META_URL       = "assets/meta.json";
const GRID_COLS      = 8; 

const grid      = document.getElementById("grid");
const infoCard  = document.getElementById("infoCard");
const infoImg   = document.getElementById("infoImage");
const infoTime  = document.getElementById("infoTime");
const infoLoc   = document.getElementById("infoLoc");
const infoClose = document.querySelector(".info-close");


function setFixedColumns(cols){
  document.documentElement.style.setProperty("--cols", String(cols));
}

async function loadJSON(url){
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
  return res.json();
}


function normalizeManifest(json){
  const out = {};
  for (const [k, arr] of Object.entries(json || {})){
    const L = String(k || "").trim().toUpperCase();
    if (!/^[A-Z]$/.test(L) || !Array.isArray(arr)) continue;
    out[L] = arr.filter(v => typeof v === "string");
  }
  return out;
}


function buildAlphabeticalList(manifest){
  const out = [];
  for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ"){
    const files = manifest[letter] || [];
    for (const file of files){
      out.push({ letter, file, src: `${IMAGE_ROOT}/${letter}/${file}` });
    }
  }
  out.sort((a, b) => {
    const L = a.letter.localeCompare(b.letter);
    return L !== 0 ? L : a.file.localeCompare(b.file);
  });
  return out;
}


function renderGrid(items){
  grid.textContent = "";
  if (!items.length){
    const p = document.createElement("p");
    p.textContent = "No images found. Check assets/manifest.json and assets/letters/.";
    grid.appendChild(p);
    return;
  }
  for (const { letter, file, src } of items){
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.loading = "lazy";
    img.decoding = "async";
    img.alt = `${letter} — ${file}`;
    img.src = src;

    img.addEventListener("error", () => {
      console.warn("[Index] Grid image 404:", img.src);
    });

    img.addEventListener("click", () => openInfo(letter, file));

    card.appendChild(img);
    grid.appendChild(card);
  }
}

let metaCache = {};


function openInfo(letter, file){
  const key = `${letter}/${file}`;
  const fallbackRel = `${IMAGE_ROOT}/${key}`;


  const likelyBases = Array.from(new Set([
    ORIGINALS_ROOT,
    "assets/originals",
    "../assets/originals",
    "/assets/originals"
  ]));

  const ext  = file.split('.').pop();
  const stem = file.slice(0, -(ext.length + 1)); 

  const letterVariants = [letter.toUpperCase(), letter.toLowerCase()];
  const extVariants = Array.from(new Set([
    ext, ext.toLowerCase(), ext.toUpperCase(),
    ...(ext.toLowerCase() !== 'png'  ? ['png','PNG']   : []),
    ...(ext.toLowerCase() !== 'jpg'  ? ['jpg','JPG']   : []),
    ...(ext.toLowerCase() !== 'jpeg' ? ['jpeg','JPEG'] : []),
    ...(ext.toLowerCase() !== 'webp' ? ['webp','WEBP'] : []),
  ]));


  const candidates = [];
  for (const base of likelyBases){
    for (const L of letterVariants){
      for (const E of extVariants){
        const rel = `${base}/${L}/${encodeURIComponent(stem)}.${E}`;
        const abs = new URL(rel, document.baseURI).href;
        candidates.push(abs);
      }
    }
  }

  tryOriginal(candidates, (url) => {
    infoImg.onerror = null;
    infoImg.onload = () => classifyCardByAspect(infoImg);
    infoImg.src = url;
    infoImg.alt = `${letter} — ${file}`;

    const meta = metaCache[key] || {};
    infoTime.textContent = meta.time || "—";
    infoLoc.textContent  = meta.location || "—";

    infoCard.removeAttribute("hidden");
  }, () => {

    const fbAbs = new URL(fallbackRel, document.baseURI).href;
    infoImg.onload = () => classifyCardByAspect(infoImg);
    infoImg.src = fbAbs;
    infoImg.alt = `${letter} — ${file}`;

    const meta = metaCache[key] || {};
    infoTime.textContent = meta.time || "—";
    infoLoc.textContent  = meta.location || "—";

    infoCard.removeAttribute("hidden");
  });
}


function tryOriginal(urls, onSuccess, onFail){
  let i = 0;
  const tester = new Image();
  tester.decoding = "async";

  const next = () => {
    if (i >= urls.length) { onFail(); return; }
    const url = urls[i++];
    tester.onload = () => onSuccess(url);
    tester.onerror = () => {
      console.warn("[InfoCard] Original 404:", url);
      next();
    };
    tester.src = url;
  };
  next();
}

function classifyCardByAspect(imgEl){
  const w = imgEl.naturalWidth || 1;
  const h = imgEl.naturalHeight || 1;
  infoCard.classList.remove("portrait", "landscape");
  const ratio = w / h;
  if (ratio < 0.9)       infoCard.classList.add("portrait");
  else if (ratio > 1.1)  infoCard.classList.add("landscape");
}


(function enableCardDrag(){
  if (!infoCard) return;

  let dragging = false;
  let startX = 0, startY = 0;
  let startLeft = 0, startTop = 0;

  function setFixedLeftTop(left, top){
    infoCard.style.right = "auto";
    infoCard.style.left  = `${left}px`;
    infoCard.style.top   = `${top}px`;
  }

  function onDown(clientX, clientY){
    dragging = true;
    infoCard.classList.add("is-dragging");

    const rect = infoCard.getBoundingClientRect();
    startX = clientX;
    startY = clientY;
    startLeft = rect.left;
    startTop  = rect.top;

    setFixedLeftTop(startLeft, startTop);
    document.body.style.userSelect = "none";
  }

  function onMove(clientX, clientY){
    if (!dragging) return;
    const dx = clientX - startX;
    const dy = clientY - startY;

    const nextLeft = startLeft + dx;
    const nextTop  = startTop  + dy;

    const margin = 8;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const rect = infoCard.getBoundingClientRect();
    const maxLeft = vw - rect.width - margin;
    const maxTop  = vh - rect.height - margin;

    const clampedLeft = Math.max(margin, Math.min(nextLeft, maxLeft));
    const clampedTop  = Math.max(margin, Math.min(nextTop,  maxTop));

    setFixedLeftTop(clampedLeft, clampedTop);
  }

  function onUp(){
    if (!dragging) return;
    dragging = false;
    infoCard.classList.remove("is-dragging");
    document.body.style.userSelect = "";
  }


  infoCard.addEventListener("mousedown", (e) => {
    if (e.target.closest(".info-close")) return;
    onDown(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
  window.addEventListener("mouseup", onUp);


  infoCard.addEventListener("touchstart", (e) => {
    if (e.target.closest(".info-close")) return;
    const t = e.touches[0];
    onDown(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    const t = e.touches[0];
    onMove(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener("touchend", onUp);
})();


if (infoClose){
  infoClose.addEventListener("click", () => {
    infoCard.setAttribute("hidden", "");
    infoImg.src = "";
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !infoCard.hasAttribute("hidden")) {
    infoCard.setAttribute("hidden", "");
    infoImg.src = "";
  }
});


(async () => {
  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }
  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch {}
  }

  setFixedColumns(GRID_COLS);

  const [rawManifest, meta] = await Promise.all([
    loadJSON(MANIFEST_URL).catch(() => ({})),
    loadJSON(META_URL).catch(() => ({}))
  ]);

  const manifest = normalizeManifest(rawManifest);
  const items = buildAlphabeticalList(manifest);
  metaCache = meta || {};

  renderGrid(items);
})();

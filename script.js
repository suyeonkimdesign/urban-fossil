
let REPLACE_RATIO = 0.20;          
const IMAGE_ROOT   = "assets/letters";   
const MANIFEST_URL = "assets/manifest.json";

const textHost = document.getElementById("textHost");

const DEFAULT_TEXT =
  textHost?.dataset.text?.trim() ||
  textHost?.textContent?.trim() ||
  "Urban Fossil is a typeface excavated from the sidewalks of New York. Each letter form comes from a flattened object found on the street.";

let CURRENT_TEXT = DEFAULT_TEXT;


const isLetter = (ch) => /^[A-Za-z]$/.test(ch);


function renderPlainText() {
  if (!textHost) return;
  textHost.textContent = "";
  const tokens = CURRENT_TEXT.split(/(\s+)/);

  for (const token of tokens) {
    if (/^\s+$/.test(token)) {
      textHost.append(token); 
    } else {
      const w = document.createElement("span");
      w.className = "word";  
      for (const ch of token) {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        w.appendChild(span);
      }
      textHost.appendChild(w);
    }
  }
}

function getCharNodes() {
  if (!textHost) return [];
  return Array.from(textHost.querySelectorAll(".word > .ch"));
}


function applyOverrides(img, letter, file){

  const OVERRIDES = {

    "A_01.png": { scale: 0.9,  z: 4 },
    "A_02.png": { scale: 0.9,  z: 2 },
    "A_03.png": { scale: 0.7, dy: "-0.15em",  z: 5 },
  
    "B_01.png": {scale: 1.5},
    "B_02.png": {scale: 1.2, ml: "0.01em"},
  
    "C": {scale: 0.8, dy: "-0.01em"},
    "C_01.png": {dy: "-0.2em", mr: "-0.1em"},
    "C_02.png": {dy: "-0.2em"},
    "C_03.png": {dy: "-0.1em", ml: "-0.05em"},
    "C_04.png": {dy: "-0.08em"},
    "C_05.png": {dy: "-0.1em"},
    "C_06.png": {dy: "-0.05em"},
    "C_07.png": {dy: "-0.1em"},
  
    "D_01.png": {scale: 1.2, rot: "-1deg", dy: "-0.1em", z: 5},

    "E": {scale: 0.7, dy: "-0.1em"},
    "E_01.png": {ml: "-0.1em"},
    "E_03.png": {scale: 1.2, dy: "-0.2em", mr: "-0.05em"},


    "F_01.png": {mr: "-0.05em", z: 5},

    "I_02.png": {scale: 0.9},

    "J": { dy: "-0.5em", ml: "-0.2em"},
    "J_01.png": {scale: 1.2, ml: "-0.45em", dy: "-0.7em"},

    "L_01.png": {scale: 1.2, dy: "-0.15em", ml: "-0.2em"},
    "L_04.png": {scale: 1.2, ml: "-0.05em"},

    "N_01.png": {scale: 1.5, rot: "5deg", z: 3},

    "P": { dy: "-0.5em"},
    "P_02.png": {scale: 1.3, dy: "-0.8em", mr: "-0.05em"},
    "P_03.png": {ml: "-0.05em", rot: "10deg", z: 3},

    "R_01.png": { scale: 1.20, dy: "-0.18em", rot: "10deg",  z: 2, mr: "-0.05em", ml: "-0.05em" },
    "R_02.png": { rot: "-10deg", ml: "0.05em", mr: "-0.08em"},
    "R_04.png": {ml: "0.1em"},
    "R_05.png": { mr: "-0.3em", z: 4},
    "R_06.png": { mr: "-0.1em", z: 4},
    "R_07.png": { rot: "-3deg", ml: "0.2em" },
    
    "S_01.png": { scale: 1.1, z: 5},
    "S_02.png": { scale: 1.1, z: 5},
    "S_03.png": { scale: 1.35, dy: "-0.6em", rot: "-8deg", z: 3, mr: "-0.17em", ml: "-0.5em" },
   
    "T_01.png": {scale: 1.5, dy: "-0.1em", ml: "-0.8em", mr: "-0.8em", z: 3},
    "T_02.png": {scale: 1.5, dy: "-0.05em", ml: "-0.1em", mr: "-0.6em", rot: "-10deg"},

    "U_01.png": {scale: 1.5, dy: "-0.1em", mr: "-0.1em", ml: "-0.1em"},
    "U_02.png": {scale: 0.7, dy: "-0.2em"},

    "V": {z: 5},
    "V_02.png": {ml: "-0.15em", mr: "-0.3em"},
    "V_04.png": {ml: "-0.2em", mr: "-0.01em", rot: "10deg"},
    "V_05.png": {ml: "-0.2em", mr: "-0.25em"},
    "V_06.png": {ml: "-0.1em", mr: "-0.08em"},

    "W_01.png": {scale: 0.7, dy: "-0.1em", ml: "-0.02em", mr: "-0.05em"},
    "W_02.png": { scale: 0.7, dy: "-0.07em", rot: "8deg", ml: "-0.5em"},
   
    "Y": { dy: "-0.5em"},
    "Y_01.png": { },
    "Y_02.png": { mr: "-0.1em", z:5},
    "Y_03.png": { },
    "Y_04.png": { rot: "-20deg", mr: "-0.3em", ml: "0.05em"},
    "Y_05.png": { dy: "-1em", scale: 1.5, z: 3 },

  };

const byFile   = file   && OVERRIDES[file]   ? OVERRIDES[file]   : {};
  const byLetter = letter && OVERRIDES[letter] ? OVERRIDES[letter] : {};
  const o = { ...byLetter, ...byFile }; 


  if (o.scale != null) img.style.setProperty("--scale", o.scale);
  if (o.dy)            img.style.setProperty("--dy",    o.dy);
  if (o.rot)           img.style.setProperty("--rot",   o.rot);
  if (o.z != null)     img.style.setProperty("--z",     o.z);


  if (o.mx) {
    img.style.marginLeft  = o.mx;
    img.style.marginRight = o.mx;
  }
  if (o.ml) img.style.marginLeft  = o.ml;
  if (o.mr) img.style.marginRight = o.mr;
}


async function loadManifest() {
  try {
    const res = await fetch(MANIFEST_URL);
    if (!res.ok) throw new Error(res.statusText);
    const json = await res.json();
    const norm = {};
    for (const [k, arr] of Object.entries(json)) {
      const K = k.toUpperCase();
      if (/^[A-Z]$/.test(K) && Array.isArray(arr)) norm[K] = arr;
    }
    return norm;
  } catch {
    return {};
  }
}

let manifestCache = null;
let replacementPlan = [];   
let revealOrder = [];       

function generatePlan(imagesByLetter) {

  renderPlainText();

  const charNodes = getCharNodes();
  const eligible = charNodes
    .map((node, i) => ({ node, i }))
    .filter(({ node }) => isLetter(node.textContent));

  const usedPaths = new Set();
  const perLetterCount = {};
  const plan = [];

  for (const { node, i } of eligible) {
    const ch = node.textContent;
    const L  = ch.toUpperCase();

    const options = imagesByLetter[L];
    if (!options || options.length === 0) continue;

    const count = perLetterCount[L] || 0;
    if (count >= 2) continue;               


    const available = options.filter(name => !usedPaths.has(`${IMAGE_ROOT}/${L}/${name}`));
    if (available.length === 0) continue;

    const file = available[Math.floor(Math.random() * available.length)];
    const src  = `${IMAGE_ROOT}/${L}/${file}`;

    plan.push({ index: i, letter: L, src, file });
    usedPaths.add(src);
    perLetterCount[L] = count + 1;
  }


  const order = [...plan.keys()];
  order.sort(() => Math.random() - 0.5);

  replacementPlan = plan;
  revealOrder = order;
}

function renderFromPlan(ratio) {

  renderPlainText();
  const nodes = getCharNodes();

  const clamped = Math.max(0, Math.min(1, Number(ratio)));
  const showCount = Math.floor(replacementPlan.length * clamped);
  const showIdxs = new Set(revealOrder.slice(0, showCount)); 

  for (let idx = 0; idx < replacementPlan.length; idx++) {
    if (!showIdxs.has(idx)) continue;

    const { index, letter, src, file } = replacementPlan[idx];
    const node = nodes[index];
    if (!node) continue;

    const img = document.createElement("img");
    img.src = src;
    img.alt = letter;     
    img.className = "letter-img";
    img.loading = "lazy";        
    img.fetchPriority = "low";     
    img.decoding = "async";

    applyOverrides(img, letter, file);


if (SILHOUETTES_ON) img.classList.add("obscured");


attachRevealHandlers(img);

    node.replaceWith(img);
  }
}




function setRatioFromSlider(value){
  REPLACE_RATIO = Math.max(0, Math.min(100, Number(value))) / 100;
}

function setTextAndRebuild(str){
  const next = (str || "").trim();
  CURRENT_TEXT = next.length ? next : DEFAULT_TEXT;
  generatePlan(manifestCache);
  renderFromPlan(REPLACE_RATIO);
}

// silhouette controls
let SILHOUETTES_ON = true; 
function attachRevealHandlers(img){
  
  img.setAttribute("role", "button");
  img.tabIndex = 0;
  const updatePressed = () => {
    const pressed = !img.classList.contains("obscured");
    img.setAttribute("aria-pressed", String(pressed));
  };
  const toggle = () => {
    img.classList.toggle("obscured");
    updatePressed();
  };
  img.addEventListener("click", toggle);
  img.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggle();
    }
  });
  updatePressed();
}

function setAllSilhouettes(on){
  document.querySelectorAll(".letter-img").forEach(img => {
    img.classList.toggle("obscured", on);
    img.setAttribute("aria-pressed", String(!on));
  });
  SILHOUETTES_ON = on;
  const btn = document.getElementById("silhouetteToggle");
  if (btn){
    btn.textContent = on ? "Reveal all" : "Blackout all";
    btn.setAttribute("aria-pressed", String(!on));
  }
}



(async () => {

  if (document.readyState === "loading") {
    await new Promise(r => document.addEventListener("DOMContentLoaded", r, { once: true }));
  }

  if (document.fonts && document.fonts.ready) {
    try { await document.fonts.ready; } catch {}
  }


  manifestCache = await loadManifest();


  const silhouetteBtn = document.getElementById("silhouetteToggle");
if (silhouetteBtn){

  setAllSilhouettes(true);
  silhouetteBtn.addEventListener("click", () => {
    setAllSilhouettes(!SILHOUETTES_ON);
  });
}


  const slider = document.getElementById("ratioSlider");
  const reload = document.getElementById("reloadBtn");

  const toggle = document.getElementById("customToggle");
  const panel  = document.getElementById("customPanel");
  const form   = document.getElementById("customForm");
  const input  = document.getElementById("customText");
  const reset  = document.getElementById("customReset");


  if (slider) setRatioFromSlider(slider.value);
  generatePlan(manifestCache);
  renderFromPlan(REPLACE_RATIO);


if (slider){
  let pending = false;
  slider.addEventListener("input", () => {
    slider.setAttribute("aria-valuenow", slider.value);
    setRatioFromSlider(slider.value);

    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      renderFromPlan(REPLACE_RATIO);
    });
  });
}



  if (reload){
    reload.addEventListener("click", () => {
      generatePlan(manifestCache);
      renderFromPlan(REPLACE_RATIO);
    });
  }


  if (toggle && panel){
    toggle.addEventListener("click", () => {
      const open = !panel.hasAttribute("hidden");
      if (open) {
        panel.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      } else {
        panel.removeAttribute("hidden");
        toggle.setAttribute("aria-expanded", "true");
        if (input) input.value = (CURRENT_TEXT === DEFAULT_TEXT) ? "" : CURRENT_TEXT;
        setTimeout(() => input && input.focus(), 0);
      }
    });
  }


  if (form && input){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      setTextAndRebuild(input.value);
    });
  }


  if (reset){
    reset.addEventListener("click", () => {
      if (input) input.value = "";
      setTextAndRebuild(""); 
    });
  }
})();


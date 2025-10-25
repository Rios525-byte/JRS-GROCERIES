/* script.js - main interactive logic */
const WHATSAPP = "919790481036"; // no plus
let products = [];
let favorites = JSON.parse(localStorage.getItem('jrs_favs') || '[]');
const grid = document.getElementById('grid');
const favGrid = document.getElementById('favGrid');
const countEl = document.getElementById('count');
const search = document.getElementById('search');
const suggestionsEl = document.getElementById('suggestions');
const categorySel = document.getElementById('category');
const sortSel = document.getElementById('sort');
const productModal = document.getElementById('productModal');
const modalContent = document.getElementById('modalContent');
const modalClose = document.getElementById('modalClose');
const favoritesSection = document.getElementById('favoritesSection');
const navLinks = document.getElementById('navLinks');

function fetchProducts(){
  return fetch('products.json').then(r=>r.json()).then(data=>{ products = data; render(products); buildSuggestions(); });
}

// render products list
function render(list){
  grid.innerHTML = '';
  list.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';
    const imgWrap = document.createElement('div'); imgWrap.className='image';
    const badge = document.createElement('div'); badge.className='badge'; badge.innerText = '₹' + p.price + ' Pack';
    card.appendChild(badge);
    if(p.img){
      const img = document.createElement('img'); img.src = p.img; img.alt = p.name; img.loading = 'lazy';
      imgWrap.appendChild(img);
    } else {
      const ph = document.createElement('div'); ph.className='placeholder'; ph.innerHTML='படம் இல்லை';
      imgWrap.appendChild(ph);
    }
    const body = document.createElement('div'); body.className='card-body';
    const title = document.createElement('div'); title.className='title'; title.innerText = p.name;
    const desc = document.createElement('div'); desc.className='desc'; desc.innerText = "ஒரு அட்டையில் 12 பீசுகள் கொண்டிருக்கும் (There are 12 pieces on one card)";
    const price = document.createElement('div'); price.className='price'; price.innerText = '₹' + p.price;

    const actions = document.createElement('div'); actions.className='actions-row';
    const buy = document.createElement('button'); buy.className='btn btn-primary'; buy.innerText='Buy Now (WhatsApp)';
    buy.onclick = ()=> openWhatsAppOrder(p);
    const view = document.createElement('button'); view.className='btn btn-outline'; view.innerText='View';
    view.onclick = ()=> openModal(p);

    const favBtn = document.createElement('button'); favBtn.className='btn btn-outline'; favBtn.innerText = favorites.includes(p.id)?'♥':'♡';
    favBtn.onclick = ()=> toggleFav(p.id, favBtn);

    actions.appendChild(buy); actions.appendChild(view); actions.appendChild(favBtn);

    body.appendChild(title); body.appendChild(desc); body.appendChild(price); body.appendChild(actions);

    card.appendChild(imgWrap); card.appendChild(body);
    grid.appendChild(card);

    // click image opens modal
    imgWrap.onclick = ()=> openModal(p);
  });
  countEl.innerText = `Showing ${list.length} products`;
}

// build suggestions from product names
function buildSuggestions(){
  const names = products.map(p=>p.name);
  suggestionsEl.innerHTML = '';
  names.slice(0,10).forEach(n=>{
    const div = document.createElement('div'); div.innerText = n;
    div.onclick = ()=> { search.value = n; applyFilters(); suggestionsEl.style.display='none'; };
    suggestionsEl.appendChild(div);
  });
}

// search suggestions
search.addEventListener('input', function(){
  const q = this.value.trim().toLowerCase();
  if(!q){ suggestionsEl.style.display='none'; applyFilters(); return; }
  suggestionsEl.style.display='block';
  suggestionsEl.innerHTML = '';
  const matches = products.filter(p=>p.name.toLowerCase().includes(q)).slice(0,6);
  matches.forEach(m=>{
    const d = document.createElement('div'); d.innerText = m.name;
    d.onclick = ()=> { search.value = m.name; suggestionsEl.style.display='none'; applyFilters(); };
    suggestionsEl.appendChild(d);
  });
});

// filters + sort
function applyFilters(){
  let q = search.value.trim().toLowerCase();
  let cat = categorySel.value;
  let filtered = products.filter(p=>{
    const inCat = (cat==='all') ? true : p.category===cat;
    const inText = p.name.toLowerCase().includes(q) || String(p.price).includes(q);
    return inCat && inText;
  });
  if(sortSel.value === 'price-asc') filtered.sort((a,b)=>a.price-b.price);
  if(sortSel.value === 'price-desc') filtered.sort((a,b)=>b.price-a.price);
  render(filtered);
}

// open modal
function openModal(p){
  productModal.style.display = 'flex'; productModal.setAttribute('aria-hidden','false');
  modalContent.innerHTML = `
    <div style="display:flex;gap:12px;flex-wrap:wrap">
      <div style="flex:1;min-width:240px">
        ${p.img ? `<img src="${p.img}" style="max-width:100%;border-radius:8px"/>` : `<div style="width:100%;height:260px;background:#f3f1ee;border-radius:8px;display:flex;align-items:center;justify-content:center">Image missing</div>`}
      </div>
      <div style="flex:1;min-width:240px">
        <h2>${p.name}</h2>
        <p style="font-weight:800;color:${getComputedStyle(document.documentElement).getPropertyValue('--accent')};font-size:18px">₹${p.price}</p>
        <p>ஒரு அட்டையில் 12 பீசுகள் கொண்டிருக்கும் (There are 12 pieces on one card)</p>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="btn btn-primary" id="modalBuy">Order via WhatsApp</button>
          <button class="btn btn-outline" id="modalFav">${favorites.includes(p.id)?'Remove ♥':'Add ♥'}</button>
        </div>
      </div>
    </div>
  `;
  document.getElementById('modalBuy').onclick = ()=> openWhatsAppOrder(p);
  document.getElementById('modalFav').onclick = ()=> { toggleFav(p.id); openModal(p); };
}
modalClose.onclick = ()=> { productModal.style.display='none'; productModal.setAttribute('aria-hidden','true'); };

// open whatsapp with prefilled message
function openWhatsAppOrder(p){
  const text = `Hello JRS, I want to order:\n- ${p.name}\nQuantity: 1\nPrice: ₹${p.price}\nPlease confirm delivery & payment.\nAddress:`;
  window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`,'_blank');
}

// favorites
function toggleFav(id, btn){
  if(favorites.includes(id)){
    favorites = favorites.filter(x=>x!==id);
  } else {
    favorites.push(id);
  }
  localStorage.setItem('jrs_favs', JSON.stringify(favorites));
  if(btn) btn.innerText = favorites.includes(id)?'♥':'♡';
  renderFavorites();
  applyFilters();
}

// render favorites section
function renderFavorites(){
  favGrid.innerHTML = '';
  const favItems = products.filter(p=>favorites.includes(p.id));
  if(favItems.length===0){ favGrid.innerHTML = '<p>No favorites yet.</p>'; return; }
  favItems.forEach(p=>{
    const card = document.createElement('article'); card.className='card';
    const imgWrap = document.createElement('div'); imgWrap.className='image';
    if(p.img){ const img = document.createElement('img'); img.src=p.img; img.loading='lazy'; imgWrap.appendChild(img); }
    else { const ph=document.createElement('div');ph.className='placeholder';ph.innerText='படம் இல்லை'; imgWrap.appendChild(ph); }
    const body=document.createElement('div'); body.className='card-body';
    body.innerHTML = `<div class="title">${p.name}</div><div class="desc">ஒரு அட்டையில் 12 பீசுகள் கொண்டிருக்கும்</div><div class="price">₹${p.price}</div>`;
    const buy=document.createElement('button'); buy.className='btn btn-primary'; buy.innerText='Buy Now'; buy.onclick=()=>openWhatsAppOrder(p);
    body.appendChild(buy);
    card.appendChild(imgWrap); card.appendChild(body); favGrid.appendChild(card);
  });
}

// nav toggle
document.getElementById('navToggle').onclick = ()=> {
  const links = document.getElementById('navLinks');
  links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
};

// simple nav view switching
document.querySelectorAll('[data-view]').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const v = e.target.getAttribute('data-view');
    if(v==='favorites'){ document.getElementById('productsSection').classList.add('hidden'); favoritesSection.classList.remove('hidden'); renderFavorites(); }
    else { favoritesSection.classList.add('hidden'); document.getElementById('productsSection').classList.remove('hidden'); }
  });
});

// theme toggle (light/dark beige)
const themeToggle = document.getElementById('themeToggle');
themeToggle.onclick = ()=>{
  document.body.classList.toggle('darkmode');
  if(document.body.classList.contains('darkmode')){
    document.documentElement.style.setProperty('--cream','#1f1f1f');
    document.documentElement.style.setProperty('--card','#111');
    document.documentElement.style.setProperty('--muted','#bbb');
  } else {
    document.documentElement.style.setProperty('--cream','#fbf6ef');
    document.documentElement.style.setProperty('--card','#fff');
    document.documentElement.style.setProperty('--muted','#666');
  }
};

// contact scroll
document.getElementById('contactScroll').addEventListener('click', (e)=>{ e.preventDefault(); document.getElementById('contact').scrollIntoView({behavior:'smooth'}); });

// load products.json then init
fetchProducts();

// filters change events
categorySel.addEventListener('change', applyFilters);
sortSel.addEventListener('change', applyFilters);
search.addEventListener('keypress', function(e){ if(e.key==='Enter'){ applyFilters(); suggestionsEl.style.display='none'; } });

// close modal on outside click
window.addEventListener('click', function(e){
  if(productModal.style.display==='flex' && !document.querySelector('.modal-box').contains(e.target)) { productModal.style.display='none'; productModal.setAttribute('aria-hidden','true'); }
});

// render favorites initially
renderFavorites();
                        

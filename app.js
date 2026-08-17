const campaigns = [
  {category:'Education',title:'Keep a child in school',desc:'Help students access books, uniforms and learning materials.',raised:182500,goal:300000,backers:84,image:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=900&q=80'},
  {category:'Healthcare',title:'A clinic for the community',desc:'Bring essential healthcare and maternal support closer to families.',raised:412000,goal:500000,backers:156,image:'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=900&q=80'},
  {category:'Food',title:'Meals for 500 families',desc:'A community-led food drive providing nutritious meals this month.',raised:97500,goal:150000,backers:62,image:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80'},
  {category:'Environment',title:'Restore our local forest',desc:'Plant native trees and protect a vital green space for future generations.',raised:64000,goal:120000,backers:41,image:'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80'},
  {category:'Education',title:'Digital skills for teens',desc:'Equip young people with practical technology and career skills.',raised:210000,goal:250000,backers:97,image:'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80'},
  {category:'Healthcare',title:'Mental wellness outreach',desc:'Fund safe spaces and counselling sessions for young people.',raised:138000,goal:200000,backers:73,image:'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=900&q=80'}
];

const grid=document.getElementById('campaignGrid');
const toast=document.getElementById('toast');
function money(n){return new Intl.NumberFormat('en-KE',{style:'currency',currency:'KES',maximumFractionDigits:0}).format(n)}
function render(filter='all'){
  if(!grid)return;
  const list=filter==='all'?campaigns:campaigns.filter(c=>c.category===filter);
  grid.innerHTML=list.map((c,i)=>{const pct=Math.min(100,Math.round(c.raised/c.goal*100));return `<article class="campaign"><div class="campaign-img" style="background-image:linear-gradient(0deg,rgba(0,0,0,.55),transparent 70%),url('${c.image}')"><span>${c.category}</span></div><div class="campaign-body"><span class="tag">Verified campaign</span><h3>${c.title}</h3><p>${c.desc}</p><div class="progress"><i style="width:${pct}%"></i></div><div class="campaign-meta"><strong>${money(c.raised)} raised</strong><span>${pct}% · ${c.backers} supporters</span></div></div></article>`}).join('');
}
document.querySelectorAll('.filter').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter)}));
const savedTheme=localStorage.getItem('kindred-theme');if(savedTheme==='dark')document.documentElement.dataset.theme='dark';
document.getElementById('themeToggle')?.addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark';if(dark)delete document.documentElement.dataset.theme;else document.documentElement.dataset.theme='dark';localStorage.setItem('kindred-theme',dark?'light':'dark');});
document.querySelectorAll('a[href="#"]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();toast.textContent='This section is coming next.';toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2200)}));
render();

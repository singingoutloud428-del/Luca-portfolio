const fallback = {
  profile: { name:'Luca', eyebrow:'PERFORMER • ACTOR • SINGER • DANCER', tagline:'Storytelling with energy, detail and musicality.', intro:'A developing performer building experience across musical theatre, acting, singing and dance.', location:'Kent / London, UK', availability:'Available for performance, creative and training opportunities', headshotUrl:'', headshotAlt:'Performer headshot' },
  about: { heading:'About me', body:'I am a versatile performer with a particular interest in musical theatre and live performance. My training combines acting, singing and dance, with an emphasis on character, storytelling, musicality and strong ensemble work.' },
  showreel: { heading:'Showreel', url:'', caption:'Add your YouTube, Vimeo or direct MP4 showreel link from the editor.' },
  cv: { heading:'CV', url:'', fileName:'Performer CV', summary:'Training, performance credits, skills and relevant experience.' },
  skills:['Musical Theatre','Acting','Singing','Contemporary Dance','Jazz Dance','Physical Theatre','Ensemble Performance'],
  credits:[{production:'Jailhouse Rock',role:'Ensemble / Performer',company:'Training Performance',year:'2026'},{production:'C’mon Everybody',role:'Ensemble / Performer',company:'Training Performance',year:'2026'},{production:'Liquid Spirit',role:'Jazz Dancer',company:'Training Performance',year:'2026'},{production:'Great Bolts of Thunder',role:'Performer',company:'Training Performance',year:'2026'}],
  training:[{title:'Level 3 Performing Arts',place:'Training / College',detail:'Acting, singing, dance, rehearsal practice and live performance.'}], gallery:[], links:[], contact:{heading:'Let’s work together',text:'For casting, performance opportunities, collaborations or professional enquiries, use the contact form below.',email:'',instagram:'',spotlight:''}, site:{accent:'#9eb9d4',updatedAt:''}
};
const $ = (id) => document.getElementById(id);
const text = (id, value) => { if ($(id)) $(id).textContent = value || ''; };

function safeLink(url) {
  try {
    const parsed = new URL(url, location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch { return ''; }
}
function embedUrl(url) {
  const value = safeLink(url);
  if (!value) return null;
  try {
    const u = new URL(value);
    if (u.hostname.includes('youtube.com')) {
      const id = u.searchParams.get('v') || u.pathname.split('/').filter(Boolean).pop();
      return id ? { type:'iframe', src:`https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1).split('/')[0];
      return id ? { type:'iframe', src:`https://www.youtube-nocookie.com/embed/${id}` } : null;
    }
    if (u.hostname.includes('vimeo.com')) {
      const id = u.pathname.split('/').filter(Boolean).find(part => /^\d+$/.test(part));
      return id ? { type:'iframe', src:`https://player.vimeo.com/video/${id}` } : null;
    }
    if (/\.(mp4|webm)(\?|$)/i.test(value)) return { type:'video', src:value };
  } catch {}
  return { type:'link', src:value };
}
function renderVideo(data) {
  const frame = $('showreelFrame');
  const emb = embedUrl(data.showreel?.url || '');
  if (!emb) return;
  frame.innerHTML = '';
  if (emb.type === 'iframe') {
    const iframe = document.createElement('iframe');
    iframe.src = emb.src; iframe.title = 'Performer showreel'; iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'; iframe.allowFullscreen = true;
    frame.appendChild(iframe);
  } else if (emb.type === 'video') {
    const video = document.createElement('video'); video.src = emb.src; video.controls = true; video.playsInline = true; frame.appendChild(video);
  } else {
    const div = document.createElement('div'); div.className='video-placeholder';
    const a = document.createElement('a'); a.className='button primary'; a.href=emb.src; a.target='_blank'; a.rel='noopener'; a.textContent='Open showreel';
    div.innerHTML='<h3>Showreel</h3><p>This link cannot be embedded, but you can open it directly.</p>'; div.appendChild(a); frame.appendChild(div);
  }
}
function render(data) {
  document.documentElement.style.setProperty('--accent', data.site?.accent || '#9eb9d4');
  text('navName', data.profile?.name); text('heroName', data.profile?.name); text('footerName', `${data.profile?.name || 'Performer'} — Portfolio`);
  text('heroEyebrow', data.profile?.eyebrow); text('heroTagline', data.profile?.tagline); text('heroIntro', data.profile?.intro); text('heroLocation', data.profile?.location); text('heroAvailability', data.profile?.availability);
  text('aboutHeading', data.about?.heading); text('aboutBody', data.about?.body); text('showreelHeading', data.showreel?.heading); text('showreelCaption', data.showreel?.caption);
  text('cvHeading', data.cv?.heading); text('cvSummary', data.cv?.summary); text('contactHeading', data.contact?.heading); text('contactText', data.contact?.text);
  document.title = `${data.profile?.name || 'Performer'} | Performer Portfolio`;

  const headshot = $('headshot'); const placeholder = $('portraitPlaceholder');
  if (data.profile?.headshotUrl) { headshot.src = data.profile.headshotUrl; headshot.alt = data.profile.headshotAlt || 'Performer headshot'; headshot.hidden = false; placeholder.hidden = true; }

  $('skillList').innerHTML = '';
  (data.skills || []).forEach(skill => { const el=document.createElement('span'); el.className='skill'; el.textContent=skill; $('skillList').appendChild(el); });

  $('creditsList').innerHTML = '';
  (data.credits || []).forEach(c => { const row=document.createElement('article'); row.className='credit-row'; [c.production,c.role,c.company,c.year].forEach((v,i)=>{const el=document.createElement(i===0?'strong':'span'); if(i===3) el.className='year'; el.textContent=v||'—'; row.appendChild(el);}); $('creditsList').appendChild(row); });
  if (!(data.credits || []).length) $('creditsList').innerHTML='<p>No credits added yet.</p>';

  $('trainingList').innerHTML = '';
  (data.training || []).forEach(t => { const card=document.createElement('article'); card.className='training-card'; const h=document.createElement('h3'); h.textContent=t.title; const s=document.createElement('strong'); s.textContent=t.place; const p=document.createElement('p'); p.textContent=t.detail; card.append(h,s,p); $('trainingList').appendChild(card); });

  if ((data.gallery || []).length) {
    $('galleryGrid').innerHTML='';
    data.gallery.forEach(g=>{ const item=document.createElement('figure'); item.className='gallery-item'; const img=document.createElement('img'); img.loading='lazy'; img.src=g.url; img.alt=g.alt||g.caption||'Performance photograph'; item.appendChild(img); if(g.caption){const cap=document.createElement('figcaption'); cap.className='gallery-caption'; cap.textContent=g.caption; item.appendChild(cap);} $('galleryGrid').appendChild(item); });
  }

  const cv = safeLink(data.cv?.url || '');
  if (cv) {
    ['cvButton','heroCvButton','navCv'].forEach(id=>{const a=$(id); a.href=cv; a.target='_blank'; a.rel='noopener'; a.classList.remove('disabled'); a.removeAttribute('aria-disabled');});
    $('cvButton').textContent = `Open ${data.cv?.fileName || 'CV'}`;
  }

  $('resourceLinks').innerHTML='';
  (data.links || []).forEach(l=>{const href=safeLink(l.url); if(!href)return; const a=document.createElement('a'); a.href=href; a.target='_blank'; a.rel='noopener'; a.textContent=`${l.label} ↗`; $('resourceLinks').appendChild(a);});

  $('contactLinks').innerHTML='';
  const contactItems = [
    data.contact?.email ? {label:data.contact.email,url:`mailto:${data.contact.email}`} : null,
    data.contact?.instagram ? {label:'Instagram ↗',url:safeLink(data.contact.instagram)} : null,
    data.contact?.spotlight ? {label:'Spotlight ↗',url:safeLink(data.contact.spotlight)} : null
  ].filter(Boolean);
  contactItems.forEach(x=>{const a=document.createElement('a');a.href=x.url;a.textContent=x.label;if(!x.url.startsWith('mailto:')){a.target='_blank';a.rel='noopener';}$('contactLinks').appendChild(a);});
  if (data.site?.updatedAt) text('updatedAt', `Updated ${new Date(data.site.updatedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}`);
  renderVideo(data);
}
async function load() {
  let data=fallback;
  try { const res=await fetch('/api/content',{headers:{accept:'application/json'}}); if(res.ok) data=await res.json(); } catch {}
  render(data);
}
$('menuButton').addEventListener('click',()=>{const n=$('navLinks');const open=n.classList.toggle('open');$('menuButton').setAttribute('aria-expanded',String(open));});
document.querySelectorAll('.nav-links a').forEach(a=>a.addEventListener('click',()=>{$('navLinks').classList.remove('open');$('menuButton').setAttribute('aria-expanded','false');}));
load();

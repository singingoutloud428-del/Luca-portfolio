let state = null;
const $ = id => document.getElementById(id);
const val = id => $(id)?.value ?? '';
const set = (id, value) => { if ($(id)) $(id).value = value ?? ''; };
function notice(el, message, type='error') { el.textContent=message; el.className=`notice ${type} show`; }
function clearNotice(el) { el.className='notice'; el.textContent=''; }
function makeInput(value, placeholder='') { const i=document.createElement('input'); i.value=value||''; i.placeholder=placeholder; return i; }
function removeButton(onClick){const b=document.createElement('button');b.type='button';b.className='icon-button';b.title='Remove';b.textContent='×';b.addEventListener('click',onClick);return b;}

async function api(url, options={}) {
  const res = await fetch(url, { credentials:'same-origin', ...options });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
async function checkAuth() {
  try {
    const data=await api('/api/auth');
    if (data.authenticated) await showEditor(); else $('loginView').hidden=false;
  } catch { $('loginView').hidden=false; }
}
$('loginForm').addEventListener('submit', async e=>{
  e.preventDefault(); clearNotice($('loginNotice'));
  try { await api('/api/auth',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({password:val('password')})}); await showEditor(); }
  catch(err){ notice($('loginNotice'),err.message); }
});
$('logoutButton').addEventListener('click',async()=>{try{await api('/api/auth',{method:'DELETE'});}catch{} location.reload();});

async function showEditor(){
  $('loginView').hidden=true; $('editorView').hidden=false;
  try { state=await api('/api/content'); populate(); } catch(err){ notice($('globalNotice'),err.message); }
}
function populate(){
  set('profileName',state.profile?.name);set('profileEyebrow',state.profile?.eyebrow);set('profileTagline',state.profile?.tagline);set('profileIntro',state.profile?.intro);set('profileLocation',state.profile?.location);set('profileAvailability',state.profile?.availability);set('headshotAlt',state.profile?.headshotAlt);
  set('aboutHeading',state.about?.heading);set('aboutBody',state.about?.body);set('showreelHeading',state.showreel?.heading);set('showreelUrl',state.showreel?.url);set('showreelCaption',state.showreel?.caption);set('cvHeading',state.cv?.heading);set('cvFileName',state.cv?.fileName);set('cvSummary',state.cv?.summary);
  set('contactHeading',state.contact?.heading);set('contactText',state.contact?.text);set('contactEmail',state.contact?.email);set('contactInstagram',state.contact?.instagram);set('contactSpotlight',state.contact?.spotlight);set('siteAccent',state.site?.accent||'#9eb9d4');
  $('headshotStatus').textContent=state.profile?.headshotUrl?'Headshot uploaded.':''; $('cvStatus').textContent=state.cv?.url?'CV uploaded.':'';
  renderSkills();renderCredits();renderTraining();renderGallery();renderLinks();
}
function renderSkills(){const wrap=$('skillsRows');wrap.innerHTML='';(state.skills||[]).forEach((s,i)=>{const row=document.createElement('div');row.className='edit-row skill';const input=makeInput(s,'Skill');input.addEventListener('input',()=>state.skills[i]=input.value);row.append(input,removeButton(()=>{state.skills.splice(i,1);renderSkills();}));wrap.appendChild(row);});}
function renderCredits(){const wrap=$('creditsRows');wrap.innerHTML='';(state.credits||[]).forEach((c,i)=>{const row=document.createElement('div');row.className='edit-row';[['production','Production'],['role','Role'],['company','Company / course'],['year','Year']].forEach(([k,p])=>{const input=makeInput(c[k],p);input.addEventListener('input',()=>state.credits[i][k]=input.value);row.appendChild(input);});row.appendChild(removeButton(()=>{state.credits.splice(i,1);renderCredits();}));wrap.appendChild(row);});}
function renderTraining(){const wrap=$('trainingRows');wrap.innerHTML='';(state.training||[]).forEach((t,i)=>{const row=document.createElement('div');row.className='edit-row training';[['title','Course / workshop'],['place','School / provider'],['detail','Details']].forEach(([k,p])=>{const input=makeInput(t[k],p);input.addEventListener('input',()=>state.training[i][k]=input.value);row.appendChild(input);});row.appendChild(removeButton(()=>{state.training.splice(i,1);renderTraining();}));wrap.appendChild(row);});}
function renderLinks(){const wrap=$('linksRows');wrap.innerHTML='';(state.links||[]).forEach((l,i)=>{const row=document.createElement('div');row.className='edit-row link';[['label','Label'],['url','https://...']].forEach(([k,p])=>{const input=makeInput(l[k],p);input.addEventListener('input',()=>state.links[i][k]=input.value);row.appendChild(input);});row.appendChild(removeButton(()=>{state.links.splice(i,1);renderLinks();}));wrap.appendChild(row);});}
function renderGallery(){const wrap=$('galleryRows');wrap.innerHTML='';(state.gallery||[]).forEach((g,i)=>{const row=document.createElement('div');row.className='edit-row gallery';const img=document.createElement('img');img.className='thumb';img.src=g.url;img.alt='';const alt=makeInput(g.alt,'Alt text');alt.addEventListener('input',()=>state.gallery[i].alt=alt.value);const cap=makeInput(g.caption,'Caption');cap.addEventListener('input',()=>state.gallery[i].caption=cap.value);row.append(img,alt,cap,removeButton(()=>{state.gallery.splice(i,1);renderGallery();}));wrap.appendChild(row);});}

document.querySelectorAll('[data-add]').forEach(btn=>btn.addEventListener('click',()=>{const type=btn.dataset.add;if(type==='skill'){state.skills.push('');renderSkills();}if(type==='credit'){state.credits.push({production:'',role:'',company:'',year:''});renderCredits();}if(type==='training'){state.training.push({title:'',place:'',detail:''});renderTraining();}if(type==='link'){state.links.push({label:'',url:''});renderLinks();}}));

async function upload(fileInputId, statusId){
  const file=$(fileInputId).files[0]; if(!file) throw new Error('Choose a file first.');
  const form=new FormData(); form.append('file',file); $(statusId).textContent='Uploading…';
  const data=await api('/api/upload',{method:'POST',body:form}); $(statusId).textContent=`Uploaded: ${data.fileName}`; return data;
}
$('uploadHeadshot').addEventListener('click',async()=>{try{const d=await upload('headshotFile','headshotStatus');state.profile.headshotUrl=d.url;}catch(e){$('headshotStatus').textContent=e.message;}});
$('uploadCv').addEventListener('click',async()=>{try{const d=await upload('cvFile','cvStatus');state.cv.url=d.url;state.cv.fileName=val('cvFileName')||d.fileName;}catch(e){$('cvStatus').textContent=e.message;}});
$('uploadGallery').addEventListener('click',async()=>{try{const d=await upload('galleryFile','galleryStatus');state.gallery.push({url:d.url,alt:'Performance photograph',caption:''});renderGallery();$('galleryFile').value='';}catch(e){$('galleryStatus').textContent=e.message;}});

function collect(){
  state.profile={...state.profile,name:val('profileName'),eyebrow:val('profileEyebrow'),tagline:val('profileTagline'),intro:val('profileIntro'),location:val('profileLocation'),availability:val('profileAvailability'),headshotAlt:val('headshotAlt')};
  state.about={heading:val('aboutHeading'),body:val('aboutBody')};state.showreel={heading:val('showreelHeading'),url:val('showreelUrl'),caption:val('showreelCaption')};state.cv={...state.cv,heading:val('cvHeading'),fileName:val('cvFileName'),summary:val('cvSummary')};
  state.contact={heading:val('contactHeading'),text:val('contactText'),email:val('contactEmail'),instagram:val('contactInstagram'),spotlight:val('contactSpotlight')};state.site={...state.site,accent:val('siteAccent')};
  return state;
}
$('saveButton').addEventListener('click',async()=>{
  const button=$('saveButton');button.disabled=true;button.textContent='Saving…';clearNotice($('globalNotice'));
  try { const result=await api('/api/content',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(collect())}); state=result.content; notice($('globalNotice'),'Saved. Your public portfolio has been updated.','success'); $('saveHint').textContent=`Last saved ${new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}.`; }
  catch(e){notice($('globalNotice'),e.message);}
  finally{button.disabled=false;button.textContent='Save & publish changes';}
});
checkAuth();

(()=>{'use strict';
const data=window.SITE_DATA||{},sel=q=>document.querySelector(q);
const text=(q,v)=>{const el=sel(q);if(el&&v)el.textContent=v};
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
const localAsset=v=>typeof v==='string'&&/^assets\/[a-z0-9_-]+\.(?:webp|png|jpe?g)$/i.test(v);
const safeUrl=v=>{try{const u=new URL(v,location.href);return ['http:','https:'].includes(u.protocol)?u.href:''}catch{return ''}};
text('#heroOverline',data.heroOverline);text('#tagline',data.tagline);
const bio=sel('#biography');for(const p of data.biography||[])if(p)bio.append(make('p','',p));
const amazon=safeUrl(data.amazonAuthorUrl);
for(const id of ['#headerAmazon','#authorAmazon','#allBooksLink']){const a=sel(id);if(a){if(amazon)a.href=amazon;else a.hidden=true}}
if(data.bannerImage&&(data.bannerImage.startsWith('data:image/')||localAsset(data.bannerImage)||safeUrl(data.bannerImage))){sel('.hero-image').style.backgroundImage=`url(${JSON.stringify(data.bannerImage)})`}
if(data.authorPhoto&&(data.authorPhoto.startsWith('data:image/')||localAsset(data.authorPhoto)||safeUrl(data.authorPhoto))){const pic=make('img','author-photo');pic.alt='Photographie de Dylan Rappeneau';pic.loading='lazy';pic.src=data.authorPhoto;pic.addEventListener('error',()=>pic.remove());sel('#portrait-frame').append(pic)}
const grid=sel('#booksGrid');for(const b of data.books||[]){
 const card=make('article','book-card'),art=make('div','book-art'),object=make('div','book-object');
 if(/^[a-z0-9_-]+$/i.test(b.id||''))card.id='livre-'+b.id;
 const fallback=make('div','book-fallback');fallback.append(make('span','slash'),make('strong','',b.title),make('small','',data.author||'DYLAN RAPPENEAU'));object.append(fallback);
 if(b.cover&&(b.cover.startsWith('data:image/')||localAsset(b.cover)||safeUrl(b.cover))){const img=make('img');img.alt='Couverture originale : '+b.title;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.src=b.cover;const alternates=[b.coverFallback,b.coverFallback2].map(safeUrl).filter(Boolean);let nextImage=0;const fallbackImage=()=>{const next=alternates[nextImage++];if(next&&next!==img.src)img.src=next;else if(next)fallbackImage();else img.remove()};img.addEventListener('error',fallbackImage);img.addEventListener('load',()=>{if(img.naturalWidth<30)fallbackImage()});object.append(img)}
 art.append(object);card.append(art);
 const copy=make('div','book-copy');copy.append(make('p','book-category',b.category||'LIVRE'));
 const title=make('h3','',b.title);if(b.subtitle)title.append(make('span','',b.subtitle));copy.append(title,make('p','book-summary',b.description||''));
 const prices=make('div','book-prices');if(b.pricePaper)prices.append(make('span','',`Broché · ${b.pricePaper}`));if(b.priceKindle)prices.append(make('span','',`Kindle · ${b.priceKindle}`));if(prices.children.length)copy.append(prices);
 const link=safeUrl(b.amazonUrl)||amazon;if(link){const a=make('a','book-link','Voir le livre sur Amazon');a.target='_blank';a.rel='noopener noreferrer';a.href=link;a.append(make('span','','↗'));copy.append(a)}card.append(copy);grid.append(card)
}if(!grid.children.length)grid.append(make('p','', 'De nouvelles publications sont à venir.'));
const news=sel('#newsList');for(const n of data.news||[]){const row=make('article','news-row');row.append(make('div','news-date',n.date||''));const main=make('div');main.append(make('h3','',n.title||''),make('p','',n.text||''));row.append(main);const target=(data.books||[]).find(b=>b.id===n.bookId);if(target&&/^[a-z0-9_-]+$/i.test(target.id||'')){const arrow=make('a','news-arrow','↗');arrow.href='#livre-'+target.id;arrow.title='Voir le livre : '+target.title;arrow.setAttribute('aria-label','Voir le livre : '+target.title);row.append(arrow)}news.append(row)}if(!news.children.length)sel('#actualites').hidden=true;
// Fenêtre de contact : aucun e-mail de réception n'est inscrit dans les fichiers publics.
const overlay=sel('#contactOverlay'),dialog=sel('#contactDialog'),closeBtn=sel('#closeContact'),openBtn=sel('#openContact'),contactForm=sel('#contactForm'),status=sel('#contactStatus'),send=sel('#contactSend');
let previousFocus=null;
function closeContact(){overlay.hidden=true;document.body.classList.remove('contact-open');status.textContent='';if(previousFocus?.isConnected)previousFocus.focus()}
function openContact(){previousFocus=document.activeElement;overlay.hidden=false;document.body.classList.add('contact-open');nav.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false');closeBtn.focus()}
openBtn.addEventListener('click',openContact);closeBtn.addEventListener('click',closeContact);
overlay.addEventListener('click',e=>{if(e.target===overlay)closeContact()});
document.addEventListener('keydown',e=>{if(overlay.hidden)return;if(e.key==='Escape'){e.preventDefault();closeContact();return}if(e.key==='Tab'){const elems=[...dialog.querySelectorAll('button:not([disabled]), input:not([disabled]):not([tabindex="-1"]),select:not([disabled]),textarea:not([disabled]),a[href]')].filter(x=>x.getClientRects().length);if(!elems.length){e.preventDefault();dialog.focus();return}const first=elems[0],last=elems[elems.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
contactForm.addEventListener('submit',async e=>{e.preventDefault();status.classList.remove('is-success');if(!contactForm.reportValidity())return;
 const id=(data.formspreeId||'').trim();if(!/^[a-z0-9]{6,32}$/i.test(id)){status.textContent='Le formulaire est prêt, mais son envoi doit encore être activé par l’auteur.';return}
 if(sel('#contactWebsite').value.trim()){status.textContent='Impossible d’envoyer le message.';return}
 send.disabled=true;send.firstChild.textContent='Envoi en cours… ';status.textContent='';
 try{const response=await fetch('https://formspree.io/f/'+id,{method:'POST',body:new FormData(contactForm),headers:{Accept:'application/json'}});
 if(!response.ok){let message='L’envoi a échoué. Veuillez réessayer plus tard.';try{const answer=await response.json();if(Array.isArray(answer.errors))message=answer.errors.map(x=>x.message).filter(Boolean).join(' ')||message}catch{}throw Error(message)}
 status.textContent='Votre message a bien été envoyé. Merci !';status.classList.add('is-success');contactForm.reset();
 }catch(error){status.textContent=error?.message||'Erreur de connexion. Réessayez plus tard.'}
 finally{send.disabled=false;send.firstChild.textContent='Envoyer mon message '}
});
text('#year',new Date().getFullYear());
const btn=sel('#menuButton'),nav=sel('#mainNav');btn.addEventListener('click',()=>{const open=nav.classList.toggle('open');btn.classList.toggle('open',open);btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',open?'Fermer le menu':'Ouvrir le menu')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false')}));
let ticking=false;const progress=sel('#readingProgress');addEventListener('scroll',()=>{if(ticking)return;ticking=true;requestAnimationFrame(()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=(max>0?scrollY/max*100:0)+'%';ticking=false})},{passive:true});
})();

export const availableOffers = item => item.offers.filter(o=>o.price!==null&&Number.isFinite(o.price)&&o.kind!=='unverified');
export const offerTotal = (item,offer) => Math.ceil(item.quantity / offer.pack) * offer.price;
export function chosenOffer(item) {return availableOffers(item).find(o=>o.id===item.selectedOffer) ?? [...availableOffers(item)].sort((a,b)=>offerTotal(item,a)-offerTotal(item,b))[0];}
export function totals(items) {
 const active=items.filter(i=>i.status!=='skip'), pending=active.filter(i=>i.status==='todo');
 return {count:active.length,done:active.filter(i=>['bought','gift'].includes(i.status)).length,priced:pending.filter(chosenOffer).length,missing:pending.filter(i=>!chosenOffer(i)).length,remaining:pending.reduce((n,i)=>n+(chosenOffer(i)?offerTotal(i,chosenOffer(i)):0),0),paid:active.filter(i=>i.status==='bought').reduce((n,i)=>n+(i.paid??0),0),unrecorded:active.filter(i=>i.status==='bought'&&i.paid===null).length};
}
export const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export const safeURL = url => {try {const u=new URL(url);return ['http:','https:'].includes(u.protocol)?u.href:'#';}catch{return '#';}};
export const escapeHTML = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

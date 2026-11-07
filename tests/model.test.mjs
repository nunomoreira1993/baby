import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {offerTotal,chosenOffer,totals,safeURL,escapeHTML,normalize} from '../public/assets/model.js';
const offer=(id,price,pack=1)=>({id,price,pack,kind:'observed'});
test('packs inteiros determinam a opção mais barata, não apenas preço unitário',()=>{
 const i={quantity:3,offers:[offer('a',10,2),offer('b',7,1)]};
 assert.equal(offerTotal(i,i.offers[0]),20); assert.equal(chosenOffer(i).id,'a');
 i.selectedOffer='b';assert.equal(chosenOffer(i).id,'b');
});
test('ofertas não confirmadas não entram na estimativa',()=>{
 assert.equal(chosenOffer({offers:[{...offer('x',0),kind:'unverified'},offer('y',null)]}),undefined);
});
test('orçamento distingue compras, presentes, dispensados e preços em falta',()=>{
 const base={quantity:1,offers:[offer('a',5)],paid:null};
 const t=totals([{...base,status:'todo'},{...base,status:'bought',paid:4},{...base,status:'gift'},{...base,status:'skip'},{...base,status:'todo',offers:[]},{...base,status:'bought'}]);
 assert.deepEqual(t,{count:5,done:3,priced:1,missing:1,remaining:5,paid:4,unrecorded:1});
});
test('links e texto não executam conteúdo de artigos',()=>{
 assert.equal(safeURL('javascript:alert(1)'),'#');assert.equal(safeURL('https://example.com/x'),'https://example.com/x');
 assert.equal(escapeHTML('<script>"&'), '&lt;script&gt;&quot;&amp;'); assert.equal(normalize('BIBERÕES'),'biberoes');
});
test('lista inicial completa, sem compras herdadas e com fontes',()=>{
 const s=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url)));
 assert.equal(s.items.length,100);assert.equal(s.packing.length,31);assert.equal(s.categories.length,10);
 const ids=new Set(s.categories.map(c=>c.id));
 for(const i of s.items){assert.equal(i.status,'todo');assert.equal(i.paid,null);assert.ok(ids.has(i.category));assert.ok(i.offers.length>0);for(const o of i.offers){assert.notEqual(safeURL(o.url),'#');assert.ok(o.pack>0);assert.equal(o.date,'2026-11-07');}}
 assert.ok(s.packing.every(p=>p.done===false));
});

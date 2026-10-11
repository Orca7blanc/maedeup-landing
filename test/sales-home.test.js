import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildSalesHome,salesHomeResponse} from '../src/sales-home.js';
import {ebookReturnUrl} from '../src/ebook-landing.js';
const original=readFileSync(new URL('../public/index.html',import.meta.url),'utf8');
const page=buildSalesHome(original);
test('home prioritizes introduction, verified reviews and both purchasing formats before optional content and the final test',()=>{
  const positions=['id="top"','id="reader-reviews"','id="read"','id="more"','id="survival-test"'].map(id=>page.indexOf(id));
  assert.ok(positions.every((n,i)=>n>=0&&(i===0||n>positions[i-1])));
  assert.ok(!page.slice(0,positions[4]).includes('href="/test.html"'));
  assert.match(page,/coastal-book.jpg/);
  assert.match(page,/id="edition-ebook"/);assert.match(page,/id="edition-paper"/);
  assert.match(page,/S000220619545/);assert.match(page,/193866498/);assert.match(page,/398378496/);
  assert.match(page,/현재 확인된 2·3권 목록/);
});
test('all ten genuine reviews survive once with the four gifted disclosures and the seven screenshots',()=>{
  const ids=[...page.matchAll(/data-review-id="([^"]+)"/g)].map(x=>x[1]);
  assert.equal(ids.length,10);assert.equal(new Set(ids).size,10);
  const fold=page.indexOf('sales-reviews-more');
  assert.equal([...page.slice(0,fold).matchAll(/data-review-id=/g)].length,3);
  assert.equal([...page.matchAll(/rr-badge rr-gift/g)].length,4);
  assert.equal([...page.matchAll(/class="rr-capture /g)].length,7);
});
test('optional content is closed by default without dropping original illustration rails or survivor functionality',()=>{
  for(const id of ['world-details','character-details','writer-details'])assert.match(page,new RegExp('<details class="sales-fold" id="'+id+'">'));
  for(const id of ['sceneRail','scenePager','characterRail','characterPager','recentList','resultChip','bridgeTitle','bridgeMeta'])assert.equal([...page.matchAll(new RegExp('id="'+id+'"','g'))].length,1);
  assert.equal([...page.matchAll(/class="char scenechar reveal"/g)].length,10);
  assert.equal([...page.matchAll(/class="scene scene-photo/g)].length,4);
  assert.match(page,/setupPager\('sceneRail'/);
  assert.throws(()=>buildSalesHome(original.replace('id="characters"','id="missing"')),/boundaries changed/);
});
test('rewritten response invalidates stale asset validators and preserves status and content type',async()=>{
  const response=await salesHomeResponse(new Response(original,{headers:{'content-type':'text/html','etag':'old','content-length':'5'}}));
  assert.equal(response.status,200);assert.equal(response.headers.get('etag'),null);assert.equal(response.headers.get('content-length'),null);assert.equal(response.headers.get('content-type'),'text/html');
  assert.match(await response.text(),/sales-page/);
});
test('home preview round-trip returns to combined purchasing with approved attribution only',()=>{
  assert.equal(ebookReturnUrl(new URL('https://example.com/preview?from=home&utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=B&analytics=off&email=private@example.com&next=https://evil.example')),'/?utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=B&analytics=off#read');
});

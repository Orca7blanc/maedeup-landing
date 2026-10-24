import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {buildSalesHome} from '../src/sales-home.js';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=buildSalesHome(read('public/index.html'));
const ebook=read('public/read.html');
for(const [id,slug] of [['nanan','nanan-book3'],['kkamangsae','kkamangsae-book1']]){
  test(`${id}: both evidence and source open the complete review from each landing page`,()=>{
    for(const page of [home,ebook]){
      const card=page.match(new RegExp('<article[^>]*data-review-id="'+id+'"[\\s\\S]*?</article>'))?.[0];
      assert.ok(card);
      assert.equal([...card.matchAll(new RegExp('<a[^>]+href="/reviews/'+slug+'-full\\.html"','g'))].length,2);
      assert.match(card,/후기 전체 보기/);
      // The quote preview stays a small excerpt; the destination holds all pages.
      assert.match(card,new RegExp('<image href="/reviews/'+slug+'-source-20261024\\.jpg"'));
    }
    const full=read(`public/reviews/${slug}-full.html`);
    const sources=[...full.matchAll(/<image href="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(sources).size,4);
    for(const path of sources)assert.ok(existsSync(new URL('../public'+path,import.meta.url)));
    assert.match(full,/후기 끝/);
  });
}

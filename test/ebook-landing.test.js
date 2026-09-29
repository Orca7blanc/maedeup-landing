import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ebookReturnUrl} from '../src/ebook-landing.js';

test('ordinary preview visitors keep their existing purchase destination', () => {
  assert.equal(ebookReturnUrl(new URL('https://example.com/preview?utm_content=A')),null);
});
test('ad readers return to the ebook store selector with their creative attribution', () => {
  const result = ebookReturnUrl(new URL('https://example.com/preview?from=ebook&utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=C'));
  assert.equal(result,'/read?utm_source=meta&utm_medium=paid_social&utm_campaign=maedeup_book1&utm_content=C#stores');
});
test('return links discard arbitrary query strings and cannot become external redirects', () => {
  assert.equal(ebookReturnUrl(new URL('https://example.com/preview?from=ebook&next=https://evil.example&utm_content=%3Cscript%3E&email=private@example.com&utm_source=unknown')),'/read#stores');
});
test('QA analytics suppression survives the preview round trip', () => {
  assert.equal(ebookReturnUrl(new URL('https://example.com/preview?from=ebook&analytics=off')),'/read?analytics=off#stores');
});
test('ebook stores retain verified destinations and label later-volume listings', () => {
  const page = readFileSync(new URL('../public/read.html',import.meta.url),'utf8');
  const storeLinks = [...page.matchAll(/href="([^"]+)" data-track="ebook_bookstore_([^"]+)"/g)].map(m=>[m[2],m[1]]);
  assert.deepEqual(storeLinks,[['ridi','https://ridibooks.com/books/5273014881'],['kyobo','https://ebook-product.kyobobook.co.kr/dig/epd/ebook/E000013298635'],['yes24','https://m.yes24.com/goods/detail/194173626'],['aladin','https://www.aladin.co.kr/search/wsearchresult.aspx?AuthorSearch=%ec%9d%b4%ec%9e%90%ec%9a%b4@10770557&amp;BranchType=9']]);
  assert.match(page,/알라딘<small>전자책 2·3권 목록/);
  assert.match(page,/11,900/);
});

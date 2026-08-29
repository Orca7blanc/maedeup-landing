import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleSocialHealth,
  imageValue,
  richTextValue,
  titleValue
} from '../src/social-publisher.js';

test('extracts Notion title and rich text values', () => {
  assert.equal(titleValue({title: [{plain_text: '매듭 소식'}]}), '매듭 소식');
  assert.equal(
    richTextValue({rich_text: [{plain_text: '첫 문장'}, {plain_text: ' 둘째 문장'}]}),
    '첫 문장 둘째 문장'
  );
});

test('prefers a direct image URL over a Notion file URL', () => {
  assert.equal(imageValue({
    '이미지 URL': {url: 'https://example.com/direct.jpg'},
    '대표 이미지': {files: [{file: {url: 'https://example.com/notion.jpg'}}]}
  }), 'https://example.com/direct.jpg');
});

test('uses a Notion-hosted file when no direct URL exists', () => {
  assert.equal(imageValue({
    '이미지 URL': {url: null},
    '대표 이미지': {files: [{file: {url: 'https://example.com/notion.jpg'}}]}
  }), 'https://example.com/notion.jpg');
});

test('health endpoint reports configuration without exposing secrets', async () => {
  const response = await handleSocialHealth({
    SOCIAL_AUTOMATION_ENABLED: 'false',
    SOCIAL_NOTION_DATA_SOURCE_ID: 'data-source',
    NOTION_TOKEN: 'notion-secret',
    INSTAGRAM_ACCESS_TOKEN: 'instagram-secret'
  });
  const body = await response.json();
  assert.deepEqual(body, {
    ok: true,
    enabled: false,
    notion: true,
    instagram: true,
    threads: false
  });
  assert.equal(JSON.stringify(body).includes('secret'), false);
});

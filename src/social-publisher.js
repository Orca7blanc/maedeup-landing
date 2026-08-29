const NOTION_API_BASE = 'https://api.notion.com/v1';
const NOTION_VERSION = '2026-03-11';
const INSTAGRAM_API_BASE = 'https://graph.instagram.com/v26.0';
const THREADS_API_BASE = 'https://graph.threads.com/v1.0';
const MAX_JOBS_PER_RUN = 5;
const MAX_RESULT_LENGTH = 1900;

export async function handleSocialHealth(env) {
  return Response.json({
    ok: true,
    enabled: env.SOCIAL_AUTOMATION_ENABLED === 'true',
    notion: Boolean(env.NOTION_TOKEN && env.SOCIAL_NOTION_DATA_SOURCE_ID),
    instagram: Boolean(env.INSTAGRAM_ACCESS_TOKEN),
    threads: Boolean(env.THREADS_ACCESS_TOKEN)
  }, {
    headers: {'cache-control': 'no-store'}
  });
}

export async function processApprovedSocialPosts(env) {
  if (env.SOCIAL_AUTOMATION_ENABLED !== 'true') {
    log('social automation disabled');
    return {processed: 0, skipped: 'disabled'};
  }
  if (!env.DB || !env.NOTION_TOKEN || !env.SOCIAL_NOTION_DATA_SOURCE_ID) {
    warn('social automation is missing required bindings');
    return {processed: 0, skipped: 'missing_configuration'};
  }

  await ensureSocialTables(env.DB);
  const pages = await queryApprovedPages(env);
  let processed = 0;

  for (const page of pages.slice(0, MAX_JOBS_PER_RUN)) {
    const scheduledAt = dateValue(page.properties?.['예약 시각']);
    if (scheduledAt && Date.parse(scheduledAt) > Date.now()) continue;
    const claimed = await claimJob(env.DB, page.id);
    if (!claimed) continue;
    processed += 1;
    await publishPage(page, env);
  }

  log('social cron completed', {processed, candidates: pages.length});
  return {processed, candidates: pages.length};
}

async function queryApprovedPages(env) {
  const response = await notionRequest(
    env,
    `/data_sources/${env.SOCIAL_NOTION_DATA_SOURCE_ID}/query`,
    {
      method: 'POST',
      body: {
        filter: {
          property: '게시 상태',
          select: {equals: '발행 승인'}
        },
        sorts: [{property: '예약 시각', direction: 'ascending'}],
        page_size: MAX_JOBS_PER_RUN * 2
      }
    }
  );
  return Array.isArray(response.results) ? response.results : [];
}

async function publishPage(page, env) {
  const pageId = page.id;
  const title = titleValue(page.properties?.['제목']) || '제목 없음';
  const instagramSelected = checkboxValue(page.properties?.Instagram);
  const threadsSelected = checkboxValue(page.properties?.Threads);
  const naverSelected = checkboxValue(page.properties?.['NAVER 초안']);
  const instagramOverride = richTextValue(page.properties?.['Instagram 문구']);
  const threadsOverride = richTextValue(page.properties?.['Threads 문구']);
  const naverTitle = richTextValue(page.properties?.['NAVER 제목']) || title;
  const naverOverride = richTextValue(page.properties?.['NAVER 원고']);
  const needsPageBody = !instagramOverride || !threadsOverride || (naverSelected && !naverOverride);
  const pageBody = needsPageBody ? await getNotionPageText(env, pageId) : '';
  const instagramText = instagramOverride || pageBody || title;
  const threadsText = threadsOverride || pageBody || title;
  const naverBody = naverOverride || pageBody;
  const imageUrl = imageValue(page.properties);
  const existingInstagramUrl = urlValue(page.properties?.['Instagram URL']);
  const existingThreadsUrl = urlValue(page.properties?.['Threads URL']);
  let instagramUrl = existingInstagramUrl;
  let threadsUrl = existingThreadsUrl;
  const results = [];

  try {
    await updateNotionPage(env, pageId, {
      '게시 상태': selectProperty('게시 중'),
      '게시 결과': richTextProperty('자동 게시 처리 중')
    });

    if (instagramSelected && !instagramUrl) {
      if (!env.INSTAGRAM_ACCESS_TOKEN) throw new Error('Instagram 연결 정보가 없습니다.');
      if (!imageUrl) throw new Error('Instagram 게시에는 대표 이미지 또는 이미지 URL이 필요합니다.');
      validateHttpsUrl(imageUrl, 'Instagram 이미지');
      instagramUrl = await publishInstagram({caption: instagramText, imageUrl}, env);
      results.push('Instagram 게시 완료');
      await savePlatformProgress(env, pageId, 'instagram', instagramUrl);
    } else if (instagramSelected) {
      results.push('Instagram 기존 게시 유지');
    }

    if (threadsSelected && !threadsUrl) {
      if (!env.THREADS_ACCESS_TOKEN) throw new Error('Threads 연결 정보가 없습니다.');
      if (imageUrl) validateHttpsUrl(imageUrl, 'Threads 이미지');
      threadsUrl = await publishThreads({text: threadsText, imageUrl}, env);
      results.push('Threads 게시 완료');
      await savePlatformProgress(env, pageId, 'threads', threadsUrl);
    } else if (threadsSelected) {
      results.push('Threads 기존 게시 유지');
    }

    if (naverSelected) {
      if (!naverTitle || !naverBody) {
        throw new Error('NAVER 초안을 선택했지만 NAVER 제목 또는 원고가 비어 있습니다.');
      }
      results.push('NAVER 원고 준비 완료 — 수동 발행 필요');
    }

    if (!instagramSelected && !threadsSelected && !naverSelected) {
      throw new Error('게시할 플랫폼이 선택되지 않았습니다.');
    }

    const completedAt = new Date().toISOString();
    const resultText = results.join(' · ');
    await env.DB.prepare(`
      UPDATE social_publish_jobs
      SET status='completed', instagram_url=?, threads_url=?, result_message=?, completed_at=?, locked_at=NULL
      WHERE notion_page_id=?
    `).bind(instagramUrl || null, threadsUrl || null, resultText, completedAt, pageId).run();
    await updateNotionPage(env, pageId, {
      '게시 상태': selectProperty('게시 완료'),
      'Instagram URL': urlProperty(instagramUrl),
      'Threads URL': urlProperty(threadsUrl),
      '게시 결과': richTextProperty(resultText),
      '게시 완료 시각': dateProperty(completedAt),
      '자동화 키': richTextProperty(pageId)
    });
    log('social post completed', {pageId, title});
  } catch (error) {
    const message = cleanError(error);
    await env.DB.prepare(`
      UPDATE social_publish_jobs
      SET status='failed', instagram_url=?, threads_url=?, result_message=?, locked_at=NULL
      WHERE notion_page_id=?
    `).bind(instagramUrl || null, threadsUrl || null, message, pageId).run();
    await updateNotionPage(env, pageId, {
      '게시 상태': selectProperty('오류'),
      'Instagram URL': urlProperty(instagramUrl),
      'Threads URL': urlProperty(threadsUrl),
      '게시 결과': richTextProperty(message),
      '자동화 키': richTextProperty(pageId)
    }).catch(updateError => {
      errorLog('failed to update Notion error state', {pageId, error: cleanError(updateError)});
    });
    errorLog('social post failed', {pageId, title, error: message});
  }
}

async function publishInstagram({caption, imageUrl}, env) {
  if (Array.from(caption).length > 2200) {
    throw new Error('Instagram 문구가 2,200자를 넘습니다.');
  }
  const user = await fetchJson(`${INSTAGRAM_API_BASE}/me?fields=user_id,username&access_token=${encodeURIComponent(env.INSTAGRAM_ACCESS_TOKEN)}`);
  const userId = user.user_id || user.id;
  if (!userId) throw new Error('Instagram 사용자 ID를 확인하지 못했습니다.');

  const container = await postForm(`${INSTAGRAM_API_BASE}/${userId}/media`, {
    image_url: imageUrl,
    caption,
    access_token: env.INSTAGRAM_ACCESS_TOKEN
  });
  if (!container.id) throw new Error('Instagram 미디어 컨테이너를 만들지 못했습니다.');
  await waitUntilInstagramReady(container.id, env.INSTAGRAM_ACCESS_TOKEN);
  const published = await postForm(`${INSTAGRAM_API_BASE}/${userId}/media_publish`, {
    creation_id: container.id,
    access_token: env.INSTAGRAM_ACCESS_TOKEN
  });
  if (!published.id) throw new Error('Instagram 게시 ID를 받지 못했습니다.');
  const media = await fetchJson(`${INSTAGRAM_API_BASE}/${published.id}?fields=permalink&access_token=${encodeURIComponent(env.INSTAGRAM_ACCESS_TOKEN)}`);
  return media.permalink || `https://www.instagram.com/`;
}

async function waitUntilInstagramReady(containerId, accessToken) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const state = await fetchJson(`${INSTAGRAM_API_BASE}/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(accessToken)}`);
    if (state.status_code === 'FINISHED') return;
    if (state.status_code === 'ERROR' || state.status_code === 'EXPIRED') {
      throw new Error(`Instagram 미디어 처리 실패: ${state.status || state.status_code}`);
    }
    await delay(1500);
  }
  throw new Error('Instagram 이미지 처리가 제한 시간 안에 끝나지 않았습니다.');
}

async function publishThreads({text, imageUrl}, env) {
  if (Array.from(text).length > 500) {
    throw new Error('Threads 문구가 500자를 넘습니다.');
  }
  const user = await fetchJson(`${THREADS_API_BASE}/me?fields=id,username&access_token=${encodeURIComponent(env.THREADS_ACCESS_TOKEN)}`);
  if (!user.id) throw new Error('Threads 사용자 ID를 확인하지 못했습니다.');
  const payload = {
    media_type: imageUrl ? 'IMAGE' : 'TEXT',
    text,
    access_token: env.THREADS_ACCESS_TOKEN
  };
  if (imageUrl) payload.image_url = imageUrl;
  const container = await postForm(`${THREADS_API_BASE}/${user.id}/threads`, payload);
  if (!container.id) throw new Error('Threads 미디어 컨테이너를 만들지 못했습니다.');
  const published = await postForm(`${THREADS_API_BASE}/${user.id}/threads_publish`, {
    creation_id: container.id,
    access_token: env.THREADS_ACCESS_TOKEN
  });
  if (!published.id) throw new Error('Threads 게시 ID를 받지 못했습니다.');
  const media = await fetchJson(`${THREADS_API_BASE}/${published.id}?fields=id,permalink&access_token=${encodeURIComponent(env.THREADS_ACCESS_TOKEN)}`);
  return media.permalink || `https://www.threads.com/@${user.username || 'maedeup_official'}`;
}

async function ensureSocialTables(db) {
  await db.prepare(`
    CREATE TABLE IF NOT EXISTS social_publish_jobs (
      notion_page_id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'pending',
      attempts INTEGER NOT NULL DEFAULT 0,
      instagram_url TEXT,
      threads_url TEXT,
      result_message TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      locked_at TEXT,
      completed_at TEXT
    )
  `).run();
}

async function claimJob(db, pageId) {
  await db.prepare(`
    INSERT OR IGNORE INTO social_publish_jobs (notion_page_id, status)
    VALUES (?, 'pending')
  `).bind(pageId).run();
  const result = await db.prepare(`
    UPDATE social_publish_jobs
    SET status='processing', attempts=attempts+1, locked_at=CURRENT_TIMESTAMP, updated_at=CURRENT_TIMESTAMP
    WHERE notion_page_id=?
      AND status IN ('pending','failed')
      AND attempts < 5
  `).bind(pageId).run();
  return Number(result.meta?.changes || 0) > 0;
}

async function savePlatformProgress(env, pageId, platform, url) {
  const column = platform === 'instagram' ? 'instagram_url' : 'threads_url';
  await env.DB.prepare(`
    UPDATE social_publish_jobs SET ${column}=?, updated_at=CURRENT_TIMESTAMP WHERE notion_page_id=?
  `).bind(url, pageId).run();
  await updateNotionPage(env, pageId, {
    [platform === 'instagram' ? 'Instagram URL' : 'Threads URL']: urlProperty(url)
  });
}

async function updateNotionPage(env, pageId, properties) {
  return notionRequest(env, `/pages/${pageId}`, {
    method: 'PATCH',
    body: {properties}
  });
}

async function getNotionPageText(env, pageId) {
  const lines = [];
  await collectBlockText(env, pageId, lines, 0);
  return lines.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
}

async function collectBlockText(env, blockId, lines, depth) {
  if (depth > 3 || lines.join('\n').length > 12000) return;
  let cursor = '';
  do {
    const query = new URLSearchParams({page_size: '100'});
    if (cursor) query.set('start_cursor', cursor);
    const response = await notionRequest(env, `/blocks/${blockId}/children?${query}`);
    for (const block of response.results || []) {
      const value = block?.[block.type];
      const text = plainText(value?.rich_text);
      if (text) lines.push(text);
      if (block.has_children) await collectBlockText(env, block.id, lines, depth + 1);
      if (lines.join('\n').length > 12000) return;
    }
    cursor = response.has_more ? response.next_cursor || '' : '';
  } while (cursor);
}

async function notionRequest(env, path, {method = 'GET', body} = {}) {
  const response = await fetch(`${NOTION_API_BASE}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${env.NOTION_TOKEN}`,
      'notion-version': NOTION_VERSION,
      'content-type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  return parseJsonResponse(response, 'Notion');
}

async function postForm(url, values) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {'content-type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams(values)
  });
  return parseJsonResponse(response, 'Meta');
}

async function fetchJson(url) {
  const response = await fetch(url, {headers: {'cache-control': 'no-store'}});
  return parseJsonResponse(response, 'Meta');
}

async function parseJsonResponse(response, service) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`${service}가 JSON이 아닌 응답을 반환했습니다. (${response.status})`);
  }
  if (!response.ok) {
    const detail = data?.error?.message || data?.message || `${response.status} ${response.statusText}`;
    throw new Error(`${service} 요청 실패: ${detail}`);
  }
  return data;
}

function selectProperty(name) {
  return {select: {name}};
}

function richTextProperty(content) {
  return {rich_text: [{type: 'text', text: {content: String(content).slice(0, MAX_RESULT_LENGTH)}}]};
}

function urlProperty(url) {
  return {url: url || null};
}

function dateProperty(start) {
  return {date: {start}};
}

export function titleValue(property) {
  return plainText(property?.title);
}

export function richTextValue(property) {
  return plainText(property?.rich_text);
}

function plainText(items) {
  if (!Array.isArray(items)) return '';
  return items.map(item => item?.plain_text || item?.text?.content || '').join('').trim();
}

function checkboxValue(property) {
  return property?.checkbox === true;
}

function dateValue(property) {
  return property?.date?.start || '';
}

function urlValue(property) {
  return typeof property?.url === 'string' ? property.url : '';
}

export function imageValue(properties) {
  const direct = urlValue(properties?.['이미지 URL']);
  if (direct) return direct;
  const files = properties?.['대표 이미지']?.files;
  const first = Array.isArray(files) ? files[0] : null;
  return first?.file?.url || first?.external?.url || '';
}

function validateHttpsUrl(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} URL 형식이 올바르지 않습니다.`);
  }
  if (url.protocol !== 'https:') throw new Error(`${label}는 HTTPS 주소여야 합니다.`);
}

function cleanError(error) {
  return (error instanceof Error ? error.message : String(error)).slice(0, MAX_RESULT_LENGTH);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message, details = {}) {
  console.log(JSON.stringify({level: 'info', message, ...details}));
}

function warn(message, details = {}) {
  console.warn(JSON.stringify({level: 'warn', message, ...details}));
}

function errorLog(message, details = {}) {
  console.error(JSON.stringify({level: 'error', message, ...details}));
}

const SEARCH_ENGINES = [
  { host: 'google.', param: 'q' },
  { host: 'bing.com', param: 'q' },
  { host: 'search.yahoo.com', param: 'p' },
  { host: 'duckduckgo.com', param: 'q' }
];

const BACKEND_URL = 'https://query-resolving-extension.onrender.com';

chrome.webNavigation.onCompleted.addListener(async (details) => {
  if (details.frameId !== 0) return;

  const url = new URL(details.url);
  const hostname = url.hostname.replace('www.', '');

  const engine = SEARCH_ENGINES.find(e => hostname.includes(e.host));

  if (engine) {
    const query = url.searchParams.get(engine.param);
    if (query) {
      console.log(`[SmartSearch] Detected: "${query}" on ${hostname}`);
      await sendQueryToBackend(query, hostname, details.url);
    }
  }
});

async function sendQueryToBackend(query, engine, fullUrl) {
  const result = await chrome.storage.local.get(['authToken']);
  const token = result.authToken;

  if (!token) {
    console.warn('[SmartSearch] No auth token. Please log in via the extension popup.');
    return;
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        query,
        engine,
        url: fullUrl,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      console.log('[SmartSearch] Query synced successfully');
    } else {
      const errData = await response.json().catch(() => ({}));
      console.error('[SmartSearch] Backend Error:', response.status, errData.message);
    }
  } catch (error) {
    console.error('[SmartSearch] Connection Error. Is the backend running on port 5000?', error);
  }
}

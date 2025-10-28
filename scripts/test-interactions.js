// quick test script to call local agent interactions endpoint
const url = 'http://localhost:5050/api/agent/interactions';
const compoundName = process.argv[2] || 'fluoxetine';

(async () => {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ compoundName })
    });
    const text = await res.text();
    console.log('HTTP', res.status);
    try {
      const json = JSON.parse(text);
      console.log('success:', json.success, 'model:', json?.interactions?.model);
      console.log('content length:', json?.interactions?.content?.length || 0);
      console.log('preview:', String(json?.interactions?.content || '').slice(0, 200));
    } catch {
      console.log(text);
    }
  } catch (e) {
    console.error('request error:', e);
  }
})();
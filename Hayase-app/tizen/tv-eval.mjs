import fs from 'node:fs';

let code;
if (process.argv[2] === '-f' && process.argv[3]) {
  code = fs.readFileSync(process.argv[3], 'utf8');
} else {
  code = process.argv.slice(2).join(' ');
}
if (!code) {
  console.error('Usage: node tv-eval.mjs "<code>" or node tv-eval.mjs -f <file>');
  process.exit(1);
}

const ws = new WebSocket('ws://127.0.0.1:9876');

const timeout = setTimeout(() => {
  console.error('Timed out waiting for response');
  ws.close();
  process.exit(1);
}, 15000);

ws.onopen = () => {
  ws.send(JSON.stringify({
    jsonrpc: '2.0',
    method: 'tv.eval',
    params: [code]
  }));
};

ws.onmessage = (evt) => {
  try {
    const data = JSON.parse(evt.data);
    if (data.method === 'remoteLog') {
      const msg = data.params ? data.params.join(' ') : '';
      if (msg.includes('[TV-EVAL-RESULT]')) {
        console.log(msg.replace(/.*\[TV-EVAL-RESULT\]/, '').trim());
        clearTimeout(timeout);
        ws.close();
        process.exit(0);
      } else if (msg.includes('[TV-EVAL-ERROR]')) {
        console.error('TV EVAL ERROR:', msg.replace(/.*\[TV-EVAL-ERROR\]/, '').trim());
        clearTimeout(timeout);
        ws.close();
        process.exit(1);
      }
    }
  } catch (err) {
    console.error('onmessage parse error:', err);
  }
};

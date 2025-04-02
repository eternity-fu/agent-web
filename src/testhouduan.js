const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors()); // 添加 CORS 中间件

app.post('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Transfer-Encoding', 'chunked');

  const message = req.body.message;
  const responseText = `你好，收到你的消息：${message}`;
  let index = 0;

  const sendChunk = () => {
    if (index < responseText.length) {
      res.write(responseText[index]);
      index++;
      setTimeout(sendChunk, 100);
    } else {
      res.end();
    }
  };

  sendChunk();
});

app.listen(3001, () => console.log('服务器运行在 3001 端口'));
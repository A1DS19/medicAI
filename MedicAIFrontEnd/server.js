const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

//create proxy server, redirect because for cookie based authentication(not stored in localsotrage) you need front and back to have same origin

app
  .prepare()
  .then(() => {
    const server = express();

    // apply proxy in dev mode

    server.use(
      '/api',
      createProxyMiddleware({
        target: process.env.NEXT_PUBLIC_API_ROUTE,
        changeOrigin: true,
      })
    );

    server.all('*', (req, res) => {
      return handle(req, res);
    });

    server.listen(8080, (err) => {
      if (err) throw err;
      console.log('> Front end Ready on http://localhost:8080');
    });
  })
  .catch((err) => {
    console.log('Error', err);
  });

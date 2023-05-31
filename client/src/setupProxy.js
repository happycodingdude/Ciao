const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: env.ASPNETCORE_URL,
            changeOrigin: true,
        })
    );
};

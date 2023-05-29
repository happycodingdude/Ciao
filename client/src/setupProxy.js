const proxyMiddleware = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_URL;
const context = [
    '/user/login'
];

module.exports = (app) => {
    const appProxy = proxyMiddleware(context, {
        target: target,
        secure: false
    })
    app.use(appProxy);
};
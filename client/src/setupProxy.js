const { createProxyMiddleware } = require('http-proxy-middleware');
const { env } = require('process');

const target = env.ASPNETCORE_URL;
const context = [
    '/user/login'
];

module.exports = (app) => {
    const appProxy = createProxyMiddleware(context, {
        target: target,
        secure: false
    })
    app.use(appProxy);
};
// module.exports = function (app) {
//     app.use(
//         '/user/login',
//         createProxyMiddleware({
//             target: 'http://localhost:5000',
//             changeOrigin: true,
//         })
//     );
// };
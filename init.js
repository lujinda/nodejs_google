module.exports = function(req, res, next){
    console.log("%s %s %s", req.method, req.originalUrl, req.ip);
    res.set('Server', 'tuxpy proxy'); // 设置response headers
    res.removeHeader('X-Powered-By');
    next();
}


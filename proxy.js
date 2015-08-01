var https = require('https');
var config = require('./config').proxy;
var zlib = require('zlib');
var util = require('./util'); 
var fs = require('fs');
var replase_format = [];

var js_content = null;

fs.readFile(__dirname + '/js.js', function(err, data){
        if(err){
            console.log(err);
            return;
        }
        js_content = data;
    });

function get_request_data(request){
    var headers = util.deepcopy(request.headers);
    headers.cookie = 'PREF=ID=67296b4b72cb9b7a:U=c32466a045d798e7:FF=0:LD=zh-CN:NW=1:TM=1431858171:LM=1431862986:SG=1:S=eC9117jGv_Az-P5z; NID=67=n4sdU2cZ2lBl_zrtMC9SngP14CF4EtKCMeez-a2wTFnn0B5oUCVPF0q1P1y3kS-fYq4YKdlQt8ZVJBF-q7Z1NSKL_jwfwrz_UKnrYBxM7TmHaA-P6BxminKd6u2CQ0vLjPhFYmTuchkP2RO3t6nSezNzcdAw4odtrHr7W_HY_yQCwvLxmqdoWapNuxRfdayzTumQvkzKjJBB'
    headers.host= config.host;
    var headser = {};
    var _data = {
        'host': config.host,
        'port': config.port,
        'method': 'GET',
        'path': request.originalUrl,
        'headers': headers
    };
    return _data
}

function process_body(body, res, my_host){
    var content_type = res.headers['content-type'];
    if (!content_type){
        return body;
    }
    content_type = content_type.split(';')[0].trim();
    if (!body){
        return body;
    }
    switch (content_type){
        case 'text/html':
            break;
        default:
            return body;
    }
    var re = new RegExp(config.host, 'g');
    var new_body = body.replace(re, my_host);

    if (js_content){
        new_body = new_body.replace('</html>', 
                String.format('</html><script>{0}</script>',
                    js_content));
    }
    return new_body;
}

function pipe_res(res){
    switch (res.headers['content-encoding']){
        case 'gzip':
            var _pipe = zlib.createGunzip();
            break;
        default:
            return res;
    }
    res.pipe(_pipe);
    return _pipe
}

exports.handler = function(request, response){
    var request_data = get_request_data(request);
    var proxy_req = https.request(request_data, function(proxy_res){
        var _pipe = pipe_res(proxy_res);
        var body = '';
        _pipe.on('data', function(chunk){
            body += chunk.toString('binary'); // 以二进制方式存起来
        }).on('end', function(){
            // 设置http response headers
            var client_res_header = ['set-cookie', 'date', 'content-type'];
            for (var i in client_res_header){
                var k = client_res_header[i];
                response.set(k, proxy_res.headers[k]);
            }
            body = process_body(body, proxy_res, request.get('host'));
            response.set('content-length', body.length);
            response.status(proxy_res.statusCode).write(body, 'binary'); // 以二进制方式写入
            response.end();
        });
    });
    proxy_req.end();
}


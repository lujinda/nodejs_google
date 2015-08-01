function deepcopy(s_obj){
    if (!s_obj){
        return s_obj;
    }
    var d_obj = null;
    switch (s_obj.constructor){
        case Object:
            d_obj = {};
            break;
        case Array:
            d_obj = [];
            break;
        default:
            return s_obj;
    }

    for (var _k in s_obj){
        var _v = s_obj[_k];
        d_obj[_k] = deepcopy(_v);
    }

    return d_obj;
}


String.format = function(src){
    if (arguments.length == 0) return null;     
        var args = Array.prototype.slice.call(arguments, 1); 
            
            return src.replace(/\{(\d+)\}/g, function(m, i){    return args[i];  }); 
            
};

exports.deepcopy = deepcopy;
exports.format = String.format;

define(function () {
    var regEncode = new RegExp('[<>"\'&]', 'g'),
        mapEncode = {'<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;', '&': '&amp;'},
        fnEncode = function (value) {
            return mapEncode[value];
        },
        regDecode = new RegExp('&(?:lt|gt|amp|#39|quot);', 'g'),
        mapDecode = {'&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': '\'', '&amp;': '&'},
        fnDecode = function (value) {
            return mapDecode[value];
        },
        html = {
            encode: function (value) {
                return (typeof value === 'string' ? value : String(value)).replace(regEncode, fnEncode);
            },
            decode: function (value) {
                return (typeof value === 'string' ? value : String(value)).replace(regDecode, fnDecode);
            }
        };
    window.encodeHTML = html.encode;
    window.decodeHTML = html.decode;
    return html;
});
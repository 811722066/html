define([
    './_base',
    '../presenters/Index',
], function (base, presenter) {
    var index = base.extend(function (options) {
        
    }, {
        creatView:function(data){
        	this.container.html(data);
        }
    });
    index.init = function () {
        new presenter(new this({
            root:$(document),
            container:$('.grid'),
        }));
    };
    return index;
});
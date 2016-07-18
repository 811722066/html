define(['repository_base'
], function (base) {
    return new (base.extend({
        /*getTableData: function (condition) {
        	return  $.getJSON('./resources/Demo.json',function(result){
        		return result;
        	});
        }*/
        getAjax:function () {
            //默认的一些参数
            /*var data = {obj:this.obj,type:this.type,m:"F9finance",c:"Glance",f:r_type}
            //这里如果需要传其它参数时则使用r_data对象传递
            if(r_data != undefined && r_data instanceof Object){
                for(var x in r_data)
                    data[x] = r_data[x]
            }*/
            var data = {};
            //执行AJAX
            return $.ajax({
                url:'http://www.php.com/myBlog/public/',
                data:data,
                dataType:'jsonp'
            })
        },
    }))();
});
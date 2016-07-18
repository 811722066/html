define(['./_base', '../repositories/Index'], function (base, repository) {
    return base.extend(function () {
        this.view.on('init', this.onInitPage.bind(this));
    }, {
        onInitPage: function () {
            /*repository.getTableData().then(function(data){
        		this.view.creatView(data);
        	}.bind(this));*/
            repository.getAjax().then(function(data){
                console.log('------');
                console.dir(data);
                this.view.creatView(data);
            }.bind(this));
        },
    });
});

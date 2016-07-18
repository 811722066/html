define(['_base', 'jquery'], function (base) {
    return base.extend(function (view) {
        this.view = view;
        this.view.on('init', this.onInit.bind(this));
    }, {
        init: function () {
            this.view.handleLoading();
            this.onInit();
        },
        onInit: function () {
        }
    });
});
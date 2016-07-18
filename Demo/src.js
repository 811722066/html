require([
	'views/index'
], function () {
	require(['views/' + (location.pathname.match(/([^\/]+)\.html/) || [, 'index'])[1]], function () {
		arguments[0] && arguments[0].init && arguments[0].init();
	});
});
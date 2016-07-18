define({
    fixInt: function (value) {
        value = value === '' ? NaN : Number(value);
        return isNaN(value) || value === Infinity ? '－' : Math.round(value);
    },
    fixFloat: function (value, decimals) {
        value = value === '' ? NaN : Number(value);
        return isNaN(value) || value === Infinity ? '－' : value.toFixed(isNaN(decimals) ? 2 : decimals).replace(/^-([0.]+)$/, '$1');
    },
    fixValue: function (value, decimals) {
        return this.fixFloat(value, decimals).replace(/\.(\d+)/, '<i>$1</i>');
    },
    fixPrice: function (value, decimals) {
        return this.fixFloat(value > 0 ? value : NaN, decimals);
    },
    fixPercent: function (value, decimals) {
        value = this.fixFloat(value, decimals);
        return value + (value === '－' ? '' : '%');
    },
    fixTime: function (value, format) {
        if (typeof value === 'number') {
            value = value.toString();
        }
        if (value && value.length > 7) {
            var now = new Date();
            switch (value.length) {
                case 8:
                    value = +new Date(value.replace(/(\d\d)(\d\d)$/, '/$1/$2'));
                    break;
                case 10:
                    value = value * 1000 + now.getTimezoneOffset() * 60000;
                    break;
                case 14:
                case 20:
                    value = +new Date(value.replace(/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d).*$/, '$1/$2/$3 $4:$5:$6'));
                    break;
            }
            value = new Date(new Date(value) - now.getTimezoneOffset() * 60000).toJSON();
            if (format) {
                return format.replace(/[YyMdHms]/g, function () {
                    switch (arguments[0].slice(-1)) {
                        case 'Y':
                            return this.slice(0, 4);
                        case 'y':
                            return this.slice(2, 4);
                        case 'M':
                            return this.slice(5, 7);
                        case 'd':
                            return this.slice(8, 10);
                        case 'H':
                            return this.slice(11, 13);
                        case 'm':
                            return this.slice(14, 16);
                        case 's':
                            return this.slice(17, 19);
                        default:
                            return arguments[0];
                    }
                }.bind(value || ''));
            } else {
                return value.slice(0, 10) === new Date(now - now.getTimezoneOffset() * 60000).toJSON().slice(0, 10) ? value.slice(11, 16) : value.slice(5, 10);
            }
        }
        return '－';
    },
    fixSymbol: function (symbol) {
        return (symbol || '－').replace(/^..|\..+?$/g, '');
    },
    fixDigit: function (value, decimals) {
        value = Number(value);
        if (isNaN(value) || value === Infinity) {
            return '－';
        } else {
            var digits = ['', '万', '亿', '兆', '京', '垓', '秭', '穰'];
            while (value > 9999 && digits.length > 1) {
                value = value / 10000;
                digits.shift();
            }
            return value.toFixed(isNaN(decimals) ? 2 : decimals) + digits[0];
        }
    },
    fixColor: function (value, decimals) {
        value = this.fixFloat(value, decimals);
        if (value > 0) {
            return 'red';
        } else if (value < 0) {
            return 'green';
        } else {
            return 'white';
        }
    },
    fixLastTrade: function (item) {
        var value = arguments.length > 1 ?
            (arguments[0] > 0 ? arguments[0] : arguments[1]) :
            (item.new > 0 ? item.new : item.lastclose);
        return value > 0 ? value : NaN;
    },
    fixChange: function (item) {
        return this.fixLastTrade.apply(this, arguments) - (arguments.length > 1 ? arguments[1] : item.lastclose);
    },
    fixChg: function (item) {
        return (this.fixLastTrade.apply(this, arguments) / (arguments.length > 1 ? arguments[1] : item.lastclose) - 1) * 100;
    },
    fixDate: function (value) {
        var date = new Date(),
            offset = parseInt(value);
        if (!isNaN(offset)) {
            switch (value.slice(-1)) {
                case 'd':
                    date.setDate(date.getDate() + offset);
                    break;
                case 'm':
                    date.setMonth(date.getMonth() + offset);
                    break;
                case 'y':
                    date.setFullYear(date.getFullYear() + offset);
                    break;
            }
        }
        return new Date(date - date.getTimezoneOffset() * 60000).toJSON().replace(/\D/g, '').slice(0, 8) + '000000';
    },
    fixStr:function (value){
    	return value==undefined?'—':value;
    },
    fixPrice:function(item){
    	return item.c24 == '净价'?item.new+ item.c4:item.new;
    },
    fixDeadline:function(item){
    	return item.c6 == 'NULL' ? this.fixFloat(item.c5,2) : this.fixFloat(item.c5,2)+'/'+this.fixFloat(item.c6,2);
    },
    fixRepurchase:function(item){
    	return item.c29*item.c12/item.price*100;
    },
    fixLastyear:function(item){
    	if(item.c16 == 'NULL'){
    		return '—';
    	}
    	if((item.price-item.c16+item.C27*0.8) > 0){
    		return '盈';
    	}else if((item.price-item.c16+item.C27*0.8) < 0){
    		return '亏';
    	}else if((item.price-item.c16+item.C27*0.8) == 0){
    		return '平';
    	}else{
    		return '—';
    	}
    },
    fixPreviousyear:function(item){
    	if(item.c18 == 'NULL'){
    		return '—';
    	}
    	if((item.price-item.c18+item.C28*0.8) > 0){
    		return '盈';
    	}else if((item.price-item.c18+item.C28*0.8) < 0){
    		return '亏';
    	}else if((item.price-item.c18+item.C28*0.8) == 0){
    		return '平';
    	}else{
    		return '—';
    	}
    },
    fixFormatNum: function(value){
   		return value != undefined ?String(value).replace(/\B(?=(?:\d{3})+\b)/g, ','):'—';
    }
});
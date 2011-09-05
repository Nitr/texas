(function($) {
  $.url = {
    get: function(name) {
      var val = decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,undefined])[1]
      );
      return val == "undefined" ? null : val;
    }
  };

  $.isEmpty = function(str) {
    return str == null || str == undefined || $.trim(str) == "";
  };
})(jQuery);

jQuery.base64 = {

/* Convert data (an array of integers) to a Base64 string. */
toBase64Table : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
base64Pad     : '=',

encode: function (data) {
    var result = '',
        chrTable = $.base64.toBase64Table.split(''),
        pad = $.base64.base64Pad,
        length = data.length,
        i;
    // Convert every three bytes to 4 ascii characters.
    for (i = 0; i < (length - 2); i += 3) {
        result += chrTable[data[i] >> 2];
        result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
        result += chrTable[((data[i+1] & 0x0f) << 2) + (data[i+2] >> 6)];
        result += chrTable[data[i+2] & 0x3f];
    }

    // Convert the remaining 1 or 2 bytes, pad out to 4 characters.
    if (length%3) {
        i = length - (length%3);
        result += chrTable[data[i] >> 2];
        if ((length%3) === 2) {
            result += chrTable[((data[i] & 0x03) << 4) + (data[i+1] >> 4)];
            result += chrTable[(data[i+1] & 0x0f) << 2];
            result += pad;
        } else {
            result += chrTable[(data[i] & 0x03) << 4];
            result += pad + pad;
        }
    }

    return result;
},

/* Convert Base64 data to a string */
toBinaryTable : [
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,-1,
    -1,-1,-1,-1, -1,-1,-1,-1, -1,-1,-1,62, -1,-1,-1,63,
    52,53,54,55, 56,57,58,59, 60,61,-1,-1, -1, 0,-1,-1,
    -1, 0, 1, 2,  3, 4, 5, 6,  7, 8, 9,10, 11,12,13,14,
    15,16,17,18, 19,20,21,22, 23,24,25,-1, -1,-1,-1,-1,
    -1,26,27,28, 29,30,31,32, 33,34,35,36, 37,38,39,40,
    41,42,43,44, 45,46,47,48, 49,50,51,-1, -1,-1,-1,-1
],

decode: function (data, offset) {
    offset = typeof(offset) !== 'undefined' ? offset : 0;
    var binTable = $.base64.toBinaryTable,
        pad = $.base64.base64Pad,
        result, result_length, idx, i, c, padding,
        leftbits = 0, // number of bits decoded, but yet to be appended
        leftdata = 0, // bits decoded, but yet to be appended
        data_length = data.indexOf('=') - offset;

    if (data_length < 0) { data_length = data.length - offset; }

    /* Every four characters is 3 resulting numbers */
    result_length = (data_length >> 2) * 3 + Math.floor((data_length%4)/1.5);
    result = new Array(result_length);

    // Convert one by one.
    for (idx = 0, i = offset; i < data.length; i++) {
        c = binTable[data.charCodeAt(i) & 0x7f];
        padding = (data.charAt(i) === pad);
        // Skip illegal characters and whitespace
        if (c === -1) {
            console.error("Illegal character '" + data.charCodeAt(i) + "'");
            continue;
        }
        
        // Collect data into leftdata, update bitcount
        leftdata = (leftdata << 6) | c;
        leftbits += 6;

        // If we have 8 or more bits, append 8 bits to the result
        if (leftbits >= 8) {
            leftbits -= 8;
            // Append if not padding.
            if (!padding) {
                result[idx++] = (leftdata >> leftbits) & 0xff;
            }
            leftdata &= (1 << leftbits) - 1;
        }
    }

    // If there are any bits left, the base64 string was corrupted
    if (leftbits) {
        throw {name: 'Base64-Error', 
               message: 'Corrupted base64 string'};
    }

    return result;
}

}; /* End of Base64 namespace */















	
	/**
	 * jQuery BASE64 functions
	 * 
	 * 	<code>
	 * 		Encodes the given data with base64. 
	 * 		String $.base64Encode ( String str )
	 *		<br />
	 * 		Decodes a base64 encoded data.
	 * 		String $.base64Decode ( String str )
	 * 	</code>
	 * 
	 * Encodes and Decodes the given data in base64.
	 * This encoding is designed to make binary data survive transport through transport layers that are not 8-bit clean, such as mail bodies.
	 * Base64-encoded data takes about 33% more space than the original data. 
	 * This javascript code is used to encode / decode data using base64 (this encoding is designed to make binary data survive transport through transport layers that are not 8-bit clean). Script is fully compatible with UTF-8 encoding. You can use base64 encoded data as simple encryption mechanism.
	 * If you plan using UTF-8 encoding in your project don't forget to set the page encoding to UTF-8 (Content-Type meta tag). 
	 * This function orginally get from the WebToolkit and rewrite for using as the jQuery plugin.
	 * 
	 * Example
	 * 	Code
	 * 		<code>
	 * 			$.base64Encode("I'm Persian."); 
	 * 		</code>
	 * 	Result
	 * 		<code>
	 * 			"SSdtIFBlcnNpYW4u"
	 * 		</code>
	 * 	Code
	 * 		<code>
	 * 			$.base64Decode("SSdtIFBlcnNpYW4u");
	 * 		</code>
	 * 	Result
	 * 		<code>
	 * 			"I'm Persian."
	 * 		</code>
	 * 
	 * @alias Muhammad Hussein Fattahizadeh < muhammad [AT] semnanweb [DOT] com >
	 * @link http://www.semnanweb.com/jquery-plugin/base64.html
	 * @see http://www.webtoolkit.info/
	 * @license http://www.gnu.org/licenses/gpl.html [GNU General Public License]
	 * @param {jQuery} {base64Encode:function(input))
	 * @param {jQuery} {base64Decode:function(input))
	 * @return string
	 */
	
	(function($){
		
		var keyString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		
		var uTF8Encode = function(string) {
			string = string.replace(/\x0d\x0a/g, "\x0a");
			var output = "";
			for (var n = 0; n < string.length; n++) {
				var c = string.charCodeAt(n);
				if (c < 128) {
					output += String.fromCharCode(c);
				} else if ((c > 127) && (c < 2048)) {
					output += String.fromCharCode((c >> 6) | 192);
					output += String.fromCharCode((c & 63) | 128);
				} else {
					output += String.fromCharCode((c >> 12) | 224);
					output += String.fromCharCode(((c >> 6) & 63) | 128);
					output += String.fromCharCode((c & 63) | 128);
				}
			}
			return output;
		};
		
		var uTF8Decode = function(input) {
			var string = "";
			var i = 0;
			var c = c1 = c2 = 0;
			while ( i < input.length ) {
				c = input.charCodeAt(i);
				if (c < 128) {
					string += String.fromCharCode(c);
					i++;
				} else if ((c > 191) && (c < 224)) {
					c2 = input.charCodeAt(i+1);
					string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
					i += 2;
				} else {
					c2 = input.charCodeAt(i+1);
					c3 = input.charCodeAt(i+2);
					string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
					i += 3;
				}
			}
			return string;
		}
		
		$.extend({
			base64Encode: function(input) {
				var output = "";
				var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
				var i = 0;
				input = uTF8Encode(input);
				while (i < input.length) {
					chr1 = input.charCodeAt(i++);
					chr2 = input.charCodeAt(i++);
					chr3 = input.charCodeAt(i++);
					enc1 = chr1 >> 2;
					enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
					enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
					enc4 = chr3 & 63;
					if (isNaN(chr2)) {
						enc3 = enc4 = 64;
					} else if (isNaN(chr3)) {
						enc4 = 64;
					}
					output = output + keyString.charAt(enc1) + keyString.charAt(enc2) + keyString.charAt(enc3) + keyString.charAt(enc4);
				}
				return output;
			},
			base64Decode: function(input) {
				var output = "";
				var chr1, chr2, chr3;
				var enc1, enc2, enc3, enc4;
				var i = 0;
				input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
				while (i < input.length) {
					enc1 = keyString.indexOf(input.charAt(i++));
					enc2 = keyString.indexOf(input.charAt(i++));
					enc3 = keyString.indexOf(input.charAt(i++));
					enc4 = keyString.indexOf(input.charAt(i++));
					chr1 = (enc1 << 2) | (enc2 >> 4);
					chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
					chr3 = ((enc3 & 3) << 6) | enc4;
					output = output + String.fromCharCode(chr1);
					if (enc3 != 64) {
						output = output + String.fromCharCode(chr2);
					}
					if (enc4 != 64) {
						output = output + String.fromCharCode(chr3);
					}
				}
				output = uTF8Decode(output);
				return output;
			}
		});
	})(jQuery);
﻿/*!
 * jQuery blockUI plugin
 * Version 2.39 (23-MAY-2011)
 * @requires jQuery v1.2.3 or later
 *
 * Examples at: http://malsup.com/jquery/block/
 * Copyright (c) 2007-2010 M. Alsup
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * Thanks to Amir-Hossein Sobhi for some excellent contributions!
 */

;(function($) {

if (/1\.(0|1|2)\.(0|1|2)/.test($.fn.jquery) || /^1.1/.test($.fn.jquery)) {
	alert('blockUI requires jQuery v1.2.3 or later!  You are using v' + $.fn.jquery);
	return;
}

$.fn._fadeIn = $.fn.fadeIn;

var noOp = function() {};

// this bit is to ensure we don't call setExpression when we shouldn't (with extra muscle to handle
// retarded userAgent strings on Vista)
var mode = document.documentMode || 0;
var setExpr = $.browser.msie && (($.browser.version < 8 && !mode) || mode < 8);
var ie6 = $.browser.msie && /MSIE 6.0/.test(navigator.userAgent) && !mode;

// global $ methods for blocking/unblocking the entire page
$.blockUI   = function(opts) { install(window, opts); };
$.unblockUI = function(opts) { remove(window, opts); };

// convenience method for quick growl-like notifications  (http://www.google.com/search?q=growl)
$.growlUI = function(title, message, timeout, onClose) {
	var $m = $('<div class="growlUI"></div>');
	if (title) $m.append('<h1>'+title+'</h1>');
	if (message) $m.append('<h2>'+message+'</h2>');
	if (timeout == undefined) timeout = 3000;
	$.blockUI({
		message: $m, fadeIn: 700, fadeOut: 1000, centerY: false,
		timeout: timeout, showOverlay: false,
		onUnblock: onClose, 
		css: $.blockUI.defaults.growlCSS
	});
};

// plugin method for blocking element content
$.fn.block = function(opts) {
	return this.unblock({ fadeOut: 0 }).each(function() {
		if ($.css(this,'position') == 'static')
			this.style.position = 'relative';
		if ($.browser.msie)
			this.style.zoom = 1; // force 'hasLayout'
		install(this, opts);
	});
};

// plugin method for unblocking element content
$.fn.unblock = function(opts) {
	return this.each(function() {
		remove(this, opts);
	});
};

$.blockUI.version = 2.39; // 2nd generation blocking at no extra cost!

// override these in your code to change the default behavior and style
$.blockUI.defaults = {
	// message displayed when blocking (use null for no message)
	message:  '<h1>Please wait...</h1>',

	title: null,	  // title string; only used when theme == true
	draggable: true,  // only used when theme == true (requires jquery-ui.js to be loaded)
	
	theme: false, // set to true to use with jQuery UI themes
	
	// styles for the message when blocking; if you wish to disable
	// these and use an external stylesheet then do this in your code:
	// $.blockUI.defaults.css = {};
	css: {
		padding:	0,
		margin:		0,
		width:		'30%',
		top:		'40%',
		left:		'35%',
		textAlign:	'center',
		color:		'#000',
		border:		'3px solid #aaa',
		backgroundColor:'#fff',
		cursor:		'default'
	},
	
	// minimal style set used when themes are used
	themedCSS: {
		width:	'30%',
		top:	'40%',
		left:	'35%'
	},

	// styles for the overlay
	overlayCSS:  {
		backgroundColor: '#000',
		opacity:	  	 0.6,
		cursor:		  	 'default'
	},

	// styles applied when using $.growlUI
	growlCSS: {
		width:  	'350px',
		top:		'10px',
		left:   	'',
		right:  	'10px',
		border: 	'none',
		padding:	'5px',
		opacity:	0.6,
		cursor: 	'default',
		color:		'#fff',
		backgroundColor: '#000',
		'-webkit-border-radius': '10px',
		'-moz-border-radius':	 '10px',
		'border-radius': 		 '10px'
	},
	
	// IE issues: 'about:blank' fails on HTTPS and javascript:false is s-l-o-w
	// (hat tip to Jorge H. N. de Vasconcelos)
	iframeSrc: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',

	// force usage of iframe in non-IE browsers (handy for blocking applets)
	forceIframe: false,

	// z-index for the blocking overlay
	baseZ: 1000,

	// set these to true to have the message automatically centered
	centerX: true, // <-- only effects element blocking (page block controlled via css above)
	centerY: true,

	// allow body element to be stetched in ie6; this makes blocking look better
	// on "short" pages.  disable if you wish to prevent changes to the body height
	allowBodyStretch: true,

	// enable if you want key and mouse events to be disabled for content that is blocked
	bindEvents: true,

	// be default blockUI will supress tab navigation from leaving blocking content
	// (if bindEvents is true)
	constrainTabKey: true,

	// fadeIn time in millis; set to 0 to disable fadeIn on block
	fadeIn:  200,

	// fadeOut time in millis; set to 0 to disable fadeOut on unblock
	fadeOut:  400,

	// time in millis to wait before auto-unblocking; set to 0 to disable auto-unblock
	timeout: 0,

	// disable if you don't want to show the overlay
	showOverlay: true,

	// if true, focus will be placed in the first available input field when
	// page blocking
	focusInput: true,

	// suppresses the use of overlay styles on FF/Linux (due to performance issues with opacity)
	applyPlatformOpacityRules: true,
	
	// callback method invoked when fadeIn has completed and blocking message is visible
	onBlock: null,

	// callback method invoked when unblocking has completed; the callback is
	// passed the element that has been unblocked (which is the window object for page
	// blocks) and the options that were passed to the unblock call:
	//	 onUnblock(element, options)
	onUnblock: null,

	// don't ask; if you really must know: http://groups.google.com/group/jquery-en/browse_thread/thread/36640a8730503595/2f6a79a77a78e493#2f6a79a77a78e493
	quirksmodeOffsetHack: 4,

	// class name of the message block
	blockMsgClass: 'blockMsg'
};

// private data and functions follow...

var pageBlock = null;
var pageBlockEls = [];

function install(el, opts) {
	var full = (el == window);
	var msg = opts && opts.message !== undefined ? opts.message : undefined;
	opts = $.extend({}, $.blockUI.defaults, opts || {});
	opts.overlayCSS = $.extend({}, $.blockUI.defaults.overlayCSS, opts.overlayCSS || {});
	var css = $.extend({}, $.blockUI.defaults.css, opts.css || {});
	var themedCSS = $.extend({}, $.blockUI.defaults.themedCSS, opts.themedCSS || {});
	msg = msg === undefined ? opts.message : msg;

	// remove the current block (if there is one)
	if (full && pageBlock)
		remove(window, {fadeOut:0});

	// if an existing element is being used as the blocking content then we capture
	// its current place in the DOM (and current display style) so we can restore
	// it when we unblock
	if (msg && typeof msg != 'string' && (msg.parentNode || msg.jquery)) {
		var node = msg.jquery ? msg[0] : msg;
		var data = {};
		$(el).data('blockUI.history', data);
		data.el = node;
		data.parent = node.parentNode;
		data.display = node.style.display;
		data.position = node.style.position;
		if (data.parent)
			data.parent.removeChild(node);
	}

	$(el).data('blockUI.onUnblock', opts.onUnblock);
	var z = opts.baseZ;

	// blockUI uses 3 layers for blocking, for simplicity they are all used on every platform;
	// layer1 is the iframe layer which is used to supress bleed through of underlying content
	// layer2 is the overlay layer which has opacity and a wait cursor (by default)
	// layer3 is the message content that is displayed while blocking

	var lyr1 = ($.browser.msie || opts.forceIframe) 
		? $('<iframe class="blockUI" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;position:absolute;width:100%;height:100%;top:0;left:0" src="'+opts.iframeSrc+'"></iframe>')
		: $('<div class="blockUI" style="display:none"></div>');
	
	var lyr2 = opts.theme 
	 	? $('<div class="blockUI blockOverlay ui-widget-overlay" style="z-index:'+ (z++) +';display:none"></div>')
	 	: $('<div class="blockUI blockOverlay" style="z-index:'+ (z++) +';display:none;border:none;margin:0;padding:0;width:100%;height:100%;top:0;left:0"></div>');

	var lyr3, s;
	if (opts.theme && full) {
		s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:fixed">' +
				'<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>' +
				'<div class="ui-widget-content ui-dialog-content"></div>' +
			'</div>';
	}
	else if (opts.theme) {
		s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement ui-dialog ui-widget ui-corner-all" style="z-index:'+(z+10)+';display:none;position:absolute">' +
				'<div class="ui-widget-header ui-dialog-titlebar ui-corner-all blockTitle">'+(opts.title || '&nbsp;')+'</div>' +
				'<div class="ui-widget-content ui-dialog-content"></div>' +
			'</div>';
	}
	else if (full) {
		s = '<div class="blockUI ' + opts.blockMsgClass + ' blockPage" style="z-index:'+(z+10)+';display:none;position:fixed"></div>';
	}			 
	else {
		s = '<div class="blockUI ' + opts.blockMsgClass + ' blockElement" style="z-index:'+(z+10)+';display:none;position:absolute"></div>';
	}
	lyr3 = $(s);

	// if we have a message, style it
	if (msg) {
		if (opts.theme) {
			lyr3.css(themedCSS);
			lyr3.addClass('ui-widget-content');
		}
		else 
			lyr3.css(css);
	}

	// style the overlay
	if (!opts.theme && (!opts.applyPlatformOpacityRules || !($.browser.mozilla && /Linux/.test(navigator.platform))))
		lyr2.css(opts.overlayCSS);
	lyr2.css('position', full ? 'fixed' : 'absolute');

	// make iframe layer transparent in IE
	if ($.browser.msie || opts.forceIframe)
		lyr1.css('opacity',0.0);

	//$([lyr1[0],lyr2[0],lyr3[0]]).appendTo(full ? 'body' : el);
	var layers = [lyr1,lyr2,lyr3], $par = full ? $('body') : $(el);
	$.each(layers, function() {
		this.appendTo($par);
	});
	
	if (opts.theme && opts.draggable && $.fn.draggable) {
		lyr3.draggable({
			handle: '.ui-dialog-titlebar',
			cancel: 'li'
		});
	}

	// ie7 must use absolute positioning in quirks mode and to account for activex issues (when scrolling)
	var expr = setExpr && (!$.boxModel || $('object,embed', full ? null : el).length > 0);
	if (ie6 || expr) {
		// give body 100% height
		if (full && opts.allowBodyStretch && $.boxModel)
			$('html,body').css('height','100%');

		// fix ie6 issue when blocked element has a border width
		if ((ie6 || !$.boxModel) && !full) {
			var t = sz(el,'borderTopWidth'), l = sz(el,'borderLeftWidth');
			var fixT = t ? '(0 - '+t+')' : 0;
			var fixL = l ? '(0 - '+l+')' : 0;
		}

		// simulate fixed position
		$.each([lyr1,lyr2,lyr3], function(i,o) {
			var s = o[0].style;
			s.position = 'absolute';
			if (i < 2) {
				full ? s.setExpression('height','Math.max(document.body.scrollHeight, document.body.offsetHeight) - (jQuery.boxModel?0:'+opts.quirksmodeOffsetHack+') + "px"')
					 : s.setExpression('height','this.parentNode.offsetHeight + "px"');
				full ? s.setExpression('width','jQuery.boxModel && document.documentElement.clientWidth || document.body.clientWidth + "px"')
					 : s.setExpression('width','this.parentNode.offsetWidth + "px"');
				if (fixL) s.setExpression('left', fixL);
				if (fixT) s.setExpression('top', fixT);
			}
			else if (opts.centerY) {
				if (full) s.setExpression('top','(document.documentElement.clientHeight || document.body.clientHeight) / 2 - (this.offsetHeight / 2) + (blah = document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + "px"');
				s.marginTop = 0;
			}
			else if (!opts.centerY && full) {
				var top = (opts.css && opts.css.top) ? parseInt(opts.css.top) : 0;
				var expression = '((document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop) + '+top+') + "px"';
				s.setExpression('top',expression);
			}
		});
	}

	// show the message
	if (msg) {
		if (opts.theme)
			lyr3.find('.ui-widget-content').append(msg);
		else
			lyr3.append(msg);
		if (msg.jquery || msg.nodeType)
			$(msg).show();
	}

	if (($.browser.msie || opts.forceIframe) && opts.showOverlay)
		lyr1.show(); // opacity is zero
	if (opts.fadeIn) {
		var cb = opts.onBlock ? opts.onBlock : noOp;
		var cb1 = (opts.showOverlay && !msg) ? cb : noOp;
		var cb2 = msg ? cb : noOp;
		if (opts.showOverlay)
			lyr2._fadeIn(opts.fadeIn, cb1);
		if (msg)
			lyr3._fadeIn(opts.fadeIn, cb2);
	}
	else {
		if (opts.showOverlay)
			lyr2.show();
		if (msg)
			lyr3.show();
		if (opts.onBlock)
			opts.onBlock();
	}

	// bind key and mouse events
	bind(1, el, opts);

	if (full) {
		pageBlock = lyr3[0];
		pageBlockEls = $(':input:enabled:visible',pageBlock);
		if (opts.focusInput)
			setTimeout(focus, 20);
	}
	else
		center(lyr3[0], opts.centerX, opts.centerY);

	if (opts.timeout) {
		// auto-unblock
		var to = setTimeout(function() {
			full ? $.unblockUI(opts) : $(el).unblock(opts);
		}, opts.timeout);
		$(el).data('blockUI.timeout', to);
	}
};

// remove the block
function remove(el, opts) {
	var full = (el == window);
	var $el = $(el);
	var data = $el.data('blockUI.history');
	var to = $el.data('blockUI.timeout');
	if (to) {
		clearTimeout(to);
		$el.removeData('blockUI.timeout');
	}
	opts = $.extend({}, $.blockUI.defaults, opts || {});
	bind(0, el, opts); // unbind events

	if (opts.onUnblock === null) {
		opts.onUnblock = $el.data('blockUI.onUnblock');
		$el.removeData('blockUI.onUnblock');
	}

	var els;
	if (full) // crazy selector to handle odd field errors in ie6/7
		els = $('body').children().filter('.blockUI').add('body > .blockUI');
	else
		els = $('.blockUI', el);

	if (full)
		pageBlock = pageBlockEls = null;

	if (opts.fadeOut) {
		els.fadeOut(opts.fadeOut);
		setTimeout(function() { reset(els,data,opts,el); }, opts.fadeOut);
	}
	else
		reset(els, data, opts, el);
};

// move blocking element back into the DOM where it started
function reset(els,data,opts,el) {
	els.each(function(i,o) {
		// remove via DOM calls so we don't lose event handlers
		if (this.parentNode)
			this.parentNode.removeChild(this);
	});

	if (data && data.el) {
		data.el.style.display = data.display;
		data.el.style.position = data.position;
		if (data.parent)
			data.parent.appendChild(data.el);
		$(el).removeData('blockUI.history');
	}

	if (typeof opts.onUnblock == 'function')
		opts.onUnblock(el,opts);
};

// bind/unbind the handler
function bind(b, el, opts) {
	var full = el == window, $el = $(el);

	// don't bother unbinding if there is nothing to unbind
	if (!b && (full && !pageBlock || !full && !$el.data('blockUI.isBlocked')))
		return;
	if (!full)
		$el.data('blockUI.isBlocked', b);

	// don't bind events when overlay is not in use or if bindEvents is false
	if (!opts.bindEvents || (b && !opts.showOverlay)) 
		return;

	// bind anchors and inputs for mouse and key events
	var events = 'mousedown mouseup keydown keypress';
	b ? $(document).bind(events, opts, handler) : $(document).unbind(events, handler);

// former impl...
//	   var $e = $('a,:input');
//	   b ? $e.bind(events, opts, handler) : $e.unbind(events, handler);
};

// event handler to suppress keyboard/mouse events when blocking
function handler(e) {
	// allow tab navigation (conditionally)
	if (e.keyCode && e.keyCode == 9) {
		if (pageBlock && e.data.constrainTabKey) {
			var els = pageBlockEls;
			var fwd = !e.shiftKey && e.target === els[els.length-1];
			var back = e.shiftKey && e.target === els[0];
			if (fwd || back) {
				setTimeout(function(){focus(back)},10);
				return false;
			}
		}
	}
	var opts = e.data;
	// allow events within the message content
	if ($(e.target).parents('div.' + opts.blockMsgClass).length > 0)
		return true;

	// allow events for content that is not being blocked
	return $(e.target).parents().children().filter('div.blockUI').length == 0;
};

function focus(back) {
	if (!pageBlockEls)
		return;
	var e = pageBlockEls[back===true ? pageBlockEls.length-1 : 0];
	if (e)
		e.focus();
};

function center(el, x, y) {
	var p = el.parentNode, s = el.style;
	var l = ((p.offsetWidth - el.offsetWidth)/2) - sz(p,'borderLeftWidth');
	var t = ((p.offsetHeight - el.offsetHeight)/2) - sz(p,'borderTopWidth');
	if (x) s.left = l > 0 ? (l+'px') : '0';
	if (y) s.top  = t > 0 ? (t+'px') : '0';
};

function sz(el, p) {
	return parseInt($.css(el,p))||0;
};

})(jQuery);
/* jTemplates 0.7.8 (http://jtemplates.tpython.com) Copyright (c) 2009 Tomasz Gloc */
eval(function(p,a,c,k,e,r){e=function(c){return(c<a?'':e(parseInt(c/a)))+((c=c%a)>35?String.fromCharCode(c+29):c.toString(36))};if(!''.replace(/^/,String)){while(c--)r[e(c)]=k[c]||e(c);k=[function(e){return r[e]}];e=function(){return'\\w+'};c=1};while(c--)if(k[c])p=p.replace(new RegExp('\\b'+e(c)+'\\b','g'),k[c]);return p}('a(37.b&&!37.b.38){(9(b){6 m=9(s,A,f){5.1M=[];5.1u={};5.2p=E;5.1N={};5.1c={};5.f=b.1m({1Z:1f,3a:1O,2q:1f,2r:1f,3b:1O,3c:1O},f);5.1v=(5.f.1v!==F)?(5.f.1v):(13.20);5.Y=(5.f.Y!==F)?(5.f.Y):(13.3d);5.3e(s,A);a(s){5.1w(5.1c[\'21\'],A,5.f)}5.1c=E};m.y.2s=\'0.7.8\';m.R=1O;m.y.3e=9(s,A){6 2t=/\\{#14 *(\\w*?)( .*)*\\}/g;6 22,1x,M;6 1y=E;6 2u=[];2v((22=2t.3N(s))!=E){1y=2t.1y;1x=22[1];M=s.2w(\'{#/14 \'+1x+\'}\',1y);a(M==-1){C j Z(\'15: m "\'+1x+\'" 2x 23 3O.\');}5.1c[1x]=s.2y(1y,M);2u[1x]=13.2z(22[2])}a(1y===E){5.1c[\'21\']=s;c}N(6 i 24 5.1c){a(i!=\'21\'){5.1N[i]=j m()}}N(6 i 24 5.1c){a(i!=\'21\'){5.1N[i].1w(5.1c[i],b.1m({},A||{},5.1N||{}),b.1m({},5.f,2u[i]));5.1c[i]=E}}};m.y.1w=9(s,A,f){a(s==F){5.1M.B(j 1g(\'\',1,5));c}s=s.U(/[\\n\\r]/g,\'\');s=s.U(/\\{\\*.*?\\*\\}/g,\'\');5.2p=b.1m({},5.1N||{},A||{});5.f=j 2A(f);6 p=5.1M;6 1P=s.1h(/\\{#.*?\\}/g);6 16=0,M=0;6 e;6 1i=0;6 25=0;N(6 i=0,l=(1P)?(1P.V):(0);i<l;++i){6 17=1P[i];a(1i){M=s.2w(\'{#/1z}\');a(M==-1){C j Z("15: 3P 1Q 3f 1z.");}a(M>16){p.B(j 1g(s.2y(16,M),1,5))}16=M+11;1i=0;i=b.3Q(\'{#/1z}\',1P);1R}M=s.2w(17,16);a(M>16){p.B(j 1g(s.2y(16,M),1i,5))}6 3R=17.1h(/\\{#([\\w\\/]+).*?\\}/);6 26=I.$1;2B(26){q\'3S\':++25;p.27();q\'a\':e=j 1A(17,p);p.B(e);p=e;D;q\'J\':p.27();D;q\'/a\':2v(25){p=p.28();--25}q\'/N\':q\'/29\':p=p.28();D;q\'29\':e=j 1n(17,p,5);p.B(e);p=e;D;q\'N\':e=2a(17,p,5);p.B(e);p=e;D;q\'1R\':q\'D\':p.B(j 18(26));D;q\'2C\':p.B(j 2D(17,5.2p));D;q\'h\':p.B(j 2E(17));D;q\'2F\':p.B(j 2G(17));D;q\'3T\':p.B(j 1g(\'{\',1,5));D;q\'3U\':p.B(j 1g(\'}\',1,5));D;q\'1z\':1i=1;D;q\'/1z\':a(m.R){C j Z("15: 3V 2H 3f 1z.");}D;2I:a(m.R){C j Z(\'15: 3W 3X: \'+26+\'.\');}}16=M+17.V}a(s.V>16){p.B(j 1g(s.3Y(16),1i,5))}};m.y.K=9(d,h,z,H){++H;6 $T=d,2b,2c;a(5.f.3b){$T=5.1v(d,{2d:(5.f.3a&&H==1),1S:5.f.1Z},5.Y)}a(!5.f.3c){2b=5.1u;2c=h}J{2b=5.1v(5.1u,{2d:(5.f.2q),1S:1f},5.Y);2c=5.1v(h,{2d:(5.f.2q&&H==1),1S:1f},5.Y)}6 $P=b.1m({},2b,2c);6 $Q=(z!=F)?(z):({});$Q.2s=5.2s;6 19=\'\';N(6 i=0,l=5.1M.V;i<l;++i){19+=5.1M[i].K($T,$P,$Q,H)}--H;c 19};m.y.2J=9(1T,1o){5.1u[1T]=1o};13=9(){};13.3d=9(3g){c 3g.U(/&/g,\'&3Z;\').U(/>/g,\'&3h;\').U(/</g,\'&3i;\').U(/"/g,\'&40;\').U(/\'/g,\'&#39;\')};13.20=9(d,1B,Y){a(d==E){c d}2B(d.2K){q 2A:6 o={};N(6 i 24 d){o[i]=13.20(d[i],1B,Y)}a(!1B.1S){a(d.41("2L"))o.2L=d.2L}c o;q 42:6 o=[];N(6 i=0,l=d.V;i<l;++i){o[i]=13.20(d[i],1B,Y)}c o;q 2M:c(1B.2d)?(Y(d)):(d);q 43:a(1B.1S){a(m.R)C j Z("15: 44 45 23 46.");J c F}2I:c d}};13.2z=9(2e){a(2e===E||2e===F){c{}}6 o=2e.47(/[= ]/);a(o[0]===\'\'){o.48()}6 2N={};N(6 i=0,l=o.V;i<l;i+=2){2N[o[i]]=o[i+1]}c 2N};6 1g=9(2O,1i,14){5.2f=2O;5.3j=1i;5.1d=14};1g.y.K=9(d,h,z,H){6 2g=5.2f;a(!5.3j){6 2P=5.1d;6 $T=d;6 $P=h;6 $Q=z;2g=2g.U(/\\{(.*?)\\}/g,9(49,3k){1C{6 1D=10(3k);a(1E 1D==\'9\'){a(2P.f.1Z||!2P.f.2r){c\'\'}J{1D=1D($T,$P,$Q)}}c(1D===F)?(""):(2M(1D))}1F(e){a(m.R){a(e 1G 18)e.1j="4a";C e;}c""}})}c 2g};6 1A=9(L,1H){5.2h=1H;L.1h(/\\{#(?:J)*a (.*?)\\}/);5.3l=I.$1;5.1p=[];5.1q=[];5.1I=5.1p};1A.y.B=9(e){5.1I.B(e)};1A.y.28=9(){c 5.2h};1A.y.27=9(){5.1I=5.1q};1A.y.K=9(d,h,z,H){6 $T=d;6 $P=h;6 $Q=z;6 19=\'\';1C{6 2Q=(10(5.3l))?(5.1p):(5.1q);N(6 i=0,l=2Q.V;i<l;++i){19+=2Q[i].K(d,h,z,H)}}1F(e){a(m.R||(e 1G 18))C e;}c 19};2a=9(L,1H,14){a(L.1h(/\\{#N (\\w+?) *= *(\\S+?) +4b +(\\S+?) *(?:12=(\\S+?))*\\}/)){L=\'{#29 2a.3m 3n \'+I.$1+\' 2H=\'+(I.$2||0)+\' 1Q=\'+(I.$3||-1)+\' 12=\'+(I.$4||1)+\' u=$T}\';c j 1n(L,1H,14)}J{C j Z(\'15: 4c 4d "3o": \'+L);}};2a.3m=9(i){c i};6 1n=9(L,1H,14){5.2h=1H;5.1d=14;L.1h(/\\{#29 (.+?) 3n (\\w+?)( .+)*\\}/);5.3p=I.$1;5.x=I.$2;5.W=I.$3||E;5.W=13.2z(5.W);5.1p=[];5.1q=[];5.1I=5.1p};1n.y.B=9(e){5.1I.B(e)};1n.y.28=9(){c 5.2h};1n.y.27=9(){5.1I=5.1q};1n.y.K=9(d,h,z,H){1C{6 $T=d;6 $P=h;6 $Q=z;6 1r=10(5.3p);6 1U=[];6 1J=1E 1r;a(1J==\'3q\'){6 2R=[];b.1e(1r,9(k,v){1U.B(k);2R.B(v)});1r=2R}6 u=(5.W.u!==F)?(10(5.W.u)):(($T!=E)?($T):({}));6 s=1V(10(5.W.2H)||0),e;6 12=1V(10(5.W.12)||1);a(1J!=\'9\'){e=1r.V}J{a(5.W.1Q===F||5.W.1Q===E){e=1V.4e}J{e=1V(10(5.W.1Q))+((12>0)?(1):(-1))}}6 19=\'\';6 i,l;a(5.W.1W){6 2S=s+1V(10(5.W.1W));e=(2S>e)?(e):(2S)}a((e>s&&12>0)||(e<s&&12<0)){6 1K=0;6 3r=(1J!=\'9\')?(4f.4g((e-s)/12)):F;6 1s,1k;N(;((12>0)?(s<e):(s>e));s+=12,++1K){1s=1U[s];a(1J!=\'9\'){1k=1r[s]}J{1k=1r(s);a(1k===F||1k===E){D}}a((1E 1k==\'9\')&&(5.1d.f.1Z||!5.1d.f.2r)){1R}a((1J==\'3q\')&&(1s 24 2A)){1R}6 3s=u[5.x];u[5.x]=1k;u[5.x+\'$3t\']=s;u[5.x+\'$1K\']=1K;u[5.x+\'$3u\']=(1K==0);u[5.x+\'$3v\']=(s+12>=e);u[5.x+\'$3w\']=3r;u[5.x+\'$1U\']=(1s!==F&&1s.2K==2M)?(5.1d.Y(1s)):(1s);u[5.x+\'$1E\']=1E 1k;N(i=0,l=5.1p.V;i<l;++i){1C{19+=5.1p[i].K(u,h,z,H)}1F(2T){a(2T 1G 18){2B(2T.1j){q\'1R\':i=l;D;q\'D\':i=l;s=e;D;2I:C e;}}J{C e;}}}1l u[5.x+\'$3t\'];1l u[5.x+\'$1K\'];1l u[5.x+\'$3u\'];1l u[5.x+\'$3v\'];1l u[5.x+\'$3w\'];1l u[5.x+\'$1U\'];1l u[5.x+\'$1E\'];1l u[5.x];u[5.x]=3s}}J{N(i=0,l=5.1q.V;i<l;++i){19+=5.1q[i].K($T,h,z,H)}}c 19}1F(e){a(m.R||(e 1G 18))C e;c""}};6 18=9(1j){5.1j=1j};18.y=Z;18.y.K=9(d){C 5;};6 2D=9(L,A){L.1h(/\\{#2C (.*?)(?: 4h=(.*?))?\\}/);5.1d=A[I.$1];a(5.1d==F){a(m.R)C j Z(\'15: 4i 3o 2C: \'+I.$1);}5.3x=I.$2};2D.y.K=9(d,h,z,H){6 $T=d;6 $P=h;1C{c 5.1d.K(10(5.3x),h,z,H)}1F(e){a(m.R||(e 1G 18))C e;}c\'\'};6 2E=9(L){L.1h(/\\{#h 1T=(\\w*?) 1o=(.*?)\\}/);5.x=I.$1;5.2f=I.$2};2E.y.K=9(d,h,z,H){6 $T=d;6 $P=h;6 $Q=z;1C{h[5.x]=10(5.2f)}1F(e){a(m.R||(e 1G 18))C e;h[5.x]=F}c\'\'};6 2G=9(L){L.1h(/\\{#2F 4j=(.*?)\\}/);5.2U=10(I.$1);5.2V=5.2U.V;a(5.2V<=0){C j Z(\'15: 2F 4k 4l 4m\');}5.2W=0;5.2X=-1};2G.y.K=9(d,h,z,H){6 2Y=b.O(z,\'1X\');a(2Y!=5.2X){5.2X=2Y;5.2W=0}6 i=5.2W++%5.2V;c 5.2U[i]};b.1a.1w=9(s,A,f){a(s.2K===m){c b(5).1e(9(){b.O(5,\'2i\',s);b.O(5,\'1X\',0)})}J{c b(5).1e(9(){b.O(5,\'2i\',j m(s,A,f));b.O(5,\'1X\',0)})}};b.1a.4n=9(1L,A,f){6 s=b.2Z({1t:1L,1Y:1f}).3y;c b(5).1w(s,A,f)};b.1a.4o=9(30,A,f){6 s=b(\'#\'+30).2O();a(s==E){s=b(\'#\'+30).3z();s=s.U(/&3i;/g,"<").U(/&3h;/g,">")}s=b.4p(s);s=s.U(/^<\\!\\[4q\\[([\\s\\S]*)\\]\\]>$/3A,\'$1\');s=s.U(/^<\\!--([\\s\\S]*)-->$/3A,\'$1\');c b(5).1w(s,A,f)};b.1a.4r=9(){6 1W=0;b(5).1e(9(){a(b.2j(5)){++1W}});c 1W};b.1a.4s=9(){b(5).3B();c b(5).1e(9(){b.3C(5,\'2i\')})};b.1a.2J=9(1T,1o){c b(5).1e(9(){6 t=b.2j(5);a(t===F){a(m.R)C j Z(\'15: m 2x 23 3D.\');J c}t.2J(1T,1o)})};b.1a.31=9(d,h){c b(5).1e(9(){6 t=b.2j(5);a(t===F){a(m.R)C j Z(\'15: m 2x 23 3D.\');J c}b.O(5,\'1X\',b.O(5,\'1X\')+1);b(5).3z(t.K(d,h,5,0))})};b.1a.4t=9(1L,h,G){6 X=5;G=b.1m({1j:\'4u\',1Y:1O,32:1f},G);b.2Z({1t:1L,1j:G.1j,O:G.O,3E:G.3E,1Y:G.1Y,32:G.32,3F:G.3F,4v:\'4w\',4x:9(d){6 r=b(X).31(d,h);a(G.2k){G.2k(r)}},4y:G.4z,4A:G.4B});c 5};6 2l=9(1t,h,2m,2n,1b,G){5.3G=1t;5.1u=h;5.3H=2m;5.3I=2n;5.1b=1b;5.3J=E;5.33=G||{};6 X=5;b(1b).1e(9(){b.O(5,\'34\',X)});5.35()};2l.y.35=9(){5.3K();a(5.1b.V==0){c}6 X=5;b.4C(5.3G,5.3I,9(d){6 r=b(X.1b).31(d,X.1u);a(X.33.2k){X.33.2k(r)}});5.3J=4D(9(){X.35()},5.3H)};2l.y.3K=9(){5.1b=b.3L(5.1b,9(o){a(b.4E.4F){6 n=o.36;2v(n&&n!=4G){n=n.36}c n!=E}J{c o.36!=E}})};b.1a.4H=9(1t,h,2m,2n,G){c j 2l(1t,h,2m,2n,5,G)};b.1a.3B=9(){c b(5).1e(9(){6 2o=b.O(5,\'34\');a(2o==E){c}6 X=5;2o.1b=b.3L(2o.1b,9(o){c o!=X});b.3C(5,\'34\')})};b.1m({38:9(s,A,f){c j m(s,A,f)},4I:9(1L,A,f){6 s=b.2Z({1t:1L,1Y:1f}).3y;c j m(s,A,f)},2j:9(z){c b.O(z,\'2i\')},4J:9(14,O,3M){c 14.K(O,3M,F,0)},4K:9(1o){m.R=1o}})})(b)}',62,295,'|||||this|var|||function|if|jQuery|return|||settings||param||new|||Template|||node|case||||extData|||_name|prototype|element|includes|push|throw|break|null|undefined|options|deep|RegExp|else|get|oper|se|for|data|||DEBUG_MODE|||replace|length|_option|that|f_escapeString|Error|eval||step|TemplateUtils|template|jTemplates|ss|this_op|JTException|ret|fn|objs|_templates_code|_template|each|false|TextNode|match|literalMode|type|cval|delete|extend|opFOREACH|value|_onTrue|_onFalse|fcount|ckey|url|_param|f_cloneData|setTemplate|tname|lastIndex|literal|opIF|filter|try|__tmp|typeof|catch|instanceof|par|_currentState|mode|iteration|url_|_tree|_templates|true|op|end|continue|noFunc|name|key|Number|count|jTemplateSID|async|disallow_functions|cloneData|MAIN|iter|not|in|elseif_level|op_|switchToElse|getParent|foreach|opFORFactory|_param1|_param2|escapeData|optionText|_value|__t|_parent|jTemplate|getTemplate|on_success|Updater|interval|args|updater|_includes|filter_params|runnable_functions|version|reg|_template_settings|while|indexOf|is|substring|optionToObject|Object|switch|include|Include|UserParam|cycle|Cycle|begin|default|setParam|constructor|toString|String|obj|val|__template|tab|arr|tmp|ex|_values|_length|_index|_lastSessionID|sid|ajax|elementName|processTemplate|cache|_options|jTemplateUpdater|run|parentNode|window|createTemplate||filter_data|clone_data|clone_params|escapeHTML|splitTemplates|of|txt|gt|lt|_literalMode|__1|_cond|funcIterator|as|find|_arg|object|_total|prevValue|index|first|last|total|_root|responseText|html|im|processTemplateStop|removeData|defined|dataFilter|timeout|_url|_interval|_args|timer|detectDeletedNodes|grep|parameter|exec|closed|No|inArray|ppp|elseif|ldelim|rdelim|Missing|unknown|tag|substr|amp|quot|hasOwnProperty|Array|Function|Functions|are|allowed|split|shift|__0|subtemplate|to|Operator|failed|MAX_VALUE|Math|ceil|root|Cannot|values|has|no|elements|setTemplateURL|setTemplateElement|trim|CDATA|hasTemplate|removeTemplate|processTemplateURL|GET|dataType|json|success|error|on_error|complete|on_complete|getJSON|setTimeout|browser|msie|document|processTemplateStart|createTemplateURL|processTemplateToText|jTemplatesDebugMode'.split('|'),0,{}))/**
 * jQuery.timers - Timer abstractions for jQuery
 * Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
 * Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
 * Date: 2009/10/16
 *
 * @author Blair Mitchelmore
 * @version 1.2
 *
 **/

jQuery.fn.extend({
	everyTime: function(interval, label, fn, times) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, times);
		});
	},
	oneTime: function(interval, label, fn) {
		return this.each(function() {
			jQuery.timer.add(this, interval, label, fn, 1);
		});
	},
	stopTime: function(label, fn) {
		return this.each(function() {
			jQuery.timer.remove(this, label, fn);
		});
	}
});

jQuery.extend({
	timer: {
		global: [],
		guid: 1,
		dataKey: "jQuery.timer",
		regex: /^([0-9]+(?:\.[0-9]*)?)\s*(.*s)?$/,
		powers: {
			// Yeah this is major overkill...
			'ms': 1,
			'cs': 10,
			'ds': 100,
			's': 1000,
			'das': 10000,
			'hs': 100000,
			'ks': 1000000
		},
		timeParse: function(value) {
			if (value == undefined || value == null)
				return null;
			var result = this.regex.exec(jQuery.trim(value.toString()));
			if (result[2]) {
				var num = parseFloat(result[1]);
				var mult = this.powers[result[2]] || 1;
				return num * mult;
			} else {
				return value;
			}
		},
		add: function(element, interval, label, fn, times) {
			var counter = 0;
			
			if (jQuery.isFunction(label)) {
				if (!times) 
					times = fn;
				fn = label;
				label = interval;
			}
			
			interval = jQuery.timer.timeParse(interval);

			if (typeof interval != 'number' || isNaN(interval) || interval < 0)
				return;

			if (typeof times != 'number' || isNaN(times) || times < 0) 
				times = 0;
			
			times = times || 0;
			
			var timers = jQuery.data(element, this.dataKey) || jQuery.data(element, this.dataKey, {});
			
			if (!timers[label])
				timers[label] = {};
			
			fn.timerID = fn.timerID || this.guid++;
			
			var handler = function() {
				if ((++counter > times && times !== 0) || fn.call(element, counter) === false)
					jQuery.timer.remove(element, label, fn);
			};
			
			handler.timerID = fn.timerID;
			
			if (!timers[label][fn.timerID])
				timers[label][fn.timerID] = window.setInterval(handler,interval);
			
			this.global.push( element );
			
		},
		remove: function(element, label, fn) {
			var timers = jQuery.data(element, this.dataKey), ret;
			
			if ( timers ) {
				
				if (!label) {
					for ( label in timers )
						this.remove(element, label, fn);
				} else if ( timers[label] ) {
					if ( fn ) {
						if ( fn.timerID ) {
							window.clearInterval(timers[label][fn.timerID]);
							delete timers[label][fn.timerID];
						}
					} else {
						for ( var fn in timers[label] ) {
							window.clearInterval(timers[label][fn]);
							delete timers[label][fn];
						}
					}
					
					for ( ret in timers[label] ) break;
					if ( !ret ) {
						ret = null;
						delete timers[label];
					}
				}
				
				for ( ret in timers ) break;
				if ( !ret ) 
					jQuery.removeData(element, this.dataKey);
			}
		}
	}
});

jQuery(window).bind("unload", function() {
	jQuery.each(jQuery.timer.global, function(index, item) {
		jQuery.timer.remove(item);
	});
});

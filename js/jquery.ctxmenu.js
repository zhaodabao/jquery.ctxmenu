/*! jQuery Contextmenu Plugin v1.0.2
Zhao Chengjia 2016-02-22 */
(function( $, undefined ) {

var _consts = {
		id: {
			ns: "ctxEventNS",
			prefix: "ctxContext-",
			ctxData: "ctxOpt",
			dynamic: "ctxDynamic",
			menu: "ctxMenu",
			enable: "ctxEnable",
			owners: "ctxOwners"
		},
		className: {
			popupDiv: "ctxmenu",
			cover: "cover",
			separator: "separator",
			hover: "hover",
			disabled: "disabled"
		}
	},
	_setting = {
		/* menu array, menu object format:
		{ id:string, image:string, text:string, action:function, disabled:boolean, children:array, separator:boolean }*/
		menu: null,
		mouseBtn: "right",
		minWidth: 120,
		maxWidth: 0,
		isHoverIntent: true, // requires jquery.hoverintent.js
		hoverIntentDelay: 400,
		animationDelay: 300, // requires jquery.easing.js
		animationMode: "easeOutBack"
	},
	menus = [],
	methods = {
		init: function( opts ) {
			opts = $.extend({}, _setting, opts);
			if ( !opts.menu || !$.isArray(opts.menu) ) return false;
			var $menu,
				_id = _consts.id,
				_class = _consts.className;
			$("." + _class.popupDiv).length > 0 && $("." + _class.popupDiv).remove();
			$menu = $("<div/>").append(build(opts.menu)).data(_id.dynamic, true).appendTo($("body"));
			return this.each(function() {
				var _s = $(this), eventNamespace = _id.prefix + (new Date().getTime());
				_s.data(_id.ns, eventNamespace).data(_id.ctxData, opts).data(_id.menu, $menu).data(_id.enable, true);
				!$menu.data(_id.owners) && $menu.data(_id.owners, []);
				$menu.data(_id.owners).push(_s);
				menus.push($menu);
				methods.refresh.call(_s, null);
				_s.bind(( opts.mouseBtn + "." + eventNamespace ), function( e ) {
					if ( !_s.data(_id.enable) ) return true;
					methods.show.apply(_s, [e.pageX, e.pageY]);
					return false;
				});
				$menu.find("li:not(.disabled)").each(function() {
					$(this).bind("click", function() {
						var _opt = $("div:first", $(this)).data("opt");
						$.isFunction(_opt.action) && _opt.action.call(this, _opt);
					});
				});
			});
		},
		refresh: function( opts ) {
			var _d, _id = _consts.id, _class = _consts.className;
			return this.each(function() {
				var _s = $(this),
					$menu = _s.data(_id.menu),
					adaptWidth,
					$ctx;
				_d = $.extend(_s.data(_id.ctxData), opts);
				// isHoverIntent is true but jquery.hoverintent.js does not exist, turn hoverIntent off
				_d.isHoverIntent && !$.fn.hoverIntent && (_d.isHoverIntent = false);
				$menu.removeClass(_class.popupDiv);
				$("li", $menu).removeClass(_class.hover);
				$("span", $menu).remove();
				$menu.addClass(_class.popupDiv);
				$ctx = $("<div/>").addClass(_class.popupDiv).appendTo("body");
				$("ul", $menu).each(function() {
					$ctx.html("");
					adaptWidth = 0;
					$ctx.html($(this).html());
					adaptWidth = $ctx.width() + 16;
					adaptWidth < _d.minWidth && ( adaptWidth = _d.minWidth );
					adaptWidth > _d.maxWidth && _d.maxWidth > 0 && ( adaptWidth = _d.maxWidth );
					$(this).width(adaptWidth);
					$(this).children("li").children("ul").css("left", adaptWidth);
				});
				$ctx.remove();
				$("li:has(ul)", $menu).each(function() {
					if ( !$(this).hasClass(_class.disabled) ) {
						$("div:first", this).append($("<span/>"));
						_d.isHoverIntent ?
							$(this).hoverIntent({ over: function() { open.call(this, _d); }, out: function() { close.call(this, _d); }, timeout: _d.hoverIntentDelay }) :
							$(this).hover(function() { open.call(this, _d); }, function() { close.call(this, _d); });
					}
				});
				$("li", $menu).each(function() {
					if ( !$(this).hasClass(_class.disabled) ) {
						$(this).click(function() {
							if ( $("ul", this).length < 1 ) {
								$("li", $menu).unbind("click");
								$menu.fadeOut(_d.animationDelay);
							}
							return false;
						});
					}
					$(this).hover(function() {
						$(this).parent().find("li." + _class.hover).removeClass(_class.hover);
						$(this).addClass(_class.hover);
					}, function() { $(this).removeClass(_class.hover); });
				});
			});

			function open( d ) {
				var left, top, pos1, pos2,
					$item = $(this),
					$cover = $item.children("." + _class.cover),
					$ul = $cover.children("ul").stop(true, true),
					spare = 20;
				$cover.show();
				left = $item.parent().width();
				top = $item.position().top + 6;
				$cover.css({ left: left, top: top, width: $ul.outerWidth() + spare, height: $ul.outerHeight(), overflow: "hidden" });
				pos1 = $cover.offset();
				pos2 = $.extend({}, pos1);
				forceViewport(pos2, $cover, true);
				pos2.top < pos1.top && $cover.css({ top: top + $item.outerHeight() - $cover.outerHeight() });
				if ( pos2.left < pos1.left ) {
					left = - $cover.width();
					$cover.css({ left: left });
					$ul.css({ left: $cover.width() }).animate({ left: spare }, d.animationDelay, d.animationMode, function() {
						$cover.css({ left: left + spare, width: $ul.outerWidth(), overflow: "visible" });
						$ul.css({ left: 0 });
					});
				} else {
					$ul.css({ left: - (left + 5) }).animate({ left: 0 }, d.animationDelay, d.animationMode, function() {
						$cover.css({ width: $ul.outerWidth(), overflow: "visible" });
					});
				}
			}

			function close( d ) {
				var $cover = $(this).children("." + _class.cover),
					$ul = $cover.children("ul").stop(true, true),
					left = $cover.position().left < 0 ? $ul.width() : - ($ul.width() + 5);
				$cover.css({ overflow: "hidden" });
				$ul.animate({ left: left }, d.animationDelay, d.animationMode, function() { $cover.hide(); });
			}
			
		},
		restore: function() {
			var _id = _consts.id;
			return this.each(function() {
				var _s = $(this), $menu = _s.data(_id.menu);
				_s.unbind("." + _s.data(_id.ns));
				$(window).unbind("keydown." + _s.data(_id.ns));
				$(document).unbind("click." + _s.data(_id.ns));
				$.each($menu.data(_id.owners), function( i ) { _s[0] === this && $menu.data(_id.owners).splice(i, 1); });
				if ( $menu.data(_id.owners).length < 1 ) {
					$.each(menus, function( i ) { $menu[0] === this && menus.splice(i, 1); });
					$menu.data(_id.dynamic) && $menu.remove();
				}
				_s.removeData(_id.ns);
				_s.removeData(_id.menu);
				_s.removeData(_id.ctxData);
				_s.removeData(_id.enable);
			});
		},
		show: function( x, y ) {
			if ( !x || !y ) {
				$.error("the position of the menu has not been specified");
				return false;
			}
			var $ctx = $(this).first(),
				$menu = $ctx.data(_consts.id.menu),
				_d = $ctx.data(_consts.id.ctxData),
				_visibility = $menu.css("visibility"), pos;
			$menu.css("visibility", "hidden").data(_consts.id.menu, $(this));
			pos = forceViewport({ top: y, left: x }, $menu, true);
			$menu.offset(pos).css("visibility", _visibility);
			if ( y > pos.top ) {
				var _h = $menu.height(), _t = pos.top;
				$menu.css({ height: 0, top: _t + _h }).show().animate({ height: _h, top: _t }, _d.animationDelay);
			} else $menu.slideDown(_d.animationDelay);
			return this;
		},
		hide: function() {
			var _id = _consts.id,
				_class = _consts.className,
				_delay = $(this).first().data(_id.menu).animationDelay;
			$.each(menus, function() {
				var _s = $(this);
				$("." + _class.hover, this).removeClass(_class.hover);
				$("ul:first ul", this).fadeOut(_delay);
				!!_s.data(_id.menu) && _s.removeData(_id.menu);
				_s.fadeOut(_delay);
			});
			return this;
		},
		disable: function( m ) {
			var _s = $(this),
				_id = _consts.id,
				_disabled = _consts.className.disabled;
			if ( !!m ) {
				var $menu = _s.data(_id.menu);
				m.charAt(0) === "" ? $("li" + m.replace(/ /g, "_"), $menu).addClass(_disabled) :
					$("div[action=\"" + m + "\"]", $menu).parent().addClass(_disabled);
			} else _s.data(_id.enable, false);
			return this;
		},
		enable: function( m ) {
			var _s = $(this),
				_id = _consts.id,
				_disabled = _consts.className.disabled;
			if ( !!m ) {
				var $menu = _s.data(_id.menu);
				m.charAt(0) === "" ? $("li" + m.replace(/ /g, "_"), $menu).removeClass(_disabled) :
					$("div[action=\"" + m + "\"]", $menu).parent().removeClass(_disabled);
			} else {
				_s.data(_id.enable, true);
				$("li", this).each(function() { $(this).removeClass(_disabled); });
			}
			return this;
		}
	},
	/* adjust the contextmenu, always displayed in the viewport */
	forceViewport = function( p, o, m ) {
		if ( p.top ) {
			if ( (p.top + o.height() + 10 - $(window).scrollTop()) > $(window).height() )
				p.top = m ? (p.top - o.height() - 5) : ($(window).height() + $(window).scrollTop() - o.height() - 5);
			if ( p.top < $(window).scrollTop() ) p.top = $(window).scrollTop();
		}
		if ( p.left ) {
			if ( (p.left + o.width() + 10 - $(window).scrollLeft()) > $(window).width() )
				p.left = $(window).width() - o.width() + $(window).scrollLeft() - 5;
			if ( p.left < $(window).scrollLeft() ) p.left = $(window).scrollLeft() - 5;
		}
		return p;
	},
	build = function( m ) {
		if ( !m || !$.isArray(m) ) return;
		var $ul = $("<ul/>"), $li, _class = _consts.className;
		$.each(m, function( i, n ) {
			if ( n.hidden ) return true;
			$li = $("<li/>").attr("id", n.id.replace(/ /g, "_")).append($("<div/>").data("opt", n).text(n.text));
			// fixed ie7- css bug, replace prepend with append
			!!n.image && $li.append($("<img/>").attr("src", n.image));
			!!n.separator && $li.addClass(_class.separator);
			!!n.disabled && $li.addClass(_class.disabled);
			$ul.append($li);
			!!n.children && $li.append(build(n.children));
		});
		return $("<div/>").addClass(_class.cover).append($ul);
	};

$.fn.extend({
	ctxmenu: function() {
		var m = arguments[0];
		if ( methods[m] ) {
			return methods[m].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if ( typeof m === "object" || !m ) {
			return methods.init.apply(this, arguments);
		} else {
			$.error("Method " + m + " does not exist in jquery.contextmenu");
			return this;
		}
	}
});

})( jQuery );
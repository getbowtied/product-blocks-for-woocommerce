jQuery(function($) {
	
	"use strict";

	//===============================================================
	// Global Throttle
	//===============================================================

	// Returns a function, that, as long as it continues to be invoked, will only
	// trigger every N milliseconds. If <code>immediate</code> is passed, trigger the 
	// function on the leading edge, instead of the trailing.

	window.gbt_gb_throttle = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			if ( !timeout ) timeout = setTimeout( later, wait );
			if (callNow) func.apply(context, args);
		};
	};

	window.gbt_category_card_animation = function(action, delay) {

		if (typeof action === "undefined" || action === null) action = '';
		if (typeof delay === "undefined" || delay === null) delay = 200;

		$('.wp-block-getbowtied-categories-grid').addClass('js_animated');

		if (action == 'reset') $('.wp-block-getbowtied-categories-grid.js_animated .gbt_18_category_grid_item').removeClass('visible animation_ready animated');

		$('.wp-block-getbowtied-categories-grid.js_animated .gbt_18_category_grid_item:not(.visible)').each(function() {
	    	if ( $(this).is(':visible') ) {                
                $(this).addClass('visible');
			}
		});

		$('.wp-block-getbowtied-categories-grid.js_animated .gbt_18_category_grid_item.visible:not(.animation_ready)').each(function(i) {
	    	$(this).addClass('animation_ready');
	    	$(this).delay(i*delay).queue(function(next) {
                $(this).addClass('animated');
                next();
            });
		});

		$('.wp-block-getbowtied-categories-grid.js_animated .gbt_18_category_grid_item.visible:first').prevAll().addClass('visible').addClass('animation_ready').addClass('animated');

	}

	$('.wp-block-getbowtied-categories-grid.js_animated').imagesLoaded( function() {
		gbt_category_card_animation();
	});

	$(window).resize(function() {
		gbt_gb_throttle(gbt_category_card_animation(), 300);
	});
	
    $(window).scroll(function() {
    	gbt_gb_throttle(gbt_category_card_animation(), 300);
    });

});
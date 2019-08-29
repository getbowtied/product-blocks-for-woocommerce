(function($) {

	"use strict";

	var swiper = [];
	var columns = [];
	var mobile;

	$(document).ready(function () {
		let _columns;


		$('.wp-block-getbowtied-carousel .gbt_18_swiper-container').each(function(i){
			let _this = $(this);
			columns.push($(this).attr('data-columns'));
			const next = $(this).siblings('.swiper-button-next');
			const prev = $(this).siblings('.swiper-button-prev');
			const spacer = $(this).attr('data-spaceBetween')
			console.log(next);
			console.log(prev);

			if ( $(window).width() < 768 ) {
				mobile = true;
				_columns = 2;
			} else {
				mobile = false;
				_columns = columns[i];
			}

			swiper.push(new Swiper ($(this), {
				direction: 'horizontal',
				loop: false,
				autoHeight: true,
				slidesPerView: _columns,
				spaceBetween: spacer,
				centerInsufficientSlides: true,
			    navigation: {
			    	nextEl: next,
			    	prevEl: prev,
			    },
			    pagination: {
			        el: '.swiper-pagination',
			        dynamicBullets: true,
			    },
			    on: {
			    	init: function() {
			    		_this.addClass('loaded');
			    	}
			    }
			}));
		})
  });

	$(window).resize(function(){
		if ( $(window).width() < 768 ) {
			if (mobile !== true) {
				for ( let i = 0; i < swiper.length; i++) {
					swiper[i].params.slidesPerView = 2;
					swiper[i].update();
				}
			mobile = true;
			}
		} else {
			if ( mobile !== false ) {
				for ( let i = 0; i < swiper.length; i++) {
					swiper[i].params.slidesPerView = columns[i];
					swiper[i].update();
				}
			mobile = false;
			}
		}
	})

} )(jQuery);

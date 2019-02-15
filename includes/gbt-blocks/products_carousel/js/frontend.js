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
				spaceBetween: 50,
				centerInsufficientSlides: true,
			    navigation: {
			    	nextEl: $('.swiper-button-next')[i],
			    	prevEl: $('.swiper-button-prev')[i],
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
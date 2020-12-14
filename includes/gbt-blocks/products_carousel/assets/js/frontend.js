(function($) {

	"use strict";

	var swiper = [];
	var columns = [];
	var mobile;

	$(function () {
		var _columns;


		$('.wp-block-getbowtied-carousel .gbt_18_swiper-container').each(function(i){
			var _this = $(this);
			columns.push($(this).attr('data-columns'));

			if ( $(window).width() < 768 ) {
				mobile = true;
				_columns = 2;
			} else {
				mobile = false;
				_columns = columns[i];
			}

			var data_id = $(this).attr('data-id');

			swiper.push( new Swiper ( '.swiper-' + data_id, {
				direction: 'horizontal',
				loop: false,
				autoHeight: true,
				slidesPerView: _columns,
				spaceBetween: parseInt($(this).attr('data-spaceBetween')),
				centerInsufficientSlides: true,
			    navigation: {
			    	nextEl: '.swiper-' + data_id + ' .swiper-button-next',
			    	prevEl: '.swiper-' + data_id + ' .swiper-button-prev',
			    },
			    pagination: {
			        el: '.swiper-' + data_id + ' .swiper-pagination',
			        dynamicBullets: true,
			    },
			    on: {
			    	init: function() {
			    		_this.addClass('loaded');
			    	}
			    }
			}));

			$(this).find('.swiper-wrapper').css('height', 'auto');
		})
  });

	$(window).on( 'resize', function(){
		if ( $(window).width() < 768 ) {
			if (mobile !== true) {
				for ( var i = 0; i < swiper.length; i++) {
					swiper[i].params.slidesPerView = 2;
					swiper[i].update();
				}
			mobile = true;
			}
		} else {
			if ( mobile !== false ) {
				for ( var i = 0; i < swiper.length; i++) {
					swiper[i].params.slidesPerView = columns[i];
					swiper[i].update();
				}
			mobile = false;
			}
		}
	});

} )(jQuery);

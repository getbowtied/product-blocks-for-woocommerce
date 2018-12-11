(function($) {

	"use strict";

	$(document).ready(function () {
		var swiper = [];
		$('.swiper-container').each(function(i){
			let _this = $(this);
			let columns = $(this).attr('data-columns');
			swiper.push(new Swiper ($(this), {
				direction: 'horizontal',
				loop: false,
				autoHeight: true,
				slidesPerView: columns,
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

} )(jQuery);
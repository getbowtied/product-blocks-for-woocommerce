(function($) {

	"use strict";

	$(document).ready(function () {
		var swiper = [];
		$('.swiper-container').each(function(){
			let columns = $(this).attr('data-columns');
			swiper.push(new Swiper ($(this), {
				direction: 'horizontal',
				loop: false,
				autoHeight: true,
				slidesPerView: columns,
				spaceBetween: 49,
				centerInsufficientSlides: true,
			    navigation: {
			    	nextEl: '.swiper-button-next',
			    	prevEl: '.swiper-button-prev',
			    },
			    pagination: {
			        el: '.swiper-pagination',
			        dynamicBullets: true,
			    },
			}));
		})
  });

} )(jQuery);
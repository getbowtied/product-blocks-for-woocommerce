(function($) {

	"use strict";

	$(document).ready(function () {
		var swiper = [];
		$('.swiper-container').each(function(){
			let columns = $(this).attr('data-columns');
			swiper.push(new Swiper ('.swiper-container', {
				direction: 'horizontal',
				loop: true,
				autoHeight: true,
				slidesPerView: columns,
			    navigation: {
			      nextEl: '.swiper-button-next',
			      prevEl: '.swiper-button-prev',
			    },
			}));
		})
  });

} )(jQuery);
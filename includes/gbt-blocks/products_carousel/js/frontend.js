(function($) {

	"use strict";

	$(document).ready(function () {
		var swiper = [];
		var swipermobile = [];
		$('.swiper-container:not(".mobile")').each(function(i){
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

		$('.swiper-container.mobile').each(function(i){
			let _this = $(this);
			swipermobile.push(new Swiper ($(this), {
				direction: 'horizontal',
				loop: false,
				autoHeight: true,
				slidesPerView: 1,
				spaceBetween: 20,
				centerInsufficientSlides: true,
			    // navigation: {
			    // 	nextEl: $('.swiper-button-next')[i],
			    // 	prevEl: $('.swiper-button-prev')[i],
			    // },
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
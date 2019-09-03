( function( $ ) {
	'use strict';

	var contentSlider = {
		init: function() {
			this.verticalContentSlider();
		},

		verticalContentSlider: function () {

			var defaultSlide = $('.gbt_18_default_slider');

			$(defaultSlide).each(function(){
				//VARIABLES
				var $this = this; //THIS SLIDE SELECTOR
				var activeImage = '.gbt_18_img .gbt_18_image_link.gbt_18_active'; // ACTIVE IMAGE SELECTOR
				var slideImage = '.gbt_18_img .gbt_18_image_link'; // ALL IMAGE SELECTOR
				var slideLength = $('.gbt_18_img_wrapper a', this).length < 9 ? '0' + ($('.gbt_18_img_wrapper a', this).length) : $('.gbt_18_img_wrapper a', this).length; //ADD 0 BEFORE SLIDE COUNT
				var slideCount = '<span class="gbt_18_number_of_items">' + slideLength + '</span>'; //SLIDE COUNT ELEMENT
				var slideLeft = '<span class="gbt_18_prev_slide"><i class="gbt_18_icon_down"></i></span>'; //BUTTON LEFT
				var slideRight = '<span class="gbt_18_next_slide"><i class="gbt_18_icon_up"></i></span>'; //BUTTON RIGHT
				var slideIndex = '<span class="gbt_18_current_slide">01</span>';
				var defaultItemActive = 1; // SET BY DEFAULT ACTIVE SLIDER ON PAGE LOAD;

				//CURENT SLIDE INDEX
				$('.gbt_18_slide_header', this).prepend(slideIndex);

				//APPEND SLIDE CONTROLS
				$('.gbt_18_slide_controls', this).append(slideLeft, slideRight);
				$('.gbt_18_img', this).append(`<div class="gbt_18_mobile_controls">${slideLeft + slideRight}</div>`);

				//APPEND SLIDE HEADER
				$('.gbt_18_slide_header', this).append(slideCount);

				//SET THE FIRST SLIDE AS DEFAULT SLIDE
				$('.gbt_18_image_link', this).eq(defaultItemActive - 1).addClass('gbt_18_active');
				$('.gbt_18_slide_content_item', this).eq(defaultItemActive - 1).addClass('gbt_18_active');
				$('.gbt_18_slide_link a').attr('href', $('.gbt_18_active input[name="slide-link"]').val());

				//SLIDE INDEX NUMBER
				function showSlideIndex(){
					var getCurentSlideIndex = $('.gbt_18_img .gbt_18_image_link.gbt_18_active', $this).index();
					setTimeout(function () {
						if (getCurentSlideIndex < 9) {
							$('.gbt_18_content .gbt_18_current_slide', $this).text('0' + (getCurentSlideIndex + 1));
						}
						else{
							$('.gbt_18_content .gbt_18_current_slide', $this).text(getCurentSlideIndex + 1);
						}
					}, 300);
				};

				//SET DEFAULT TEXT ANIMATION
				var activeContentSelector = $('.gbt_18_slide_content_item.gbt_18_active ', $this);

				activeContentSelector.prev().find('.gbt_18_slide_content_wrapper').css({
					transform: 'translateY(-10%)',
				});
				activeContentSelector.next().find('.gbt_18_slide_content_wrapper').css({
					transform: 'translateY(10%)',
				});
				activeContentSelector.find('.gbt_18_slide_content_wrapper').css({
					transform: 'translateY(0)',
				});

				function changeSlideContent(direction){

					var activeSlideIndex = $(activeImage, $this).index();

					if ( direction == 'up' ) {
						$('.gbt_18_slide_content_item.gbt_18_active .gbt_18_slide_content_wrapper').css({
							transform: 'translateY(10%)',
							opacity: '0',
						});
					} else {
						$('.gbt_18_slide_content_item.gbt_18_active .gbt_18_slide_content_wrapper').css({
							transform: 'translateY(-10%)',
							opacity: '0',
						});
					}

					setTimeout(continueAnimation, 700);

					function continueAnimation() {

						$('.gbt_18_slide_content_item', $this).eq(activeSlideIndex).addClass('gbt_18_active').siblings().removeClass('gbt_18_active');

						var activeContentSelector = $('.gbt_18_slide_content_item.gbt_18_active ', $this);

						activeContentSelector.prev().find('.gbt_18_slide_content_wrapper').css({
							transform: 'translateY(-10%)',
						});
						activeContentSelector.next().find('.gbt_18_slide_content_wrapper').css({
							transform: 'translateY(10%)',
						});
						activeContentSelector.find('.gbt_18_slide_content_wrapper').css({
							transform: 'translateY(0)',
							opacity: '1'
						});

						if (activeContentSelector.next('.gbt_18_slide_content_item').length == 0) {
							$('.gbt_18_slide_content_item', $this).eq(0).find('.gbt_18_slide_content_wrapper').css({
								transform: 'translateY(10%)',
							});

						}
						if (activeContentSelector.prev('.gbt_18_slide_content_item').length == 0){
							$('.gbt_18_slide_content_item', $this).eq(-1).find('.gbt_18_slide_content_wrapper').css({
								transform: 'translateY(-10%)',
							});
						}

						$('.gbt_18_slide_link a').attr('href', $('.gbt_18_active input[name="slide-link"]').val());
					}
				}
				//SET DEFAULT IMAGE ANIMATION
				$(slideImage, $this).eq(-1).animate({ opacity: 0}, {delay: 400}).css({
					transform: 'translateY(-100%)',
					opacity: '0',
				});
				$(activeImage, $this).animate({opacity: 1},{duration: 0}).css({
					transform: 'translateY(0)',
					opacity: '1',
				});
				$(activeImage, $this).next().animate({ opacity: 0}, {delay: 400}).css({
					transform: 'translateY(100%)',
					opacity: '0',
				});

				//INFINITY SLIDE AND ANIMATION CONTROL
				function infinitySlide(){
					if ($(activeImage, $this).next().length == 0) {

						$(slideImage, $this).removeAttr('style');

						$(activeImage, $this).prev().animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(-100%)',
							opacity: '0',
						});
						$(activeImage, $this).animate({opacity: 1},{duration: 0}).css({
							transform: 'translateY(0)',
							opacity: '1',
						});
						$(slideImage, $this).eq(0).animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(100%)',
							opacity: '0',
						});
					}
					else if($(activeImage, $this).prev().length == 0){

						$(slideImage, $this).removeAttr('style');

						$(activeImage, $this).next().animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(100%)',
							opacity: '0',
						});
						$(activeImage, $this).animate({opacity: 1},{duration: 0}).css({
							transform: 'translateY(0)',
							opacity: '1',
						});
						$(slideImage, $this).eq(-1).animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(-100%)',
							opacity: '0',
						});
					}
					else{

						$(slideImage, $this).removeAttr('style');

						$(activeImage, $this).animate({opacity: 1},{duration: 0}).css({
							transform: 'translateY(0)',
						});
						$(activeImage, $this).prev().animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(-100%)',
						});
						$(activeImage, $this).next().animate({ opacity: 0}, {delay: 400}).css({
							transform: 'translateY(100%)',
						});
					}
				}
				//SLIDE RIGHT FUNCTION
				function slideRightM(){
					////////////////////////////////////////
					if ($(activeImage, $this).next().length > 0) {
						$(activeImage, $this).removeClass('gbt_18_active').next().addClass('gbt_18_active');
					}
					else{
						$(slideImage, $this).removeClass('gbt_18_active').eq(0).addClass('gbt_18_active');
					}

					//CHANGE CONTENT
					changeSlideContent('down');

					//INFINITY SLIDE
					infinitySlide();

					//SLIDE INDEX SHOW VALUE
					showSlideIndex();

					$('.gbt_18_content .gbt_18_current_slide', $this).addClass('gbt_18_slide_up');

					$('.gbt_18_content .gbt_18_current_slide', $this).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
					   	function() {
					    	$(this).removeClass('gbt_18_slide_up');
						}
					);
				};

				//SLIDE LEFT FUNCTION
				function slideLeftM(){

					if ($(activeImage, $this).prev().length > 0) {
						$(activeImage, $this).removeClass('gbt_18_active').prev().addClass('gbt_18_active');
					}
					else{
						$(slideImage, $this).removeClass('gbt_18_active').eq(-1).addClass('gbt_18_active');
					}
					//CHANGE CONTENT
					changeSlideContent('up');

					//INFINITY SLIDE
					infinitySlide();

					//SLIDE INDEX SHOW VALUE
					showSlideIndex();

					$('.gbt_18_content .gbt_18_current_slide', $this).addClass('gbt_18_slide_down');

					$('.gbt_18_content .gbt_18_current_slide', $this).one('webkitAnimationEnd oanimationend msAnimationEnd animationend',
					   	function() {
					    	$(this).removeClass('gbt_18_slide_down');
					});
				}

				//CLICK NEXT SLIDE, STOP CLICK WHEN ANIMATION RUN
				$('.gbt_18_next_slide', this).on('click', function(e){
					if ($('.gbt_18_current_slide').hasClass('gbt_18_slide_up') || $('.gbt_18_current_slide').hasClass('gbt_18_slide_down')) {
						return false;
					}
					else{
						slideRightM();
					}

				});

				//CLICK PREV SLIDE, STOP CLICK WHEN ANIMATION RUN
				$('.gbt_18_prev_slide', this).on('click', function(){
					if ($('.gbt_18_current_slide').hasClass('gbt_18_slide_up') || $('.gbt_18_current_slide').hasClass('gbt_18_slide_down')) {
						return false;
					}
					else{
						slideLeftM();
					}
				});
			});
		}
	};
	$( document ).ready( function(){
		contentSlider.init();
	});
}( jQuery ) );

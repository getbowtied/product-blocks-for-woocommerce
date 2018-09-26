( function( $ ) {
	'use strict';

	var wooPlugin = {
		init: function() {
			this.wooSlidePlugin();
		},

		wooSlidePlugin: function () {

			var defaultSlide = $('.gbt_18_default_slider');

			$(defaultSlide).each(function(){
				//VARIABLES
				var $this = this; //THIS SLIDE SELECTOR
				var activeImage = '.gbt_18_img .gbt_18_image-link.gbt_18_active'; // ACTIVE IMAGE SELECTOR
				var slideImage = '.gbt_18_img .gbt_18_image-link'; // ALL IMAGE SELECTOR
				var slideLength = $('.gbt_18_img-wrapper a', this).length < 10 ? '0' + ($('.gbt_18_img-wrapper a', this).length) : $('.gbt_18_img-wrapper a', this).length; //ADD 0 BEFORE SLIDE COUNT
				var slideCount = '<span class="gbt_18_number_of_items">' + slideLength + '</span>'; //SLIDE COUNT ELEMENT
				var slideLeft = '<span class="gbt_18_prev_slide"><i class="gbt_18_icon_up"></i></span>'; //BUTTON LEFT
				var slideRight = '<span class="gbt_18_next_slide"><i class="gbt_18_icon_down"></i></span>'; //BUTTON RIGHT
				var slideIndex = '<span class="gbt_18_current_slide">01</span>'; 


				//CURENT SLIDE INDEX
				$('.gbt_18_slide_header', this).prepend(slideIndex);

				//APPEND SLIDE CONTROLS
				$('.gbt_18_slide_controls', this).append(slideLeft);
				$('.gbt_18_slide_controls', this).append(slideRight);

				//APPEND SLIDE HEADER
				$('.gbt_18_slide_header', this).append(slideCount);

				//SET THE FIRST SLIDE AS DEFAULT SLIDE
				$('.gbt_18_image-link', this).eq(0).addClass('gbt_18_active');

				//SLIDE INDEX NUMBER
				function showSlideIndex(){
					var getCurentSlideIndex = $('.gbt_18_img .gbt_18_image-link.gbt_18_active').index();
					setTimeout(function () {
						if (getCurentSlideIndex < 10) {
							$('.gbt_18_content .gbt_18_current_slide', $this).text('0' + (getCurentSlideIndex + 1));
						}
						else{
							$('.gbt_18_content .gbt_18_current_slide', $this).text(getCurentSlideIndex + 1);
						}
					}, 300);
				};

				//SET DEFAULT ANIMATION 
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
					if ($(activeImage).next().length == 0) {

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
				$('.gbt_18_slide_controls .gbt_18_next_slide', this).on('click', function(e){
					if ($('.gbt_18_current_slide').hasClass('gbt_18_slide_up') || $('.gbt_18_current_slide').hasClass('gbt_18_slide_down')) {
						return false;
					}
					else{
						slideRightM();
					}
					
				});

				//CLICK PREV SLIDE, STOP CLICK WHEN ANIMATION RUN
				$('.gbt_18_slide_controls .gbt_18_prev_slide', this).on('click', function(){
					if ($('.gbt_18_current_slide').hasClass('gbt_18_slide_up') || $('.gbt_18_current_slide').hasClass('gbt_18_slide_down')) {
						return false;
					}
					else{
						slideLeftM();
					}
				});
			});

		},
	};
	$( document ).ready( function(){
		wooPlugin.init();		
	});
}( jQuery ) );
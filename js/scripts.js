( function( $ ) {
	'use strict';

	var wooPlugin = {
		init: function() {
			this.wooSlidePlugin();
			this.expadingProduct();
			// this.snapScroll();
		},

		wooSlidePlugin: function () {

			var defaultSlide = $('.gbt_18_default_slider');

			$(defaultSlide).each(function(){
				//VARIABLES
				var $this = this; //THIS SLIDE SELECTOR
				var activeImage = '.gbt_18_img .gbt_18_image_link.gbt_18_active'; // ACTIVE IMAGE SELECTOR
				var slideImage = '.gbt_18_img .gbt_18_image_link'; // ALL IMAGE SELECTOR
				var slideLength = $('.gbt_18_img_wrapper a', this).length < 10 ? '0' + ($('.gbt_18_img_wrapper a', this).length) : $('.gbt_18_img_wrapper a', this).length; //ADD 0 BEFORE SLIDE COUNT
				var slideCount = '<span class="gbt_18_number_of_items">' + slideLength + '</span>'; //SLIDE COUNT ELEMENT
				var slideLeft = '<span class="gbt_18_prev_slide"><i class="gbt_18_icon_down"></i></span>'; //BUTTON LEFT
				var slideRight = '<span class="gbt_18_next_slide"><i class="gbt_18_icon_up"></i></span>'; //BUTTON RIGHT
				var slideIndex = '<span class="gbt_18_current_slide">01</span>'; 
				var defaultItemActive = 1; // SET BY DEFAULT ACTIVE SLIDER ON PAGE LOAD;

				//CURENT SLIDE INDEX
				$('.gbt_18_slide_header', this).prepend(slideIndex);

				//APPEND SLIDE CONTROLS
				$('.gbt_18_slide_controls', this).append(slideLeft);
				$('.gbt_18_slide_controls', this).append(slideRight);

				//APPEND SLIDE HEADER
				$('.gbt_18_slide_header', this).append(slideCount);

				//SET THE FIRST SLIDE AS DEFAULT SLIDE
				$('.gbt_18_image_link', this).eq(defaultItemActive - 1).addClass('gbt_18_active');
				$('.gbt_18_slide_content_item', this).eq(defaultItemActive - 1).addClass('gbt_18_active',);

				//SLIDE INDEX NUMBER
				function showSlideIndex(){
					var getCurentSlideIndex = $('.gbt_18_img .gbt_18_image_link.gbt_18_active').index();
					setTimeout(function () {
						if (getCurentSlideIndex < 10) {
							$('.gbt_18_content .gbt_18_current_slide', $this).text('0' + (getCurentSlideIndex + 1));
						}
						else{
							$('.gbt_18_content .gbt_18_current_slide', $this).text(getCurentSlideIndex + 1);
						}
					}, 300);
				};

				//SET DEFAULT TEXT ANIMATION 
				var activeContentSelector = $('.gbt_18_slide_content_item.gbt_18_active ', $this);

				activeContentSelector.prev().find('.gbt_18_slide_text, .gbt_18_slide_title').css({
					transform: 'translateY(-10%)',
				});
				activeContentSelector.next().find('.gbt_18_slide_text, .gbt_18_slide_title').css({
					transform: 'translateY(10%)',
				});
				activeContentSelector.find('.gbt_18_slide_text, .gbt_18_slide_title').css({
					transform: 'translateY(0)',
				});

				function changeSlideContent(){
					var activeSlideIndex = $(activeImage).index()

					$('.gbt_18_slide_content_item', $this).eq(activeSlideIndex).addClass('gbt_18_active').siblings().removeClass('gbt_18_active');

					var activeContentSelector = $('.gbt_18_slide_content_item.gbt_18_active ', $this);

					activeContentSelector.prev().find('.gbt_18_slide_text, .gbt_18_slide_title').css({
						transform: 'translateY(-10%)',
					});
					activeContentSelector.next().find('.gbt_18_slide_text, .gbt_18_slide_title').css({
						transform: 'translateY(10%)',
					});
					activeContentSelector.find('.gbt_18_slide_text, .gbt_18_slide_title').css({
						transform: 'translateY(0)',
					});

					if (activeContentSelector.next('.gbt_18_slide_content_item').length == 0) {
						$('.gbt_18_slide_content_item', $this).eq(0).find('.gbt_18_slide_text, .gbt_18_slide_title').css({
							transform: 'translateY(10%)',
						});

					}
					if (activeContentSelector.prev('.gbt_18_slide_content_item').length == 0){
						$('.gbt_18_slide_content_item', $this).eq(-1).find('.gbt_18_slide_text, .gbt_18_slide_title').css({
							transform: 'translateY(-10%)',
						});
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
					changeSlideContent();

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
					changeSlideContent();

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
		expadingProduct: function(){
			//PRODUCT SELECTORS
			var itemSelector = $('.gbt_18_expanding_grid .gbt_18_expanding_grid_item');
            var productImg;

            //EXPANDED SELECTORS
            var expandedContainer = $('.gbt_18_expanded_content');
            var expandedImg = $('.gbt_18_expanded_content .gbt_18_product_image_item:first-child img');
            var expandedBg = $('.gbt_18_expanded_bg');

            var x, y, z, w, q;
            var a, b, c, d;

            var bgValLeft,
            	bgValTop,
            	bgScaleWidthVal,
            	bgScaleHeightVal,
            	valLeft,
            	valTop,
            	scaleWidthVal,
            	scaleHeightVal;
            

            //OPEN MODAL
			$(itemSelector).on('click', function(e){
				$('.gbt_18_expanding_grid').width($('body').innerWidth());
				e.preventDefault();

				$('body').addClass('gbt_18_overflow');
				$('.gbt_18_expanded_content').addClass('gbt_18_visible').scrollTop(0);

				//PRODUCT IMG POSITION
				productImg = $(this).find('.gbt_18_feature_image img')
				productImg.css({opacity: 0});

				//ANIMATION VALUES CALCULATE
				
				//EXPANDED BACKGROUND VALUES
				bgValLeft = ((productImg.offset().left - $(document).scrollLeft()) - (expandedBg.offset().left - $(document).scrollLeft()))
				bgValTop = ((productImg.offset().top - $(document).scrollTop()) - (expandedBg.offset().top - $(document).scrollTop()))

				//BG SCALE VALUE
				bgScaleWidthVal = (productImg.width() / expandedBg.width())
				bgScaleHeightVal = (productImg.height() / expandedBg.height())

				//PRODUCT IMG VALUES
				valLeft = ((productImg.offset().left - $(document).scrollLeft()) - (expandedImg.offset().left - $(document).scrollLeft()))
				valTop = ((productImg.offset().top - $(document).scrollTop()) - (expandedImg.offset().top - $(document).scrollTop()))

				//PRDUCT IMAGE SCALE VALUE
				scaleWidthVal = (productImg.width() / expandedImg.width())
				scaleHeightVal = (productImg.height() / expandedImg.height())

				//BG ANIMATION FUNCTION
				

				$({moveX: bgValLeft, moveY: bgValTop, scaleX: bgScaleWidthVal.toFixed(2), scaleY: bgScaleHeightVal.toFixed(2)}).animate({
				    moveX: 0,
				    moveY: 0,
				    scaleX: 1,
				    scaleY:  1
				}, {
				    duration: 250,

				    step: function (now, fx) {

				        if (fx.prop == "moveX") {
				            a = now;
				        } else if (fx.prop == "moveY") {
				            b = now;
				        }
				        else if (fx.prop == "scaleX") {
				            c = now;
				        }
				        else if (fx.prop == "scaleY") {
				            d = now;
				        }
				       	expandedBg.css({
				        	transform: `translateX(${a}px) translateY(${b}px) scaleX(${c}) scaleY(${d})`,
				        	opacity: 1
				    	});
				    }
				});

				//PRODUCT IMAGE ANIMATION FUNCTION

				$({moveX: valLeft, moveY: valTop, scaleX: scaleWidthVal.toFixed(2), scaleY: scaleHeightVal.toFixed(2)}).animate({
				    moveX: 0,
				    moveY: 0,
				    scaleX: 1,
				    scaleY:  1
				}, {
				    duration: 250,
				    //easing: 'easeOutElastic',
				    step: function (now, fx) {

				        if (fx.prop == "moveX") {
				            x = now;
				        } else if (fx.prop == "moveY") {
				            y = now;
				        }
				        else if (fx.prop == "scaleX") {
				            z = now;
				        }
				        else if (fx.prop == "scaleY") {
				            w = now;
				        }
				        expandedImg.css({
				        	transform: `translateX(${x}px) translateY(${y}px) scaleX(${z}) scaleY(${w})`,
				        	opacity: 1,
				    	});
				    },
				});
				var delayTime;
				$('.gbt_18_expanded_content .gbt_18_product_image_item:nth-child(n + 2) img').each(function(i) {
					delayTime = (i + 1)
					$(this).delay( delayTime* 200 ).animate({opacity:1}, 350);
				});

				$('.gbt_18_close_content').animate({
						opacity: 1
					},{
						duration: 250,
						 
					});
				
				$('.gbt_18_product_details .summary > *').addClass('gbt_18_animated');

				$('.gbt_18_product_details .summary > *').each(function(i) {
				   $(this).css({
				   		transitionDelay: (i + 1)* 50 + 'ms'
				   });
				});
			});
			
			$('.gbt_18_close_content').on('click', function(){
				$('.gbt_18_close_content').css({ opacity: 0})
				$(this).animate({
					opacity: 0
				}, 250)
				$('.gbt_18_product_details .summary > *').removeClass('gbt_18_animated');
				$('.gbt_18_product_details .summary >').removeAttr('style');

				itemSelector.css('opacity', '1');
            	
            	$('.gbt_18_product_image_item:nth-child(n + 2) img').css({opacity: 0});
            	
		    	//REVERSE IMAGE ANIMATION
        		$({moveX: 0, moveY: 0, scaleX: 1, scaleY: 1}).animate({
				    moveX: valLeft,
				    moveY: valTop,
				    scaleX: scaleWidthVal.toFixed(2),
				    scaleY:  scaleHeightVal.toFixed(2)
				}, {
				    duration: 250,
				    //easing: 'easeOutElastic',
				    step: function (now, fx) {

				        if (fx.prop == "moveX") {
				            x = now;
				        } else if (fx.prop == "moveY") {
				            y = now;
				        }
				        else if (fx.prop == "scaleX") {
				            z = now;
				        }
				        else if (fx.prop == "scaleY") {
				            w = now;
				        }
				        expandedImg.css({
				        	transform: `translateX(${x}px) translateY(${y}px) scaleX(${z}) scaleY(${w})`,
				    	});
				    },
				    complete:  function() { 
						expandedImg.css({
							transform: 'translateX(0px) translateY(0px) scaleX(1) scaleY(1)',
							opacity: 0,
						})
						productImg.css({
							opacity: 1,
						})
						$('.gbt_18_expanded_content').removeClass('gbt_18_visible');
						$('body').removeClass('gbt_18_overflow');
					}

				});
				

        		$({moveX: 0, moveY: 0, scaleX: 1, scaleY: 1}).animate({
				    moveX: bgValLeft,
				    moveY: bgValTop,
				    scaleX: bgScaleWidthVal.toFixed(2),
				    scaleY:  bgScaleHeightVal.toFixed(2)
				}, {
				    duration: 250,

				    step: function (now, fx) {

				        if (fx.prop == "moveX") {
				            a = now;
				        } else if (fx.prop == "moveY") {
				            b = now;
				        }
				        else if (fx.prop == "scaleX") {
				            c = now;
				        }
				        else if (fx.prop == "scaleY") {
				            d = now;
				        }
				       	expandedBg.css({
				        	transform: `translateX(${a}px) translateY(${b}px) scaleX(${c}) scaleY(${d})`,
				    	});
				    },
				    complete:  function() { 
						expandedBg.css({
							transform: 'translateX(0px) translateY(0px) scaleX(1) scaleY(1)',
							opacity: 0
						})
					}
				});
			});
		},

		// snapScroll: function(){
		// 	if ($('.gbt_18_product_lookbook').length >= 1) {
				
		// 	}
			

		// }
	};
	$( document ).ready( function(){
		wooPlugin.init();		
	});
}( jQuery ) );
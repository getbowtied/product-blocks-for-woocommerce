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
			var itemSelector = $('.gbt_18_expanding_grid .gbt_18_expanding_grid_item')
            var productTitle = $('.gbt_18_product-info .gbt_18_product_title span');
            var productPrice = $('.gbt_18_product-info .gbt_18_product_price');
            var productImg =  $('.gbt_18_feature_image img');

            //EXPANDED SELECTORS
            var expandedContainer = $('.gbt_18_expanded_content');
            var productDetailsImg = $('.gbt_18_product_image img');
            var productDetailsTitle = $('.gbt_18_details_title');
            var productDetailsPrice = $('.gbt_18_details_price');
            
            //OPEN MODAL
			$(itemSelector).on('click', function(){

				$('.gbt_18_expanded_content').addClass('gbt_18_visible');
				$('body').addClass('gbt_18_overflow');
				//GET PRDUCT CONENT
				//var getProductImgLink = $(this).find(productImg).attr('src');
				var getProductTitle = $(this).find( productTitle).html();
				var getProductPrice = $(this).find(productPrice).html();

				expandedContainer.find(productDetailsTitle).html(getProductTitle);
				expandedContainer.find(productDetailsPrice).html(getProductPrice);

				$(this).find('.gbt_18_feature_image img').css('opacity', '0');
            	
				//PRODUCT IMG POSITION
				var productImg = $(this).find('.gbt_18_feature_image img');
				var offset = productImg.offset()
				var photoOffsetTop = offset.top - $(document).scrollTop()
				var photoOffsetLeft = offset.left - $(document).scrollLeft()

				//PRODUCT IMG EXPANDED POSITION
				var expandedImg = $('.gbt_18_expanded_content .gbt_18_product_image_item:first-child');
				var expandedOffset = expandedImg.offset()
				var expandedPhotoOffsetTop = expandedOffset.top - $(document).scrollTop()
				var expandedPhotoOffsetLeft = expandedOffset.left - $(document).scrollLeft()

				//PRODUCT BACKGROUND POSITION
				var expandedBg = $('.gbt_18_expanded_bg');
				var expandedBgOffset = expandedBg.offset();
				var expandedBgOffsetTop = expandedBgOffset.top - $(document).scrollTop()
				var expandedBgOffsetLeft = expandedBgOffset.left - $(document).scrollLeft()

				//ANIMATION VALUES CALCULATE
				
				//EXPANDED BACKGROUND VALUES
				var bgValLeft = (photoOffsetLeft - expandedBgOffsetLeft)
				var bgValTop = (photoOffsetTop - expandedBgOffsetTop)

				//BG SCALE VALUE
				var bgScaleWidthVal = (productImg.width() / expandedBg.width())
				var bgScaleHeightVal = (productImg.height() / expandedBg.height())

				//PRODUCT IMG VALUES
				var valLeft = (photoOffsetLeft - expandedPhotoOffsetLeft)
				var valTop = (photoOffsetTop - expandedPhotoOffsetTop)

				//PRDUCT IMAGE SCALE VALUE
				var scaleWidthVal = (productImg.width() / expandedImg.width())
				var scaleHeightVal = (productImg.height() / expandedImg.height())

				//BG ANIMATION FUNCTION
				var a,b,c,d;

				$({moveX: bgValLeft, moveY: bgValTop, scaleX: bgScaleWidthVal.toFixed(2), scaleY: bgScaleHeightVal.toFixed(2)}).animate({
				    moveX: 0,
				    moveY: 0,
				    scaleX: 1,
				    scaleY:  1
				}, {
				    duration: 600,

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
				var x, y, z, w;

				$({moveX: valLeft, moveY: valTop, scaleX: scaleWidthVal.toFixed(2), scaleY: scaleHeightVal.toFixed(2)}).animate({
				    moveX: 0,
				    moveY: 0,
				    scaleX: 1,
				    scaleY:  1
				}, {
				    duration: 600,

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
				        	opacity: 1
				    	});
				    }
				});
				$('.gbt_18_expanded_content .gbt_18_product_image_item:nth-child(n + 2)').each(function(i) {
				   $(this).delay( (i + 1)* 300 ).animate({opacity:1}, 600);
				});
				$('.gbt_18_product_details, .gbt_18_close_content').stop().delay(600).animate({
					opacity: 1
				}, 600);
			});
			

			
			//CLOSE MODAL
			$('.gbt_18_close_content').on('click', function(){
				$('.gbt_18_expanded_content').removeClass('gbt_18_visible');
				itemSelector.css('opacity', '1');
            	productImg.css('opacity', '1');
            	expandedContainer.scrollTop(0);
            	$('.gbt_18_expanded_content .gbt_18_product_image_item,.gbt_18_product_details, .gbt_18_close_content').css({
            		opacity: 0
            	});	
			});
			//GET PRODUCT INFORMATION
			
			
	        
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
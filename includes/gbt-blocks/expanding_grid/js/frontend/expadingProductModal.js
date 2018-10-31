( function( $ ) {
	'use strict';

	var expadingProductModal = {
		init: function() {
			this.expadingProduct();
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

				var id = $(this).attr('id');

				$('body').addClass('gbt_18_overflow');
				$('#'+id+'.gbt_18_expanded_content').addClass('gbt_18_visible').scrollTop(0);
				$('#'+id+'.gbt_18_expanded_content').css({opacity: 1});

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
	};

	$( document ).ready( function(){
		expadingProductModal.init();		
	});
	
}( jQuery ) );
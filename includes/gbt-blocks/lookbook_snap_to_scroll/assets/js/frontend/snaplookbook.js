( function( $ ) {
	'use strict';

	var snapLookbook = {
		init: function() {
			this.snapScrollFunction();
			// this.hoverImageFunction();
		},

		snapScrollFunction: function(){
			$.scrollify({
				section:".gbt_18_look_book_item",
			    scrollbars: false,
			    overflowScroll: false,
			   	standardScrollElements: ".scroll-wrapper",
			   	updateHash: false,
			    before:function(i,panels) {

					var ref = panels[i].attr("data-section-name");

					$(".gbt_18_pagination .gbt_18_active").removeClass("gbt_18_active");

					$(".gbt_18_pagination").find(`a[href="#${ref}"]`).addClass("gbt_18_active");

					//SET DATA SECTION NAME VALUE

			    },
			    afterRender:function() {

			      	$("header").append('<div class="gbt_18_pagination"></div>');

			      	var getDataValue;
			      	var activeClass;
			      	var lookBookImage;
			      	var getItemIndex;

			      	// $('.scroll-wrapper').on('scroll', function(){
 			      // 		var scrollIsBottom = $(this).prop('scrollHeight') - $(this).innerHeight();
 			      // 		// console.log($(this).scrollTop())
			      	// 	if ($(this).scrollTop() == 0) {
			      	// 		//console.log('move up');
			      	// 		$.scrollify.previous();
			      	// 	}
			      	// 	else if( $(this).scrollTop() == scrollIsBottom ){
			      	// 		//console.log('move down');
			      	// 		$.scrollify.next();
			      	// 	}
			      	// });

			      	$(".gbt_18_look_book_item").each(function(i) {

			      		i = (i + 1);

			      		$(this).attr("data-section-name", i );
			        	
			        	getDataValue = $(this).attr("data-section-name",);

			        	getItemIndex = (($(this).index() + 1) < 10) ? '0' + ($(this).index() + 1) : $(this).index() + 1;
			        	
			        	lookBookImage = $(this).find('.gbt_18_look_item:first-child .gbt_18_look_product_image img');
                     
			        	(i===0) ? activeClass = "gbt_18_active" : activeClass = "";
			        	
			        	$('.gbt_18_shop_this_book', this).prepend(`<span class="gbt_18_current_book">${(i < 10) ? '0' + (i - 1) : (i - 1) }</span>`);

			        	if (lookBookImage.length == 0) {
			        		$(".gbt_18_pagination").append(
				        		`<div class="gbt_18_snap_page">
					        		<a class="${activeClass}" href="#${getDataValue}">
					        			<span> ${getItemIndex}</span>
					        		</a>
					        	</div>`
				        	);
			        	}
			        	else{
			        		$(".gbt_18_pagination").append(
				        		`<div class="gbt_18_snap_page">
					        		<a class="${activeClass}" href="#${getDataValue}">
					        			<span> ${getItemIndex}</span>
					        		</a>
					        		<div class="gbt_18_hover_image">
					        			<img src="${lookBookImage.attr('src')}" alt="">
					        		</div>
					        	</div>`
				        	);
			        	}
			      	});

			      
					$(".gbt_18_pagination a").on("click",function(e) {
						e.preventDefault();
						$.scrollify.move($(this).attr("href"));
					});

					$('.gbt_18_scroll_down_button').on('click',function(){
						$.scrollify.next();
					});

			    }
			});
		},
		hoverImageFunction: function(){

			var getImageWidth;

			$('.gbt_18_look_book_type_inline .gbt_18_look_item .gbt_18_look_product_title').on({
				mouseenter: function() {
					getImageWidth = $( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image img').width();
						$( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image').animate({width: getImageWidth + 'px', opacity: 1}, 500);
			  	},
			  	mouseleave: function() {
			  			$( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image').animate({width: 0, opacity: 0},500);
			  	}
			});
		}
	};

	$( document ).ready( function(){
		snapLookbook.init();		
	});

    let canSnap = true;

	$(document).on('DOMMouseScroll mousewheel', '.scroll-wrapper', function(ev) {
	    var $this = $(this),
	        scrollTop = this.scrollTop,
	        scrollHeight = this.scrollHeight,
	        height = $this.innerHeight(),
	        delta = (ev.type == 'DOMMouseScroll' ?
	            ev.originalEvent.detail * -40 :
	            ev.originalEvent.wheelDelta),
	        up = delta > 0;

	    var prevent = function() {
	        ev.stopPropagation();
	        ev.preventDefault();
	        ev.returnValue = false;
	        return false;
	    }

	    if (!up && -delta > scrollHeight - height - scrollTop) {
	    	if (canSnap === true) {
	    		canSnap = false;
		    	setTimeout(function(){
		    		console.log('triggering next');
			    	$.scrollify.next();
			    	canSnap = true;
	    		}, 300);
		    };
	        return prevent();
	    } else if (up && delta > scrollTop) {
	        if (canSnap === true) {
	        	canSnap = false;
		    	setTimeout(function(){
		    		console.log('trigger previous');
			    	$.scrollify.previous();
			    	canSnap = true;
	    		}, 300);
		    };
	        return prevent();
	    }
	});
	
}( jQuery ) );
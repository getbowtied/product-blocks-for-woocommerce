( function( $ ) {
	'use strict';

	var snapLookbook = {
		init: function() {
			this.snapScrollFunction();
			this.hoverImageFunction();
		},

		snapScrollFunction: function(){
			$.scrollify({
				section:".gbt_18_look_book_item",
			    scrollbars:true,
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
			      	$(".gbt_18_look_book_item").each(function(i) {

			      		i = (i + 1);

			      		$(this).attr("data-section-name", i );
			        	
			        	getDataValue = $(this).attr("data-section-name",);

			        	getItemIndex = (($(this).index() + 1) < 10) ? '0' + ($(this).index() + 1) : $(this).index() + 1;
			        	
			        	lookBookImage = $(this).find('.gbt_18_look_item:first-child .gbt_18_look_product_image img');
                     
			        	(i===0) ? activeClass = "gbt_18_active" : activeClass = "";
			        	
			        	$('.gbt_18_shop_this_book', this).prepend(`<span class="gbt_18_current_book">${(i < 10) ? '0' + i : i }</span>`);

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
			var endAnimation = false;
			$('.gbt_18_look_book_type_inline .gbt_18_look_item .gbt_18_look_product_title').on({
				mouseenter: function() {
					getImageWidth = $( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image img').width();
					if (!endAnimation) {
						$( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image').animate({width: getImageWidth + 'px', opacity: 1},350, function(){
				    		endAnimation = true;
				    	});
					}
			  	},
			  	mouseleave: function() {

			  		if (endAnimation) {
			  			$( this ).closest('.gbt_18_look_item').find('.gbt_18_look_product_image').animate({width: 0, opacity: 0},350 , function(){
							endAnimation = false;
			  			});
			  		}
			    	
			  	}
			});
		}
	};

	$( document ).ready( function(){
		snapLookbook.init();		
	});
	
}( jQuery ) );
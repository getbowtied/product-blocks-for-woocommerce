( function( $ ) {
	'use strict';

	var snapLookbook = {
		init: function() {
			this.snapScrollFunction();
		},

		snapScrollFunction: function(){
			$.scrollify({
				section:".gbt_18_look_book_item",
			    scrollbars:true,
			   	updateHash: false,
			    before:function(i,panels) {

					var ref = panels[i].attr("data-section-name");

					$(".gbt_18_pagination .gbt_18_active").removeClass("gbt_18_active");

					$(".gbt_18_pagination").find("a[href=\"#" + ref + "\"]").addClass("gbt_18_active");

					//SET DATA SECTION NAME VALUE

			    },
			    afterRender:function() {

			      	$("header").append('<div class="gbt_18_pagination"></div>');

			      	var getDataValue;
			      	var activeClass;
			      	var lookBookImage;
			      	$(".gbt_18_look_book_item").each(function(i) {

			      		$(this).attr("data-section-name", i + 1);
			        	
			        	getDataValue = $(this).attr("data-section-name");
			        	
			        	lookBookImage = $(this).find('.gbt_18_look_item:first-child .gbt_18_look_product_image img');

			        	(i===0) ? activeClass = "gbt_18_active" : activeClass = "";
			        	
			        	if (lookBookImage.length == 0) {
			        		$(".gbt_18_pagination").append(
				        		`<div class="gbt_18_snap_page">
					        		<a class="${activeClass}" href="#${getDataValue}">
					        			<span> ${getDataValue}</span>
					        		</a>
					        	</div>`
				        	);
			        	}
			        	else{
			        		$(".gbt_18_pagination").append(
				        		`<div class="gbt_18_snap_page">
					        		<a class="${activeClass}" href="#${getDataValue}">
					        			<span> ${getDataValue}</span>
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
	};

	$( document ).ready( function(){
		snapLookbook.init();		
	});
	
}( jQuery ) );
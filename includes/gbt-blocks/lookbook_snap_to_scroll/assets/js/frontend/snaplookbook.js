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
			    // scrollbars: false,
			    overflowScroll: true,
			   	// standardScrollElements: ".scroll-wrapper",
			   	// updateHash: false,
			    before:function(idx, panels) {

			    	for ( let j = 0; j < panels.length; j++) {
			    		$(panels[j]).removeClass('active');

			    	}

					var ref = panels[idx].attr("data-section-name");

					$(".gbt_18_pagination .gbt_18_active").removeClass("gbt_18_active");

					$(".gbt_18_pagination").find(`a[href="#${ref}"]`).addClass("gbt_18_active");

					//SET DATA SECTION NAME VALUE
			    },
			    after: function(idx, panels){
			    	for ( let j = 0; j < panels.length; j++) {
			    		$(panels[j]).scrollTop(0);
			    	}
			    	$(panels[idx]).addClass('active');
			    },
			    afterRender:function(e) {

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

	// function getOffset( el ) {
	//     var _x = 0;
	//     var _y = 0;
	//     while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
	//         _x += el.offsetLeft - el.scrollLeft;
	//         _y += el.offsetTop - el.scrollTop;
	//         el = el.offsetParent;
	//     }
	//     return { top: _y, left: _x };
	// }
	// var x = getOffset( document.getElementById('yourElId') ).left; 

	// function centerLookbook() {
	// 	let element =  document.getElementsByClassName('gbt_18_snap_look_book')[0];
	// 	let rect = getOffset( element );
	// 	console.log(rect);
	// 	element.style.marginLeft = -rect.left + "px"; 
	// }

	$( document ).ready( function(){
		// centerLookbook();
		snapLookbook.init();
	});

	// let doit;
	// window.onresize = function(){
	//   clearTimeout(doit);
	//   doit = setTimeout(centerLookbook, 100);
	// };


	
}( jQuery ) );
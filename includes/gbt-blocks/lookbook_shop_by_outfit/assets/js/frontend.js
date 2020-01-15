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
			    overflowScroll: true,
			    before:function(idx, panels) {

			    	for ( var j = 0; j < panels.length; j++) {
			    		$(panels[j]).removeClass('active');

			    	}

					var ref = panels[idx].attr("data-section-name");

					$(".gbt_18_pagination .gbt_18_active").removeClass("gbt_18_active");

					$(".gbt_18_pagination").find('a[href="#' + ref + '"]').addClass("gbt_18_active");

					//SET DATA SECTION NAME VALUE
			    },
			    after: function(idx, panels){
			    	for ( var j = 0; j < panels.length; j++) {
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

			      	$(".gbt_18_look_book_item").each(function(i) {

			      		i = (i + 1);

			      		$(this).attr("data-section-name", i );

			        	getDataValue = $(this).attr("data-section-name");

			        	getItemIndex = (($(this).index() + 1) < 10) ? '0' + ($(this).index() + 1) : $(this).index() + 1;

			        	lookBookImage = $(this).find('.gbt_18_look_thumb img');

			        	(i===0) ? activeClass = "gbt_18_active" : activeClass = "";
						var num = i - 1;
						(i < 10) ? num = '0' + (i - 1) : num = i - 1;
			        	$('.gbt_18_shop_this_book', $(this)).prepend('<span class="gbt_18_current_book">' + num + '</span>');

			        	if (lookBookImage.length == 0) {
			        		$(".gbt_18_pagination").append('<div class="gbt_18_snap_page"><a class="' + activeClass + '" href="#' + getDataValue + '"><span> ' + getItemIndex + '</span></a></div>');
			        	}
			        	else{
			        		$(".gbt_18_pagination").append('<div class="gbt_18_snap_page"><a class="' + activeClass + '" href="#' + getDataValue + '"><span> ' + getItemIndex + '</span></a><div class="gbt_18_hover_image"><img src="' + lookBookImage.attr('src') + '}" alt=""></div></div>');
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


	function gbt_18_lookbook_pagination() {
		$("header").append('<div class="gbt_18_pagination"></div>');

      	var getDataValue;
      	var activeClass;
      	var lookBookImage;
      	var getItemIndex;

      	$(".gbt_18_look_book_item").each(function(i, el) {

      		$(this).attr("data-section-name", i );

        	getDataValue = $(this).attr("data-section-name");

        	getItemIndex = (($(this).index()) < 10) ? '0' + ($(this).index()) : $(this).index();

        	lookBookImage = $(this).find('.gbt_18_look_thumb img');

        	(i===0) ? activeClass = "gbt_18_active" : activeClass = "";

			var num = i;
			(i < 10) ? num = '0' + i : num = i;

        	$('.gbt_18_shop_this_book', $(this)).prepend('<span class="gbt_18_current_book">' + num + '</span>');

        	if (lookBookImage.length == 0) {
        		$(".gbt_18_pagination").append('<div class="gbt_18_snap_page"><a class="' + activeClass + '" href="#' + getDataValue + '"><span> ' + getItemIndex + '</span></a></div>');
        	}
        	else{
        		$(".gbt_18_pagination").append('<div class="gbt_18_snap_page"><a class="' + activeClass + '" href="#' + getDataValue + '"><span> ' + getItemIndex + '</span></a><div class="gbt_18_hover_image"><img src="' + lookBookImage.attr('src') + '" alt=""></div></div>');
        	}
      	});


		$(".gbt_18_pagination a").on("click",function(e) {
			e.preventDefault();
			var section = $(this).attr('href').substr(1);
			$('html, body').animate({
				scrollTop: $('.gbt_18_look_book_item[data-section-name="'+section+'"]').offset().top
			}, 500);
		});

		$('.gbt_18_scroll_down_button').on('click',function(){
			if ($('.gbt_18_look_book_item[data-section-name="1"]').length) {
				$('html, body').animate({
					scrollTop: $('.gbt_18_look_book_item[data-section-name="1"]').offset().top
				}, 500);
			}
		});
	}

	function gbt_18_isScrolledIntoView(elem)
	{
	    var docViewTop = $(window).scrollTop();
	    var docViewBottom = docViewTop + $(window).height();

	    var elemTop = elem.offset().top;
	    var elemBottom = elemTop + elem.height();

	    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
	}

	$(function() {
		gbt_18_lookbook_pagination();
	});

}( jQuery ) );

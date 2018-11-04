(function( $ ) {

    'use strict';

  $('.gbt_18_editor_slide_content.slider').each(function(){
  	console.log('test');
	$(this).slick({
		slidesToShow: 1,
		arrows: true,
		fade: false,
		dots: false,
		swipe: false,
		touchMove: false,
		draggable: false,
		zIndex: -1,
		adaptiveHeight: true,
		vertical: true
	});
});

} )( jQuery );
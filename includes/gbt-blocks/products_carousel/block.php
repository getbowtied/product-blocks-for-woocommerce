<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_products_carousel( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'		=> '',
		'align'				=> 'center',
		'queryOrder'		=> '',
		'columns'			=> 3,
		'queryDisplayType'	=> 'all_products'
	), $attributes ) );
	

	switch ( $queryOrder ) {
		case 'date_desc':
			$orderby= 'date';
			$order= 'desc';
		break;
		case 'date_asc':
			$orderby= 'date';
			$order= 'asc';
		break;
		case 'title_desc':
			$orderby= 'title';
			$order= 'desc';
		break;
		case 'title_asc':
			$orderby= 'title';
			$order= 'asc';
		break;
		default: 
			$orderby = 'none';
			$order = '';
		break;
	}

	if ( $queryDisplayType == 'specific') {
		$orderby = 'post__in';
	}

	$args = [
		'post_type' 		=> 'product',
		'status' 			=> 'publish',
		'posts_per_page' 	=> -1,
		'post__in' 			=> explode(',',$productIDs),
		'orderby'			=> $orderby,
		'order'				=> $order
	];

	$loop = new WP_Query( $args );
	ob_start();
	printf('<script type="text/javascript">
		jQuery(function($) {
			"use strict";
			  $(".slider").slick({
				slidesToShow: %d,
				slidesToScroll: %d,
				speed: 600,
				arrows: true,
				fade: false,
				dots: false,
				touchMove: false,
				adaptiveHeight: true
			}); 	  
		});
	</script>', $columns, $columns);
	if ( $loop->have_posts() ) { ?>
		<div class="wp-block-getbowtied-products-carousel <?php echo $align; ?>">
			<ul class="products slider">
				<?php while ( $loop->have_posts() ) : $loop->the_post(); ?>
					<?php wc_get_template_part( 'content', 'product' ); ?>
				<?php endwhile; ?>
			</ul>
		</div>
	<?php } wp_reset_postdata();
 return ob_get_clean();
}
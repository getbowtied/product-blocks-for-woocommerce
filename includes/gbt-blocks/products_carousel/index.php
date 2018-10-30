<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_products_carousel( $attributes ) {

	extract( shortcode_atts( array(
		'product_ids'					=> [],
		'columns'						=> '3',
		'align'							=> 'center',
	), $attributes ) );

	$args = [
		'post_type' 		=> 'product',
		'status' 			=> 'publish',
		'posts_per_page' 	=> -1,
		'post__in' 			=> $product_ids
	];

	$loop = new WP_Query( $args );

	ob_start();

	if ( $loop->have_posts() ) {

	?>
		<div class="wp-block-getbowtied-products-carousel <?php echo $align; ?>">
			<ul class="products slider">

				<?php while ( $loop->have_posts() ) : $loop->the_post(); ?>

					<?php wc_get_template_part( 'content', 'product' ); ?>

				<?php endwhile; ?>

			</ul>
		</div>

	<?php }
	wp_reset_postdata(); ?>

	<script type="text/javascript">
		jQuery(function($) {
	
			"use strict";

			  $('.slider').slick({
				slidesToShow: <?php echo $columns; ?>,
				slidesToScroll: <?php echo $columns; ?>,
				speed: 600,
				arrows: true,
				fade: false,
				dots: false,
				touchMove: false,
				adaptiveHeight: true
			}); 	  
		});
	</script>
<?php

ob_get_clean();
}
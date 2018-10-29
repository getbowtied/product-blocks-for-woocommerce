<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// register editor assets
add_action( 'admin_init', 'getbowtied_products_carousel_editor_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_editor_assets' ) ) {
	function getbowtied_products_carousel_editor_assets() {

		wp_enqueue_script(
			'getbowtied-products-carousel-editor-slick-scripts',
			plugins_url( 'vendor/slick/js/slick.min.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-editor-slick-styles',
			plugins_url( 'vendor/slick/css/slick-styles.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'vendor/slick/css/slick-styles.css' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-editor-scripts',
			plugins_url( 'js/backend/block.js', __FILE__ ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-editor-styles',
			plugins_url( 'css/backend/editor.css', __FILE__ ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/backend/editor.css' )
		);
	}
}

// register frontend assets
add_action( 'enqueue_block_assets', 'getbowtied_products_carousel_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_assets' ) ) {
	function getbowtied_products_carousel_assets() {

		wp_enqueue_script(
			'getbowtied-products-carousel-slick-scripts',
			plugins_url( 'vendor/slick/js/slick.min.js', __FILE__ ),
			array( 'jquery' )
		);

		// wp_enqueue_script(
		// 	'getbowtied-products-carousel-slick-slider-scripts',
		// 	plugins_url( 'js/frontend/flexslider.js', __FILE__ ),
		// 	array( 'jquery' )
		// );

		wp_enqueue_style(
			'getbowtied-products-carousel-slick-styles',
			plugins_url( 'vendor/slick/css/slick-styles.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'vendor/slick/css/slick-styles.css' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-styles',
			plugins_url( 'css/frontend/style.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/frontend/style.css' )
		);
	}
}

register_block_type( 'getbowtied/products-carousel', array(
	// 'editor_style'  	=> 'getbowtied-products-carousel-editor-styles',
	// 'editor_script'		=> 'getbowtied-products-carousel-editor-scripts',
	'attributes'      	=> array(
		'product_ids' 					=> array(
			'type'						=> 'array',
			'default'					=> [],
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_products_carousel',
) );

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
		<div class="wp-block-getbowtied-products-carousel ' . $align . '">
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
				slidesToShow: 4,
				slidesToScroll: 4,
				arrows: true,
				fade: false,
				dots: false,
				touchMove: false,
				adaptiveHeight: true
			}); 	  
		});
	</script>
<?php

//ob_end_flush();
}
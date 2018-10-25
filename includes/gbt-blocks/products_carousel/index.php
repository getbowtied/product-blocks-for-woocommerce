<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// register editor assets
add_action( 'admin_init', 'getbowtied_products_carousel_editor_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_editor_assets' ) ) {
	function getbowtied_products_carousel_editor_assets() {

		wp_register_script(
			'getbowtied-products-carousel-editor-scripts',
			plugins_url( 'js/backend/block2.js', __FILE__ ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_register_style(
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
			'getbowtied-products-carousel-scripts',
			plugins_url( 'js/vendor/flexslider/jquery.flexslider.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-scripts-flexslider',
			plugins_url( 'js/frontend/flexslider.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-styles',
			plugins_url( 'css/frontend/style.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/frontend/style.css' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-flexslider-styles',
			plugins_url( 'js/vendor/flexslider/flexslider.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'js/vendor/flexslider/flexslider.css' )
		);
	}
}

register_block_type( 'getbowtied/products-carousel', array(
	'editor_style'  	=> 'getbowtied-products-carousel-editor-styles',
	'editor_script'		=> 'getbowtied-products-carousel-editor-scripts',
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

	?>

	<?php

	if ( $loop->have_posts() ) {
		$i = 0;
		while ( $loop->have_posts() ) : $loop->the_post();

			if( $i == 0 ) {
				echo '<div class="slide">';
				echo '<ul class="products columns-'.$columns.'">';
			}

			wc_get_template_part( 'content', 'product' );
			$i++;

			if( $i == $columns ) {
				echo '</ul>';
				echo '</div>';
				$i = 0;
			}

		endwhile;

		if( $i != 0 && $i < $columns ) {
			echo '</ul>';
			echo '</div>';
		}
	}
	wp_reset_postdata();

	return '<div class="wp-block-getbowtied-products-carousel flexslider ' . $align . '"><div class="slider">' . ob_get_clean() . '</div></div>';
}
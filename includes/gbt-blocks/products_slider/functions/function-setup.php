<?php
/**
 * Products Slider Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'wp_enqueue_scripts', 'pbfw_products_slider_assets' );
function pbfw_products_slider_assets() {
	if ( has_block( 'getbowtied/products-slider' ) ) {
		wp_enqueue_script(
			'getbowtied-products-slider-scripts',
			plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
			array( 'jquery', 'swiper' ),
			PBFW_VERSION
		);

		wp_enqueue_style(
			'getbowtied-products-slider-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array( 'swiper' ),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/products-slider', array(
	'editor_script'		=> 'getbowtied-products-slider-editor-scripts',
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
	),

	'render_callback' => 'pbfw_render_frontend_products_slider',
) );

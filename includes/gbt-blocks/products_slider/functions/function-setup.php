<?php
/**
 * Products Slider Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_products_slider_assets' );
function pbfw_products_slider_assets() {
	if ( ! is_admin() && is_singular() && has_block( 'getbowtied/products-slider', get_the_ID() ) ) {
		wp_enqueue_style(
			'swiper',
			plugins_url( 'assets/frontend/vendor/swiper/css/swiper.min.css', dirname( dirname( dirname( dirname( __FILE__ ) ) ) ) ),
			array(),
			'5.2.0'
		);

		wp_enqueue_script(
			'swiper',
			plugins_url( 'assets/frontend/vendor/swiper/js/swiper.min.js', dirname( dirname( dirname( dirname( __FILE__ ) ) ) ) ),
			array( 'jquery' ),
			'5.2.0',
			true
		);

		wp_enqueue_script(
			'getbowtied-products-slider-scripts',
			plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
			array( 'jquery' ),
			PBFW_VERSION
		);

		wp_enqueue_style(
			'getbowtied-products-slider-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array(),
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

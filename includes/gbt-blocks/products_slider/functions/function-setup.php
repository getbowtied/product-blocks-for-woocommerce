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
	wp_register_script(
		'getbowtied-products-slider-scripts',
		plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'jquery', 'swiper' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-products-slider-styles',
		plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array( 'swiper' ),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_products_slider_editor_assets' );
function pbfw_products_slider_editor_assets() {
	wp_register_script(
		'getbowtied-products-slider-editor-scripts',
		plugins_url( 'block'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-products-slider-editor-styles',
		plugins_url( 'assets/css/backend/editor'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/products-slider', array(
	'editor_script'		=> 'getbowtied-products-slider-editor-scripts',
	'editor_style'		=> 'getbowtied-products-slider-editor-styles',
	'script'			=> 'getbowtied-products-slider-scripts',
	'style'				=> 'getbowtied-products-slider-styles',
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
	),

	'render_callback' => 'pbfw_render_frontend_products_slider',
) );

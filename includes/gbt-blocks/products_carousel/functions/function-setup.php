<?php
/**
 * Product Carousel
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_products_carousel_assets' );
function pbfw_products_carousel_assets() {
	wp_register_script(
		'getbowtied-products-carousel-scripts',
		plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'jquery', 'swiper' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-products-carousel-styles',
		plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array( 'swiper' ),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_products_carousel_editor_assets' );
function pbfw_products_carousel_editor_assets() {
	wp_register_script(
		'getbowtied-products-carousel-editor-scripts',
		plugins_url( 'block'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-products-carousel-editor-styles',
		plugins_url( 'assets/css/backend/editor'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/products-carousel', array(
	'editor_script'		=> 'getbowtied-products-carousel-editor-scripts',
	'editor_style'		=> 'getbowtied-products-carousel-editor-styles',
	'script'			=> 'getbowtied-products-carousel-scripts',
	'style'				=> 'getbowtied-products-carousel-styles',
	'attributes'      => array(
		'productIDs'       => array(
			'type'    => 'string',
			'default' => '',
		),
		'align'            => array(
			'type'    => 'string',
			'default' => 'center',
		),
		'queryOrder'       => array(
			'type'    => 'string',
			'default' => '',
		),
		'columns'          => array(
			'type'    => 'integer',
			'default' => 3,
		),
		'queryDisplayType' => array(
			'type'    => 'string',
			'default' => 'all_products',
		),
		'queryProducts'    => array(
			'type'    => 'string',
			'default' => 'wc/v3/products?per_page=10',
		),
		'spaceBetween'     => array(
			'type'    => 'integer',
			'default' => 20,
		),
	),

	'render_callback' => 'pbfw_render_frontend_products_carousel',
)
);

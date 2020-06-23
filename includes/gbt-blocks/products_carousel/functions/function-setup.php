<?php
/**
 * Product Carousel
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'wp_enqueue_scripts', 'pbfw_products_carousel_assets' );
function pbfw_products_carousel_assets() {
	if ( has_block( 'getbowtied/products-carousel' ) ) {
		wp_enqueue_script(
			'getbowtied-products-carousel-scripts',
			plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
			array( 'jquery', 'swiper' ),
			PBFW_VERSION
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array( 'swiper' ),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/products-carousel', array(
	'editor_script'		=> 'getbowtied-products-carousel-editor-scripts',
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
			'type'    => 'int',
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
			'type'    => 'int',
			'default' => 20,
		),
	),

	'render_callback' => 'pbfw_render_frontend_products_carousel',
)
);

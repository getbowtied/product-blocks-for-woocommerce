<?php
/**
 * Scattered Product List Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'wp_enqueue_scripts', 'pbfw_expanding_grid_assets' );
function pbfw_expanding_grid_assets() {
	if ( has_block( 'getbowtied/scattered-product-list' ) ) {
		wp_enqueue_style(
			'getbowtied-scattered-product-list-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array(),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/scattered-product-list', array(
	'editor_script'		=> 'getbowtied-scattered-product-list-editor-scripts',
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
		'queryDisplayType' => array(
			'type'    => 'string',
			'default' => 'all_products',
		),
		'queryProducts'    => array(
			'type'    => 'string',
			'default' => 'wc/v3/products?per_page=10',
		),
		'limit'            => array(
			'type'    => 'int',
			'default' => '10',
		),
	),

	'render_callback' => 'pbfw_render_frontend_expanding_grid',
) );

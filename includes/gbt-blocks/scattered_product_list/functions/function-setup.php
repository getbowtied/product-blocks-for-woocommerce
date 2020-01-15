<?php
/**
 * Scattered Product List Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_expanding_grid_editor_assets' );
function pbfw_expanding_grid_editor_assets() {
	wp_register_script(
		'getbowtied-scattered-product-list-editor-scripts',
		plugins_url( 'block.js', dirname( __FILE__ ) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
}

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_expanding_grid_assets' );
function pbfw_expanding_grid_assets() {
	if ( ! is_admin() && is_singular() && has_block( 'getbowtied/scattered-product-list', get_the_ID() ) ) {
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

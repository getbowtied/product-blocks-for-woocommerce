<?php
/**
 * Categories Grid Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_categories_grid_assets' );
function pbfw_categories_grid_assets() {
	wp_register_script(
		'getbowtied-categories-grid-scripts',
		plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'jquery', 'imagesloaded' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-categories-grid-styles',
		plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_categories_grid_editor_assets' );
function pbfw_categories_grid_editor_assets() {
	wp_register_script(
		'getbowtied-categories-grid-editor-scripts',
		plugins_url( 'block'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-categories-grid-editor-styles',
		plugins_url( 'assets/css/backend/editor'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/categories-grid', array(
	'editor_script'		=> 'getbowtied-categories-grid-editor-scripts',
	'editor_style'		=> 'getbowtied-categories-grid-editor-styles',
	'script'			=> 'getbowtied-categories-grid-scripts',
	'style'				=> 'getbowtied-categories-grid-styles',
	'attributes'      	=> array(
		'queryDisplayType'				=> array(
			'type'						=> 'string',
			'default'					=> 'all_categories',
		),
		'categoryIDs'					=> array(
			'type'						=> 'string',
			'default'					=> '',
		),
		'orderby' 						=> array(
			'type'						=> 'string',
			'default'					=> 'menu_order',
		),
		'limit'							=> array(
			'type'						=> 'integer',
			'default'					=> 8,
		),
		'hideEmpty'  					=> array(
			'type'    					=> 'boolean',
			'default' 					=> false,
		),
		'productCount'  				=> array(
			'type'    					=> 'boolean',
			'default' 					=> true,
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'parentOnly'					=> array(
			'type'						=> 'boolean',
			'default'					=> false,
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
		'className'						=> array(
			'type'						=> 'string',
			'default'					=> 'is-style-layout-2',
		),
	),

	'render_callback' => 'pbfw_render_frontend_categories_grid',
) );

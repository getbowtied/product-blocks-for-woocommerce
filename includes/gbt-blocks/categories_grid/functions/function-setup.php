<?php
/**
 * Categories Grid Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_categories_grid_editor_assets' );
function pbfw_categories_grid_editor_assets() {
	wp_register_script(
		'getbowtied-categories-grid-editor-scripts',
		plugins_url( 'block.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
	wp_localize_script( 'getbowtied-categories-grid-editor-scripts', 'getbowtied_pbw',
            array( 'ajax_url' => admin_url( 'admin-ajax.php' ), 'woo_placeholder_image'	=>	function_exists('wc_placeholder_img_src')? wc_placeholder_img_src() : '' ));
	wp_register_style(
		'getbowtied-categories-grid-editor-styles',
		plugins_url( 'assets/css/backend/editor'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor'.PBFW_SUFFIX.'.css' )
	);
}

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_categories_grid_assets' );
function pbfw_categories_grid_assets() {
	if ( ! is_admin() && is_singular() && has_block( 'getbowtied/categories-grid', get_the_ID() ) ) {

		wp_enqueue_script( 'imagesloaded' );
		
		wp_enqueue_script(
			'getbowtied-categories-grid-scripts',
			plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-categories-grid-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array(),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/categories-grid', array(
	'editor_style'  	=> 'getbowtied-categories-grid-editor-styles',
	'editor_script'		=> 'getbowtied-categories-grid-editor-scripts',
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

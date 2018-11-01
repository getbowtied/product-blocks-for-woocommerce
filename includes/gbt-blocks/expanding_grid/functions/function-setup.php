<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_expanding_grid_editor_assets' );
if ( ! function_exists( 'getbowtied_expanding_grid_editor_assets' ) ) {
	function getbowtied_expanding_grid_editor_assets() {

		wp_enqueue_script(
			'getbowtied-expanding-grid-editor-scripts',
			plugins_url( 'block.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-expanding-grid-editor-styles',
			plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor.css' )
		);
	}
}

//==============================================================================
//	Enqueue Frontend Assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_expanding_grid_assets' );
if ( ! function_exists( 'getbowtied_expanding_grid_assets' ) ) {
	function getbowtied_expanding_grid_assets() {

		wp_enqueue_script(
			'getbowtied-expanding-grid-scripts',
			plugins_url( 'assets/js/frontend/expadingProductModal.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-expanding-grid-styles',
			plugins_url( 'assets/css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style.css' )
		);
	}
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/expanding-grid', array(
	'attributes'      	=> array(
		'product_ids' 					=> array(
			'type'						=> 'array',
			'default'					=> [],
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_expanding_grid',
) );
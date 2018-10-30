<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_categories_grid_editor_assets' );
if ( ! function_exists( 'getbowtied_categories_grid_editor_assets' ) ) {
	function getbowtied_categories_grid_editor_assets() {

		wp_register_script(
			'getbowtied-categories-grid-editor-scripts',
			plugins_url( 'js/backend/block.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_localize_script( 'getbowtied-categories-grid-editor-scripts', 'ajax_object',
	            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_register_style(
			'getbowtied-categories-grid-editor-styles',
			plugins_url( 'css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/backend/editor.css' )
		);
	}
}

//==============================================================================
//	Enqueue Frontend Assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_categories_grid_assets' );
if ( ! function_exists( 'getbowtied_categories_grid_assets' ) ) {
	function getbowtied_categories_grid_assets() {

		wp_enqueue_script(
			'getbowtied-categories-grid-scripts',
			plugins_url( 'js/frontend/animation.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-categories-grid-imagesloaded',
			plugins_url( 'js/frontend/__imagesloaded.pkgd.min.js', dirname(__FILE__) ),
			array()
		);

		wp_enqueue_style(
			'getbowtied-categories-grid-styles',
			plugins_url( 'css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/frontend/style.css' )
		);
	}
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/categories-grid', array(
	'editor_style'  	=> 'getbowtied-categories-grid-editor-styles',
	'editor_script'		=> 'getbowtied-categories-grid-editor-scripts',
	'attributes'      	=> array(
		'orderby' 						=> array(
			'type'						=> 'string',
			'default'					=> 'title',
		),
		'number'						=> array(
			'type'						=> 'integer',
			'default'					=> 8,
		),
		'hide_empty'  					=> array(
			'type'    					=> 'boolean',
			'default' 					=> false,
		),
		'product_count'  				=> array(
			'type'    					=> 'boolean',
			'default' 					=> true,
		),
		'order'		  					=> array(
			'type'	  					=> 'string',
			'default' 					=> 'ASC',
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'parent_only'					=> array(
			'type'						=> 'boolean',
			'default'					=> false,
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
		'className'						=> array(
			'type'						=> 'string',
			'default'					=> 'is-style-layout-1',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_categories_grid',
) );
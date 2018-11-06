<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_lookbook_snap_to_scroll_editor_assets' );
if ( ! function_exists( 'getbowtied_lookbook_snap_to_scroll_editor_assets' ) ) {
	function getbowtied_lookbook_snap_to_scroll_editor_assets() {

		wp_enqueue_script(
			'getbowtied-lookbook-snap-to-scroll-editor-lookbook-scripts',
			plugins_url( 'blocks/lookbook.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-snap-to-scroll-editor-lookbook-product-scripts',
			plugins_url( 'blocks/product.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element' )
		);

		wp_enqueue_style(
			'getbowtied-lookbook-snap-to-scroll-editor-styles',
			plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor.css' )
		);
	}
}

//==============================================================================
//	Enqueue Frontend Assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_lookbook_snap_to_scroll_assets' );
if ( ! function_exists( 'getbowtied_lookbook_snap_to_scroll_assets' ) ) {
	function getbowtied_lookbook_snap_to_scroll_assets() {

		wp_enqueue_script(
			'getbowtied-lookbook-snap-to-scroll-scrollify-scripts',
			plugins_url( 'assets/js/frontend/jquery.scrollify.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-snap-to-scroll-snaplookbook-scripts',
			plugins_url( 'assets/js/frontend/snaplookbook.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-lookbook-snap-to-scroll-styles',
			plugins_url( 'assets/css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style.css' )
		);
	}
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/lookbook-snap-to-scroll-product', array(

	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
		'imgURL'						=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
		'image_position'				=> array(
			'type'						=> 'string',
			'default'					=>  'image-right',
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_lookbook_snap_to_scroll_product',
) );
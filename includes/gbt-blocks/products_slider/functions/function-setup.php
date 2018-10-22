<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue editor assets
//==============================================================================
add_action( 'enqueue_block_editor_assets', 'getbowtied_products_slider_editor_assets' );
if ( ! function_exists( 'getbowtied_products_slider_editor_assets' ) ) {
	function getbowtied_products_slider_editor_assets() {

		wp_enqueue_script(
			'getbowtied-products-slider',
			plugins_url( 'block.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-slider-styles',
			plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' )
		);

		wp_localize_script( 'getbowtied-products-slider', 'ajax_object',
	            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
	}
}

//==============================================================================
//	Enqueue frontend assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_products_slider_assets' );
if ( ! function_exists( 'getbowtied_products_slider_assets' ) ) {
	function getbowtied_products_slider_assets() {
		
		wp_enqueue_style(
			'getbowtied-products-slider-frontend-css',
			plugins_url( 'assets/css/frontend/style.css', dirname(__FILE__) ),
			array()
		);

		wp_enqueue_script(
			'getbowtied-products-slider-frontend-js',
			plugins_url( 'assets/js/frontend/scripts.js', dirname(__FILE__) ),
			array( 'jquery' )
		);
	}
}

//==============================================================================
//	Register the block
//==============================================================================
register_block_type( 'getbowtied/products-slider', array(
	'attributes'      => array(
		'product_ids'	=> array(
			'type'		=> 'string',
			'default'	=> '',
		),
		'align'			=> array(
			'type'		=> 'string',
			'enum' 		=> array( 'wide', 'full', '' ),
		),
	),
	'render_callback' => 'getbowtied_render_frontend_products_slider',
) );
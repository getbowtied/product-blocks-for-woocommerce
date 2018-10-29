<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue editor assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_products_slider_editor_assets' );
if ( ! function_exists( 'getbowtied_products_slider_editor_assets' ) ) {
	function getbowtied_products_slider_editor_assets() {

		wp_enqueue_script(
			'getbowtied-products-slider-slick-scripts',
			plugins_url( 'vendor/slick/js/slick.min.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-slider-editor-slick-styles',
			plugins_url( 'vendor/slick/css/slick-styles.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'vendor/slick/css/slick-styles.css' )
		);

		wp_enqueue_script(
			'getbowtied-products-slider-editor-scripts',
			plugins_url( 'js/backend/block.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-slider-editor-styles',
			plugins_url( 'css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/backend/editor.css' )
		);
	}
}

// register frontend assets
add_action( 'enqueue_block_assets', 'getbowtied_products_slider_assets' );
if ( ! function_exists( 'getbowtied_products_slider_assets' ) ) {
	function getbowtied_products_slider_assets() {

		wp_register_script(
			'getbowtied-products-slider-scripts',
			plugins_url( 'js/frontend/verticalContentSlider.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_register_style(
			'getbowtied-products-slider-styles',
			plugins_url( 'css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/frontend/style.css' )
		);
	}
}

register_block_type( 'getbowtied/products-slider', array(
	// 'editor_style'  	=> 'getbowtied-products-slider-editor-styles',
	// 'editor_script'		=> 'getbowtied-products-slider-editor-scripts',
	'script'			=> 'getbowtied-products-slider-scripts',
	'style'				=> 'getbowtied-products-slider-styles',
	'attributes'      	=> array(
		'product_ids' 					=> array(
			'type'						=> 'array',
			'default'					=> [],
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_products_slider',
) );
<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_products_carousel_editor_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_editor_assets' ) ) {
	function getbowtied_products_carousel_editor_assets() {

		wp_enqueue_script(
			'getbowtied-slick-scripts',
			plugins_url( '../vendor/slick/js/slick.min.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-slick-styles',
			plugins_url( '../vendor/slick/css/slick-styles.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . '../vendor/slick/css/slick-styles.css' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-editor-scripts',
			plugins_url( 'block.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-editor-styles',
			plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor.css' )
		);
	}
}

//==============================================================================
//	Enqueue Frontend Assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_products_carousel_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_assets' ) ) {
	function getbowtied_products_carousel_assets() {

		wp_enqueue_script(
			'getbowtied-swiper-scripts',
			plugins_url( 'js/vendor/swiper.min.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-scripts',
			plugins_url( 'js/frontend.js', dirname(__FILE__) ),
			array( 'jquery', 'getbowtied-swiper-scripts' )
		);

		wp_enqueue_style(
			'getbowtied-swiper-styles',
			plugins_url( 'assets/css/frontend/swiper.min.css', dirname(__FILE__) ),
			array()
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-styles',
			plugins_url( 'assets/css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style.css' )
		);
	}
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/products-carousel', array(
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> '',
		),
		'queryOrder'					=> array(
			'type'						=> 'string',
			'default'					=> '',
		),
		'columns'						=> array(
			'type'						=> 'int',
			'default'					=> 3,
		),
		'queryDisplayType'				=> array(
			'type'						=> 'string',
			'default'					=> 'all_products'
		),
		'queryProducts'					=> array(
			'type'						=> 'string',
			'default'					=> 'wc/v3/products?per_page=10'
		),
	),

	'render_callback' => 'getbowtied_render_frontend_products_carousel',
) );
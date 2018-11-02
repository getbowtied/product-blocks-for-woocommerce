<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'getbowtied_lookbook_distortion_editor_assets' );
if ( ! function_exists( 'getbowtied_lookbook_distortion_editor_assets' ) ) {
	function getbowtied_lookbook_distortion_editor_assets() {

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-editor-lookbook-scripts',
			plugins_url( 'js/backend/lookbook.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-editor-lookbook-product-scripts',
			plugins_url( 'js/backend/product.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-lookbook-distortion-editor-styles',
			plugins_url( 'css/backend/editor.css', dirname(__FILE__) ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/backend/editor.css' )
		);
	}
}

//==============================================================================
//	Enqueue Frontend Assets
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_lookbook_distortion_assets' );
if ( ! function_exists( 'getbowtied_lookbook_distortion_assets' ) ) {
	function getbowtied_lookbook_distortion_assets() {

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-imagesloaded-scripts',
			plugins_url( 'js/frontend/imagesloaded.pkgd.min.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-three-scripts',
			plugins_url( 'js/frontend/three.min.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-TweenMax-scripts',
			'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.20.3/TweenMax.min.js',
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-hover-scripts',
			plugins_url( 'js/frontend/hover.js', dirname(__FILE__) ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-lookbook-distortion-hover1-scripts',
			plugins_url( 'js/frontend/frontend.js', dirname(__FILE__) ),
			array( ), false, true
		);

		wp_enqueue_style(
			'getbowtied-lookbook-distortion-styles',
			plugins_url( 'css/frontend/style.css', dirname(__FILE__) ),
			array(),
			filemtime( plugin_dir_path( dirname(__FILE__) ) . 'css/frontend/style.css' )
		);
	}
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/lookbook-distortion-product', array(

	'attributes'      	=> array(
		'product_id' 					=> array(
			'type'						=> 'number',
			'default'					=> '',
		),
		'bg_color'						=> array(
			'type'						=> 'string',
			'default'					=> '#abb7c3'
		),
		'text_color'					=> array(
			'type'						=> 'string',
			'default'					=> '#ffffff'
		),
		'animation'						=> array(
			'type'						=> 'string',
			'default'					=> 'animation-1'
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_lookbook_distortion_product',
) );
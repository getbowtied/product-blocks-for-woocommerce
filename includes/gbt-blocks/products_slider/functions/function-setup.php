<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'pbfw_products_slider_editor_assets' );
function pbfw_products_slider_editor_assets() {
	wp_enqueue_script(
		'getbowtied-products-slider-editor-scripts',
		plugins_url( 'block.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);

	wp_enqueue_style(
		'getbowtied-products-slider-editor-styles',
		plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor.css' )
	);
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/products-slider', array(
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
	),

	'render_callback' => 'pbfw_render_frontend_products_slider',
) );
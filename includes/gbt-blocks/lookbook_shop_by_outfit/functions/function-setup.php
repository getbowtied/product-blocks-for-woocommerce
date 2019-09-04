<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'pbfw_lookbook_snap_to_scroll_editor_assets' );
function pbfw_lookbook_snap_to_scroll_editor_assets() {

	wp_enqueue_script(
		'getbowtied-lookbook-shop-by-outfit-editor-lookbook-scripts',
		plugins_url( 'blocks/lookbook.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element' )
	);

	wp_enqueue_script(
		'getbowtied-lookbook-shop-by-outfit-editor-lookbook-product-scripts',
		plugins_url( 'blocks/product.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element' )
	);

	wp_enqueue_style(
		'getbowtied-lookbook-shop-by-outfit-editor-styles',
		plugins_url( 'assets/css/backend/editor.css', dirname(__FILE__) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor.css' )
	);
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type( 'getbowtied/lookbook-shop-by-outfit-product', array(
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
		'imgURL'						=> array(
			'type'						=> 'string',
			'default'					=>  '',
		),
		'imgID'							=> array(
			'type'						=> 'int',
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

	'render_callback' => 'pbfw_render_frontend_lookbook_snap_to_scroll_product',
) );

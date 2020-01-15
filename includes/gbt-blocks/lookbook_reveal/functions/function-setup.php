<?php
/**
 * LookBook - Product Reveal Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_lookbook_reveal_editor_assets' );
function pbfw_lookbook_reveal_editor_assets() {
	wp_enqueue_script(
		'getbowtied-lookbook-reveal-editor-lookbook-scripts',
		plugins_url( 'blocks/lookbook.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
	wp_enqueue_script(
		'getbowtied-lookbook-reveal-editor-lookbook-product-scripts',
		plugins_url( 'blocks/product.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
}

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_lookbook_reveal_assets' );
function pbfw_lookbook_reveal_assets() {
	if ( ! is_admin() && is_singular() && has_block( 'getbowtied/lookbook-reveal-product', get_the_ID() ) ) {

		wp_enqueue_style(
			'getbowtied-lookbook-reveal-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array(),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/lookbook-reveal-product', array(
	'attributes'      	=> array(
		'productIDs' 					=> array(
			'type'						=> 'string',
			'default'					=> '',
		),
		'bgColor'						=> array(
			'type'						=> 'string',
			'default'					=> '#abb7c3'
		),
		'textColor'					=> array(
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

	'render_callback' => 'pbfw_render_frontend_lookbook_reveal_product',
) );

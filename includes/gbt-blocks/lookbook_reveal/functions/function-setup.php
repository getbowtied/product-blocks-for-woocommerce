<?php
/**
 * LookBook - Product Reveal Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_lookbook_reveal_assets' );
function pbfw_lookbook_reveal_assets() {
	wp_register_style(
		'getbowtied-lookbook-reveal-styles',
		plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Enqueue Editor Assets
 */
add_action( 'enqueue_block_editor_assets', 'pbfw_lookbook_reveal_editor_assets' );
function pbfw_lookbook_reveal_editor_assets() {
	wp_register_script(
		'getbowtied-lookbook-reveal-editor-scripts',
		plugins_url( 'blocks/lookbook'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
		PBFW_VERSION
	);

	wp_register_script(
		'getbowtied-lookbook-reveal-product-editor-scripts',
		plugins_url( 'blocks/product'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
		PBFW_VERSION
	);

	wp_register_style(
		'getbowtied-lookbook-reveal-editor-styles',
		plugins_url( 'assets/css/backend/editor'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
		array(),
		filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/backend/editor'.PBFW_SUFFIX.'.css')
	);
}

/**
 * Register Block
 */
register_block_type( 'getbowtied/lookbook-reveal', array(
	'editor_script'		=> 'getbowtied-lookbook-reveal-editor-scripts',
) );

register_block_type( 'getbowtied/lookbook-reveal-product', array(
	'editor_script'		=> 'getbowtied-lookbook-reveal-product-editor-scripts',
	'editor_style'		=> 'getbowtied-lookbook-reveal-editor-styles',
	'style'				=> 'getbowtied-lookbook-reveal-styles',
	'parent'			=> 'getbowtied/lookbook-reveal',
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
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'pbfw_render_frontend_lookbook_reveal_product',
) );

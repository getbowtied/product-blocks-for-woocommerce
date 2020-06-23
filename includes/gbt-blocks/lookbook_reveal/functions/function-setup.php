<?php
/**
 * LookBook - Product Reveal Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'wp_enqueue_scripts', 'pbfw_lookbook_reveal_assets' );
function pbfw_lookbook_reveal_assets() {
	if ( has_block( 'getbowtied/lookbook-reveal' ) ) {
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

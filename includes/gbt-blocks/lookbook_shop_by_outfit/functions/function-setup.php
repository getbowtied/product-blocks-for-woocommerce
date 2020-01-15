<?php
/**
 * LookBook - Shop by Outfit Setup
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

/**
 * Enqueue Frontend Assets
 */
add_action( 'enqueue_block_assets', 'pbfw_lookbook_snap_to_scroll_assets' );
function pbfw_lookbook_snap_to_scroll_assets() {
	if ( ! is_admin() && is_singular() && has_block( 'getbowtied/lookbook-shop-by-outfit', get_the_ID() ) ) {

		wp_enqueue_script(
			'jquery-scrollify',
			plugins_url( 'assets/frontend/vendor/scrollify/js/jquery.scrollify.js', dirname( dirname( dirname( dirname( __FILE__ ) ) ) ) ),
			array( 'jquery' ),
			PBFW_VERSION,
			true
		);

		wp_enqueue_script(
			'getbowtied-lookbook-shop-by-outfit-scripts',
			plugins_url( 'assets/js/frontend'.PBFW_SUFFIX.'.js', dirname(__FILE__) ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' ),
			PBFW_VERSION
		);

		wp_enqueue_style(
			'getbowtied-lookbook-shop-by-outfit-styles',
			plugins_url( 'assets/css/frontend/style'.PBFW_SUFFIX.'.css', dirname(__FILE__) ),
			array(),
			filemtime(plugin_dir_path( dirname(__FILE__) ) . 'assets/css/frontend/style'.PBFW_SUFFIX.'.css')
		);
	}
}

/**
 * Register Block
 */
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

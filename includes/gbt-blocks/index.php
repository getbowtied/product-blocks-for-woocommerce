<?php
/**
 * Blocks Setup
 */

 /**
  * Main Editor Styles and Scripts
  */
add_action(
	'enqueue_block_editor_assets',
	function() {
		wp_enqueue_style(
			'getbowtied-product-blocks-editor-styles',
			plugins_url( 'assets/backend/css/editor'.PBFW_SUFFIX.'.css', dirname( dirname( __FILE__ ) ) ),
			array( 'wp-edit-blocks' ),
			PBFW_VERSION
		);
		wp_enqueue_script(
			'getbowtied-product-blocks-editor-scripts',
			plugins_url( 'assets/backend/js/main.js', dirname( dirname( __FILE__ ) ) ),
			array( 'wp-blocks', 'jquery' ),
			PBFW_VERSION
		);
	}
);

/**
 * Frontend Styles
 */
add_action( 'enqueue_block_assets', 'getbowtied_product_blocks_frontend_styles' );
function getbowtied_product_blocks_frontend_styles() {
	wp_enqueue_style(
		'swiper',
		plugins_url( 'assets/frontend/css/swiper.min.css', dirname( dirname( __FILE__ ) ) ),
		array(),
		'5.2.0'
	);
	wp_enqueue_style(
		'getbowtied-product-blocks-frontend-styles',
		plugins_url( 'assets/frontend/css/fonts.css', dirname( dirname( __FILE__ ) ) ),
		array(),
		PBFW_VERSION
	);

	wp_enqueue_script( 'imagesloaded' );
	wp_enqueue_script(
		'jquery-scrollify',
		plugins_url( 'assets/frontend/js/jquery.scrollify.js', dirname( dirname( __FILE__ ) ) ),
		array( 'jquery' ),
		PBFW_VERSION,
		true
	);
	wp_enqueue_script(
		'swiper',
		plugins_url( 'assets/frontend/js/swiper.min.js', dirname( dirname( __FILE__ ) ) ),
		array( 'jquery' ),
		'5.2.0',
		true
	);
}

require_once dirname( __FILE__ ) . '/products_slider/block.php';
require_once dirname( __FILE__ ) . '/categories_grid/block.php';
require_once dirname( __FILE__ ) . '/products_carousel/block.php';
require_once dirname( __FILE__ ) . '/scattered_product_list/block.php';
require_once dirname( __FILE__ ) . '/lookbook_reveal/block.php';
require_once dirname( __FILE__ ) . '/lookbook_shop_by_outfit/block.php';

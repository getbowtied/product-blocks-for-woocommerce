<?php
//==============================================================================
//	Main Editor Styles
//==============================================================================

add_action(
	'enqueue_block_editor_assets',
	function() {
		wp_enqueue_style(
			'getbowtied-product-blocks-editor-styles',
			plugins_url( 'assets/backend/css/editor.css', dirname( dirname( __FILE__ ) ) ),
			array( 'wp-edit-blocks' ),
			PBFW_VERSION
		);
	}
);

//==============================================================================
//	Main JS
//==============================================================================
add_action( 'admin_init', 'pbfw_scripts' );
function pbfw_scripts() {

	wp_enqueue_script(
		'getbowtied-product-blocks-editor-scripts',
		plugins_url( 'assets/backend/js/main.js', dirname( dirname( __FILE__ ) ) ),
		array( 'wp-blocks', 'jquery' ),
		PBFW_VERSION
	);

}

//==============================================================================
//	Frontend Styles
//==============================================================================
add_action( 'enqueue_block_assets', 'getbowtied_product_blocks_frontend_styles' );
function getbowtied_product_blocks_frontend_styles() {
	wp_enqueue_style(
		'swiper',
		plugins_url( 'assets/frontend/css/swiper.min.css', dirname( dirname( __FILE__ ) ) ),
		array(),
		'4.5.0'
	);
	wp_enqueue_style(
		'getbowtied-product-blocks-frontend-styles',
		plugins_url( 'assets/frontend/css/styles.css', dirname( dirname( __FILE__ ) ) ),
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
		'4.5.0',
		true
	);
	wp_enqueue_script(
		'getbowtied-product-blocks-frontend-scripts',
		plugins_url( 'assets/frontend/js/scripts.min.js', dirname( dirname( __FILE__ ) ) ),
		array( 'jquery', 'imagesloaded' ),
		PBFW_VERSION,
		true
	);
}

require_once 'products_slider/block.php';
require_once 'categories_grid/block.php';
require_once 'products_carousel/block.php';
require_once 'scattered_product_list/block.php';
require_once 'lookbook_reveal/block.php';
require_once 'lookbook_shop_by_outfit/block.php';

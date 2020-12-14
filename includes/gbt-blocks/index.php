<?php
/**
 * Blocks Setup
 */

 /**
  * Main Editor Styles and Scripts
  */
add_action( 'enqueue_block_editor_assets', function() {
	wp_enqueue_style(
		'getbowtied-product-blocks-editor-styles',
		plugins_url( 'assets/backend/css/editor'.PBFW_SUFFIX.'.css', dirname( dirname( __FILE__ ) ) ),
		array( 'wp-edit-blocks' ),
		PBFW_VERSION
	);
	wp_enqueue_script(
		'getbowtied-product-blocks-editor-scripts',
		plugins_url( 'assets/backend/js/blocks'.PBFW_SUFFIX.'.js', dirname( dirname( __FILE__ ) ) ),
		array( 'wp-blocks' ),
		PBFW_VERSION
	);

	wp_localize_script( 'getbowtied-product-blocks-editor-scripts', 'getbowtied_pbw',
		array(
			'ajax_url' => admin_url( 'admin-ajax.php' ),
			'woo_placeholder_image'	=>	function_exists('wc_placeholder_img_src')? wc_placeholder_img_src() : ''
		)
	);
} );

add_action( 'wp_enqueue_scripts', 'getbowtied_register_external_libraries', 0 );
function getbowtied_register_external_libraries() {
	if ( has_block( 'getbowtied/lookbook-shop-by-outfit' ) ) {
		wp_register_script(
			'jquery-scrollify',
			plugins_url( 'assets/frontend/scrollify/js/jquery.scrollify.js', dirname( dirname( __FILE__ ) ) ),
			array( 'jquery' ),
			PBFW_VERSION,
			true
		);
	}

	if ( has_block( 'getbowtied/products-slider' ) || has_block( 'getbowtied/products-carousel' ) ) {
		wp_register_style(
			'swiper',
			plugins_url( 'assets/frontend/swiper/css/swiper.min.css', dirname( dirname( __FILE__ ) ) ),
			array(),
			'6.4.1'
		);

		wp_register_script(
			'swiper',
			plugins_url( 'assets/frontend/swiper/js/swiper.min.js', dirname( dirname( __FILE__ ) ) ),
			array( 'jquery' ),
			'6.4.1',
			true
		);
	}
}

require_once dirname( __FILE__ ) . '/products_slider/block.php';
require_once dirname( __FILE__ ) . '/categories_grid/block.php';
require_once dirname( __FILE__ ) . '/products_carousel/block.php';
require_once dirname( __FILE__ ) . '/scattered_product_list/block.php';
require_once dirname( __FILE__ ) . '/lookbook_reveal/block.php';
require_once dirname( __FILE__ ) . '/lookbook_shop_by_outfit/block.php';

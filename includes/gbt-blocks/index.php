<?php
//==============================================================================
//	Main Editor Styles
//==============================================================================
wp_enqueue_style(
	'getbowtied-product-blocks-editor-styles',
	plugins_url( 'assets/css/editor.css', dirname(dirname(__FILE__) )),
	array( 'wp-edit-blocks' )
);

//==============================================================================
//	Main JS
//==============================================================================
add_action( 'admin_init', 'getbowtied_product_blocks_scripts' );
if ( ! function_exists( 'getbowtied_product_blocks_scripts' ) ) {
	function getbowtied_product_blocks_scripts() {

		wp_enqueue_script(
			'getbowtied-product-blocks-editor-scripts',
			plugins_url( 'assets/js/main.js', dirname(dirname(__FILE__)) ),
			array( 'wp-blocks', 'jquery' )
		);

	}
}

require_once 'products_slider/block.php';
require_once 'categories_grid/block.php';
require_once 'products_carousel/block.php';
require_once 'expanding_grid/block.php';
require_once 'lookbook_distortion/block.php';
require_once 'lookbook_snap_to_scroll/block.php';


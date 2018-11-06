<?php

// Shopkeeper Custom Gutenberg Blocks
 
add_filter( 'block_categories', function( $categories, $post ) {
	if ( $post->post_type !== 'post' && $post->post_type !== 'page' && $post->post_type !== 'portfolio' ) {
		return $categories;
	}
	return array_merge(
		array(
			array(
				'slug' => 'product_blocks',
				'title' => __( 'Product Blocks for WooCommerce', 'gbt-blocks' ),
			),
		),
		$categories
	);
}, 10, 2 );

//==============================================================================
//	Main Editor Styles
//==============================================================================
wp_enqueue_style(
	'getbowtied-product-blocks-editor-styles',
	plugins_url( 'assets/css/editor.css', dirname(dirname(__FILE__) )),
	array( 'wp-edit-blocks' )
);

// require_once 'block_1/block.php';
require_once 'products_slider/block.php';
require_once 'categories_grid/block.php';
// require_once 'products_main/block.php';
require_once 'products_carousel/block.php';
require_once 'expanding_grid/block.php';
require_once 'lookbook_distortion/block.php';
require_once 'lookbook_snap_to_scroll/block.php';


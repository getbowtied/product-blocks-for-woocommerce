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

// require_once 'block_1/block.php';
require_once 'products_slider/index.php';
require_once 'categories_grid/index.php';
require_once 'products_main/block.php';
require_once 'products_carousel/index.php';


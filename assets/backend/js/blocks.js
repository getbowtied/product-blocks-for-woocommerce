( function( blocks ) {
	var blockCategories = blocks.getCategories();
	blockCategories.unshift({ 'slug': 'product_blocks', 'title': 'Product Blocks for WooCommerce'});
	blocks.setCategories(blockCategories);
})(
	window.wp.blocks
);


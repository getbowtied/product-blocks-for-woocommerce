( function( blocks ) {
	var blockCategories = blocks.getCategories();
	blockCategories.unshift({ 'slug': 'product_blocks', 'title': 'Product Blocks for WooCommerce'});
	blocks.setCategories(blockCategories);
})(
	window.wp.blocks
);

// @prepros-append ../../../includes/gbt-blocks/categories_grid/block.js
// @prepros-append ../../../includes/gbt-blocks/scattered_product_list/block.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_reveal/blocks/lookbook.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_reveal/blocks/product.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_shop_by_outfit/blocks/lookbook.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_shop_by_outfit/blocks/product.js
// @prepros-append ../../../includes/gbt-blocks/products_carousel/block.js
// @prepros-append ../../../includes/gbt-blocks/products_slider/block.js

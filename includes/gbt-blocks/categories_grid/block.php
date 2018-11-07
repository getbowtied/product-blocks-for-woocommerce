<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_categories_grid( $attributes ) {

	extract( shortcode_atts( array(
		'categoryIDs'					=> '',
		'orderby'						=> 'menu_order',
		'limit'     					=> 8,
		'columns'						=> '3',
		'hideEmpty'				 		=> false,
		'productCount'				 	=> true,
		'parentOnly'     				=> false,
		'align'							=> 'center',
		'className'						=> 'is-style-layout-2',
		'queryDisplayType'				=> 'all_categories',
	), $attributes ) );



	$args['taxonomy'] = 'product_cat';
	if ( $queryDisplayType == 'specific' ) {
		$args['orderby'] 	= 'include';
		$args['include'] 	= $categoryIDs;
		$args['hide_empty'] = false;
	} else {
		$args['number']	 		= $limit;
		$args['hide_empty']		= $hideEmpty;
		$args['parent']			= ($parentOnly === true)? 0 : '';
		switch ( $orderby ) {
			case 'menu_order': break;
			case 'title_asc' :
				$args['orderby'] = 'title';
				$args['order']	 = 'asc';
				break;
			case 'title_desc':
				$args['orderby'] = 'title';
				$args['order']	 = 'desc';
				break;
			default: break;
		}
	}

	$product_categories = get_terms( $args );

	// $sorted = [];
	// function _sortCategories( $index, $arr, &$newarr, $level = 0) {
	// 	for ( $i=0; $i< sizeof($arr); $i++ ) {
	// 		if ( $arr[$i]->parent == $index) {
	// 			$newarr[] = $arr[$i];
	// 			_sortCategories($arr[$i]->term_id, $arr, $newarr, $level + 1 );
	// 		}
	// 	}
	// 	return $newarr;
	// }

	// if ($orderby == 'menu_order' && $queryDisplayType == 'all_categories') {
	// 	$sorted = _sortCategories(0, $product_categories, $sorted);
	// 	if (sizeof($product_categories) == sizeof($sorted)) {
	// 		$product_categories = $sorted;
	// 	}
	// }
	ob_start();

	if ( $product_categories ) :

		foreach ($product_categories as $cat): ?>

            <div class="gbt_18_category_grid_item">
                <a class="gbt_18_category_grid_item_img" href="<?php echo get_term_link( $cat->slug, 'product_cat' ); ?>">
                    <?php 
                    	$thumbnail_id = get_woocommerce_term_meta( $cat->term_id, 'thumbnail_id', true );
					    $image = wp_get_attachment_image_src( $thumbnail_id, 'large');
					    $image = isset($image[0]) ? $image[0] : wc_placeholder_img_src();
					    if ( isset($image) ) {
						    echo '<img src="' . $image . '" alt="' . $cat->name . '" />';
						}
                    ?>
                </a>
                <h4 class="gbt_18_category_grid_item_title">
                    <?php echo esc_html($cat->name); ?>
                    <?php if( $productCount ) { ?>
                    	<span class="gbt_18_category_grid_item_count"><?php echo esc_attr($cat->count); ?></span>
                    <?php } ?>
                </h4>
            </div>

		<?php endforeach; ?>
   
		<div class="clearfix"></div>
					
	<?php endif; ?>

	<?php

	if( $className == 'is-style-layout-1' ) {
		$columns = 'columns-'.$columns;
	}

	return '<section class="wp-block-getbowtied-categories-grid gbt_18_categories_grid_wrapper '.$className.' ' . $align . '"><div class="gbt_18_categories_grid '.$columns.'">' . ob_get_clean() . '</div></section>';
}

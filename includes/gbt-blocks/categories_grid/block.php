<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_categories_grid( $attributes ) {

	extract( shortcode_atts( array(
		'orderby'						=> 'title',
		'number'     					=> 8,
		'order'      					=> 'ASC',
		'columns'						=> '3',
		'hide_empty'				 	=> false,
		'product_count'				 	=> true,
		'parent_only'     				=> false,
		'align'							=> 'center',
		'className'						=> 'is-style-layout-2'
	), $attributes ) );

	$args['taxonomy'] = 'product_cat';

	if( $orderby == 'title' ) {
		$args['orderby'] = $orderby;
		$args['order'] = $order;
	} else {
		$args['menu_order'] = $order;
	}

	$args['hide_empty'] = $hide_empty;
	$args['number'] = $number;

	if ( $parent_only ) {
		$args['parent'] = 0 ;
	} else {
		$args['pad_counts'] = true;
	}

	$product_categories = get_terms( $args );

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
                    <?php if( $product_count ) { ?>
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

//==============================================================================
//	Backend Output
//==============================================================================
add_action('wp_ajax_getbowtied_render_backend_categories_grid', 'getbowtied_render_backend_categories_grid');
function getbowtied_render_backend_categories_grid() {

	$attributes = $_POST['attributes'];
	$output = '';
	$output_final = '';

	if( $attributes['source'] == 'all' ) {

		extract( shortcode_atts( array(
			'orderby'						=> 'title',
			'number'     					=> 8,
			'order'      					=> 'ASC',
			'columns'						=> '3',
			'hide_empty'				 	=> 0,
			'product_count'				 	=> 1,
			'parent_only'     				=> 0,
			'className'						=> 'is-style-layout-2'
		), $attributes ) );

		$args['taxonomy'] = 'product_cat';

		if( $orderby == 'title' ) {
			$args['orderby'] = $orderby;
			$args['order'] = $order;
		} else {
			$args['menu_order'] = $order;
		}

		$args['hide_empty'] = $hide_empty;
		$args['number'] = $number;

		if ( $parent_only ) {
			$args['parent'] = 0;
		} else {
			$args['pad_counts'] = true;
		}
	} elseif( $attributes['source'] == 'specific' ) {
		extract( shortcode_atts( array(
			'product_ids'					=> [],
			'columns'						=> '3',
		), $attributes ) );

		$args['include'] = $product_ids;
	}

	$product_categories = get_terms( $args );

	if ( $product_categories ) {

		foreach ($product_categories as $cat): ?>

			<?php

			$output .= 'el("div",{className:"gbt_18_editor_category_grid_item", key:"gbt_18_editor_category_grid_item"},';

				$output .= 'el("a",{className:"gbt_18_editor_category_grid_item_img", key:"gbt_18_editor_category_grid_item_img"}';

					$thumbnail_id = get_woocommerce_term_meta( $cat->term_id, 'thumbnail_id', true );
				    $image = wp_get_attachment_image_src( $thumbnail_id, 'large');
				    $image = isset($image[0]) ? $image[0] : wc_placeholder_img_src();

				    if ( isset($image) ) {
				    	$output .= ',el("img",{key:"gbt_18_editor_category_grid_item_thumb", src: "'.$image.'"})';
					}

				$output .= '),';

				$output .= 'el("h4",{className:"gbt_18_editor_category_grid_item_title", key:"gbt_18_editor_category_grid_item_title"}, "'.htmlspecialchars_decode($cat->name).'"';

					if( $product_count ) {
						$output .= ',el("span",{className:"gbt_18_editor_category_grid_item_count", key:"gbt_18_editor_category_grid_item_count"}, "'.esc_attr($cat->count).'")';
					}

				$output .= ')';

			$output .= '),';

		endforeach;

	} 

	if( strpos( $className,'is-style-layout-1' ) ) {
		$className = 'columns-'.$columns;
	}

	$output_final = 'el("div",{className:"gbt_18_editor_categories_grid '.$className.'",key:"gbt_18_editor_categories_grid"},'.$output.'el("div",{className:"clearfix",key:"clearfix"}))'; 

	echo json_encode($output_final);
	exit;
}
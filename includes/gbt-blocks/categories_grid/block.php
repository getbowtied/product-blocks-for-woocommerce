<?php
/**
 * Categories Grid
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

require_once dirname( __FILE__ ) . '/functions/function-setup.php';

/**
 * Frontend Output
 */
function pbfw_render_frontend_categories_grid( $attributes ) {

	extract(
		shortcode_atts(
			array(
				'categoryIDs'      => '',
				'orderby'          => 'menu_order',
				'limit'            => 8,
				'columns'          => '3',
				'hideEmpty'        => false,
				'productCount'     => true,
				'parentOnly'       => false,
				'align'            => 'center',
				'className'        => 'is-style-layout-2',
				'queryDisplayType' => 'all_categories',
			),
			$attributes
		)
	);

	$args['taxonomy'] = 'product_cat';
	if ( $queryDisplayType == 'specific' ) {
		$args['orderby']    = 'include';
		$args['include']    = $categoryIDs;
		$args['hide_empty'] = false;
	} else {
		$args['number']     = $limit;
		$args['hide_empty'] = $hideEmpty;
		$args['parent']     = ( $parentOnly === true ) ? 0 : '';
		switch ( $orderby ) {
			case 'menu_order':
			$args['menu_order'] = 'asc';
				break;
			case 'title_asc':
				$args['orderby'] = 'title';
				$args['order']   = 'asc';
				break;
			case 'title_desc':
				$args['orderby'] = 'title';
				$args['order']   = 'desc';
				break;
			default:
				break;
		}
	}

	$product_categories = get_terms( $args );
	if ( $className == 'is-style-layout-1' ) {
		$columns = 'columns-' . $columns;
	}

	ob_start();
	if ( $product_categories ) :
		printf( '<section class="wp-block-getbowtied-categories-grid gbt_18_categories_grid_wrapper %s align%s"><div class="gbt_18_categories_grid %s">', $className, $align, $columns );
		foreach ( $product_categories as $cat ) : ?>
			<div class="gbt_18_category_grid_item">
				<a class="gbt_18_category_grid_item_img" href="<?php echo get_term_link( $cat->slug, 'product_cat' ); ?>">
					<?php
						$thumbnail_id = get_term_meta( $cat->term_id, 'thumbnail_id', true );
						$image        = wp_get_attachment_image( $thumbnail_id, 'large' );
						echo ! $image ? wc_placeholder_img() : $image;
					?>
				</a>
				<h4 class="gbt_18_category_grid_item_title">
					<?php echo esc_html( $cat->name ); ?>
					<?php if ( $productCount ) { ?>
						<span class="gbt_18_category_grid_item_count"><?php echo esc_attr( $cat->count ); ?></span>
					<?php } ?>
				</h4>
			</div>
		<?php endforeach; ?>
		<div class="clearfix"></div>
	 </div>
	</section>
		<?php
	endif;
	return ob_get_clean();
}

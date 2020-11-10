<?php
/**
 * Scattered Product List
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

require_once dirname( __FILE__ ) . '/functions/function-setup.php';

/**
 * Frontend Output
 */
function pbfw_render_frontend_expanding_grid( $attributes ) {

	extract(
		shortcode_atts(
			array(
				'productIDs'       => '',
				'align'            => 'center',
				'queryOrder'       => '',
				'queryDisplayType' => 'all_products',
				'queryProducts'    => 'wc/v3/products?per_page=10',
				'limit'			   => 10
			),
			$attributes
		)
	);

	$queryProducts = str_replace( '/wc/v3/products?', '', $queryProducts );
	$query         = explode( '&', $queryProducts );
	$a             = [];
	foreach ( $query as $q ) {
		$temp = explode( '=', $q );
		if ( isset( $temp[0] ) && isset( $temp[1] ) ) {
			$a[ $temp[0] ] = $temp[1];
		}
	}

	$args = [
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' => isset( $limit ) ? $limit : 10,
		'tax_query'      => array(
			array(
				'taxonomy' => 'product_visibility',
				'terms'    => array( 'exclude-from-catalog' ),
				'field'    => 'name',
				'operator' => 'NOT IN',
			),
		),
	];
	switch ( $queryDisplayType ) {
		case 'specific':
			$args['post__in'] = explode( ',', $productIDs );
			$args['orderby']  = 'post__in';
			break;
		case 'all_products':
			break;
		case 'filter_by':
			if ( isset( $a['featured'] ) ) {
				$args['tax_query'][] = array(
					'taxonomy' => 'product_visibility',
					'field'    => 'name',
					'terms'    => 'featured',
					'operator' => 'IN',
				);
			}
			if ( isset( $a['on_sale'] ) ) {
				$args['post__in'] = wc_get_product_ids_on_sale();
			}
			if ( isset( $a['attribute'] ) && isset( $a['attribute_term'] ) ) {
				$args['tax_query'][] = array(
					'taxonomy' => $a['attribute'],
					'field'    => 'id',
					'terms'    => explode( ',', $a['attribute_term'] ),
					'operator' => 'IN',
				);
			}
			break;
		case 'by_category':
			if ( isset( $a['category'] ) ) {
				$args['tax_query'][] = array(
					'taxonomy' => 'product_cat',
					'field'    => 'id',
					'terms'    => explode( ',', $a['category'] ),
					'operator' => 'IN',
				);
			}
			break;

		default:
			break;
	}

	if ( $queryDisplayType != 'specific' ) {
		$args['order']   = isset( $a['order'] ) ? $a['order'] : 'date';
		$args['orderby'] = isset( $a['orderby'] ) ? $a['orderby'] : 'desc';
	}

	$lc = new WP_Query( $args );
	ob_start();

	$products = [];

	if ( $lc->have_posts() ) :
		while ( $lc->have_posts() ) :
			$lc->the_post();
			$products[] = wc_get_product( get_the_ID() );
		endwhile;
		wp_reset_postdata();
	endif;

	if ( $products ) :
		?>
		<div class="wp-block-getbowtied-scattered-product-list gbt_18_expanding_grid align<?php echo $align; ?>">
			<div class="gbt_18_grid">
				<?php foreach ( $products as $product ) : ?>
					<div id="product-<?php echo $product->get_id(); ?>" class="gbt_18_expanding_grid_item">
						<a href="<?php echo $product->get_permalink(); ?>">
							<?php $image = wp_get_attachment_image( $product->get_image_id(), 'large' ); ?>
							<div class="gbt_18_feature_image">
								<?php echo ! $image ? wc_placeholder_img() : $image; ?>
							</div>
							<div class="gbt_18_product-info">
								<h2 class="gbt_18_product_title">
									<span><?php echo $product->get_name(); ?></span>
								</h2>
								<span class="gbt_18_product_price">
									<?php echo $product->get_price_html(); ?>
								</span>
							</div>
						</a>
					</div>
				<?php endforeach; ?>
			</div>
		</div>
		<?php
	endif;
	return ob_get_clean();
}

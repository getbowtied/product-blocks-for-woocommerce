<?php
/**
 * Product Carousel
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

require_once dirname( __FILE__ ) . '/functions/function-setup.php';

/**
 * Frontend Output
 */
function pbfw_render_frontend_products_carousel( $attributes ) {

	extract(
		shortcode_atts(
			array(
				'productIDs'       => '',
				'align'            => 'center',
				'queryOrder'       => '',
				'columns'          => 3,
				'queryDisplayType' => 'all_products',
				'queryProducts'    => 'wc/v3/products?per_page=10',
				'spaceBetween'		 => 20,
			),
			$attributes
		)
	);

	$queryProducts = str_replace( 'wc/v3/products?', '', $queryProducts );
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
		'posts_per_page' => isset( $a['per_page'] ) ? $a['per_page'] : 10,
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
	$unique = uniqid();
	ob_start();
	if ( $lc->have_posts() ) { ?>
		<div class="wp-block-getbowtied-carousel align<?php echo $align; ?>">
			<div class="swiper-navigation-container">
				<div class="swiper-container gbt_18_swiper-container swiper-<?php echo esc_attr($unique); ?>" data-columns="<?php echo $columns; ?>" data-spaceBetween="<?php echo $spaceBetween; ?>" data-id="<?php echo esc_attr($unique); ?>">
					<div class="swiper-wrapper">
						<?php
						while ( $lc->have_posts() ) :
							$lc->the_post();

							$product = wc_get_product( get_the_ID() );

							if( $product->is_in_stock() || ( !$product->is_in_stock() && ( 'no' === get_option('woocommerce_hide_out_of_stock_items') ) ) ) {
								?>
								<div class="swiper-slide woocommerce">
									<ul class="products">
										<?php wc_get_template_part( 'content', 'product' ); ?>
									</ul>
								</div>
								<?php
							}
							?>
						<?php endwhile; ?>
					</div>
					<div class="swiper-pagination"></div>
					<div class="swiper-button-prev">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path d="M427.699 171.705c9.999-9.996 10.001-26.205 0.005-36.204s-26.205-10.001-36.204-0.005l-307.2 307.107c-9.999 9.996-10.001 26.205-0.005 36.204l307.2 307.293c9.996 9.999 26.205 10.001 36.204 0.005s10.001-26.205 0.005-36.204l-289.101-289.188 289.095-289.008zM102.4 435.2c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6h819.2c14.138 0 25.6-11.462 25.6-25.6s-11.462-25.6-25.6-25.6h-819.2z"></path></svg>
					</div>
					<div class="swiper-button-next">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path d="M596.301 749.895c-9.999 9.996-10.001 26.205-0.005 36.204s26.205 10.001 36.204 0.005l307.2-307.107c9.999-9.996 10.001-26.205 0.005-36.204l-307.2-307.293c-9.996-9.999-26.205-10.001-36.204-0.005s-10.001 26.205-0.005 36.204l289.101 289.188-289.095 289.008zM921.6 486.4c14.138 0 25.6-11.462 25.6-25.6s-11.462-25.6-25.6-25.6h-819.2c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6h819.2z"></path></svg>
					</div>
				</div>
			</div>
		</div>
		<?php
	} wp_reset_postdata();
	return ob_get_clean();
}

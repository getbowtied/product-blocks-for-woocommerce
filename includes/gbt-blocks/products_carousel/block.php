<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

require_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
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
	ob_start();
	if ( $lc->have_posts() ) { ?>
		<div class="wp-block-getbowtied-carousel align<?php echo $align; ?>">
			<div class="swiper-navigation-container">
				<div class="swiper-container gbt_18_swiper-container" data-columns="<?php echo $columns; ?>" data-spaceBetween="<?php echo $spaceBetween; ?>">
					<div class="swiper-wrapper">
						<?php
						while ( $lc->have_posts() ) :
							$lc->the_post();
							?>
							<div class="swiper-slide">
								<ul class="products">
									<?php wc_get_template_part( 'content', 'product' ); ?>
								</ul>
							</div>
						<?php endwhile; ?>
					</div>
					<div class="swiper-pagination"></div>
					<div class="swiper-button-prev"></div>
					<div class="swiper-button-next"></div>
				</div>
			</div>
		</div>
		<?php
	} wp_reset_postdata();
	return ob_get_clean();
}

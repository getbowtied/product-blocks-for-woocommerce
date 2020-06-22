<?php
/**
 * Products Slider
 */

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

require_once dirname( __FILE__ ) . '/functions/function-setup.php';

/**
 * Frontend Output
 */
function pbfw_render_frontend_products_slider( $attributes ) {
	extract(
		shortcode_atts(
			array(
				'productIDs' => '',
			),
			$attributes
		)
	);

	$products = wc_get_products(
		[
			'include' => explode( ',', $productIDs ),
			'limit'   => -1,
		]
	);

	$sorted = [];
	foreach ( explode( ',', $productIDs ) as $id ) {
		foreach ( $products as $unsorted ) {
			if ( $unsorted->get_id() == $id ) {
				$sorted[] = $unsorted;
				break;
			}
		}
	}

	if ( sizeof( $sorted ) == sizeof( $products ) ) {
		$products = $sorted;
	}

	ob_start();
	if ( $products ) :
		printf( '<div class="wp-block-getbowtied-vertical-slider gbt_18_default_slider alignfull">' );
		   printf( '<div class="gbt_18_content">' );
			   printf( '<div class="gbt_18_content_wrapper">' );
				   printf( '<div class="gbt_18_slide_header"><span class="gbt_18_line"></span></div>' );
					   printf( '<div class="gbt_18_slide_content">' );
		foreach ( $products as $product ) :
			printf(
				'<div class="gbt_18_slide_content_item product">
								 			<div class="gbt_18_slide_content_wrapper">
								 				<div class="summary entry-summary">
								 					<h2 class="product-title entry-title gbt_18_slide_title"><a href="%s">%s</a></h2>
													<p class="price">%s</p>',
				esc_url( get_permalink( $product->get_id() ) ),
				$product->get_name(),
				$product->get_price_html(),
				$product->get_short_description()
			);
			// Product Stock
			if ( $product->is_in_stock() === false ) : ?>
									<p class="stock <?php echo $product->get_availability()['class']; ?>"><?php echo $product->get_availability()['availability']; ?></p>
											<?php
								endif;
			// Product add to cart button
			?>
								<div class="cart">
								<?php if ( $product->get_type() == 'simple' && $product->is_in_stock() && $product->is_purchasable() ) : ?>
									<?php
									woocommerce_quantity_input(
										array(
											'min_value'   => $product->get_min_purchase_quantity(),
											'max_value'   => $product->get_max_purchase_quantity(),
											'input_value' => $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
										),
										$product
									);
									?>
									<button type="submit"
											class="single_add_to_cart_button button alt ajax_add_to_cart add_to_cart_button"
											value="<?php echo $product->get_id(); ?>"
											data-product_id="<?php echo $product->get_id(); ?>"
											data-quantity="1"
											href="<?php echo esc_url( $product->add_to_cart_url() ); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</button>
								<?php else : ?>
									<a
											class="single_add_to_cart_button button alt"
											href="<?php echo esc_url( $product->add_to_cart_url() ); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</a>
								<?php endif; ?>
								</div>
								<input type="hidden" name="slide-link" value="<?php echo esc_url(get_permalink($product->get_id())); ?>" />
								<?php printf( '<div class="gbt_18_slide_link"><a href="#"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 1024 1024"><path d="M596.301 749.895c-9.999 9.996-10.001 26.205-0.005 36.204s26.205 10.001 36.204 0.005l307.2-307.107c9.999-9.996 10.001-26.205 0.005-36.204l-307.2-307.293c-9.996-9.999-26.205-10.001-36.204-0.005s-10.001 26.205-0.005 36.204l289.101 289.188-289.095 289.008zM921.6 486.4c14.138 0 25.6-11.462 25.6-25.6s-11.462-25.6-25.6-25.6h-819.2c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6h819.2z"></path></svg>%s</a></div>', __( 'View Product Page', 'block-shop' ) ); ?>
						<?php
						printf( '</div></div></div>' );
						endforeach;
				   printf( '</div>' );
				   printf( '<div class="gbt_18_slide_controls"></div>' );
			   printf( '</div>' );
		   printf( '</div>' );

		   printf( '<div class="gbt_18_img">' );
			   printf( '<div class="gbt_18_img_wrapper">' );
		foreach ( $products as $product ) :
			$image = wp_get_attachment_image( $product->get_image_id(), 'large' );
			printf( '<a class="gbt_18_image_link" href="%s">%s</a>', get_permalink( $product->get_id() ), ! $image ? wc_placeholder_img() : $image );
				   endforeach;
			   printf( '</div>' );
		   printf( '</div>' );
		  printf( '</div>' );
	endif;

	return ob_get_clean();
}

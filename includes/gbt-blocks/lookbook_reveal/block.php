<?php
/**
 * LookBook - Product Reveal
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

require_once dirname( __FILE__ ) . '/functions/function-setup.php';

/**
 * Frontend Output
 */
function pbfw_render_frontend_lookbook_reveal_product( $attributes ) {

	extract(
		shortcode_atts(
			array(
				'productIDs' => '',
				'bgColor'    => '#abb7c3',
				'textColor'  => '#ffffff',
				'align'      => 'center',
			),
			$attributes
		)
	);

	ob_start();

	if ( $productIDs ) :

		$products = wc_get_products(
			[
				'status'         => 'publish',
				'posts_per_page' => 1,
				'include'        => [ $productIDs ],
			]
		);

		if ( $products ) :?>
			<div class="gbt_18_distorsion_lookbook">
				<?php foreach ( $products as $product ) : ?>
					<section class="gbt_18_distorsion_lookbook_item">
						<?php
							$image = wp_get_attachment_image_src( $product->get_image_id(), array( 1000, 1000 ) );
							$iobj  = wp_get_attachment_image( $product->get_image_id(), array( 1000, 1000 ) );

							$gallery_ids = $product->get_gallery_image_ids();
						if ( isset( $gallery_ids[0] ) ) {
							$image2 = wp_get_attachment_image_src( $gallery_ids[0], array( 1000, 1000 ) );
							$iobj2  = wp_get_attachment_image( $gallery_ids[0], array( 1000, 1000 ) );
						}
						?>
						<style>.product-<?php echo $product->get_id(); ?> a.added_to_cart.wc-forward { color: <?php echo $textColor; ?>; } ?> </style>
						<a class="gbt_18_fade_images_link" href="<?php echo $product->get_permalink(); ?>">
								<div class="gbt_18_fade_images">
									<?php echo isset( $iobj ) ? $iobj : wc_placeholder_img(); ?>
									<?php echo isset( $iobj2 ) ? $iobj2 : ''; ?>
								</div>
						</a>
						<div class="gbt_18_distorsion_lookbook_content product-<?php echo $product->get_id(); ?>" style="background-color: <?php echo $bgColor; ?>;">
							<div class="gbt_18_text_wrapper" style="color:<?php echo $textColor; ?>">
								<div class="gbt_18_content_top">
									<h2 style="color:<?php echo $textColor; ?>"><?php echo $product->get_name(); ?></h2>
									<div class="gbt_18_description" style="color:<?php echo $textColor; ?>"><?php echo $product->get_short_description(); ?></div>
								</div>
								<div class="gbt_18_content_bottom">
									<span class="gbt_18_product_price" style="color:<?php echo $textColor; ?>">
										<?php echo $product->get_price_html(); ?>
									</span>
									<?php if ( ! function_exists( 'blockshop_version' ) ) : ?>
									<a 		style="color:<?php echo $bgColor; ?>; background-color: <?php echo $textColor; ?>;"
											<?php if ( $product->is_type( 'simple' ) && $product->is_purchasable() ) : ?>
											class="single_add_to_cart_button button alt ajax_add_to_cart add_to_cart_button"
											data-quantity="1"
											data-product_id="<?php echo esc_attr( $product->get_id() ); ?>"
											<?php else : ?>
											class="blockshop_add_to_cart single_add_to_cart_button button alt"
											<?php endif; ?>
											href="<?php echo esc_url( $product->add_to_cart_url() ); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</a>
										<?php
									else :
										$link_id = uniqid( $product->get_id() );

										?>
									<a 		style=""
											<?php if ( $product->is_type( 'simple' ) && $product->is_purchasable() ) : ?>
											class="blockshop_add_to_cart single_add_to_cart_button button alt ajax_add_to_cart add_to_cart_button"
											data-quantity="1"
											data-product_id="<?php echo esc_attr( $product->get_id() ); ?>"
											<?php else : ?>
											class="blockshop_add_to_cart single_add_to_cart_button button alt"
											<?php endif; ?>
											href="<?php echo esc_url( $product->add_to_cart_url() ); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</a>
										<?php
										if ( function_exists( 'blockshop_version' ) && function_exists( 'getbowtied_hex2rgb' ) ) :
											$body_rgb = getbowtied_hex2rgb( $bgColor );
											$text_rgb = getbowtied_hex2rgb( $textColor );
											?>

										<style type="text/css">
										.product-<?php echo $product->get_id(); ?> a.blockshop_add_to_cart.single_add_to_cart_button.button.alt,
										.product-<?php echo $product->get_id(); ?> a.added_to_cart.wc-forward,
										.gbt_18_distorsion_lookbook .gbt_18_distorsion_lookbook_content.product-<?php echo $product->get_id(); ?> .gbt_18_description a{
											background-image: linear-gradient(to top, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px);
											background-image: -webkit-linear-gradient(to top, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px);
											background-image: -moz-linear-gradient(to top, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px);
											background-image: -o-linear-gradient(to top, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px);
											background-image: -ms-linear-gradient(to top, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgb(<?php echo esc_attr( $text_rgb ); ?>) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px, rgba(<?php echo esc_attr( $body_rgb ); ?>, 0) 1px);
											border: none;
											color: <?php echo $textColor; ?>;
										}
										.product-<?php echo $product->get_id(); ?> a.blockshop_add_to_cart.single_add_to_cart_button.button.alt.loading {
											border-color: <?php echo $textColor; ?>;
										}
										.product-<?php echo $product->get_id(); ?> a.blockshop_add_to_cart.single_add_to_cart_button.button.alt.loading:after {
											background-color: <?php echo $textColor; ?>
										}

										</style>

										<?php endif; ?>
									<?php endif; ?>
								</div>
							</div>
						</div>
					</section>
				<?php endforeach; ?>
			</div>
			<?php
			wp_reset_postdata();
			?>
		<?php endif; ?>
	<?php endif; ?>
	<?php
	return ob_get_clean();
}

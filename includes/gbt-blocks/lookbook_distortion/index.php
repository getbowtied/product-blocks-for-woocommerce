<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_lookbook_distortion_product( $attributes ) {

	extract( shortcode_atts( array(
		'product_id'					=> '',
		'bg_color'						=> '#abb7c3',
		'text_color'					=> '#ffffff',
		'animation'						=> 'animation-1',
		'align'							=> 'center',
	), $attributes ) );

	ob_start();

	if( $product_id ) :

		$products = wc_get_products( [
			'status' 			=> 'publish',
			'posts_per_page' 	=> 1,
			'include' 			=> [$product_id]
		] );

		if ( $products ) :

		?>
			<div class="gbt_18_distorsion_lookbook <?php echo $align; ?>">
				<?php foreach( $products as $product ) : ?>

					<section class="gbt_18_distorsion_lookbook_item">
		                <div class="gbt_18_distorsion_image" data-displacement="<?php echo plugins_url( 'assets/images/animations/' . $animation . '.jpg', __FILE__ ); ?>" data-intensity="-0.65" data-speedIn="1.2" data-speedOut="1.2">
		                	<?php 
								$image = wp_get_attachment_image_src( $product->image_id, 'full' )[0];

								$gallery_ids = $product->get_gallery_attachment_ids();
	                			if( $gallery_ids[0] ) {
	                				$image2 = wp_get_attachment_image_src( $gallery_ids[0], 'full' )[0];
	                			}               
		    				?>

		                    <img src="<?php echo $image; ?>" alt="Imafdsge"/>
		                    <img src="<?php echo $image2; ?>" alt="Imfdsage"/>
		                </div>
		                <div class="gbt_18_distorsion_lookbook_content" style="background-color: <?php echo $bg_color; ?>;">
		                    <div class="gbt_18_text_wrapper">
		                        <h2 style="color:<?php echo $text_color; ?>"><?php echo $product->name; ?></h2>
		                        <p style="color:<?php echo $text_color; ?>"><?php echo $product->short_description; ?></p>
		                        <span class="gbt_18_product_price" style="color:<?php echo $text_color; ?>">
		                            <?php echo $product->get_price_html(); ?>
		                        </span>
		                        <?php if ( $product->get_type() == 'simple' ): ?>
									<?php 
									woocommerce_quantity_input( array(
										'min_value'   => $product->get_min_purchase_quantity(),
										'max_value'   => $product->get_max_purchase_quantity(),
										'input_value' => $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
									), $product);
									?>
									<button type="submit" 
											class="single_add_to_cart_button button alt ajax_add_to_cart add_to_cart_button" 
											value="<?php echo $product->get_id(); ?>"
											data-product_id="<?php echo $product->get_id(); ?>"
											data-quantity="1"
											href="<?php echo esc_url($product->add_to_cart_url()); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</button>
								<?php else: ?>
									<button type="submit" 
											class="single_add_to_cart_button button alt" 
											href="<?php echo esc_url($product->add_to_cart_url()); ?>">
											<?php echo $product->add_to_cart_text(); ?>
									</button>
								<?php endif; ?>
		                    </div>
		                </div>
		            </section>

				<?php endforeach; ?>

			</div>

			<?php

			wp_reset_postdata(); ?>

	    <?php endif; ?>

   	<?php endif; ?>

<?php
 return ob_get_clean();
}
<?php

// Products Slider

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_products_slider( $attributes ) {

	extract( shortcode_atts( array(
		'product_ids'					=> [],
		'columns'						=> '3',
		'align'							=> 'center',
	), $attributes ) );

	$products = wc_get_products( [
		'status' 			=> 'publish',
		'posts_per_page' 	=> 5,
		// 'include' 			=> $product_ids,
		'per_page'			=> 10
	] );

	ob_start();
?>

	<?php if ( $products ) : ?>
	
		<div class="gbt_18_default_slider <?php echo $align; ?>">
			<div class="gbt_18_content">
				<div class="gbt_18_content_wrapper">
					<div class="gbt_18_slide_header">
						<span class="gbt_18_line"></span>
					</div>
					<div class="gbt_18_slide_content">

						<?php

						foreach( $products as $product ) : ?>

							<div class="gbt_18_slide_content_item">
				                <h2 class="gbt_18_slide_title">
				                    <a target="_blank" href="<?php echo get_permalink($product->get_id()); ?>"><?php echo $product->get_name(); ?></a>
				                </h2>
				                <p class="price"><?php echo $product->get_price_html(); ?></p>
				                <p class="gbt_18_slide_text">
				                    <span class="gbt_18_p_wrapper"><?php echo substr($product->get_short_description(), 0, 100); ?></span>
				                </p>
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

				        <?php endforeach; ?>

					</div>
        			<div class="gbt_18_slide_controls"></div>
        		</div>
        	</div>

        	<div class="gbt_18_img">
        		<div class="gbt_18_img_wrapper">

        			<?php foreach( $products as $product ) : 

        				$image 			= wp_get_attachment_image_src( $product->get_image_id(), 'full' );
						$image_link  	= wp_get_attachment_url( $product->get_image_id() );
        				?>

        				<a target="_blank" class="gbt_18_image_link" href="<?php echo get_permalink($product->get_id()); ?>">
        					<img src="<?php echo $image[0]; ?>" alt="" />
        				</a>

        			<?php endforeach; ?>

        		</div>
        	</div>

		</div>

	<?php endif; ?>

<?php 
	return ob_get_clean();
}
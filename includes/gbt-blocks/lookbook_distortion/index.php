<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_lookbook_distortion_product( $attributes ) {

	extract( shortcode_atts( array(
		'product_id'					=> [],
		'bg_color'						=> '#abb7c3',
		'align'							=> 'center',
	), $attributes ) );

	$products = wc_get_products( [
		'status' 			=> 'publish',
		'posts_per_page' 	=> 1,
		'include' 			=> $product_id
	] );

	ob_start();

	if ( $products ) :

	?>
		<div class="gbt_18_distorsion_lookbook <?php echo $align; ?>">
			<?php foreach( $products as $product ) : ?>

				<section class="gbt_18_distorsion_lookbook_item">
	                <div class="gbt_18_distorsion_image" data-displacement="<?php echo plugins_url('16.jpg', __FILE__); ?>" data-intensity="-0.65" data-speedIn="1.2" data-speedOut="1.2">
	                	<?php 
							$image 			= wp_get_attachment_image_src( $product->image_id, 'full' );
							$image_link  	= wp_get_attachment_url( $product->image_id );
	    				?>

	                    <img src="<?php echo $image[0]; ?>" alt="Imafdsge"/>
	                    <img src="<?php echo $image[0]; ?>" alt="Imfdsage"/>
	                </div>
	                <div class="gbt_18_distorsion_lookbook_content" style="background-color: <?php echo $bg_color; ?>;">
	                    <div class="gbt_18_text_wrapper">
	                        <h2><?php echo $product->name; ?></h2>
	                        <p><?php echo $product->short_description; ?></p>
	                        <span class="gbt_18_product_price">
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

		<script>
	        imagesLoaded( document.querySelectorAll('img'), () => {
	            document.body.classList.remove('loading');
	        });

	        Array.from(document.querySelectorAll('.gbt_18_distorsion_image')).forEach((el) => {
	            const imgs = Array.from(el.querySelectorAll('img'));
	            new hoverEffect({
	                parent: el,
	                intensity: el.dataset.intensity || undefined,
	                speedIn: el.dataset.speedin || undefined,
	                speedOut: el.dataset.speedout || undefined,
	                easing: el.dataset.easing || undefined,
	                hover: el.dataset.hover || undefined,
	                image1: imgs[0].getAttribute('src'),
	                image2: imgs[1].getAttribute('src'),
	                displacementImage: el.dataset.displacement
	            });
	        });

	    </script>

    <?php endif;

 return ob_get_clean();
}
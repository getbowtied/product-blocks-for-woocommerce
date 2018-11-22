<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_lookbook_distortion_product( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'					=> '',
		'bgColor'						=> '#abb7c3',
		'textColor'					=> '#ffffff',
		'animation'						=> 'animation-1',
		'align'							=> 'center',
	), $attributes ) );

	ob_start();

	if( $productIDs ) :

		$products = wc_get_products( [
			'status' 			=> 'publish',
			'posts_per_page' 	=> 1,
			'include' 			=> [$productIDs]
		] );

		if ( $products ) :

		?>
			<div class="gbt_18_distorsion_lookbook <?php echo $align; ?>">
				<?php foreach( $products as $product ) : ?>

					<section class="gbt_18_distorsion_lookbook_item">
		                <div class="gbt_18_distorsion_image" data-displacement="<?php echo plugins_url( 'assets/images/animations/' . $animation . '.jpg', __FILE__ ); ?>" data-intensity="-0.65" data-speedIn="1.2" data-speedOut="1.2">
		                	<?php 
								$image = wp_get_attachment_image( $product->get_image_id(), 'square' );
								$image = !$image? wc_placeholder_img() : $image;

								$gallery_ids = $product->get_gallery_image_ids();
	                			if( isset($gallery_ids[0]) ) {
	                				$image2 = wp_get_attachment_image( $gallery_ids[0], 'square' );
	                			}    
	                			$image2 = !$image2? $image : $image2;           
		    				?>
								<?php 
									echo $image;
									echo $image2;
								?>
		                </div>
		                <div class="gbt_18_distorsion_lookbook_content" style="background-color: <?php echo $bgColor; ?>;">
		                    <div class="gbt_18_text_wrapper">
		                        <h2 style="color:<?php echo $textColor; ?>"><?php echo $product->get_name(); ?></h2>
		                        <p style="color:<?php echo $textColor; ?>"><?php echo $product->get_short_description(); ?></p>
		                        <span class="gbt_18_product_price" style="color:<?php echo $textColor; ?>">
		                            <?php echo $product->get_price_html(); ?>
		                        </span>
								<a 		style="color:<?php echo $textColor; ?>" 
										class="single_add_to_cart_button button alt" 
										href="<?php echo esc_url($product->add_to_cart_url()); ?>">
										<?php echo $product->add_to_cart_text(); ?>
								</a>
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
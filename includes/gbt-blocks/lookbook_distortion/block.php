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
			<div class="gbt_18_distorsion_lookbook">
				<?php foreach( $products as $product ) : ?>

					<section class="gbt_18_distorsion_lookbook_item">
						<?php 
							$image = wp_get_attachment_image_src( $product->get_image_id(), 'woocommerce_single' );
							$iobj  = wp_get_attachment_image( $product->get_image_id(), 'woocommerce_single' );

							$gallery_ids = $product->get_gallery_image_ids();
                			if( isset($gallery_ids[0]) ) {
                				$image2 = wp_get_attachment_image_src( $gallery_ids[0], 'woocommerce_single' );
                				$iobj2  = wp_get_attachment_image( $gallery_ids[0], 'woocommerce_single' );
                			}   

                			$distortion = false;
                			if (isset($image) && isset($image2)) {
                				if (isset($image[1]) && isset($image2[1]) && ($image[1] == $image2[1]) &&
                					isset($image[2]) && isset($image2[2]) && ($image[2] == $image2[2])) { // images have same width and weight
                					$distortion = true;
                					$ratio = $image[1] / $image[2];
                				}
                			}

                			if (isset($ratio)) {
                				if ($ratio >= 1) { // landscape image
                					$c_height = 50;
                					$c_width  = 50 * $ratio;
                					$margins  = ($c_width - 50) / 2;
                				} else {
                					$c_height = 50 / $ratio;
                					$c_width = 50;
                					$margins = 0;
                				}
                			}
						?>
						<?php if ($distortion === true): ?>
			                <div class="gbt_18_distorsion_image" style="margin: 0 -<?php echo $margins; ?>%; width: <?php echo $c_width; ?>%; height: 0; padding-bottom: <?php echo $c_height?>%;" data-displacement="<?php echo plugins_url( 'assets/images/animations/' . $animation . '.jpg', __FILE__ ); ?>" data-intensity="-0.65" data-speedIn="1.2" data-speedOut="1.2">
			                	<?php echo $iobj, $iobj2; ?>
			                </div>
		                <?php else : ?>
							<div class="gbt_18_fade_images">
								<?php echo isset($iobj)? $iobj : wc_placeholder_img(); ?>
								<?php echo isset($iobj2)? $iobj2 : ''; ?>
							</div>
		                <?php endif; ?>
		                <div class="gbt_18_distorsion_lookbook_content" style="background-color: <?php echo $bgColor; ?>;">
		                    <div class="gbt_18_text_wrapper">
		                    	<div class="gbt_18_content_top">
			                        <h2 style="color:<?php echo $textColor; ?>"><?php echo $product->get_name(); ?></h2>
			                        <div style="color:<?php echo $textColor; ?>"><?php echo $product->get_short_description(); ?></div>
			                    </div>
			                    <div class="gbt_18_content_bottom">
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
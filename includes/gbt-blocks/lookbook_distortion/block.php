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
							$image = wp_get_attachment_image_src( $product->get_image_id(), array(1000,1000) );
							$iobj  = wp_get_attachment_image( $product->get_image_id(), array(1000,1000) );

							$gallery_ids = $product->get_gallery_image_ids();
                			if( isset($gallery_ids[0]) ) {
                				$image2 = wp_get_attachment_image_src( $gallery_ids[0], array(1000,1000) );
                				$iobj2  = wp_get_attachment_image( $gallery_ids[0], array(1000,1000) );
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
                					$margins  = "margin: 0 " . -($c_width - 50) / 2 . "%";

                					$mob_c_height = 100;
                					$mob_c_width  = 100 * $ratio;
                					$mob_margins  = "margin: 0 " . -($mob_c_width - 100) / 2 . "%";
                				} else {
                					$c_height = 50 / $ratio;
                					$c_width = 50;
                					$margins = "margin: " . ($c_width - $c_height) / 2 . "% 0";

                					$mob_c_height = 100 / $ratio;
                					$mob_c_width  = 100;
                					$mob_margins  = "margin: " . ($mob_c_width - $mob_c_height) / 2 . "% 0";
                				}
                			}

                			$ident = uniqid('distortion_');
						?>
						<a href="<?php echo $product->get_permalink(); ?>">
							<?php if ($distortion === true): ?>
								<style>
									@media screen and (min-width: 768px) {
										.<?php echo $ident; ?> {
											<?php echo $margins; ?> !important;
											width: <?php echo $c_width; ?>% !important;
											height: 0 !important;
											padding-bottom: <?php echo $c_height?>% !important;
										}
									}
									@media screen and (max-width: 767px) {
										.<?php echo $ident; ?> {
											<?php echo $mob_margins; ?> !important;
											width: <?php echo $mob_c_width; ?>% !important;
											height: 0 !important;
											padding-bottom: <?php echo $mob_c_height?>% !important;
										}
									}
								</style>
				                <div class="gbt_18_distorsion_image <?php echo $ident; ?>" 
				                	data-displacement="<?php echo plugins_url( 'assets/images/animations/' . $animation . '.jpg', __FILE__ ); ?>" 
				                	data-intensity="-0.65" 
				                	data-speedIn="1.2" 
				                	data-speedOut="1.2">
				                	<?php echo $iobj, $iobj2; ?>
				                </div>
			                <?php else : ?>
								<div class="gbt_18_fade_images">
									<?php echo isset($iobj)? $iobj : wc_placeholder_img(); ?>
									<?php echo isset($iobj2)? $iobj2 : ''; ?>
								</div>
			                <?php endif; ?>
		            	</a>
		                <div class="gbt_18_distorsion_lookbook_content" style="background-color: <?php echo $bgColor; ?>;">
		                    <div class="gbt_18_text_wrapper">
		                    	<div class="gbt_18_content_top">
			                        <h2 style="color:<?php echo $textColor; ?>"><?php echo $product->get_name(); ?></h2>
			                        <div class="gbt_18_description" style="color:<?php echo $textColor; ?>"><?php echo $product->get_short_description(); ?></div>
			                    </div>
			                    <div class="gbt_18_content_bottom">
			                        <span class="gbt_18_product_price" style="color:<?php echo $textColor; ?>">
			                            <?php echo $product->get_price_html(); ?>
			                        </span>
									<a 		style="color:<?php echo $bgColor; ?>; background-color: <?php echo $textColor; ?>;" 
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
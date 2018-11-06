<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_lookbook_snap_to_scroll_product( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'					=> '',
		'imgURL'						=> '',
		'image_position'				=> 'image-right',
		'align'							=> 'center',
	), $attributes ) );

	$products = wc_get_products( [
		'include' 			=> explode(',',$productIDs),
		'limit'				=> -1
	] );

	$sorted = [];
	foreach ( explode(',',$productIDs) as $id) {
		foreach ($products as $unsorted) {
			if ($unsorted->get_id() == $id) {
				$sorted[] = $unsorted;
				break;
			}
		}
	}

	if (sizeof($sorted) == sizeof($products)) {
		$products= $sorted;
	}

	ob_start();

	if ( $products ) :

	?>
		<section class="gbt_18_look_book_item gbt_18_look_book_type_grid <?php echo $image_position; ?>">
            <div class="gbt_18_look_image">
                <img src="<?php echo $imgURL; ?>">
                <div class="gbt_18_shop_this_book">
                    <h5><?php echo __( 'Shop this look', 'gbt-blocks'); ?></h5>
                </div>
            </div>
            <div class="gbt_18_look_product_box">

				<?php foreach( $products as $product ) : ?> 

                    <div class="gbt_18_look_item">
                        <div class="gbt_18_item_wrapper">
                            <div class="gbt_18_look_product_image">
                            	<?php
									$image_link = wp_get_attachment_url( $product->get_image_id() );
                            	?>
                                <a href="<?php echo get_permalink($product->get_id()); ?>">
                                    <img src="<?php echo $image_link; ?>" alt="test">
                                </a>
                            </div>
                            <div class="gbt_18_look_product_info">
                            	<?php if( $product->get_average_rating() > 0 ) : ?>
	                                <div class="star-rating">
	                                    <span style="width:<?php echo $product->get_average_rating() * 20; ?>%">
	                                        Rated <strong class="rating"><?php echo $product->get_average_rating(); ?></strong> out of 5
	                                    </span>
	                                </div>
	                            <?php endif; ?>
                                <a href="<?php echo get_permalink($product->get_id()); ?>" class="gbt_18_look_product_title" >
                                    <h2 class="woocommerce-loop-product__title">
                                        <?php echo $product->get_name(); ?>
                                    </h2>
                                </a>
                                <span class="gbt_18_product_price">
                                    <?php echo $product->get_price_html(); ?>
                                </span>
                            </div>
                        </div>
                    </div>

				<?php endforeach; ?>

			</div>
		</section>

		<?php

		wp_reset_postdata(); ?>

    <?php endif; ?>

<?php
 return ob_get_clean();
}
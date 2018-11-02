<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_expanding_grid( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'		=> '',
		'align'				=> 'center',
		'queryOrder'		=> '',
	), $attributes ) );

	switch ( $queryOrder ) {
		case 'date_desc':
			$orderby= 'date';
			$order= 'desc';
		break;
		case 'date_asc':
			$orderby= 'date';
			$order= 'asc';
		break;
		case 'title_desc':
			$orderby= 'title';
			$order= 'desc';
		break;
		case 'title_asc':
			$orderby= 'title';
			$order= 'asc';
		break;
		default: 
			$orderby = 'none';
			$order = '';
		break;
	}

	$products = wc_get_products( [
		'include' 			=> explode(',',$productIDs),
		'limit'				=> -1,
		'orderby'			=> $orderby,
		'order'				=> $order
	] );

	ob_start();

	if ($orderby == 'none') {
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
	}

	if ( $products ) :

	?>

		<div class="gbt_18_expanding_grid <?php echo $align; ?>">

            <div class="gbt_18_grid">

            	<?php foreach( $products as $product ) : ?>

					<div id="product-<?php echo $product->get_id(); ?>" class="gbt_18_expanding_grid_item">

						<?php 
							$image 			= wp_get_attachment_image_src( $product->get_image_id(), 'full' );
							$image_link  	= wp_get_attachment_url( $product->get_image_id() );
	    				?>
	                    <div class="gbt_18_feature_image">
	                        <img src="<?php echo $image[0]; ?>" alt="">
	                    </div>
	                    <div class="gbt_18_product-info">
	                        <h2 class="gbt_18_product_title">
	                            <span><?php echo $product->get_name(); ?></span>
	                        </h2>
	                        <span class="gbt_18_product_price">
	                            <?php echo $product->get_price_html(); ?>
	                        </span>
	                    </div>
	                </div>

               	<?php endforeach; ?>

            </div>

            <?php foreach( $products as $product ) : ?>

            <div id="product-<?php echo $product->get_id(); ?>" class="gbt_18_expanded_content">
                <span class="gbt_18_close_content">X</span>
                <div class="gbt_18_expanded_bg"></div>
                <div class="gbt_18_product_details">
                    <div class="summary entry-summary">
                        <h1 class="product_title entry-title"><?php echo $product->get_name(); ?></h1>

                        <?php echo $product->get_price_html(); ?>

                        <div class="woocommerce-product-details__short-description">
                            <p><?php echo $product->get_short_description(); ?></p>
                        </div>
                        <p class="stock in-stock">2 in stock</p>
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

                <?php $attachment_ids = $product->get_gallery_image_ids(); ?>
                
                <div class="gbt_18_product_image">
                	<?php foreach( $attachment_ids as $attachment_id ) : ?>

                		<?php $image_url = wp_get_attachment_image_src( $attachment_id, 'full' )[0]; ?>
                		<div class="gbt_18_product_image_item">
	                        <img src="<?php echo $image_url; ?>" alt="img 01"/>
	                    </div>
                	<?php endforeach ?>
                </div>
            </div>

            <?php endforeach; ?>

        </div>

	<?php endif;
	wp_reset_postdata(); ?>

<?php

 return ob_get_clean();
}
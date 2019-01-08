<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_expanding_grid( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'					=> '',
		'align'							=> 'center',
		'queryOrder'					=> '',
		'queryDisplayType'				=> 'all_products',
		'queryProducts'					=> 'wc/v3/products?per_page=10'
	), $attributes ) );

$queryProducts = str_replace('/wc/v3/products?', '',$queryProducts);
	$query = explode('&',$queryProducts);
	$a = [];
	foreach ($query as $q) {
		$temp = explode('=', $q);
		if(isset($temp[0]) && isset($temp[1])) $a[$temp[0]] = $temp[1];
	}

	$args = [
		'post_type'      => 'product',
		'post_status'    => 'publish',
		'posts_per_page' =>  isset($a['per_page'])? $a['per_page'] : 10,
		'tax_query'		 => array(array(
            'taxonomy'  => 'product_visibility',
            'terms'     => array('exclude-from-catalog'),
            'field'     => 'name',
            'operator'  => 'NOT IN',
        )),
	];
	switch ($queryDisplayType) {
		case 'specific':
			$args['post__in'] 	= explode(',',$productIDs);
			$args['orderby']	= 'post__in';
			break;
		case 'all_products':
			break;
		case 'filter_by':
			if (isset($a['featured'])){
				$args['tax_query'][] = array(
				    'taxonomy' => 'product_visibility',
				    'field'    => 'name',
				    'terms'    => 'featured',
				    'operator' => 'IN'
				);
			}
			if (isset($a['on_sale'])){
				$args['post__in'] = wc_get_product_ids_on_sale();
			}
			if (isset($a['attribute']) && isset($a['attribute_term'])){
				$args['tax_query'][] = array(
			        'taxonomy'        => $a['attribute'],
			        'field'           => 'id',
			        'terms'           =>  explode(',',$a['attribute_term']),
			        'operator'        => 'IN',
			    );
			}
			break;
		case 'by_category': 
			if (isset($a['category'])) 
				$args['tax_query'][] = array(
			        'taxonomy'        => 'product_cat',
			        'field'           => 'id',
			        'terms'           =>  explode(',',$a['category']),
			        'operator'        => 'IN',
			    );
			break;

		default:
		break;
	}

	if ($queryDisplayType != 'specific'){
		$args['order'] 		= isset($a['order'])? $a['order'] : 'date';
		$args['orderby'] 	= isset($a['orderby'])? $a['orderby'] : 'desc';
	}

	$lc = new WP_Query( $args );
	ob_start();

	$products = [];

	if ($lc->have_posts()) :
		while ($lc->have_posts()):
			$lc->the_post();
			$products[] = wc_get_product(get_the_ID());
		endwhile;
		wp_reset_postdata();
	endif;

	if ($products):
	?>
		<div class="wp-block-getbowtied-expanding-grid gbt_18_expanding_grid align<?php echo $align; ?>">
            <div class="gbt_18_grid">
            	<?php foreach( $products as $product ) : ?>
					<div id="product-<?php echo $product->get_id(); ?>" class="gbt_18_expanding_grid_item">
						<a href="<?php echo $product->get_permalink(); ?>">
							<?php $image 	= wp_get_attachment_image( $product->get_image_id(), 'large' );	?>
		                    <div class="gbt_18_feature_image">
		                        <?php echo !$image? wc_placeholder_img() : $image; ?>
		                    </div>
		                    <div class="gbt_18_product-info">
		                        <h2 class="gbt_18_product_title">
		                            <span><?php echo $product->get_name(); ?></span>
		                        </h2>
		                        <span class="gbt_18_product_price">
		                            <?php echo $product->get_price_html(); ?>
		                        </span>
		                    </div>
	                	</a>
	                </div>
               	<?php endforeach; ?>
            </div>
            <?php /*foreach( $products as $product ) : ?>
            <div id="product-<?php echo $product->get_id(); ?>" class="product gbt_18_expanded_content">
                <span class="gbt_18_close_content">X</span>
                <div class="gbt_18_expanded_bg"></div>
                <div class="gbt_18_product_details">
                    <div class="summary entry-summary">
                    	<?php // Product title ?>
                        	<h1 class="product_title entry-title"><?php echo $product->get_name(); ?></h1>

                        <?php // Product rating ?>
                        <?php if ( $product->get_review_count() > 0 ): ?>
	                        <div class="woocommerce-product-rating">
	                        	<div class="star-rating">
	                        	<?php echo wc_get_star_rating_html($product->get_average_rating(), $product->get_review_count());?>
	                        	</div>
	                        </div>
                    	<?php endif; ?>

                    	<?php // Product price ?>
                        	<p class="price"><?php echo $product->get_price_html(); ?></p>

                        <?php // Product description ?>
	                        <div class="woocommerce-product-details__short-description">
	                            <p><?php echo $product->get_short_description(); ?></p>
	                        </div>

	                    <?php // Product Stock 
	                    	if ( $product->is_in_stock() === false ): ?>
								<p class="stock <?php echo $product->get_availability()['class']; ?>"><?php echo $product->get_availability()['availability']; ?></p><br/>
	                    	<?php endif;?>
                        
                        <?php // Product add to cart button ?>
	                        <div class="cart">
	                        <?php if ( $product->get_type() == 'simple' && $product->is_in_stock() && $product->is_purchasable()): ?>
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
								<a 		target="_blank"
										class="single_add_to_cart_button button alt" 
										href="<?php echo esc_url($product->add_to_cart_url()); ?>">
										<?php echo $product->add_to_cart_text(); ?>
								</a>
							<?php endif; ?>
							</div>

                    </div>
                </div>
	        	<?php // Product Images
                $attachment_ids = $product->get_gallery_image_ids(); ?>
                <div class="gbt_18_product_image">
                	<?php 
                		// Main Image 
                		$image 	= wp_get_attachment_image( $product->get_image_id(), 'large' ); ?>
                		<div class="gbt_18_product_image_item">
							<?php echo !$image? wc_placeholder_img() : $image; ?>
                		</div>
                		<?php // Gallery Images
                		foreach( $attachment_ids as $attachment_id ) :
                			$image = wp_get_attachment_image( $attachment_id, 'large' ); 
                			if (!empty($image)): ?>
	                		<div class="gbt_18_product_image_item">
		                       <?php echo $image; ?>
		                    </div>
		                <?php endif;
		            endforeach ?>
                </div>
            </div>

            <?php endforeach;*/ ?>
        </div>
	<?php endif;
 return ob_get_clean();
}
<?php
// Products Slider

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function getbowtied_render_frontend_products_slider( $attributes ) {
	extract( shortcode_atts( array(
		'productIDs'					=> '',
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
		printf('<div class="wp-block-getbowtied-vertical-slider gbt_18_default_slider align%s">', $align);
	 		printf('<div class="gbt_18_content">');
				printf('<div class="gbt_18_content_wrapper">');
					printf('<div class="gbt_18_slide_header"><span class="gbt_18_line"></span></div>');
						printf('<div class="gbt_18_slide_content">');
							foreach( $products as $product ) : 
								 printf('<div class="gbt_18_slide_content_item"><h2 class="gbt_18_slide_title"><a target="_blank" href="%s">%s</a></h2>
								<p class="price">%s</p><p class="gbt_18_slide_text"><span class="gbt_18_p_wrapper">%s</span></p>',
								esc_url(get_permalink($product->get_id())),	
								$product->get_name(),
								$product->get_price_html(),
								$product->get_short_description());
								if ( $product->get_type() == 'simple' ):
									woocommerce_quantity_input( array(
										'min_value'   => $product->get_min_purchase_quantity(),
										'max_value'   => $product->get_max_purchase_quantity(),
										'input_value' => $product->get_min_purchase_quantity(), // WPCS: CSRF ok, input var ok.
									), $product);
									printf('<button type="submit" class="single_add_to_cart_button button alt ajax_add_to_cart add_to_cart_button" value="%d" data-product_id="%d" data-quantity="1" href="%s">%s</button>',
									$product->get_id(),
									$product->get_id(), 
									esc_url($product->add_to_cart_url()), 
									$product->add_to_cart_text());
								else:
									printf('<button type="submit" class="single_add_to_cart_button button alt" href="%s">%s</button>', esc_url($product->add_to_cart_url()), esc_html($product->add_to_cart_text()));
								endif;
							printf('</div>');
						endforeach;
					printf('</div>');
					printf('<div class="gbt_18_slide_controls"></div>');
				printf('</div>');
			printf('</div>');

			printf('<div class="gbt_18_img">');
				printf('<div class="gbt_18_img_wrapper">');
					foreach( $products as $product ) : 
						$image 			= wp_get_attachment_image_src( $product->get_image_id(), 'full' );
						$image_link  	= wp_get_attachment_url( $product->get_image_id() );
						printf('<a target="_blank" class="gbt_18_image_link" href="%s"><img src="%s" alt="" /></a>', get_permalink($product->get_id()), $image[0]);
					endforeach;
				printf('</div>');
			printf('</div>');
		printf('</div>');
	endif;

	return ob_get_clean();
}
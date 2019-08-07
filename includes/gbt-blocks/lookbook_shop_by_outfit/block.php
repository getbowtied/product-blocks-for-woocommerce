<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

include_once 'functions/function-setup.php';

//==============================================================================
//	Frontend Output
//==============================================================================
function pbfw_render_frontend_lookbook_snap_to_scroll_product( $attributes ) {

	extract( shortcode_atts( array(
		'productIDs'					=> '',
		'imgURL'						=> '',
		'imgID'							=> '',
		'image_position'				=> 'image-right',
		'align'							=> 'center',
	), $attributes ) );


	$columns = count(explode(',',$productIDs)) - 1;
	$row  = $columns > 3? 'rows-2' : '';
	$columns = $columns %2 == 0 && !($columns %3 == 0)? 2 : $columns;
	$columns = $columns %3 == 0 || $columns == 5? 3 : $columns;
	ob_start();

	// if ( $products ) :

	?>
		<section class="gbt_18_look_book_item gbt_18_look_book_type_grid <?php echo $image_position; ?>">
            <div class="gbt_18_look_image" <?php if (!empty($imgURL)) { echo 'style="background-image:url('.esc_url($imgURL).')"';}; ?>>
            	<div class="gbt_18_look_thumb">
					<?php 
						$thumb = wp_get_attachment_image($imgID, 'thumbnail');
						if ($thumb) echo $thumb;
					?>	
            	</div>
                <div class="gbt_18_shop_this_book">
                    <h5><?php echo __( 'Shop this look', 'gbt-blocks'); ?></h5>
                </div>
            </div>
            <?php if (!empty($productIDs)):?>
            <div class="gbt_18_look_product_box <?php echo $row; ?>">
        		<?php echo do_shortcode('[products columns="'.$columns.'" ids="'.$productIDs.'"]'); ?>
			</div>
			<?php endif; ?>
		</section>

		<?php

		wp_reset_postdata(); ?>

    <?php //endif; ?>

<?php
 return ob_get_clean();
}
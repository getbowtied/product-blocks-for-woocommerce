<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly


add_action( 'enqueue_block_editor_assets', 'getbowtied_products_slider_editor_assets' );

if ( ! function_exists( 'getbowtied_products_slider_editor_assets' ) ) {
	function getbowtied_products_slider_editor_assets() {

		wp_enqueue_script(
			'getbowtied-products-slider',
			plugins_url( 'js/backend/block.js', __FILE__ ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-slider-styles',
			plugins_url( 'css/backend/editor.css', __FILE__ ),
			array( 'wp-edit-blocks' )
		);

		wp_localize_script( 'getbowtied-products-slider', 'ajax_object',
	            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );
	}
}

add_action( 'enqueue_block_assets', 'getbowtied_products_slider_assets' );

if ( ! function_exists( 'getbowtied_products_slider_assets' ) ) {
	function getbowtied_products_slider_assets() {
		
		wp_enqueue_style(
			'getbowtied-products-slider-frontend-css',
			plugins_url( 'css/frontend/style.css', __FILE__ ),
			array()
		);

		wp_enqueue_script(
			'getbowtied-products-slider-frontend-js',
			plugins_url( 'js/frontend/scripts.js', __FILE__ ),
			array( 'jquery' )
		);
	}
}

register_block_type( 'getbowtied/products-slider', array(
	'attributes'      => array(
		'product_ids'	=> array(
			'type'		=> 'string',
			'default'	=> '',
		),
		'align'			=> array(
			'type'		=> 'string',
			'enum' 		=> array( 'wide', 'full', '' ),
		),
	),
	'render_callback' => 'getbowtied_render_frontend_products_slider',
) );

function getbowtied_render_frontend_products_slider( $attributes ) {

	extract( shortcode_atts( array(
		'product_ids'							=>  [],
	), $attributes ) );

	if (isset($attributes['product_ids'])) $product_ids = $attributes['product_ids']; else return;

	$product_ids = explode(",", $product_ids);
	$products = wc_get_products(array( "include" => $product_ids));

	ob_start();

	if ( !empty( $products ) ) {?>
		<div class="gbt_18_default_slider">
			<div class="gbt_18_content">
                <div class="gbt_18_content_wrapper">
                    <div class="gbt_18_slide_header">
                        <span class="gbt_18_line"></span>
                    </div>

                    <div class="gbt_18_slide_content product">
						<?php foreach ( $products as $product ) { ?>

						<div class="gbt_18_slide_content_item">
						    <h2 class="gbt_18_slide_title">
						        <a href="<?php echo esc_url($product->get_permalink()); ?>"><?php echo $product->get_name(); ?></a>
						    </h2>
						    <p class="gbt_18_slide_text summary">
						        <span class="gbt_18_p_wrapper">
    								<?php echo $product->get_price_html(); ?>
						        	<?php echo $product->get_short_description(); ?>
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
						        </span>
						    </p>
						</div>
						<?php } ?>
					</div><!-- /gbt_18_slide_content -->
                <div class="gbt_18_slide_controls"></div>
            	</div>
            </div>
			<div class="gbt_18_img">
	                <div class="gbt_18_img_wrapper">
	                <?php foreach ( $products as $product ) {
		    				$image_id = $product->get_image_id();
							if (isset($image_id)) {
								$src = wp_get_attachment_image_src($image_id, 'woocommerce_single');
								if (isset($src[0])) { ?>
									<a class="gbt_18_image_link" href="<?php echo esc_url($product->get_permalink()); ?>">
				                        <img src="<?php echo esc_url($src[0]) ;?>" alt="<?php echo $product->get_name();?>" />
				                    </a>
								<?php } 
							}

	               		} ?>
	               </div>
        	</div>
        </div>
	<?php 
	} 
	// $output_final = 'el("div",{key:"wp-block-gbt-products-slider",className:"wp-block-gbt-products-slider"},el("div",{className:"products_slider",key:"products_slider"},'.$output.'el("div",{className:"clearfix",key:"clearfix"})))'; 

	woocommerce_reset_loop();

	return ob_get_clean();
}

add_action('wp_ajax_getbowtied_render_backend_products_slider', 'getbowtied_render_backend_products_slider');
function getbowtied_render_backend_products_slider() {


	$attributes = isset($_POST['attributes'])? $_POST['attributes']: '';
	$output = '';
	$product_ids = array();

	extract( shortcode_atts( array(
		'product_ids'							=>  [],
	), $attributes ) );

	if ( isset( $attributes[ 'product_ids' ] ) ) {
		$ids = $attributes['product_ids'];
	} else {
		$ids = array();
	}

	$ids = explode(",", $ids);

	if( !empty($ids) ) $products = wc_get_products(array( "include" => $ids));

	if ( !empty( $products ) ) {
		foreach ( $products as $product ) {
			$name = $product->get_name();
			$image_id = $product->get_image_id();
			$image = wp_get_attachment_image_src( $image_id, $size = 'thumbnail');
			$output .= 'el("div",{className:"product",  id:"product-result-'.$product->get_id().'"},';
			if (isset($image[0])) {
				$output .= 'el("img",{src:"'.esc_url($image[0]).'"}),';
			}
			$output .= 'el("span",{className:"product-title"},"'.htmlspecialchars_decode($name).'"),';
			$output .= 'el("span", 
							{
								className:"remove", 
								key:"remove_product_'.$product->get_id().'", 
								onClick: function(){
									var arr = props.attributes.product_ids.split(",");
									var remove = "'.$product->get_id().'";
									var index = arr.indexOf(remove);
									if (index > -1) {
									  arr.splice(index, 1);
									  $(\'#search-result-'.$product->get_id().'\').toggleClass(\'selected\');
									}
									props.setAttributes({product_ids: arr.join(",")});
									getCategoriesGrid(arr.join(","));
								}
							},
							"x"
						)),';
		}
	} 
	woocommerce_reset_loop();

	$output_final = 'el("div",{key:"wp-block-gbt-products-slider",className:"wp-block-gbt-products-slider"},el("div",{className:"products_slider",key:"products_slider"},'.$output.'el("div",{className:"clearfix",key:"clearfix"})))'; 
	echo json_encode($output_final);
	die();
}


function getbowtied_search_category() {

	$keyword = isset($_POST['attributes']['query'])? $_POST['attributes']['query'] :'';
	if (empty($keyword) || strlen($keyword) < 3) {
		return;
	} 

	$tax_query = array(
      	array(
			'taxonomy' => 'product_visibility',
			'field'    => 'name',
			'terms'    => 'exclude-from-search',
			'operator' => 'NOT IN',
		)
    );

	$args = array(
		's'						 => $keyword,
		'posts_per_page'		 => 8,
		'post_type'				 => 'product',
		'post_status'			 => 'publish',
		'ignore_sticky_posts'	 => 1,
		'suppress_filters'		 => false,
		'tax_query'				 => $tax_query
	);

	$args = apply_filters('search_products_args', $args);
	$products = get_posts( $args );
	$return = array("ids" => array(), "html" => '');

	if ( !empty( $products ) ) {

		foreach ( $products as $post ) {

			$product = wc_get_product( $post );
			$id = $product->get_id();
			$name = $product->get_name();
			$return['ids'][] = ["value" => $id, "label"=> $name];
			$return['html'] .= '
				el(
					"div",
					{
						className: "search-result", 
						id: "search-result-'.$id.'",
						onClick: function(e) {
							if ($("search-result-'.$id.'").hasClass("selected")) {
								var arr = props.attributes.product_ids.split(",");
								var remove = "'.$id.'";
								var index = arr.indexOf(remove);
								if (index > -1) {
								  arr.splice(index, 1);
								}
								props.setAttributes({product_ids: arr.join(",")});
								getCategoriesGrid(arr.join(","));
							} else {
	           					var temp = [];
	           					temp.push('.$id.');
	           					var tempArr = attributes.product_ids.split(",");
	           					temp = temp.concat(tempArr);
	           					props.setAttributes({product_ids: temp.join(",")});
	           					getCategoriesGrid( temp.join(",") );
							}
							$("#search-result-'.$id.'").toggleClass("selected");
						},
					}, 
					"'. $name .'"
				),';
		}
	}
	$return['html'] .= 'el("div", {className: "search-results"}, '.$return['html'] .' el("div", {className:"clearfix"}))';
	echo json_encode($return);
	die();
}

add_action('wp_ajax_getbowtied_search_category', 'getbowtied_search_category');
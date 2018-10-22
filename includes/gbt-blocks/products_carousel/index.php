<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// register editor assets
add_action( 'admin_init', 'getbowtied_products_carousel_editor_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_editor_assets' ) ) {
	function getbowtied_products_carousel_editor_assets() {

		wp_register_script(
			'getbowtied-products-carousel-editor-scripts',
			plugins_url( 'js/backend/block.js', __FILE__ ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_localize_script( 'getbowtied-products-carousel-editor-scripts', 'ajax_object',
	            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_register_style(
			'getbowtied-products-carousel-editor-styles',
			plugins_url( 'css/backend/editor.css', __FILE__ ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/backend/editor.css' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-scripts',
			plugins_url( 'js/vendor/flexslider/jquery.flexslider.js', __FILE__ ),
			array( 'jquery' )
		);
	}
}

// register frontend assets
add_action( 'enqueue_block_assets', 'getbowtied_products_carousel_assets' );
if ( ! function_exists( 'getbowtied_products_carousel_assets' ) ) {
	function getbowtied_products_carousel_assets() {

		wp_enqueue_script(
			'getbowtied-products-carousel-scripts',
			plugins_url( 'js/vendor/flexslider/jquery.flexslider.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-products-carousel-scripts-flexslider',
			plugins_url( 'js/frontend/flexslider.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-styles',
			plugins_url( 'css/frontend/style.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/frontend/style.css' )
		);

		wp_enqueue_style(
			'getbowtied-products-carousel-flexslider-styles',
			plugins_url( 'js/vendor/flexslider/flexslider.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'js/vendor/flexslider/flexslider.css' )
		);
	}
}

register_block_type( 'getbowtied/products-carousel', array(
	'editor_style'  	=> 'getbowtied-products-carousel-editor-styles',
	'editor_script'		=> 'getbowtied-products-carousel-editor-scripts',
	'attributes'      	=> array(
		'orderby' 						=> array(
			'type'						=> 'string',
			'default'					=> 'newest',
		),
		'number'						=> array(
			'type'						=> 'integer',
			'default'					=> 6,
		),
		'products_source'		  		=> array(
			'type'	  					=> 'string',
			'default' 					=> 'all',
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_products_carousel',
) );

function getbowtied_render_frontend_products_carousel( $attributes ) {

	extract( shortcode_atts( array(
		'orderby'						=> 'newest',
		'number'     					=> 6,
		'products_source'      			=> 'date',
		'columns'						=> '3',
		'align'							=> 'center',
	), $attributes ) );

	$args = [
		'post_type' 		=> 'product',
		'status' 			=> 'publish',
		'orderby' 			=> $orderby,
	    'order' 			=> $products_source,
		'posts_per_page' 	=> $number
	];

	$loop = new WP_Query( $args );

	ob_start();

	?>

	<?php

	if ( $loop->have_posts() ) {
		$i = 0;
		while ( $loop->have_posts() ) : $loop->the_post();

			if( $i == 0 ) {
				echo '<div class="slide">';
				echo '<ul class="products columns-'.$columns.'">';
			}

			wc_get_template_part( 'content', 'product' );
			$i++;

			if( $i == $columns ) {
				echo '</ul>';
				echo '</div>';
				$i = 0;
			}

		endwhile;

		if( $i != 0 && $i < $columns ) {
			echo '</ul>';
			echo '</div>';
		}
	}
	wp_reset_postdata();

	return '<div class="wp-block-getbowtied-products-carousel flexslider ' . $align . '"><div class="slider">' . ob_get_clean() . '</div></div>';
}

add_action('wp_ajax_getbowtied_render_backend_products_carousel', 'getbowtied_render_backend_products_carousel');
function getbowtied_render_backend_products_carousel() {

	$attributes = $_POST['attributes'];
	$output = '';
	$output_final = '';

	extract( shortcode_atts( array(
		'orderby'						=> 'newest',
		'number'     					=> 6,
		'products_source'      			=> 'date',
		'columns'						=> '3',
	), $attributes ) );

	$args = [
		'status' => 'publish',
		'orderby' => $orderby,
	    'order' => $products_source,
		'limit' => $number
	];

	$products = wc_get_products( $args );

	if ( $products ) {

		$i = 0;
		foreach ($products as $product):

			if( $i == 0 ) {
				$output .= 'el("div", {className:"slide"}, ';
				$output .= 'el("ul", {className:"gbt-products products columns-'.$columns.'", key:"gbt-products"}, ';
			}

			$output .= 'el("li",{className:"gbt-product product", key:"gbt-product"},';

				$output .= 'el("a",{className:"woocommerce-loop-product__link", key:"gbt-product-link"},';

				    $image = wp_get_attachment_image_src( $product->image_id, 'thumbnail');
				    $image = isset($image[0]) ? $image[0] : wc_placeholder_img_src();

				    if ( isset($image) ) {
				    	$output .= 'el("img",{key:"gbt-product-thumbnail", src: "'.$image.'"}),';
					}

					$output .= 'el("h4",{className:"gbt-product-title", key:"gbt-product-title"}, "'.htmlspecialchars_decode($product->name).'"),';

					$output .= 'el("span",{className:"gbt-price price", key:"gbt-price"}, "'.$product->price.'"),';

					$output .= 'el("button",{className:"gbt-add-to-cart", key:"gbt-add-to-cart"}, "Add To Cart"),';

				$output .= '),';

			$output .= '),';

			$i++;

			if( $i == $columns ) {
				$output .= '),';
				$output .= '),';
				$i = 0;
			}

		endforeach;

		if( $i != 0 && $i < $columns ) {
			$output .= '),';
			$output .= '),';
		}

	} 

	$output_final = 'el( "div", {className:"flexslider", id:"flexslider"}, el( "div", {className: "slider"}, '.$output.') )'; 

	echo json_encode($output_final);
	exit;
}

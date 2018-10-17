<?php

// Categories Grid

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

// register editor assets
add_action( 'admin_init', 'getbowtied_categories_grid_editor_assets' );
if ( ! function_exists( 'getbowtied_categories_grid_editor_assets' ) ) {
	function getbowtied_categories_grid_editor_assets() {

		wp_register_script(
			'getbowtied-categories-grid-editor-scripts',
			plugins_url( 'js/backend/block.js', __FILE__ ),
			array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
		);

		wp_localize_script( 'getbowtied-categories-grid-editor-scripts', 'ajax_object',
	            array( 'ajax_url' => admin_url( 'admin-ajax.php' ) ) );

		wp_register_style(
			'getbowtied-categories-grid-editor-styles',
			plugins_url( 'css/backend/editor.css', __FILE__ ),
			array( 'wp-edit-blocks' ),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/backend/editor.css' )
		);
	}
}

// register frontend assets
add_action( 'enqueue_block_assets', 'getbowtied_categories_grid_assets' );
if ( ! function_exists( 'getbowtied_categories_grid_assets' ) ) {
	function getbowtied_categories_grid_assets() {

		wp_enqueue_script(
			'getbowtied-categories-grid-scripts',
			plugins_url( 'js/frontend/animation.js', __FILE__ ),
			array( 'jquery' )
		);

		wp_enqueue_script(
			'getbowtied-categories-grid-imagesloaded',
			plugins_url( 'js/frontend/__imagesloaded.pkgd.min.js', __FILE__ ),
			array()
		);

		wp_enqueue_style(
			'getbowtied-categories-grid-styles',
			plugins_url( 'css/frontend/style.css', __FILE__ ),
			array(),
			filemtime( plugin_dir_path( __FILE__ ) . 'css/frontend/style.css' )
		);
	}
}

register_block_type( 'getbowtied/categories-grid', array(
	'editor_style'  	=> 'getbowtied-categories-grid-editor-styles',
	'editor_script'		=> 'getbowtied-categories-grid-editor-scripts',
	'attributes'      	=> array(
		'orderby' 						=> array(
			'type'						=> 'string',
			'default'					=> 'title',
		),
		'number'						=> array(
			'type'						=> 'integer',
			'default'					=> 8,
		),
		'hide_empty'  					=> array(
			'type'    					=> 'boolean',
			'default' 					=> false,
		),
		'product_count'  				=> array(
			'type'    					=> 'boolean',
			'default' 					=> false,
		),
		'order'		  					=> array(
			'type'	  					=> 'string',
			'default' 					=> 'ASC',
		),
		'columns'						=> array(
			'type'						=> 'number',
			'default'					=> '3'
		),
		'parent'						=> array(
			'type'						=> 'string',
			'default'					=> '0',
		),
		'align'							=> array(
			'type'						=> 'string',
			'default'					=> 'center',
		),
		'className'						=> array(
			'type'						=> 'string',
			'default'					=> 'is-style-layout-1',
		),
	),

	'render_callback' => 'getbowtied_render_frontend_categories_grid',
) );

function getbowtied_render_frontend_categories_grid( $attributes ) {

	extract( shortcode_atts( array(
		'orderby'						=> 'title',
		'number'     					=> 8,
		'order'      					=> 'ASC',
		'columns'						=> '3',
		'hide_empty'				 	=> false,
		'product_count'				 	=> false,
		'parent'     					=> '0',
		'align'							=> 'center',
		'className'						=> 'is-style-layout-1'
	), $attributes ) );

	$args['taxonomy'] = 'product_cat';

	if( $orderby == 'title' ) {
		$args['orderby'] = $orderby;
		$args['order'] = $order;
	} else {
		$args['menu_order'] = $order;
	}

	$args['hide_empty'] = $hide_empty;
	$args['number'] = $number;

	if ( $parent == '0' ) {
		$args['parent'] = 0 ;
	} else {
		$args['pad_counts'] = true;
	}

	$product_categories = get_terms( $args );

	ob_start();

	if ( $product_categories ) :

		foreach ($product_categories as $cat): ?>

            <div class="gbt-category-grid-item">
                <a class="gbt-category-img" href="<?php echo get_term_link( $cat->slug, 'product_cat' ); ?>">
                    <?php 
                    	$thumbnail_id = get_woocommerce_term_meta( $cat->term_id, 'thumbnail_id', true );
					    $image = wp_get_attachment_image_src( $thumbnail_id, 'large');
					    $image = isset($image[0]) ? $image[0] : wc_placeholder_img_src();
					    if ( isset($image) ) {
						    echo '<img src="' . $image . '" alt="' . $cat->name . '" />';
						}
                    ?>
                </a>
                <h4 class="gbt-category-title">
                    <?php echo esc_html($cat->name); ?><span class="gbt-count"><?php echo esc_attr($cat->count); ?></span>
                </h4>
            </div>

		<?php endforeach; ?>
   
		<div class="clearfix"></div>
					
	<?php endif; ?>

	<?php

	return '<section class="wp-block-getbowtied-categories-grid gbt-grid '.$className.' ' . $align . '"><div class="gbt_categories_grid">' . ob_get_clean() . '</div></section>';
}

add_action('wp_ajax_getbowtied_render_backend_categories_grid', 'getbowtied_render_backend_categories_grid');
function getbowtied_render_backend_categories_grid() {

	$attributes = $_POST['attributes'];
	$output = '';
	$output_final = '';

	extract( shortcode_atts( array(
		'orderby'						=> 'title',
		'number'     					=> 8,
		'order'      					=> 'ASC',
		'columns'						=> '3',
		'hide_empty'				 	=> 0,
		'product_count'				 	=> 0,
		'parent'     					=> '0',
	), $attributes ) );

	$args['taxonomy'] = 'product_cat';

	if( $orderby == 'title' ) {
		$args['orderby'] = $orderby;
		$args['order'] = $order;
	} else {
		$args['menu_order'] = $order;
	}

	$args['hide_empty'] = $hide_empty;
	$args['number'] = $number;

	if ( $parent == '0' ) {
		$args['parent'] = 0;
	} else {
		$args['pad_counts'] = true;
	}

	$product_categories = get_terms( $args );

	if ( $product_categories ) {

		foreach ($product_categories as $cat): ?>

			<?php

			$output .= 'el("div",{className:"gbt-category-grid-item", key:"gbt-category-grid-item"},';

				$output .= 'el("a",{className:"gbt-category-img", key:"gbt-category-img-a"}';

					$thumbnail_id = get_woocommerce_term_meta( $cat->term_id, 'thumbnail_id', true );
				    $image = wp_get_attachment_image_src( $thumbnail_id, 'large');
				    $image = isset($image[0]) ? $image[0] : wc_placeholder_img_src();

				    if ( isset($image) ) {
				    	$output .= ',el("img",{key:"gbt-category-img", src: "'.$image.'"})';
					}

				$output .= '),';

				$output .= 'el("h4",{className:"gbt-category-title", key:"gbt-category-title"}, "'.htmlspecialchars_decode($cat->name).'"';

					if( $product_count ) {
						$output .= ',el("span",{className:"gbt-count", key:"gbt-count"}, "'.esc_attr($cat->count).'")';
					}

				$output .= ')';

			$output .= '),';

		endforeach;

	} 

	$output_final = 'el("div",{className:"gbt_editor_categories_grid",key:"gbt_categories_grid"},'.$output.'el("div",{className:"clearfix",key:"clearfix"}))'; 

	echo json_encode($output_final);
	exit;
}

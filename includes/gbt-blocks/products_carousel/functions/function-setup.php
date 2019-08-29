<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'pbfw_products_carousel_editor_assets' );
function pbfw_products_carousel_editor_assets() {
	wp_enqueue_script(
		'getbowtied-products-carousel-editor-scripts',
		plugins_url( 'block.js', dirname( __FILE__ ) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
	wp_enqueue_style(
		'getbowtied-products-carousel-editor-styles',
		plugins_url( 'assets/css/backend/editor.css', dirname( __FILE__ ) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/backend/editor.css' )
	);
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type(
	'getbowtied/products-carousel',
	array(
		'attributes'      => array(
			'productIDs'       => array(
				'type'    => 'string',
				'default' => '',
			),
			'align'            => array(
				'type'    => 'string',
				'default' => 'center',
			),
			'queryOrder'       => array(
				'type'    => 'string',
				'default' => '',
			),
			'columns'          => array(
				'type'    => 'int',
				'default' => 3,
			),
			'queryDisplayType' => array(
				'type'    => 'string',
				'default' => 'all_products',
			),
			'queryProducts'    => array(
				'type'    => 'string',
				'default' => 'wc/v3/products?per_page=10',
			),
			'spaceBetween'     => array(
				'type'    => 'int',
				'default' => 20,
			),
		),

		'render_callback' => 'pbfw_render_frontend_products_carousel',
	)
);

<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

//==============================================================================
//	Enqueue Editor Assets
//==============================================================================
add_action( 'admin_init', 'pbfw_expanding_grid_editor_assets' );
function pbfw_expanding_grid_editor_assets() {
	wp_enqueue_script(
		'getbowtied-scattered-product-list-editor-scripts',
		plugins_url( 'block.js', dirname( __FILE__ ) ),
		array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
	);
	wp_enqueue_style(
		'getbowtied-scattered-product-list-editor-styles',
		plugins_url( 'assets/css/backend/editor.css', dirname( __FILE__ ) ),
		array( 'wp-edit-blocks' ),
		filemtime( plugin_dir_path( dirname( __FILE__ ) ) . 'assets/css/backend/editor.css' )
	);
}

//==============================================================================
//	Register Block
//==============================================================================
register_block_type(
	'getbowtied/scattered-product-list',
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
			'queryDisplayType' => array(
				'type'    => 'string',
				'default' => 'all_products',
			),
			'queryProducts'    => array(
				'type'    => 'string',
				'default' => 'wc/v3/products?per_page=10',
			),
			'limit'            => array(
				'type'    => 'int',
				'default' => '10',
			),
		),

		'render_callback' => 'pbfw_render_frontend_expanding_grid',
	)
);

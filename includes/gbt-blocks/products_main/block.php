<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

register_block_type( 'getbowtied/products-main', array(
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
	'render_callback' => 'getbowtied_render_frontend_products_main',
) );

wp_enqueue_script(
	'getbowtied-products-main',
	plugins_url( 'block.js', __FILE__ ),
	array( 'wp-blocks', 'wp-components', 'wp-editor', 'wp-i18n', 'wp-element', 'jquery' )
);

wp_enqueue_style(
	'getbowtied-products-main-styles',
	plugins_url( 'assets/css/backend/editor.css', __FILE__ ),
	array( 'wp-edit-blocks' )
);

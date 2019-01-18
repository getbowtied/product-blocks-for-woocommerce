<?php

/**
 * Plugin Name:       		Product Blocks for WooCommerce
 * Plugin URI:        		https://github.com/getbowtied/product-blocks-for-woocommerce
 * Description:       		Advanced Blocks for WooCommerce.
 * Version:           		1.0
 * Author:            		GetBowtied
 * Author URI:        		https://getbowtied.com
 * License: 				GPLv2
 * License URI: 			http://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 		5.0
 * Tested up to: 			5.0.3
 * WC requires at least: 	3.5
 * WC tested up to: 		3.5.3
 *
 * @package  Product Blocks for WooCommerce
 * @author   GetBowtied
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

if ( ! function_exists( 'is_plugin_active' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
}

add_action( 'init', 'product_blocks_for_woocommerce' );
if(!function_exists('product_blocks_for_woocommerce')) {
	function product_blocks_for_woocommerce() {

		if( is_plugin_active( 'gutenberg/gutenberg.php' ) || is_wp_version('>=', '5.0') ) {
			include_once 'includes/gbt-blocks/index.php';
		} else {
			add_action( 'admin_notices', 'theme_warning' );
		}
	}
}

if( !function_exists('theme_warning') ) {
	function theme_warning() {

		?>

		<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">
			<p>Product Blocks for WooCommerce plugin couldn't find the Block Editor (Gutenberg) on this site. It requires WordPress 5+ or Gutenberg installed as a plugin.</p>
		</div>

		<?php
	}
}

if( !function_exists('is_wp_version') ) {
	function is_wp_version( $operator = '>', $version = '4.0' ) {

		global $wp_version;

		return version_compare( $wp_version, $version, $operator );
	}
}

add_action('init', 'gbt_image_sizes');
if( !function_exists('gbt_image_sizes') ) {
	function gbt_image_sizes() {
		add_image_size('gbt_square', 900, 900, true);
	}
}

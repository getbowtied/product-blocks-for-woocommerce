<?php

/**
 * Plugin Name:       		Product Blocks for WooCommerce
 * Plugin URI:        		https://github.com/getbowtied/product-blocks-for-woocommerce
 * Description:       		Advanced Blocks for WooCommerce.
 * Version:           		1.0
 * Author:            		GetBowtied
 * Author URI:        		https://getbowtied.com
 * Requires at least: 		4.9
 * Tested up to: 		4.9.8
 * WC requires at least: 	3.5
 * WC tested up to: 		3.5
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

add_action( 'init', 'product_blocks_updater' );
function product_blocks_updater() {

	if ( !class_exists('WP_GitHub_Updater')) require_once 'core/class-updater.php';

	if ( !defined('WP_GITHUB_FORCE_UPDATE')) define( 'WP_GITHUB_FORCE_UPDATE', true );

	if ( is_admin() ) {

		$config = array(
			'slug' 				 => plugin_basename(__FILE__),
			'proper_folder_name' => 'product-blocks-for-woocommerce',
			'api_url' 			 => 'https://api.github.com/repos/getbowtied/product-blocks-for-woocommerce',
			'raw_url' 			 => 'https://raw.github.com/getbowtied/product-blocks-for-woocommerce/master',
			'github_url' 		 => 'https://github.com/getbowtied/product-blocks-for-woocommerce',
			'zip_url' 			 => 'https://github.com/getbowtied/product-blocks-for-woocommerce/zipball/master',
			'sslverify'			 => true,
			'requires'			 => '4.9',
			'tested'			 => '4.9.8',
			'readme'			 => 'README.txt',
			'access_token'		 => '',
		);

		// new WP_GitHub_Updater( $config );

	}
}

function product_blocks_for_woocommerce() {

	//if( is_plugin_active( 'gutenberg/gutenberg.php' ) || is_wp_version('>=', '5.0') ) {
		include_once 'includes/gbt-blocks/index.php';
	// } else {
	// 	add_action( 'admin_notices', 'theme_warning' );
	// }
}
add_action( 'init', 'product_blocks_for_woocommerce' );

if( !function_exists('theme_warning') ) {
	function theme_warning() {

		echo '<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">';
		echo '<p>Product Blocks for WooCommerce is enabled but not effective. Please activate Gutenberg plugin in order to work.</p>';
		echo '</div>';
	}
}

if( !function_exists('is_wp_version') ) {
	function is_wp_version( $operator = '>', $version = '4.0' ) {

		global $wp_version;

		return version_compare( $wp_version, $version, $operator );
	}
}

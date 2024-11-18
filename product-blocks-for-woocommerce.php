<?php

/**
 * Plugin Name:       		Product Blocks for WooCommerce
 * Plugin URI:        		https://github.com/getbowtied/product-blocks-for-woocommerce
 * Description:       		Advanced Blocks for WooCommerce.
 * Version:           		1.9.1
 * Author:            		Get Bowtied
 * Author URI:        		https://getbowtied.com
 * License: 				GPLv2
 * License URI: 			http://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 		6.0
 * Tested up to: 			6.7
 * WC requires at least: 	9.0
 * WC tested up to: 		9.4
 *
 * @package  Product Blocks for WooCommerce
 * @author   GetBowtied
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

define('PBFW_VERSION', '1.9.1');
define('PBFW_SUFFIX', SCRIPT_DEBUG ? '' : '.min');

if ( ! function_exists( 'is_plugin_active' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
}

add_action( 'init', 'pbfw_includes' );
function pbfw_includes() {

	if ( !is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
		add_action( 'admin_notices', 'pbfw_woocommerce_warning' );
	} else if( ! (is_plugin_active( 'gutenberg/gutenberg.php' ) || pbfw_wp_version('>=', '5.0')) ) {
		add_action( 'admin_notices', 'pbfw_gutenberg_warning' );
	} else {
		include_once dirname( __FILE__ ) . '/includes/gbt-blocks/index.php';
	}
}

function pbfw_woocommerce_warning() {
	?>
	<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">
		<p><?php esc_html_e("Product Blocks for WooCommerce is enabled but not effective. It requires WooCommerce in order to work.", "getbowtied"); ?>.</p>
	</div>
	<?php
}

function pbfw_gutenberg_warning() {
	?>

	<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">
		<p><?php esc_html_e("Product Blocks for WooCommerce plugin couldn't find the Block Editor (Gutenberg) on this site. It requires WordPress 5+ or Gutenberg installed as a plugin.", "getbowtied"); ?></p>
	</div>

	<?php
}

function pbfw_wp_version( $operator = '>', $version = '4.0' ) {
	global $wp_version;
	return version_compare( $wp_version, $version, $operator );
}


// WooCommerce HPOS Compatibility
add_action('before_woocommerce_init', function() {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility( 'custom_order_tables', __FILE__, true );

    }
});
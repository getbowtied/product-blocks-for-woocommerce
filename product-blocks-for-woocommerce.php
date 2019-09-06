<?php

/**
 * Plugin Name:       		Product Blocks for WooCommerce
 * Plugin URI:        		https://github.com/getbowtied/product-blocks-for-woocommerce
 * Description:       		Advanced Blocks for WooCommerce.
 * Version:           		1.3.3
 * Author:            		GetBowtied
 * Author URI:        		https://getbowtied.com
 * License: 				GPLv2
 * License URI: 			http://www.gnu.org/licenses/gpl-2.0.html
 * Requires at least: 		5.0
 * Tested up to: 			5.2.2
 * WC requires at least: 	3.5
 * WC tested up to: 		3.7.0
 *
 * @package  Product Blocks for WooCommerce
 * @author   GetBowtied
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
} // Exit if accessed directly

define('PBFW_VERSION', '1.3.2');

if ( ! function_exists( 'is_plugin_active' ) ) {
    require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
}

class ProductBlocksForWooCommerce {

    /**
     * The single instance of the class.
     *
     * @var ProductBlocksForWooCommerce
    */
    protected static $_instance = null;

    /**
     * ProductBlocksForWooCommerce constructor.
     *
    */
    public function __construct() {

        add_action( 'init', array( $this, 'pbfw_includes' ) );
    }

    /**
     * Includes blocks or show warning
     *
     * @return void
     */
    public function pbfw_includes() {

    	if ( !is_plugin_active( 'woocommerce/woocommerce.php' ) ) {
    		add_action( 'admin_notices', array( $this, 'pbfw_woocommerce_warning' ) );
    	} else if( ! (is_plugin_active( 'gutenberg/gutenberg.php' ) || $this->pbfw_wp_version('>=', '5.0')) ) {
    		add_action( 'admin_notices', array( $this, 'pbfw_gutenberg_warning' ) );
    	} else {
    		include_once 'includes/gbt-blocks/index.php';
    	}
    }

    /**
     * Content of Woocommerce warning
     *
     * @return void
     */
    public function pbfw_woocommerce_warning() {
    	?>
    	<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">
    		<p><?php _e("Product Blocks for WooCommerce is enabled but not effective. It requires WooCommerce in order to work.", "getbowtied"); ?>.</p>
    	</div>
    	<?php
    }

    /**
     * Content of Gutenberg warning
     *
     * @return void
     */
    public function pbfw_gutenberg_warning() {
    	?>

    	<div class="message error woocommerce-admin-notice woocommerce-st-inactive woocommerce-not-configured">
    		<p><?php _e("Product Blocks for WooCommerce plugin couldn't find the Block Editor (Gutenberg) on this site. It requires WordPress 5+ or Gutenberg installed as a plugin.", "getbowtied"); ?></p>
    	</div>

    	<?php
    }

    /**
     * Check if WP version is at least the given version
     *
     * @param string $operator Comparison operator
     * @param string $version Given version to compare
     *
     * @return boolean
     */
    public function pbfw_wp_version( $operator = '>', $version = '4.0' ) {
    	global $wp_version;
    	return version_compare( $wp_version, $version, $operator );
    }

    /**
     * Ensures only one instance of ProductBlocksForWooCommerce is loaded or can be loaded.
     *
     * @return ProductBlocksForWooCommerce
    */
    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }
}

$product_blocks = new ProductBlocksForWooCommerce;

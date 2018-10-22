<?php
if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

//==============================================================================
//	Ajax product search
//==============================================================================
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
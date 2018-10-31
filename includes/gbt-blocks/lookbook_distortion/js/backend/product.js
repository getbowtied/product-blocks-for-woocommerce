( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var SelectControl		= components.SelectControl;
	var RangeControl		= components.RangeControl;
	var PanelColor			= components.PanelColor; // wp.editor.PanelColorSettings
	var ColorPalette		= components.ColorPalette;
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-distortion-product', {
		title: i18n.__( 'Lookbook Product' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M2 6h4v11H2zm5 13h10V4H7v15zM9 6h6v11H9V6zm9 0h4v11h-4z"})),
		category: 'product_blocks',
		parent: [ 'getbowtied/lookbook-distortion-lookbook' ],
		attributes: {
			product_id: {
				type: 'string',
				default: ''
			},
			result: {
				type: 'array',
				default: []
			},
			bg_color: {
	        	type: 'string',
	        	default: '#abb7c3'
	        },
		},

		edit: function( props ) {

			var attributes = props.attributes;

			var colors = [
				{ name: 'red', 				color: '#d02e2e' },
				{ name: 'orange', 			color: '#f76803' },
				{ name: 'yellow', 			color: '#fbba00' },
				{ name: 'green', 			color: '#43d182' },
				{ name: 'blue', 			color: '#2594e3' },
				{ name: 'white', 			color: '#ffffff' },
				{ name: 'dark-gray', 		color: '#abb7c3' },
				{ name: 'black', 			color: '#000' 	 },
			];

			function renderResults() {
				var products = props.attributes.result;

				var productElements = [];
				var dots = '';

				for ( i = 0; i < products.length; i++ ) {
					
					if( products[i]['name'].length > 35 ) { dots = '...'; } else { dots = ''; }

					productElements.push(
						el( "div", { className: "gbt_18_editor_lookbook_product_content", key: "gbt_18_editor_lookbook_product_content"},
							el( "div", { className: "gbt_18_editor_lookbook_product_content_left", key: "gbt_18_editor_lookbook_product_content_left"},
								el( "div", { className: "gbt_18_editor_lookbook_product_content_left_inner_top", key: "gbt_18_editor_lookbook_product_content_left_inner_top"},
									el("h2", { className: "gbt_18_editor_lookbook_product_title", key: "gbt_18_editor_lookbook_product_title"}, products[i]['name'].substring(0,35) + dots ),
									el("div",{className:"gbt_18_editor_lookbook_product_text", key:"gbt_18_editor_lookbook_product_text", dangerouslySetInnerHTML: { __html: products[i]['short_description'].substring(0,100) } } ),
								),
								el( "div", { className: "gbt_18_editor_lookbook_product_content_left_inner_bottom", key: "gbt_18_editor_lookbook_product_content_left_inner_bottom"},
									el("p",{className:"gbt_18_editor_lookbook_product_price", key:"gbt_18_editor_lookbook_product_price", dangerouslySetInnerHTML: { __html: products[i]['price_html'] } } ),
									el("button",{className:"gbt_18_editor_lookbook_product_button", key:"gbt_18_editor_lookbook_product_button"}, "Add To Cart"),
								),
							),
							el( "div", { className: "gbt_18_editor_lookbook_product_content_right", key: "gbt_18_editor_lookbook_product_content_right"},
								el( "div", { className: "gbt_18_editor_lookbook_product_image", key: "gbt_18_editor_lookbook_product_image", style:{backgroundImage: "url("+products[i]['images'][0]['src']+")"} })
							)
						));
				}
				return productElements;
			}

			function createProduct() {

				wp.apiFetch({ path: '/wc/v2/products?per_page=1' }).then(function (products) { 

					var product_id = products[0]['id'];

					props.setAttributes( { product_id: product_id } );
					props.setAttributes( { result: products } );

				});

			}

			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-distortion-inspector'
					},
					el('hr'),
					el(
						SelectControl,
						{
							key: 'lookbook-distortion-order-by',
							options:
								[
									{ value: 'datef',   label: 'Newest - newest first' },
									{ value: 'menu_order', label: 'Menu Order' },
								],
              				label: i18n.__( 'Order By' ),
              				value: attributes.orderby,
              				onChange: function( newOrderBy ) {
              					props.setAttributes( { orderby: newOrderBy } );
								createProduct();
							},
						}
					),
					el(
						PanelColor,
						{
							key: 'slide-text-color-panel',
							title: i18n.__( 'Background Color' ),
							colorValue: attributes.bg_color,
						},
						el(
							ColorPalette, 
							{
								key: 'slide-text-color-palette',
								colors: colors,
								value: attributes.bg_color,
								onChange: function( newColor) {
									props.setAttributes( { bg_color: newColor } );
								},
							} 
						),
					),
				),
				el( "div",
					{
						className: "gbt_18_lookbook_distortion_product_wrapper",
						key: "gbt_18_lookbook_distortion_product_wrapper",
						style: { backgroundColor: attributes.bg_color }
					},
					renderResults()
				),
			];
		},

		save: function( props ) {
			return '';
		},
	} );

} )(
	window.wp.blocks,
	window.wp.components,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element,
	jQuery
);
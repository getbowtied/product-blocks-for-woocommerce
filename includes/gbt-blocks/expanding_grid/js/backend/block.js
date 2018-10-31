( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var SelectControl		= components.SelectControl;
	var RangeControl		= components.RangeControl;
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/expanding-grid', {
		title: i18n.__( 'Product Grid with Expanding Preview' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M21 15h2v2h-2v-2zm0-4h2v2h-2v-2zm2 8h-2v2c1 0 2-1 2-2zM13 3h2v2h-2V3zm8 4h2v2h-2V7zm0-4v2h2c0-1-1-2-2-2zM1 7h2v2H1V7zm16-4h2v2h-2V3zm0 16h2v2h-2v-2zM3 3C2 3 1 4 1 5h2V3zm6 0h2v2H9V3zM5 3h2v2H5V3zm-4 8v8c0 1.1.9 2 2 2h12V11H1zm2 8l2.5-3.21 1.79 2.15 2.5-3.22L13 19H3z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			orderby: {
				type: 'string',
				default: 'newest'
			},
			result: {
				type: 'array',
				default: []
			},
			product_ids: {
				type: 'array',
				default: []
			},
			content: {
				type: 'array',
				default: []
			},
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function renderResults() {
				var products = props.attributes.result;

				var productElements = [];
				for ( i = 0; i < products.length; i++ ) {
					productElements.push(
						el("li",{className:"gbt_18_grid_product", key:"gbt_18_grid_product"},
							el("div",{className:"gbt_18_grid_product_content_wrapper", key:"gbt_18_grid_product_content_wrapper"},
								el("img",{key:"gbt_18_grid_product_thumbnail", className: "gbt_18_grid_product_thumbnail", src: products[i]['images'][0]['src'] } ),
								el("h4",{className:"gbt_18_grid_product_title", key:"gbt_18_grid_product_title"}, products[i]['name']),
								el("span",{className:"gbt_18_grid_product_price", key:"gbt_18_grid_product_price", dangerouslySetInnerHTML: { __html: products[i]['price_html'] } } ),
								el("button",{className:"gbt_18_grid_product_button", key:"gbt_18_grid_product_button"}, "Add To Cart")
							)
						));
				}
				return productElements;
			}

			function createProductGrid() {

				wp.apiFetch({ path: '/wc/v2/products?per_page=6' }).then(function (products) { 

					var product_ids = [];

					for ( var i = 0; i < products.length; i++ ) {
						product_ids.push(products[i]['id']);
					}

					props.setAttributes( { product_ids: product_ids } );
					props.setAttributes( { result: products } );

				});

			}

			return [
				el(
					InspectorControls,
					{
						key: 'expanding-grid-inspector'
					},
					el('hr'),
					el(
						SelectControl,
						{
							key: 'expanding-grid-order-by',
							options:
								[
									{ value: 'datef',   label: 'Newest - newest first' },
									{ value: 'menu_order', label: 'Menu Order' },
								],
              				label: i18n.__( 'Order By' ),
              				value: attributes.orderby,
              				onChange: function( newOrderBy ) {
              					props.setAttributes( { orderby: newOrderBy } );
								createProductGrid();
							},
						}
					),
				),
				el( "div",
					{
						className: "gbt_18_expanding_grid_wrapper",
						key: "gbt_18_expanding_grid_wrapper",	
					},
					el( "ul",
						{
							className: "gbt_18_expanding_grid_products ",
						},
						renderResults()
					)
				),
				attributes.result.length == 0 && createProductGrid()
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
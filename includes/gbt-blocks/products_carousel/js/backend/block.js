( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var RadioControl        = components.RadioControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;
	var PanelBody			= components.PanelBody;
	var RangeControl		= components.RangeControl;

	/* Register Block */
	registerBlockType( 'getbowtied/products-carousel', {
		title: i18n.__( 'Product Carousel' ),
		icon: 'slides',
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			orderby: {
				type: 'string',
				default: 'newest'
			},
			number: {
				type: 'number',
				default: '6'
			},
			products_source: {
				type: 'string',
				default: 'date'
			},
			columns: {
				type: 'number',
				default: '3'
			},
			grid: {
				type: 'string',
				default: ''
			},
			slider: {
				type: 'string',
				default: ''
			}
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function createProductsSlider( newNumber ) {

				props.setAttributes( { slider: ' ' } );

				wp.apiFetch({ path: '/wc/v2/products?per_page=' + newNumber }).then(function (products) {
					//console.log(products); 

					var final_output = [];

					var products_list = [];
					var index = 0;

					for( var i = 0; i < products.length; i++) {

						products_list[index] = 
							el("li",{className:"gbt-product product", key:"gbt-product"},
								el("a",{className:"woocommerce-loop-product__link", key:"gbt-product-link"},
									el("div",{key:"gbt-product-thumbnail", className: "gbt-product-thumbnail", style: { backgroundImage: "url("+products[i]['images'][0]['src']+")" } } ),
									el("h4",{className:"gbt-product-title", key:"gbt-product-title"}, products[i]['name']),
									el("span",{className:"gbt-price price", key:"gbt-price"}, products[i]['price']),
									el("button",{className:"gbt-add-to-cart", key:"gbt-add-to-cart"}, "Add To Cart")
								)
							);

						index++;

						if( index == attributes.columns ) {

							final_output.push( el("div", {className:"slide"}, el("ul", {className:"products columns-" + attributes.columns}, products_list)) );
							index = 0;
							products_list = [];
						}
					}

					if( index > 0 && index < attributes.columns ) {

						final_output.push( el("div", {className:"slide"}, el("ul", {className:"products columns-" + attributes.columns}, products_list)) );
						index = 0;
						products_list = [];
					}

					final_output = el( "div", {className:"flexslider", id:"flexslider"},el( "div", {className: "slider"}, final_output	));

					props.setAttributes( { slider: final_output } );

					jQuery('.flexslider').flexslider({
				    	selector: ".slider > .slide",
				    	animation: "slide",
				    	slideshow: false,
				    }); 

				});

			}

			return [
				el(
					InspectorControls,
					{
						key: 'products-carousel-inspector'
					},
					el('hr'),
					el(
						SelectControl,
						{
							key: 'products-carousel-order-by',
							options:
								[
									{ value: 'datef',   label: 'Newest - newest first' },
									{ value: 'menu_order', label: 'Menu Order' },
								],
              				label: i18n.__( 'Order By' ),
              				value: attributes.orderby,
              				onChange: function( newOrderBy ) {
              					props.setAttributes( { orderby: newOrderBy } );
								createProductsSlider( attributes.number );
							},
						}
					),
					el(
						SelectControl,
						{
							key: 'products-carousel-order',
							options:
							[
								{ value: 'all',  label: 'All Products'  },
								{ value: 'DESC', label: 'Descending' }
							],
              				label: i18n.__( 'Alphabetical Order' ),
              				value: attributes.products_source,
              				onChange: function( newOrder ) {
              					props.setAttributes( { products_source: newOrder } );
								createProductsSlider( attributes.number );
							},
						}
					),
					el(
						RangeControl,
						{
							key: 'products-carousel-display-number',
              				label: i18n.__( 'Number of Products' ),
              				initialPosition: 6,
							min: 1,
							max: 200,
              				value: attributes.number,
              				onChange: function( newNumber ) {
              					props.setAttributes( { number: newNumber } );
              					createProductsSlider( newNumber);
							},
						},
					),
					el(
						RangeControl,
						{
							key: "products-carousel-columns",
							value: attributes.columns,
							allowReset: false,
							initialPosition: 3,
							min: 1,
							max: 4,
							label: i18n.__( 'Columns' ),
							onChange: function( newColumns ) {
								props.setAttributes( { columns: newColumns } );
								createProductsSlider( attributes.number );
							},
						}
					),
				),
				attributes.slider == '' && createProductsSlider( attributes.number ),
				attributes.slider
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
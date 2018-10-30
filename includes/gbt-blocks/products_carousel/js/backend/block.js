( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var rawHandler = element.createBlocksFromMarkup;

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
			product_ids: {
				type: 'array',
				default: []
			},
			columns: {
				type: 'number',
				default: '3'
			},
			content: {
				type: 'string',
				default: ''
			},
			old_align: {
				type: 'string',
				default: 'center'
			}
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function createProductsSlider( newNumber ) {

				wp.apiFetch({ path: '/wc/v2/products?per_page=' + newNumber }).then(function (products) { 

					var final_output = [];
					var products_list = [];
					var product_ids = [];

					for( var i = 0; i < products.length; i++) {

						product_ids.push(products[i]['id']);

						products_list[i] = 
							el("li",{className:"gbt_18_carousel_product", key:"gbt_18_carousel_product"},
								el("div",{className:"gbt_18_carousel_product_content_wrapper", key:"gbt_18_carousel_product_content_wrapper"},
									el("div",{key:"gbt_18_carousel_product_thumbnail", className: "gbt_18_carousel_product_thumbnail", style: { backgroundImage: "url("+products[i]['images'][0]['src']+")" } } ),
									el("h4",{className:"gbt_18_carousel_product_title", key:"gbt_18_carousel_product_title"}, products[i]['name']),
									el("span",{className:"gbt_18_carousel_product_price", key:"gbt_18_carousel_product_price", dangerouslySetInnerHTML: { __html: products[i]['price_html'] } } ),
									el("button",{className:"gbt_18_carousel_product_button", key:"gbt_18_carousel_product_button"}, "Add To Cart")
								)
							);
					}

					props.setAttributes( { content: products_list } );
					props.setAttributes( { product_ids: product_ids } );

					if( products_list.length != 0 ) {
						initSlider();
					}	
	    
				});

			}

			function reinitSlider( columns ) {

				if( attributes.align != attributes.old_align || columns ) {

					if( jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').hasClass('slick-slider') ) {

						jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').css('opacity', '0');

						setTimeout(function(){
							
							jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').slick('unslick');

							props.setAttributes( { old_align: attributes.align } );

							var columns = columns || attributes.columns;

							initSlider(columns);
							jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').css('opacity', '1');
						}, 400);
					}
				}
			}

			function initSlider(columns) {
				columns = columns || attributes.columns;

				jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').slick({
					slidesToShow: columns,
					slidesToScroll: columns,
					arrows: true,
					fade: false,
					dots: false,
					swipe: false,
					touchMove: false,
					draggable: false,
					zIndex: -1,
					adaptiveHeight: true,
				}); 
			}

			return [
				reinitSlider(),
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
              					setTimeout(function(){
              						createProductsSlider( newNumber);
              					},200)
              					
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
								reinitSlider( newColumns );
							},
						}
					),
				),
				el( "div",
					{
						className: "gbt_18_product_carousel_wrapper",
						key: "gbt_18_product_carousel_wrapper",	
					},
					el( "ul",
						{
							className: "gbt_18_carousel_products gbt_18_carousel_slider",
						},
						attributes.content
					)
				),
				//attributes.content === '' && createProductsSlider( attributes.number )
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
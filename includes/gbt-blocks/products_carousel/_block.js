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
	registerBlockType( 'getbowtied/products-carousel', {
		title: i18n.__( 'Product Carousel' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M2 6h4v11H2zm5 13h10V4H7v15zM9 6h6v11H9V6zm9 0h4v11h-4z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			orderby: {
				type: 'string',
				default: 'newest'
			},
			product_ids: {
				type: 'array',
				default: []
			},
			columns: {
				type: 'number',
				default: 3
			},
			content: {
				type: 'array',
				default: []
			},
			old_align: {
				type: 'string',
				default: 'center'
			},
			old_columns: {
				type: 'number',
				default: 3
			}
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function createProductsSlider() {

				wp.apiFetch({ path: '/wc/v2/products?per_page=6' }).then(function (products) { 

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

					if( product_ids.length == 0 ) {
						props.setAttributes( { content: [] } );
					} else {
						initSlider();
					}
	    
				});

			}

			function reinitSlider( columns ) {

				if( attributes.align != attributes.old_align || attributes.old_columns != columns ) {

					if( jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').hasClass('slick-slider') ) {

						jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').css('opacity', '0');

						setTimeout(function(){
							
							jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').slick('unslick');

							props.setAttributes( { old_align: attributes.align } );
							props.setAttributes( { old_columns: attributes.columns } );

							initSlider(columns);
							jQuery('.gbt_18_carousel_products.gbt_18_carousel_slider').css('opacity', '1');
						}, 400);
					}
				}
			}

			function initSlider(columns) {

				var columns = columns || attributes.columns;

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
				reinitSlider(attributes.columns),
				el(
					InspectorControls,
					{
						key: 'products-carousel-inspector'
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
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
									createProductsSlider();
								},
							}
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
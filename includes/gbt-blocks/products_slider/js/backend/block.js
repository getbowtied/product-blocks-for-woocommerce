( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var SelectControl		= components.SelectControl;
	var RangeControl		= components.RangeControl;
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	function generateDummy() {

		return el( "div", { className: "gbt_18_editor_slide_dummy_content_item", key: "gbt_18_slide_dummy_content_item"},
			el( "div", { className: "gbt_18_editor_slide_dummy_content_left", key: "gbt_18_editor_slide_dummy_content_left"},
				el("div", { className: "gbt_18_editor_slide_dummy_title", key: "gbt_18_slide_dummy_title"}),
				el("div",{className:"gbt_18_editor_slide_dummy_p1", key:"gbt_18_editor_slide_dummy_p1"} ),
				el("div",{className:"gbt_18_editor_slide_dummy_p2", key:"gbt_18_editor_slide_dummy_p2"} ),
				el("div",{className:"gbt_18_editor_slide_dummy_p3", key:"gbt_18_editor_slide_dummy_p3"} ),
				el("button",{className:"gbt_18_editor_add_to_cart", key:"gbt_18_editor_dummy_add_to_cart"}, "Add To Cart"),
			),
			el( "div", { className: "gbt_18_editor_slide_dummy_content_right", key: "gbt_18_editor_slide_dummy_content_right"},
				el( "div", { className: "gbt_18_editor_dummy_image", key: "gbt_18_editor_dummy_image"})
			)
		);
	}

	/* Register Block */
	registerBlockType( 'getbowtied/products-slider', {
		title: i18n.__( 'Product Slider' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M21 18H2v2h19v-2zm-2-8v4H4v-4h15m1-2H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm1-4H2v2h19V4z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			number: {
				type: 'number',
				default: '6'
			},
			content: {
				type: 'string',
				default: generateDummy()
			},
			product_ids: {
				type: 'array',
				default: []
			},
			product_source: {
				type: 'string',
				default: 'none'
			},
			old_align: {
				type: 'string',
				default: 'center'
			}
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function createProductsSlider( source, newNumber ) {

				if( source == 'none' ) {
					if( jQuery('.gbt_18_editor_slide_content.slider').hasClass('slick-slider') ) {
						jQuery('.gbt_18_editor_slide_content.slider').slick('unslick');
					}
					props.setAttributes( { content: generateDummy() } );
				} else {
					if( jQuery('.gbt_18_editor_slide_content.slider').hasClass('slick-slider') ) {
						jQuery('.gbt_18_editor_slide_content.slider').slick('unslick');
					}

					wp.apiFetch({ path: '/wc/v2/products?per_page=' + newNumber }).then(function (products) {

						var init_products = attributes.product_ids;

						var products_list = [];
						var products_ids = [];
						var dots = '';

						for( var i = 0; i < products.length; i++) {

							products_ids.push(products[i]['id']);

							if( products[i]['name'].length > 35 ) { dots = '...'; } else { dots = ''; }

							products_list[i] = 
								el( "div", { className: "gbt_18_editor_slide_content_item slide", key: "gbt_18_slide_content_item"},
									el( "div", { className: "gbt_18_editor_slide_content_left", key: "gbt_18_editor_slide_content_left"},
										el( "div", { className: "gbt_18_editor_slide_content_left_inner", key: "gbt_18_editor_slide_content_left_inner"},
											el("h2", { className: "gbt_18_editor_slide_title", key: "gbt_18_slide_title"}, products[i]['name'].substring(0,35) + dots ),
											el("p",{className:"gbt_18_editor_slide_price", key:"gbt_18_slide_price", dangerouslySetInnerHTML: { __html: products[i]['price_html'] } } ),
											el("div",{className:"gbt_18_editor_slide_text", key:"gbt_18_slide_text", dangerouslySetInnerHTML: { __html: products[i]['short_description'].substring(0,100) } } ),
											el("button",{className:"gbt_18_editor_add_to_cart", key:"gbt_18_editor_add_to_cart"}, "Add To Cart"),
										),
									),
									el( "div", { className: "gbt_18_editor_slide_content_right", key: "gbt_18_editor_slide_content_right"},
										el( "div", { className: "gbt_18_editor_image", key: "gbt_18_image", style:{backgroundImage: "url("+products[i]['images'][0]['src']+")"} })
									)
								);
						}

						props.setAttributes( { content: products_list } );
						props.setAttributes( { product_ids: products_ids } );

						if( products_ids.length == 0 ) {
							props.setAttributes( { content: generateDummy() } );
						} else {
							initSlider();
						}	    
					});
				}
			}

			function reinitSlider(align) {

				if( align != attributes.old_align ) {

					if( jQuery('.gbt_18_editor_slide_content.slider').hasClass('slick-slider') ) {
						jQuery('.gbt_18_editor_slide_content.slider').slick('unslick');

						props.setAttributes( { old_align: align } );

						setTimeout(function(){
							initSlider();
						}, 200);
					}
				}
			}

			function initSlider() {
				jQuery('.gbt_18_editor_slide_content.slider').slick({
					slidesToShow: 1,
					arrows: true,
					fade: false,
					dots: false,
					swipe: false,
					touchMove: false,
					draggable: false,
					zIndex: -1,
					adaptiveHeight: true,
					vertical: true
				}); 
			}

			return [
				reinitSlider(attributes.align),
				el(
					InspectorControls,
					{
						key: 'products-slider-inspector'
					},
					el('hr'),
					el(
						SelectControl,
						{
							key: 'products-slider-order',
							options:
							[
								{ value: 'none',  label: 'No Product'  },
								{ value: 'all',  label: 'All Products'  },
								{ value: 'DESC', label: 'Descending' }
							],
              				label: i18n.__( 'Alphabetical Order' ),
              				value: attributes.products_source,
              				onChange: function( newOrder ) {
              					props.setAttributes( { products_source: newOrder } );
								createProductsSlider( newOrder, attributes.number );
							},
						}
					),
					el(
						RangeControl,
						{
							key: 'products-slider-display-number',
              				label: i18n.__( 'Number of Products' ),
              				initialPosition: 6,
							min: 1,
							max: 200,
              				value: attributes.number,
              				onChange: function( newNumber ) {
              					props.setAttributes( { number: newNumber } );
              					setTimeout(function(){
              						createProductsSlider( attributes.products_source, newNumber);
              					},400)
              					
							},
						},
					),
				),
				el( "div",
					{
						className: "gbt_18_editor_default_slider",
						key: "gbt_18_default_slider",	
					},
					el( "div",
						{
							className: "gbt_18_editor_content",
							key: "gbt_18_content",	
						},
						el( "div",
							{
								className: "gbt_18_editor_content_wrapper",
								key: "gbt_18_content_wrapper",	
							},
							el( "div",
								{
									className: "gbt_18_editor_slide_content slider",
									key: "gbt_18_slide_content",
								},
								attributes.content
							),
						)
					),
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
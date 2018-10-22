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
		},

		edit: function( props ) {

			var attributes = props.attributes;

			function getCategoriesGrid( orderby, products_source, number, columns ) {

				orderby 			= orderby    		|| attributes.orderby;
				number 				= number 	 		|| attributes.number;
				products_source 	= products_source 	|| attributes.products_source;
				columns 			= columns 	 		|| attributes.columns;

				var data = {
					action 		: 'getbowtied_render_backend_products_carousel',
					attributes  : {
						'orderby' 			 : orderby,
						'products_source'	 : products_source,
						'number'			 : number,
						'columns'			 : columns,
					}
				};

				jQuery.post( 'admin-ajax.php', data, function(response) { 
					response = jQuery.parseJSON(response);
					props.setAttributes( { grid: ' ' } );
					props.setAttributes( { grid: response } );

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
								getCategoriesGrid( newOrderBy, null, null, null );
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
								getCategoriesGrid( null, newOrder, null, null );
							},
						}
					),
					el(
						TextControl,
						{
							key: 'products-carousel-display-number',
              				label: i18n.__( 'Number of Products' ),
              				type: 'number',
              				value: attributes.number,
              				onChange: function( newNumber ) {
              					props.setAttributes( { number: newNumber } );
              					setTimeout(function() {
              						getCategoriesGrid( null, null, newNumber, null );
              					}, 500);
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
								getCategoriesGrid( null, null, null, newColumns );
							},
						}
					),
				),
				el(
					'div',
					{
						key: 'wp-block-getbowtied-products-carousel',
					},
					eval( attributes.grid ),
					attributes.grid == '' && getCategoriesGrid( null, null, null, null )
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
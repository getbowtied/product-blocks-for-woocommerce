( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;
	var RangeControl		= components.RangeControl;

	var SVG 				= components.SVG;
	var Path 				= components.Path;

	var apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/categories-grid', {
		title: i18n.__( 'Product Categories Grid' ),
		icon: el( SVG, { xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 24 24" },
				el(Path, { d:"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" } )
			  ),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		styles: [
			{ name: 'layout-1', label:  'Layout 1'  },
			{ name: 'layout-2', label:  'Layout 2', isDefault: true },
			{ name: 'layout-3', label:  'Layout 3'  },
		],
		attributes: {
			product_ids: {
				type: 'string',
				default: ''
			},
			source: {
				type: 'string',
				default: 'all'
			},
			orderby: {
				type: 'string',
				default: 'title'
			},
			number: {
				type: 'number',
				default: '8'
			},
			order: {
				type: 'string',
				default: 'asc'
			},
			columns: {
				type: 'number',
				default: '3'
			},
			hide_empty: {
				type: 'boolean',
				default: false
			},
			product_count: {
				type: 'boolean',
				default: true
			},
			parent_only: {
				type: 'boolean',
				default: false
			},
			grid: {
				type: 'string',
				default: ''
			},
		},

		edit: function( props ) {

			var attributes = props.attributes;
			var className  = props.className;

			if( className.indexOf('is-style-layout') == -1 ) { className += ' is-style-layout-2'; }

			function getCategoriesGrid( orderby, order, parent_only, number, hide_empty, product_count, columns ) {

				orderby 	= orderby    || attributes.orderby;
				number 		= number 	 || attributes.number;
				order 		= order 	 || attributes.order;
				columns 	= columns 	 || attributes.columns;

				var data = {
					action 		: 'getbowtied_render_backend_categories_grid',
					attributes  : {
						'source'			: 'all',			
						'orderby' 			: orderby,
						'order'				: order,
						'parent_only'		: Number(parent_only),
						'number'			: number,
						'hide_empty'	   	: Number(hide_empty),
						'product_count'		: Number(product_count),
						'columns'			: columns,
						'className'			: className
					}
				};

				jQuery.post( 'admin-ajax.php', data, function(response) { 
					response = jQuery.parseJSON(response);
					props.setAttributes( { grid: ' ' } );
					props.setAttributes( { grid: response } );
				});	
			}

			return [
				el(
					InspectorControls,
					{
						key: 'categories-grid-inspector'
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
						el(
							SelectControl,
							{
								key: 'categories-grid-source',
								options:
								[
									{ value: 'all',  	 label: 'All Categories'  },
									{ value: 'specific', label: 'Manually Pick Categories' }
								],
	              				label: i18n.__( 'Source' ),
	              				value: attributes.source,
	              				onChange: function( newSource ) {
	              					props.setAttributes( { source: newSource } );

	              					if(newSource == 'specific') {
	              						props.setAttributes( { product_ids: ''} );
	              					}
								},
							}
						),
						props.attributes.source === 'all' && [
							el(
								SelectControl,
								{
									key: 'categories-grid-order-by',
									options:
										[
											{ value: 'title',   label: 'Alphabetical' },
											{ value: 'menu_order', label: 'Menu Order' },
										],
		              				label: i18n.__( 'Order By' ),
		              				value: attributes.orderby,
		              				onChange: function( newOrderBy ) {
		              					props.setAttributes( { orderby: newOrderBy } );
										getCategoriesGrid( newOrderBy, null, attributes.parent_only, null, attributes.hide_empty, attributes.product_count, null );
									},
								}
							),
							el(
								SelectControl,
								{
									key: 'categories-grid-order',
									options:
									[
										{ value: 'ASC',  label: 'Ascending'  },
										{ value: 'DESC', label: 'Descending' }
									],
		              				label: i18n.__( 'Alphabetical Order' ),
		              				value: attributes.order,
		              				onChange: function( newOrder ) {
		              					props.setAttributes( { order: newOrder } );
										getCategoriesGrid( null, newOrder, attributes.parent_only, null, attributes.hide_empty, attributes.product_count, null );
									},
								}
							),
							el(
								TextControl,
								{
									key: 'categories-grid-display-number',
		              				label: i18n.__( 'How many product categories to display?' ),
		              				type: 'number',
		              				value: attributes.number,
		              				onChange: function( newNumber ) {
		              					props.setAttributes( { number: newNumber } );
		              					setTimeout(function() {
		              						getCategoriesGrid( null, null, attributes.parent_only, newNumber, attributes.hide_empty, attributes.product_count, null );
		              					}, 500);
									},
								},
							),
							el(
								ToggleControl,
								{
									id: "categories-grid-display",
									key: 'categories-grid-display',
		              				label: i18n.__( 'Parent Categories Only' ),
		              				checked: attributes.parent_only,
		              				onChange: function() {
		              					props.setAttributes( { parent_only: ! attributes.parent_only } );
										getCategoriesGrid( null, null, !attributes.parent_only, null, attributes.hide_empty, attributes.product_count, null);
									},
								}
							),
							el(
								ToggleControl,
								{
									key: "categories-grid-hide-empty",
		              				label: i18n.__( 'Hide Empty' ),
		              				checked: attributes.hide_empty,
		              				onChange: function() {
		              					props.setAttributes( { hide_empty: ! attributes.hide_empty } );
										getCategoriesGrid( null, null, attributes.parent_only, null, !attributes.hide_empty, attributes.product_count, null );
									},
								}
							),
						],
						el(
							ToggleControl,
							{
								key: "categories-grid-product-count",
	              				label: i18n.__( 'Product Count' ),
	              				checked: attributes.product_count,
	              				onChange: function() {
	              					props.setAttributes( { product_count: ! attributes.product_count } );
									getCategoriesGrid( null, null, attributes.parent_only, null, attributes.hide_empty, !attributes.product_count, null );
								},
							}
						),
						props.className.indexOf('is-style-layout-1') !== -1 && el(
							RangeControl,
							{
								key: "categories-grid-layout-1-columns",
								value: attributes.columns,
								allowReset: false,
								initialPosition: 3,
								min: 1,
								max: 6,
								label: i18n.__( 'Columns' ),
								onChange: function( newColumns ) {
									props.setAttributes( { columns: newColumns } );
									getCategoriesGrid( null, null, attributes.parent_only, null, attributes.hide_empty, attributes.product_count, newColumns );
								},
							}
						),
					),
				),
				el(
					'div',
					{
						key: 'gbt_18_editor_categories_grid_wrapper',
						className: className + ' gbt_18_editor_categories_grid_wrapper'
					},
					eval( attributes.grid ),
					attributes.grid == '' && getCategoriesGrid( null, null, attributes.parent_only, null, attributes.hide_empty, attributes.product_count, null )
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
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
	registerBlockType( 'getbowtied/categories-grid', {
		title: i18n.__( 'Product Categories Grid' ),
		icon: 'layout',
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		styles: [
			{ name: 'layout-1', label:  'Layout 1' , isDefault: true },
			{ name: 'layout-2', label:  'Layout 2'  },
			{ name: 'layout-3', label:  'Layout 3'  },
		],
		attributes: {
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
				default: false
			},
			parent: {
				type: 'string',
				default: '0'
			},
			grid: {
				type: 'string',
				default: ''
			},
		},

		edit: function( props ) {

			var attributes = props.attributes;
			var className  = props.className;

			function getCategoriesGrid( orderby, order, parent, number, columns, hide_empty, product_count ) {

				orderby 	= orderby    || attributes.orderby;
				number 		= number 	 || attributes.number;
				order 		= order 	 || attributes.order;
				parent 		= parent 	 || attributes.parent;
				columns 	= columns 	 || attributes.columns;

				var data = {
					action 		: 'getbowtied_render_backend_categories_grid',
					attributes  : {
						'orderby' 					   : orderby,
						'order'						   : order,
						'parent'					   : parent,
						'number'					   : number,
						'columns'					   : columns,
						'hide_empty'				   : Number(hide_empty),
						'product_count'				   : Number(product_count),
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
						PanelBody, 
						{ 
							key: 'categories-grid-layout-settings-panel',
							title: 'Layout Settings',
							initialOpen: true,
						},
						( props.className.indexOf('is-style-layout-1') !== -1 ) && el(
							ToggleControl,
							{
								key: "categories-grid-product-count",
	              				label: i18n.__( 'Show Product Count' ),
	              				checked: attributes.product_count,
	              				onChange: function() {
	              					props.setAttributes( { product_count: ! attributes.product_count } );
									getCategoriesGrid( null, null, null, null, null, attributes.hide_empty, !attributes.product_count );
								},
							}
						),
					),
					el( 
						PanelBody, 
						{ 
							key: 'categories-grid-output-settings-panel',
							title: 'Output Settings',
							initialOpen: false,
						},
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
									getCategoriesGrid( newOrderBy, null, null, null, null, attributes.hide_empty, attributes.product_count );
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
									getCategoriesGrid( null, newOrder, null, null, null, attributes.hide_empty, attributes.product_count );
								},
							}
						),
						el(
							SelectControl,
							{
								id: "categories-grid-display",
								key: 'cat-display',
								options: [{value: '0', label: 'Parent Categories Only'}, {value: '1', label: 'Parent Categories + Subcategories'}],
	              				label: i18n.__( 'Categories Display' ),
	              				value: attributes.parent,
	              				onChange: function( newParent ) {
	              					props.setAttributes( { parent: newParent } );
									getCategoriesGrid( null, null, newParent, null, null, attributes.hide_empty, attributes.product_count);
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
	              						getCategoriesGrid( null, null, null, newNumber, null, attributes.hide_empty, attributes.product_count );
	              					}, 500);
								},
							},
						),
						el(
							RangeControl,
							{
								key: "categories-grid-columns",
								value: attributes.columns,
								allowReset: false,
								initialPosition: 3,
								min: 1,
								max: 4,
								label: i18n.__( 'Columns' ),
								onChange: function( newColumns ) {
									props.setAttributes( { columns: newColumns } );
									getCategoriesGrid( null, null, null, null, newColumns, attributes.hide_empty, attributes.product_count );
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
									getCategoriesGrid( null, null, null, null, null, !attributes.hide_empty, attributes.product_count );
								},
							}
						),
						el(
							ToggleControl,
							{
								key: "categories-grid-product-count",
	              				label: i18n.__( 'Show Product Count' ),
	              				checked: attributes.product_count,
	              				onChange: function() {
	              					props.setAttributes( { product_count: ! attributes.product_count } );
									getCategoriesGrid( null, null, null, null, null, attributes.hide_empty, !attributes.product_count );
								},
							}
						),
					),
				),
				el(
					'div',
					{
						key: 'wp-block-getbowtied-categories-grid',
						className: className + ' gbt-editor'
					},
					eval( attributes.grid ),
					attributes.grid == '' && getCategoriesGrid( null, null, null, null, null, attributes.hide_empty, attributes.product_count )
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
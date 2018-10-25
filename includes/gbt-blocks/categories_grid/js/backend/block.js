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

	var apiFetch = wp.apiFetch;

	var xhr;

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
			resultList: {
				type: 'string',
				default: ''
			},
			selectedList: {
				type: 'string',
				default: ''
			},
			selected : {
				type: 'string',
				default: ''
			},
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
				default: false
			},
			parent_only: {
				type: 'boolean',
				default: false
			},
			grid: {
				type: 'string',
				default: ''
			},
			query: {
				type: 'string',
				default: ''
			},
		},

		edit: function( props ) {

			var attributes = props.attributes;
			var className  = props.className;

			function getCategoriesGrid1( product_ids ) {

				if(product_ids) {

					var data = {
						action 		: 'getbowtied_render_backend_categories_grid',
						attributes  : {
							'source'		: 'specific',
							'product_ids'  	: product_ids,
						}
					};

					jQuery.post( 'admin-ajax.php', data, function(response) { 
						response = jQuery.parseJSON(response);
						props.setAttributes( { grid: ' ' } );
						props.setAttributes( { grid: response } );
					});	
				} else {
					props.setAttributes( { grid: ' ' } );
				}
			}

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

			function getSelectedCategories() {

				console.log(attributes.selectedList);

				if( attributes.selectedList ) {

					var result = [];
					for( var i = 0; i < attributes.selectedList.length; i++ ) {
						console.log(attributes.selectedList[i]);

						apiFetch({ path: '/wc/v3/products/categories/' + attributes.selectedList[i] }).then(function (category) {
				        	console.log(category);

				        	result.push(
				        		el(
									"div",
									{
										className: "selected-category", 
										id: "selected-category-" + category.id,
										onClick: function(e) {
											console.log('deleted');
											// var arr = props.attributes.product_ids.split(",");
											// var remove = "'.$id.'";
											// var index = arr.indexOf(remove);
											// if (index > -1) {
											//   arr.splice(index, 1);
											// }
											// props.setAttributes({product_ids: arr.join(",")});
											// props.setAttributes({selectedList: arr});
											// getCategoriesGrid1(arr.join(","));
											// getSelectedCategories();
										}
									}, 
									el(
										"img",
										{
											src: category.image.src
										}
									),
									el(
										"span",
										{},
										category.name
									)
								)
				        	);
						});
					}
				}

				props.setAttributes({selected: result});
			}

			return [
				el(
					InspectorControls,
					{
						key: 'categories-grid-inspector'
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
					props.attributes.source === 'specific' && [
						el(
							TextControl,
							{
								key: 'categories-grid-query-panel-string',
		          				type: 'search',
		          				className: 'categories-grid-ajax-search',
		          				value: attributes.query,
		          				placeholder: i18n.__( 'Search for categories to display'),
		          				onChange: function( newQuery ) {
		          					
		          					props.setAttributes( { query: newQuery } );
		          					if (newQuery.length < 3) {
		          						props.setAttributes( { resultList: ''} );
		          						return;
		          					}

							        var query = '/wc/v3/products/categories?per_page=10&search=' + newQuery;

							        props.setAttributes( { resultList: ''} );
		          					var data = {
		          						action: 'getbowtied_search_category1',
		          						attributes: {
		          							'query': newQuery
		          						}	
		          					};

		          					if(xhr && xhr.readyState != 4){
							            xhr.abort();
							        }
							        xhr = jQuery.ajax({
									    type: "POST",
									    url: 'admin-ajax.php',
									    data: data,
									    success: function(response){
									    	props.setAttributes( { resultList: ''} );
									      	response = jQuery.parseJSON(response);
											var arr = response.ids;
											props.setAttributes( { products: response.ids } );
											props.setAttributes( { resultList: response.html} );
											for (var i = 0, len = arr.length; i < len; i++) {
												var tempArr = props.attributes.product_ids.split(",");
												var index = tempArr.indexOf(arr[i]['value']);
												if ( index > -1 ){
													$('#search-result-'+arr[i]['value']).addClass('selected');
												}
											}
									    }
									});
								},
							},
						),
						el(
							'div',
							{
								className: 'search-results-wrapper'
							},
							eval(attributes.resultList)
						),
						el(
							'div',
							{
								className: 'selection-wrapper'
							},
							el(
								"label",
								{},
								i18n.__("Selected Categories")
							),
							el(
								'div',
								{
									className: 'selection'
								},
								eval(attributes.selected)
							),
						),
					],
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
				el(
					'div',
					{
						key: 'wp-block-getbowtied-categories-grid',
						className: className + ' gbt-editor'
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
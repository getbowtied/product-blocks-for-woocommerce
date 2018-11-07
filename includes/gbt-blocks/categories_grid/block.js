( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;
	var RangeControl		= components.RangeControl;
	var Button 				= components.Button;
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	var apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/categories-grid', {
		title: i18n.__( 'Product Categories Grid' ),
		icon: el( SVG, { xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 24 24" },
				el(Path, { d:"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" } )
			  ),
		category: 'widgets',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		styles: [
			{ name: 'layout-1', label:  'Layout 1'  },
			{ name: 'layout-2', label:  'Layout 2', isDefault: true },
			{ name: 'layout-3', label:  'Layout 3'  },
		],
		attributes: {
			categoryIDs: {
				type: 'string',
				default: '',
			},
		/* Products source */
			result: {
				type: 'array',
				default: [],
			},
			queryCategories: {
				type: 'string',
				default: '',
			},
			queryCategoriesLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'all_categories',
			},
		/* loader */
			isLoading: {
				type: 'bool',
				default: false,
			},
		/* Manually pick products */
			querySearchString: {
				type: 'string',
				default: '',
			},
			querySearchResults: {
				type: 'array',
				default: [],
			},
			querySearchNoResults: {
				type: 'bool',
				default: false,
			},
			querySearchSelectedIDs: {
				type: 'array',
				default: [],
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
		/* Order by */
			queryOrder: {
				type: 'string',
				default: '',
			},
			parentOnly: {
				type: 'bool',
				default: false,
			},
			hideEmpty: {
				type: 'bool',
				default: false,
			},
			orderby: {
				type: 'string',
				default: 'menu_order',
			},
			productCount: {
				type: 'bool',
				default: true,
			},
		/* First Load */
			firstLoad: {
				type: 'bool',
				default: true,
			},
			limit: {
				type: 'int',
				default: 8,
			},
		/* Columns */
			columns: {
				type: 'int',
				default: 3,
			}

		},
		edit: function( props ) {

		//==============================================================================
		//	Helper functions
		//==============================================================================
			if( props.className.indexOf('is-style-layout') == -1 ) { props.className += ' is-style-layout-2'; }

			function _categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			function _searchResultClass(theID){
				var index = props.attributes.querySearchSelectedIDs.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
			}

			function _sortCategories( index, arr, newarr = [], level = 0) {
				for ( let i = 0; i < arr.length; i++ ) {
					if ( arr[i].parent == index) {
						arr[i].level = level;
						newarr.push(arr[i]);
						_sortCategories(arr[i].id, arr, newarr, level + 1 );
					}
				}

				return newarr;
			}

			function _sortByKeys(keys, products) {
				var sorted =[];
				for ( var i = 0; i < keys.length; i++ ) {
					for ( var j = 0; j < products.length; j++ ) {
						if ( keys[i] == products[j].id ) {
							sorted.push(products[j]);
							break;
						}
					}
				}

				return sorted;
			}

			function _destroyQuery() {
				props.setAttributes({ queryOrder: ''});
				props.setAttributes({ queryCategories: ''});
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
				props.setAttributes({ querySearchSelected: []});
				props.setAttributes({ querySearchSelectedIDs: []});
				props.setAttributes({ queryAttributesOptionsSelected: [] });
				props.setAttributes({ queryCategorySelected: [] });
				props.setAttributes({result: []});
			}

			function _destroyTempAtts() {
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
			}

			function _isChecked( needle, haystack ) {
				var idx = haystack.indexOf(needle.toString());
				if ( idx != - 1) {
					return true;
				}
				return false;
			}

			function _isDonePossible() {
				return ( (props.attributes.queryCategories.length == 0) || (_buildQuery(props.attributes.limit, props.attributes.orderby, props.attributes.parentOnly, props.attributes.hideEmpty) === props.attributes.queryCategoriesLast) );
			}

			function _isLoading() {
				if ( props.attributes.isLoading  === true ) {
					return 'is-busy';
				} else {
					return '';
				}
			}

			function _isLoadingText(){
				if ( props.attributes.isLoading  === false ) {
					return i18n.__('Update');
				} else {
					return i18n.__('Updating');
				}
			}

		//==============================================================================
		//	Show products functions
		//==============================================================================
			function getQuery( query ) {
				return '/wc/v3/products/categories' + query;
			}

			function getResult() {
				let query;

				if ( props.attributes.queryDisplayType == 'all_categories' ) {
					query = _buildQuery(props.attributes.limit, props.attributes.orderby, props.attributes.parentOnly, props.attributes.hideEmpty);
				} else {
					query = props.attributes.queryCategories;
				}
				props.setAttributes({ queryCategoriesLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (categories) {
						if ( props.attributes.orderby == 'menu_order' && props.attributes.queryDisplayType == 'all_categories') {
							categories = _sortCategories(0, categories);
						}
						props.setAttributes({ result: categories});
						props.setAttributes({ isLoading: false});
						let IDs = '';
						for ( let i = 0; i < categories.length; i++) {
							IDs += categories[i].id + ',';
						}
						props.setAttributes({ categoryIDs: IDs});
					});
				}
			}

			function renderResults() {
				if ( props.attributes.firstLoad === true ) {
					query = _buildQuery(props.attributes.limit, props.attributes.orderby, props.attributes.parentOnly, props.attributes.hideEmpty);
					apiFetch({ path: query }).then(function (categories) {
						categories = _sortCategories(0, categories);
						props.setAttributes({ result: categories });
						props.setAttributes({ firstLoad: false });
						props.setAttributes({queryCategories: query});
						props.setAttributes({queryCategoriesLast: query});

						let IDs = '';
						for ( let i = 0; i < categories.length; i++) {
							IDs += categories[i].id + ',';
						}
						props.setAttributes({ categoryIDs: IDs});
					});
				}

				function getColumns() {
					if ( props.className.indexOf('is-style-layout-1') !== -1)  {
						return 'columns-' + props.attributes.columns;
					} else {
						return '';
					}
				}
				var categories = props.attributes.result;
				var categoryElements = [];
				var wrapper = [];

				var class_prefix = 'gbt_18_editor_category_grid_item';

				for ( i = 0; i < categories.length; i++ ) {
					let img = '';
					if ( categories[i].image !== null ) { img = categories[i]['image']['src'] } else { img= getbowtied_pbw.woo_placeholder_image };
					categoryElements.push(
						el( 'div',
							{	
								key: 		class_prefix,
								className: 	class_prefix
							},
							el( 'a',
								{
									key: 		class_prefix + '_img',
									className: 	class_prefix + '_img'
								},
								el( 'img',
									{
										key: 		class_prefix + '_thumb',
										className: 	class_prefix + '_thumb',
										src: 		img
									}
									),
								el( 'h4',
									{
										key: 		class_prefix + '_title',
										className: 	class_prefix + '_title'
									},
									categories[i]['name'].replace(/&amp;/g, '&'),
									props.attributes.productCount === true && el( 'span',
										{
											key: 						class_prefix + '_count',
											className: 					class_prefix + '_count',
										},
										categories[i]['count']
									),
								),
							)
						));
				}

				wrapper.push(
					el(	'div',
					{
						key: 'gbt_18_editor_categories_grid_wrapper',
						className: props.className + ' gbt_18_editor_categories_grid_wrapper'
					},
						el( 'div',
						{
							key: 		'gbt_18_editor_categories_grid',
							className: 	'gbt_18_editor_categories_grid ' + props.className + ' ' + getColumns()  // add columns class name
						},
							categoryElements,
							el(	'div',
							{
								key: 	'clearfix',
								className: 	'clearfix'
							}
							),
						),
					)
				);
				return wrapper;
			}

			function _buildQuery(limit = 10, orderby='menu_order', parentOnly=true, hideEmpty=true) {
				if ( props.attributes.queryDisplayType === 'specific' ) {
					return props.attributes.queryCategories;
				}
				var query = getQuery('?per_page=' + limit);

				switch (orderby) {
					case 'menu_order':
						break;
					case 'title_asc':
						query += '&orderby=slug&order=asc';
						break;
					case 'title_desc':
						query += '&orderby=slug&order=desc';
						break;
					default: 
						break;
				}

				if (parentOnly === true ) {
					query+= '&parent=0';
				}

				if ( hideEmpty === true ) {
					query+= '&hide_empty=true';
				}
				return query;
			}

			function _getQueryOrder() {
				if ( props.attributes.queryOrder.length < 1) return '';
				var order = '';
				switch ( props.attributes.queryOrder ) {
					case 'date_desc':
						order = '&orderby=date&order=desc';
					break;
					case 'date_asc':
						order = '&orderby=date&order=asc';
					break;
					case 'title_desc':
						order = '&orderby=title&order=desc';
					break;
					case 'title_asc':
						order = '&orderby=title&order=asc';
					break;
					default: 
						
					break;
				}

				return order;
			}

		//==============================================================================
		//	Display ajax results
		//==============================================================================
			function renderSearchResults() {
				var categoryElements = [];

				if ( props.attributes.querySearchNoResults == true) {
					return el('span', {className: 'no-results'}, i18n.__('No categories matching.'));
				}
				var categories = props.attributes.querySearchResults;
				for ( var i = 0; i < categories.length; i++ ) {
					if ( categories[i].image !== null && categories[i].image.src != '' ) {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+categories[i].image.src+'\')"></span>'}});
					} else {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					categoryElements.push(
						el(
							'span', 
							{
								className: _searchResultClass(categories[i].id),
								title: categories[i].name.replace(/&amp;/g, '&'),
								'data-index': i,
							}, 
							img,
							el(
								'label', 
								{
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											var _this = evt.target;
											var qSR = props.attributes.querySearchSelectedIDs;
											var index = qSR.indexOf(categories[evt.target.value].id);
											if (index == -1) {
												qSR.push(categories[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ querySearchSelectedIDs: qSR });
											
											var query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryCategories: query});
											} else {
												props.setAttributes({queryCategories: '' });
											}
											apiFetch({ path: query }).then(function (categories) {
												props.setAttributes({ querySearchSelected: categories});
											});
										},
									},
								),
								categories[i].name.replace(/&amp;/g, '&'),
								el('span',{ className: 'dashicons dashicons-yes'}),
								el('span',{ className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return categoryElements;
			}

			function renderSearchSelected() {
				var categoryElements = [];
				var i;

				var categories = props.attributes.querySearchSelected;
				if ( props.attributes.querySearchSelectedIDs.length < 1 ) {
					var bugFixer = [];
					for ( var i = 0; i < categories.length; i++ ) {
						bugFixer.push(categories[i].id);
					}
					props.setAttributes({ querySearchSelectedIDs: bugFixer});
				}

				for ( var i = 0; i < categories.length; i++ ) {
					if ( categories[i].image !== null && categories[i].image.src != '' ) {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+categories[i].image.src+'\')"></span>'}});
					} else {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					categoryElements.push(
						el(
							'span', 
							{
								className:'single-result', 
								title: categories[i].name.replace(/&amp;/g, '&'),
							}, 
							img, 
							el(
								'label', 
								{
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											var _this = evt.target;

											
											var qSS = props.attributes.querySearchSelectedIDs;
											var index = qSS.indexOf(categories[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ querySearchSelectedIDs: qSS });
											
											var query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryCategories: query});
											} else {
												props.setAttributes({queryCategories: ''});
											}
											apiFetch({ path: query }).then(function (categories) {
												props.setAttributes({ querySearchSelected: categories});
											});
										},
									},
								),
								categories[i].name.replace(/&amp;/g, '&'),
								el('span',{ className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return categoryElements;
			}

		//==============================================================================
		//	Main controls 
		//==============================================================================
			return [
				el(
					InspectorControls,
					{
						key: 'products-main-inspector',
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
					/* Columns */
						props.className.indexOf('is-style-layout-1') !== -1 && [
						el(
							RangeControl,
							{
								key: "categories-grid-layout-1-columns",
								value: props.attributes.columns,
								allowReset: false,
								initialPosition: 3,
								min: 2,
								max: 6,
								label: i18n.__( 'Columns' ),
								onChange: function( newColumns ) {
									props.setAttributes( { columns: newColumns } );
								},
							}
						),
						el('hr',{})],
						el(
							SelectControl,
							{
								key: 'query-panel-select',
								label: i18n.__('Source:'),
								value: props.attributes.queryDisplayType,
								options: [{
									label: i18n.__('Choose an Option'),
									value: 'default'
								}, {
									label: i18n.__('Manually pick'),
									value: 'specific'
								}, {
									label: i18n.__('All Categories'),
									value: 'all_categories'
								}],
								onChange: function onChange(value) {
									// if ( props.attributes.queryCategories != '' ) {
									// 	if ( window.confirm(i18n.__("Changing the product source will lose the current selection.")) === false) {
									// 		return;
									// 	}
									// }
		       						//    					_destroyQuery();
									// if ( value === 'by_category') {
									// 	getCategories();
									// }
									// if ( value === 'all_categories') {
									// 	var query = getQuery('?per_page=-1');
									// 	props.setAttributes({queryCategories: query});
									// }
									return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
					/* Pick specific producs */
						props.attributes.queryDisplayType === 'specific' && el(
							'div',
							{
								className: 'products-ajax-search-wrapper',
							},
							el(
								TextControl,
								{
									key: 'query-panel-string',
			          				type: 'search',
			          				className: 'products-ajax-search',
			          				value: props.attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for categories to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        var query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (categories) {
								        	if ( categories.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: categories});
										});

									},
								},
							),
						),
						props.attributes.queryDisplayType === 'specific' && props.attributes.querySearchString != '' && el(
							'div',
							{ 
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						props.attributes.queryDisplayType === 'specific' && props.attributes.querySearchSelected.length > 0 && el(
							'div',
							{
								className: 'products-selected-results-wrapper',
							},
							el(
								'label',
								{},
								i18n.__('Selected Products:'),
							),
							el(
								'div',
								{
									className: 'products-selected-results',
								},
								renderSearchSelected(),
							),
						),
						props.attributes.queryDisplayType === 'all_categories' && [
						el(
							SelectControl,
							{
								key: 'categories-grid-order-by',
								options:
									[
										{ value: 'menu_order',  label: 'Menu Order' },
										{ value: 'title_asc',   label: 'Alphabetical Ascending' },
										{ value: 'title_desc',  label: 'Alphabetical Descending' },
									],
	              				label: i18n.__( 'Order By' ),
	              				value: props.attributes.orderby,
	              				onChange: function( value ) {
	              					props.setAttributes( { orderby: value } );
								},
							}
						),
						el(
							TextControl,
							{
								key: 'categories-grid-display-number',
	              				label: i18n.__( 'How many product categories to display?' ),
	              				type: 'number',
	              				value: props.attributes.limit,
	              				onChange: function( value ) {
	              					// console.log(value);
	              					props.setAttributes( { limit: value } );
								},
							},
						),
						el(
							ToggleControl,
							{
								id: "categories-grid-display",
								key: 'categories-grid-display',
	              				label: i18n.__( 'Parent Categories Only' ),
	              				checked: props.attributes.parentOnly,
	              				onChange: function( value ) {
		              				props.setAttributes( { parentOnly: value } );
								},
							}
						),
						el(
							ToggleControl,
							{
								key: "categories-grid-hide-empty",
	              				label: i18n.__( 'Hide Empty' ),
	              				checked: props.attributes.hideEmpty,
	              				onChange: function( value ) {
	              					props.setAttributes( { hideEmpty: value } );
								},
							}
						),
					],
					/* All products */

					/* Load all products */
						el(
							'button',
							{
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									// _buildQuery(props.attributes.limit, props.attributes.orderby, props.attributes.parentOnly, props.attributes.hideEmpty);
									_destroyTempAtts();
									getResult();
								},
							},
							_isLoadingText(),
						),
					),
					el('hr', {}),
					el(
						ToggleControl,
						{
							key: "categories-grid-product-count",
              				label: i18n.__( 'Product Count' ),
              				checked: props.attributes.productCount,
              				onChange: function( value ) {
              					props.setAttributes({ productCount: value });
							},
						}
					),
				),
				el(
					'div',
					{
					},
					renderResults(),
				),
			];
		},

		save: function() {
        	return;
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
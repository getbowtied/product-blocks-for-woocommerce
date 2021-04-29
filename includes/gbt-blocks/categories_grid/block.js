( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType = blocks.registerBlockType;

	const {
		TextControl,
		SelectControl,
		ToggleControl,
		Button,
		RangeControl,
		SVG,
		Path,
	} = components;

	const {
		InspectorControls,
	} = wp.blockEditor;

	const apiFetch = wp.apiFetch;
	const useEffect = wp.element.useEffect;

	/* Register Block */
	registerBlockType( 'getbowtied/categories-grid', {
		title: i18n.__( 'Product Categories Grid' ),
		icon: el( SVG, { key: 'getbowtied-categories-grid-icon', xmlns:'http://www.w3.org/2000/svg', viewBox:'0 0 24 24' },
				el(Path, { key: 'getbowtied-categories-grid-icon-path', d:"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" } )
			  ),
		category: 'product_blocks',
		description: i18n.__( 'Display a grid of products from your selected categories.' ),
		keywords: [ i18n.__( 'product categories' ), i18n.__( 'grid' ), i18n.__( 'thumbs' ) ],
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
				type: 'boolean',
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
				type: 'boolean',
				default: false,
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
				type: 'boolean',
				default: false,
			},
			hideEmpty: {
				type: 'boolean',
				default: false,
			},
			orderby: {
				type: 'string',
				default: 'menu_order',
			},
			productCount: {
				type: 'boolean',
				default: true,
			},
		/* First Load */
			firstLoad: {
				type: 'boolean',
				default: true,
			},
			limit: {
				type: 'integer',
				default: 8,
			},
		/* Columns */
			columns: {
				type: 'integer',
				default: 3,
			}

		},
		edit: function( props ) {

			let className 				= props.className;
			let attributes 				= props.attributes;
			attributes.selectedIDS 		= attributes.selectedIDS || [];
			attributes.doneFirstLoad 	= attributes.doneFirstLoad || false;
			attributes.result 			= attributes.result || [];

		//==============================================================================
		//	Helper functions
		//==============================================================================
			if( className.indexOf('is-style-layout') == -1 ) { className += ' is-style-layout-2'; }

			function _categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			function _searchResultClass(theID){
				const index = attributes.selectedIDS.indexOf(theID);
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
				let sorted =[];
				for ( let i = 0; i < keys.length; i++ ) {
					for ( let j = 0; j < products.length; j++ ) {
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
				props.setAttributes({ selectedIDS: []});
				props.setAttributes({ queryAttributesOptionsSelected: [] });
				props.setAttributes({ queryCategorySelected: [] });
				props.setAttributes({result: []});
			}

			function _destroyTempAtts() {
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
			}

			function _isChecked( needle, haystack ) {
				const idx = haystack.indexOf(needle.toString());
				if ( idx != - 1) {
					return true;
				}
				return false;
			}

			function _isDonePossible() {
				return ( (attributes.queryCategories.length == 0) || (_buildQuery(attributes.limit, attributes.orderby, attributes.parentOnly, attributes.hideEmpty) === attributes.queryCategoriesLast) );
			}

			function _isLoading() {
				if ( attributes.isLoading  === true ) {
					return 'is-busy';
				} else {
					return '';
				}
			}

			function _isLoadingText(){
				if ( attributes.isLoading  === false ) {
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

			function getResult( query ) {
				if( query === null ) {
					if ( attributes.queryDisplayType == 'all_categories' ) {
						query = _buildQuery(attributes.limit, attributes.orderby, attributes.parentOnly, attributes.hideEmpty);
					} else {
						query = attributes.queryCategories;
					}

					useEffect( function() {
						props.setAttributes({ queryCategoriesLast: query});
					});
				}

				if (query != '') {
					apiFetch({ path: query }).then(function (categories) {
						if ( attributes.orderby == 'menu_order' && attributes.queryDisplayType == 'all_categories') {
							categories.sort((a, b) => (a.menu_order > b.menu_order) ? 1 : -1)
						}
						props.setAttributes({ result: categories});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: categories });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < categories.length; i++) {
							IDs += categories[i].id + ',';
						}
						props.setAttributes({ categoryIDs: IDs});
					});
				}
			}

			function renderResults() {
				if ( attributes.firstLoad === true ) {
					let query = _buildQuery(attributes.limit, attributes.orderby, attributes.parentOnly, attributes.hideEmpty);
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
						return 'columns-' + attributes.columns;
					} else {
						return '';
					}
				}
				let categories = attributes.result;
				let categoryElements = [];
				let wrapper = [];

				const class_prefix = 'gbt_18_editor_category_grid_item';

				for ( let i = 0; i < categories.length; i++ ) {
					let img = '';
					if ( categories[i].image !== null ) { img = categories[i]['image']['src'] } else { img= getbowtied_pbw.woo_placeholder_image };
					categoryElements.push(
						el( 'div',
							{
								key: 		'gbt-category-grid-item-' + categories[i].id,
								className: 	class_prefix
							},
							el( 'a',
								{
									key: 'gbt-category-grid-item-a-' + i,
									className: 	class_prefix + '_img'
								},
								el( 'img',
									{
										key: 'gbt-category-grid-item-img-' + i,
										className: 	class_prefix + '_thumb',
										src: 		img
									}
									),
								el( 'h4',
									{
										key: 'gbt-category-grid-item-h4-' + i,
										className: 	class_prefix + '_title'
									},
									categories[i]['name'].replace(/&amp;/g, '&'),
									attributes.productCount === true && el( 'span',
										{
											key: 'gbt-category-grid-item-count-' + i,
											className: class_prefix + '_count',
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
						className: className + ' gbt_18_editor_categories_grid_wrapper'
					},
						el( 'div',
						{
							key: 		'gbt_18_editor_categories_grid',
							className: 	'gbt_18_editor_categories_grid ' + props.className + ' ' + getColumns()  // add columns class name
						},
							categoryElements,
							el(	'div',
							{
								key: 	'gbt_18_editor_categories_grid_clearfix',
								className: 	'clearfix'
							}
							),
						),
					)
				);
				return wrapper;
			}

			function _buildQuery(limit = 10, orderby='menu_order', parentOnly=true, hideEmpty=true) {
				if ( attributes.queryDisplayType === 'specific' ) {
					return attributes.queryCategories;
				}
				let query = getQuery('?per_page=' + limit);

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
				if ( attributes.queryOrder.length < 1) return '';
				let order = '';
				switch ( attributes.queryOrder ) {
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
				let categoryElements = [];

				if ( attributes.querySearchNoResults == true) {
					return el('span', {key: 'gbt-categories-grid-noresults', className: 'no-results'}, i18n.__('No categories matching.'));
				}
				let categories = attributes.querySearchResults;
				for ( let i = 0; i < categories.length; i++ ) {
					let img;
					if ( categories[i].image !== null && categories[i].image.src != '' ) {
						img = el('span', { key: 'gbt-categories-grid-img-wrapper'+i, className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+categories[i].image.src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-categories-grid-img-wrapper'+i,className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					categoryElements.push(
						el(
							'span',
							{
								key: 	   'gbt-categories-grid-cat-item-' + categories[i].id,
								className: _searchResultClass(categories[i].id),
								title: categories[i].name.replace(/&amp;/g, '&'),
								'data-index': i,
							},
							img,
							el(
								'label',
								{
									key: 	   'gbt-categories-grid-cat-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-categories-grid-cat-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											let _this = evt.target;
											let qSR = attributes.selectedIDS;
											let index = qSR.indexOf(categories[evt.target.value].id);
											if (index == -1) {
												qSR.push(categories[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
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
								el('span',{ key: 'gbt-categories-grid-cat-item-dashicon-yes-' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'gbt-categories-grid-cat-item-dashivon-noalt-' + i, className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return categoryElements;
			}

			function renderSearchSelected() {
				let categoryElements = [];
				let i;

				let categories = attributes.querySearchSelected;
				if ( attributes.selectedIDS.length < 1 && categories.length > 0) {
					let bugFixer = [];
					for ( let i = 0; i < categories.length; i++ ) {
						bugFixer.push(categories[i].id);
					}

					useEffect( function() {
						props.setAttributes({ selectedIDS: bugFixer});
					});
				}

				for ( let i = 0; i < categories.length; i++ ) {
					let img ='';
					if ( categories[i].image !== null && categories[i].image.src != '' ) {
						img = el('span', { key: 'gbt-categories-grid-search-item-' + i, className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+categories[i].image.src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-categories-grid-search-item-' + i, className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					categoryElements.push(
						el(
							'span',
							{
								key 	 : 'gbt-categories-grid-search-item-' + categories[i].id,
								className:'single-result',
								title: categories[i].name.replace(/&amp;/g, '&'),
							},
							img,
							el(
								'label',
								{
									key 	 : 'gbt-categories-grid-search-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key 	 : 'gbt-categories-grid-search-item-checkbox-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											let _this = evt.target;


											let qSS = attributes.selectedIDS;
											let index = qSS.indexOf(categories[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryCategories: query});
												apiFetch({ path: query }).then(function (categories) {
													props.setAttributes({ querySearchSelected: categories});
												});
											} else {
												props.setAttributes({queryCategories: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								categories[i].name.replace(/&amp;/g, '&'),
								el('span',{ key: 'gbt-categories-grid-search-item-dashicon-noalt-' + i, className: 'dashicons dashicons-no-alt'})
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
						el(
							SelectControl,
							{
								key: 'gbt-categories-grid-query-panel-select',
								label: i18n.__('Source:'),
								value: attributes.queryDisplayType,
								options: [{
									label: i18n.__('Manually pick'),
									value: 'specific'
								}, {
									label: i18n.__('All Categories'),
									value: 'all_categories'
								}],
								onChange: function onChange(value) {
									return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
					/* Pick specific producs */
						attributes.queryDisplayType === 'specific' && el(
							'div',
							{
								key: 'gbt-categories-grid-query-ajax-search-wrapper',
								className: 'products-ajax-search-wrapper',
							},
							el(
								TextControl,
								{
									key: 'gbt-categories-grid-query-panel-string',
			          				type: 'search',
			          				className: 'products-ajax-search',
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for categories to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        let query = getQuery('?per_page=10&search=' + newQuery);
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
						attributes.queryDisplayType === 'specific' && attributes.querySearchString != '' && el(
							'div',
							{
								key: 'gbt-categories-grid-specific-ajax-search-results',
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.queryDisplayType === 'specific' && attributes.querySearchSelected.length > 0 && el(
							'div',
							{
								key: 'gbt-categories-grid-specific-results-wrapper',
								className: 'products-selected-results-wrapper',
							},
							el(
								'label',
								{
									key: 'gbt-categories-grid-specific-results-label',
								},
								i18n.__('Selected Products:'),
							),
							el(
								'div',
								{
									key: 'gbt-categories-grid-specific-selected-results',
									className: 'products-selected-results',
								},
								renderSearchSelected(),
							),
						),
						attributes.queryDisplayType === 'all_categories' && [
						el(
							SelectControl,
							{
								key: 'gbt-categories-grid-order-by',
								options:
									[
										{ value: 'menu_order',  label: 'Menu Order' },
										{ value: 'title_asc',   label: 'Alphabetical Ascending' },
										{ value: 'title_desc',  label: 'Alphabetical Descending' },
									],
	              				label: i18n.__( 'Order By' ),
	              				value: attributes.orderby,
	              				onChange: function( value ) {
	              					props.setAttributes( { orderby: value } );
								},
							}
						),
						el(
							RangeControl,
							{
								key: "gbt-categories-grid-display-number",
								value: attributes.limit,
								allowReset: false,
								initialPosition: 8,
								min: 1,
								max: 100,
								label: i18n.__( 'How many product categories to display?' ),
								onChange: function( value ) {
									props.setAttributes( { limit: value } );
								},
							}
						),
						el(
							ToggleControl,
							{
								id: "categories-grid-display",
								key: 'gbt-categories-grid-display',
	              				label: i18n.__( 'Parent Categories Only' ),
	              				checked: attributes.parentOnly,
	              				onChange: function( value ) {
		              				props.setAttributes( { parentOnly: value } );
								},
							}
						),
						el(
							ToggleControl,
							{
								key: "gbt-categories-grid-hide-empty",
	              				label: i18n.__( 'Hide Empty' ),
	              				checked: attributes.hideEmpty,
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
								key: 'gbt-categories-grid-load-button',
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									let query;

									props.setAttributes({ isLoading: true });
									_destroyTempAtts();

									if ( attributes.queryDisplayType == 'all_categories' ) {
										query = _buildQuery(attributes.limit, attributes.orderby, attributes.parentOnly, attributes.hideEmpty);
									} else {
										query = attributes.queryCategories;
									}
									props.setAttributes({ queryCategoriesLast: query});
									getResult(query);
								},
							},
							_isLoadingText(),
						),
					),
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
						el(
							ToggleControl,
							{
								key: "gbt-categories-grid-product-count",
	              				label: i18n.__( 'Product Count' ),
	              				checked: attributes.productCount,
	              				onChange: function( value ) {
	              					props.setAttributes({ productCount: value });
								},
							}
						),
						/* Columns */
						props.className.indexOf('is-style-layout-1') !== -1 &&
						el(
							RangeControl,
							{
								key: "gbt-categories-grid-layout-1-columns",
								value: attributes.columns,
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
					),
				),
				el(
					'div',
					{
						key: 'gbt-categories-grid-results',
					},
					attributes.result.length < 1 && attributes.doneFirstLoad === false && getResult(null),
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

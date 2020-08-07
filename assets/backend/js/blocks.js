( function( blocks ) {
	var blockCategories = blocks.getCategories();
	blockCategories.unshift({ 'slug': 'product_blocks', 'title': 'Product Blocks for WooCommerce'});
	blocks.setCategories(blockCategories);
})(
	window.wp.blocks
);

// @prepros-append ../../../includes/gbt-blocks/categories_grid/block.js
// @prepros-append ../../../includes/gbt-blocks/scattered_product_list/block.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_reveal/blocks/lookbook.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_reveal/blocks/product.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_shop_by_outfit/blocks/lookbook.js
// @prepros-append ../../../includes/gbt-blocks/lookbook_shop_by_outfit/blocks/product.js
// @prepros-append ../../../includes/gbt-blocks/products_carousel/block.js
// @prepros-append ../../../includes/gbt-blocks/products_slider/block.js

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls = blockEditor.InspectorControls;

	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const ToggleControl		= components.ToggleControl;
	const RangeControl		= components.RangeControl;
	const Button 			= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/categories-grid', {
		title: i18n.__( 'Product Categories Grid' ),
		icon: el( SVG, { key: 'getbowtied-categories-grid-icon', xmlns:'http://www.w3.org/2000/svg', viewBox:'0 0 24 24' },
				el(Path, { key: 'getbowtied-categories-grid-icon-path', d:"M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z" } )
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

			function getResult() {
				let query;

				if ( attributes.queryDisplayType == 'all_categories' ) {
					query = _buildQuery(attributes.limit, attributes.orderby, attributes.parentOnly, attributes.hideEmpty);
				} else {
					query = attributes.queryCategories;
				}
				props.setAttributes({ queryCategoriesLast: query});

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
					props.setAttributes({ selectedIDS: bugFixer});
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
							TextControl,
							{
								key: 'gbt-categories-grid-display-number',
	              				label: i18n.__( 'How many product categories to display?' ),
	              				type: 'number',
	              				value: attributes.limit,
	              				onChange: function( value ) {
	              					props.setAttributes( { limit: value } );
								},
							},
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
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getResult();
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
					attributes.result.length < 1 && attributes.doneFirstLoad === false && getResult(),
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType = blocks.registerBlockType;

	const InspectorControls = blockEditor.InspectorControls;

	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const ToggleControl		= components.ToggleControl;
	const RangeControl		= components.RangeControl;
	const Button 			= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/scattered-product-list', {
		title: i18n.__( 'Scattered Product List' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M 7.1875 2.9941406 C 6.409 3.0139688 5.6767969 3.4902656 5.3730469 4.2597656 L 4.2929688 7 L 6.4433594 7 L 7.234375 4.9921875 L 12.326172 7 L 17.779297 7 L 7.96875 3.1328125 C 7.713 3.0320625 7.447 2.9875312 7.1875 2.9941406 z M 5 9 C 3.9069372 9 3 9.9069372 3 11 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 11 C 21 9.9069372 20.093063 9 19 9 L 5 9 z M 5 11 L 14 11 L 14 19 L 5 19 L 5 11 z M 16 11 L 19 11 L 19 19 L 16 19 L 16 11 z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
		/* Products source */
			queryProducts: {
				type: 'string',
				default: '/wc/v2/products?per_page=10',
			},
			queryProductsLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'all_products',
			},
		/* Manually pick products */
			selectedIDS: {
				type: 'string',
				default: '',
			},
			productIDs: {
				type: 'string',
				default: '',
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
		/* Display by category */
			queryCategoryOptions: {
				type: 'array',
				default: ''
			},
			queryCategorySelected: {
				type: 'array',
				default: [],
			},
		/* Filter by */
			queryFilterSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesOptions: {
				type: 'array',
				default: [],
			},
			queryAttributesOptionsValues: {
				type: 'array',
				default: []
			},
			queryAttributesSelectedSlug: {
				type: 'string',
				default: '',
			},
			queryAttributesOptionsSelected: {
				type: 'array',
				default: [],
			},
		/* Order by */
			queryOrder: {
				type: 'string',
				default: '',
			},
		/* Limit */
			limit: {
				type: 'int',
				default: 10
			}
		},
		edit: function( props ) {

			let attributes = props.attributes;
			// attributes.selectedIDS		 			= attributes.selectedIDS || [];
			attributes.selectedSlide 				= attributes.selectedSlide || 0;
			attributes.result 						= attributes.result || [];
			attributes.isLoading 					= attributes.isLoading || false;
			attributes.querySearchString    		= attributes.querySearchString || '';
			attributes.querySearchResults   		= attributes.querySearchResults || [];
			attributes.querySearchNoResults 		= attributes.querySearchNoResults || false;
			attributes.doneFirstLoad 				= attributes.doneFirstLoad || false;

		//==============================================================================
		//	Helper functions
		//==============================================================================
			function _categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			function toArray(s) {
				let ret = [];
				if ( s.length > 0 ) {
					ret = s.split(",");
				}
				for ( let i = 0; i < ret.length; i++) {
					if ( ret[i] == '') {
						ret.splice(i, 1);
					} else {
						ret[i] = Number(ret[i]);
					}
				}

				return ret;

			}
			function _searchResultClass(theID){
				let haystack = toArray(attributes.selectedIDS);
				const index = haystack.indexOf(theID);
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
						_sortCategories(arr[i].value, arr, newarr, level + 1 );
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
				props.setAttributes({ queryProducts: ''});
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
				props.setAttributes({ querySearchSelected: []});
				props.setAttributes({ selectedIDS: []});
				props.setAttributes({ queryAttributesOptionsSelected: []});
				props.setAttributes({ queryCategorySelected: [] });
				props.setAttributes({ result: []});
			}

			function _destroyTempAtts() {
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
			}

			function _isChecked( needle, haystack ) {
				let idx = haystack.indexOf(needle.toString());
				if ( idx != - 1) {
					return true;
				}
				return false;
			}

			function _isDonePossible() {
				return ( (attributes.queryProducts.length == 0) || (attributes.queryProducts === attributes.queryProductsLast) );
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
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				let query = attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});


				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: products });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < products.length; i++) {
							IDs += products[i].id + ',';
						}
						props.setAttributes({ productIDs: IDs});
						props.setAttributes({ selectedSlide: 0});
					});
				}
			}

			function renderResults() {

				let products = attributes.result;
				let productElements = [];
				let wrapper = [];

				if( products.length > 0) {

					let class_prefix = 'gbt_18_grid_product';

					for ( let i = 0; i < products.length; i++ ) {
						let img = '';
						if ( typeof products[i].images[0] !== 'undefined' && products[i].images[0].src != '' ) {
							img = products[i].images[0].src;
						} else {
							img = getbowtied_pbw.woo_placeholder_image;
						}
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + '_item-' + products[i].id,
									className: 	class_prefix + ' item-' + products[i].id,
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper' + i,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'img',
										{
											key: 		class_prefix + '_thumbnail' + i,
											className: 	class_prefix + '_thumbnail',
											src: 		img
										}
									),
									el( 'h4',
										{
											key: 		class_prefix + '_title' + i,
											className: 	class_prefix + '_title'
										},
										products[i]['name']
									),
									el( 'span',
										{
											key: 						class_prefix + '_price' + i,
											className: 					class_prefix + '_price',
											dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] }
										}
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
						{
							key: 		'gbt_18_expanding_grid_wrapper',
							className: 	'gbt_18_expanding_grid_wrapper'
						},
							el( 'ul',
								{
									key: 		'gbt_18_expanding_grid_products ',
									className: 	'gbt_18_expanding_grid_products '
								},
								productElements,
							)
						),
					);

				} else {

					let class_prefix = 'gbt_18_placeholder_grid_product';

					for ( let i = 0; i < 2; i++ ) {
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + '_item-' + i,
									className: 	class_prefix + ' item-' + i,
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper' + i,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail' + i,
											className: 	class_prefix + '_thumbnail',
										}
									),
									el( 'div',
										{
											key: 		class_prefix + '_title' + i,
											className: 	class_prefix + '_title'
										},
									),
									el( 'div',
										{
											key: 						class_prefix + '_price' + i,
											className: 					class_prefix + '_price',
										}
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
						{
							key: 		'gbt_18_placeholder_expanding_grid_wrapper',
							className: 	'gbt_18_placeholder_expanding_grid_wrapper'
						},
							el( 'ul',
								{
									key: 		'gbt_18_placeholder_expanding_grid_products ',
									className: 	'gbt_18_placeholder_expanding_grid_products '
								},
								productElements,
							)
						),
					);
				}

				return wrapper;
			}

			function _queryLimit(limit){
				let query = attributes.queryProducts;

				let buildQ = query;
				let newQ;
				buildQ = buildQ.replace('/wc/v2/products?', '');
				buildQ = buildQ.split('&');

				let flag = false;
				for ( let j = 0; j < buildQ.length; j++) {
					let temp = [];
					temp = buildQ[j].split('=');
					if (temp[0] === 'per_page'){
						buildQ[j] = 'per_page='+limit;
						flag= true;
						break;
					}
				}

				if ( flag === true) {
					newQ = '/wc/v2/products?' + buildQ.join('&');
				} else {
					newQ = '/wc/v2/products?per_page=' + limit + '&' + buildQ.join('&');
				}

				props.setAttributes({ queryProducts: newQ});
				return newQ;
			}

			function _queryOrder(value) {
				let query = attributes.queryProducts;
				if ( query.length < 1) return;
				let idx = query.indexOf('&orderby');
				if ( idx > -1) {
					query = query.substring(idx, -25);
				}

				switch ( value ) {
					case 'date_desc':
						query +='&orderby=date&order=desc';
					break;
					case 'date_asc':
						query +='&orderby=date&order=asc';
					break;
					case 'title_desc':
						query +='&orderby=title&order=desc';
					break;
					case 'title_asc':
						query +='&orderby=title&order=asc';
					break;
					default:

					break;
				}
				props.setAttributes({ queryProducts: query });
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
				let productElements = [];

				if ( attributes.querySearchNoResults === true) {
					return el('span', { key: 'gbt-scattered-list-search-results-noresults', className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( typeof products[i].images[0] !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { key: 'gbt-scattered-list-search-results-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-scattered-list-search-results-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-scattered-list-search-item-' + products[i].id,
								className: _searchResultClass(products[i].id),
								title: products[i].name,
								'data-index': i,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-scattered-list-search-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-scattered-list-search-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;
											let qSR = toArray(attributes.selectedIDS);
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR.join(',') });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: '' });
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-scattered-list-search-item-dashicon-yes-' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'gbt-scattered-list-search-item-dashicon-noalt-' + i, className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				let productElements = [];
				let i;

				let products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( typeof products[i].images[0] !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { key: 'gbt-scattered-list-search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-scattered-list-search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-scattered-list-search-selected-item-' + products[i].id,
								className:'single-result',
								title: products[i].name,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-scattered-list-search-selected-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-scattered-list-search-selected-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;


											let qSS = toArray(attributes.selectedIDS);

											if ( qSS.length < 1 && attributes.querySearchSelected.length > 0) {
												for ( let i = 0; i < attributes.querySearchSelected.length; i++ ) {
													qSS.push(attributes.querySearchSelected[i].id);
												}
											}
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS.join(',') });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
												apiFetch({ path: query }).then(function (products) {
													props.setAttributes({ querySearchSelected: products});
												});
											} else {
												props.setAttributes({queryProducts: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-scattered-list-search-selected-item-dashicon-no-alt-' + i, className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return productElements;
			}

			function renderCategories( parent = 0, level = 0 ) {
				let categoryElements = [];
				let catArr = attributes.queryCategoryOptions;
				if ( catArr.length > 0 )
				{
					for ( let i = 0; i < catArr.length; i++ ) {
						if ( catArr[i].parent !=  parent ) { continue; };
						categoryElements.push(
							el(
								'li',
								{
									key: 'gbt-scattered-list-category-item-' + catArr[i].value,
									className: 'level-' + catArr[i].level,
								},
								el(
								'label',
									{
										key: 'gbt-scattered-list-category-label-' + i,
										className: _categoryClassName( catArr[i].parent, catArr[i].value ) + ' ' + catArr[i].level,
									},
									el(
									'input',
										{
											type:  'checkbox',
											key:   'category-checkbox-' + catArr[i].value,
											value: catArr[i].value,
											'data-index': i,
											'data-parent': catArr[i].parent,
											checked: _isChecked(catArr[i].value, attributes.queryCategorySelected),
											onChange: function onChange(evt){
												let idx = Number(evt.target.dataset.index);
												if (evt.target.checked === true) {
													let qCS = attributes.queryCategorySelected;
													let index = qCS.indexOf(evt.target.value);
													if (index == -1) {
														qCS.push(evt.target.value);
													}
													for (let j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															let index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 == -1) {
																qCS.push(catArr[j].value.toString());
															}
														} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												} else {
													let qCS = attributes.queryCategorySelected;
													let index = qCS.indexOf(evt.target.value);
													if (index > -1) {
													  qCS.splice(index, 1);
													}
													for (let j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															let index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 > -1) {
																qCS.splice(index2, 1);
															}
															} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												};
												if ( attributes.queryCategorySelected.length > 0 ) {
													let query = getQuery('?per_page=' + attributes.limit + '&category=' + attributes.queryCategorySelected.join(','));
													query = query + _getQueryOrder();
													props.setAttributes({ queryProducts: query});
												} else {
													props.setAttributes({ queryProducts: '' });
												}
											},
										},
									),
									catArr[i].label,
									el(
										'sup',
										{
											// className: 'category-count',
										},
										catArr[i].count,
									),
								),
								renderCategories( catArr[i].value, level+1)
							),
						);
					}
				}
				if (categoryElements.length > 0 ) {
					let wrapper = el('ul', {className: 'level-' + level}, categoryElements);
					return wrapper;
				} else {
					return;
				}
			}

			function renderAttributes() {
				let attributeElements = [];
				let attArr = attributes.queryAttributesOptionsValues;
				if ( attArr.length > 0 )
				{
					for ( let i = 0; i < attArr.length; i++ ) {
						attributeElements.push(
							el(
							'label',
								{
									key: 'gbt-scattered-list-attribute-item-' + attArr[i].value,
									className: 'attribute-label',
								},
								el(
								'input',
									{
										type:  'checkbox',
										key:   'attribute-checkbox-' + attArr[i].value,
										value: attArr[i].value,
										checked: _isChecked(attArr[i].value, attributes.queryAttributesOptionsSelected),
										onChange: function onChange(evt){
											if (evt.target.checked === true) {
												let qCS = attributes.queryAttributesOptionsSelected;
												let index = qCS.indexOf(evt.target.value);
												if (index == -1) {
													qCS.push(evt.target.value);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											} else {
												let qCS = attributes.queryAttributesOptionsSelected;
												let index = qCS.indexOf(evt.target.value);
												if (index > -1) {
												  qCS.splice(index, 1);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											};
											if ( attributes.queryAttributesOptionsSelected.length > 0 ) {
												let query = getQuery('?per_page=' + attributes.limit + '&attribute=' + attributes.queryAttributesSelectedSlug + '&attribute_term='+ attributes.queryAttributesOptionsSelected.join(','));
												query = query + _getQueryOrder();
												props.setAttributes({ queryProducts: query});
											} else {
												props.setAttributes({ queryProducts: '' });
											}
										},
									},
								),
								attArr[i].label,
								el(
									'sup',
									{},
									attArr[i].count,
								),
							),
						);
					}
				}
				return attributeElements;
			}

			function renderOrderby() {
				let _returnArr= [];
				_returnArr.push(
					el(
						SelectControl,
						{
							key: 'query-panel-orderby',
							label: i18n.__('Order By:'),
							value: attributes.queryOrder,
							className: 'orderby-wrapper',
							options: [{
								label: i18n.__('Newness - newest first'),
								value: 'date_desc'
							}, {
								label: i18n.__('Newness - oldest first'),
								value: 'date_asc'
							}, {
								label: i18n.__('Title - ascending'),
								value: 'title_asc'
							}, {
								label: i18n.__('Title - descending'),
								value: 'title_desc'
							}],
							onChange: function onChange(value) {
								props.setAttributes({ queryOrder: value });
								_queryOrder(value);
							},
						},
					),
				);

				return _returnArr;
			}

		//==============================================================================
		//	Get ajax results
		//==============================================================================
			function getCategories() {
				let query = getQuery('/categories?&per_page=100');
				let options = [];
				let sorted = [];

				apiFetch({ path: query }).then(function (categories) {
				 	for ( let i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id, 'parent': categories[i].parent, 'count': categories[i].count };
		        	}

		        	for ( let i = 0; i < options.length; i++ ) {

		        	}
		        	sorted = _sortCategories(0, options);
		        	props.setAttributes({queryCategoryOptions: sorted });
				});
			}

			function getAttributes() {
				let query = getQuery('/attributes');
				let options = [];
				options.push({'label': 'Choose', 'value': ' '});

				apiFetch({ path: query }).then(function (categories) {
				 	for ( let i = 0; i < categories.length; i++ ) {
		        		options.push({'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id });
		        	}

		        	props.setAttributes({queryAttributesOptions: options});
				});
			}

			function getAttributesOptions( term ) {
				let query = getQuery('/attributes/'+term+'/terms');
				let options = [];
				apiFetch({ path: query }).then(function (attributes) {
				 	for ( let i = 0; i < attributes.length; i++ ) {
		        		options[i] = {'label': attributes[i].name.replace(/&amp;/g, '&'), 'value': attributes[i].id, 'count': attributes[i].count};
		        	}

		        	props.setAttributes({queryAttributesOptionsValues: options});
				});

				let query2 = getQuery('/attributes/'+term);

				apiFetch({ path: query2 }).then(function (attributes) {
			     	props.setAttributes({queryAttributesSelectedSlug: attributes.slug});
				});
			}

		//==============================================================================
		//	Main controls
		//==============================================================================
			return [
				el(
					InspectorControls,
					{
						key: 'gbt-scattered-list-products-main-inspector',
					},
					el(
						'div',
						{
							key: 'gbt-scattered-list-products-main-inspector-wrapper',
							className: 'products-main-inspector-wrapper',
						},
						el(
							SelectControl,
							{
								key: 'query-panel-select',
								label: i18n.__('Source:'),
								value: attributes.queryDisplayType,
								options: [{
									label: i18n.__('Choose an Option'),
									value: 'default'
								}, {
									label: i18n.__('Manually pick products'),
									value: 'specific'
								}, {
									label: i18n.__('Display by Category'),
									value: 'by_category'
								}, {
									label: i18n.__('Filter Products'),
									value: 'filter_by'
								}, {
									label: i18n.__('All Products'),
									value: 'all_products'
								}],
								onChange: function onChange(value) {
									if ( attributes.queryProducts != '' ) {
										if ( window.confirm(i18n.__("Changing the product source will lose the current selection.")) === false) {
											return;
										}
									}
		          					_destroyQuery();
									if ( value === 'by_category') {
										getCategories();
									}
									if ( value === 'all_products') {
										let query = getQuery('?per_page='+attributes.limit);
										props.setAttributes({queryProducts: query});
									}
									return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
					/* Pick specific producs */
						attributes.queryDisplayType === 'specific' && el(
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
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for products to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        let query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (products) {
								        	if ( products.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: products});
										});

									},
								},
							),
						),
						attributes.queryDisplayType === 'specific' && attributes.querySearchResults.length > 0 && attributes.querySearchString != '' && el(
							'div',
							{
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.queryDisplayType === 'specific' && attributes.querySearchSelected.length > 0 && el(
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
					/* Display by category */
						attributes.queryDisplayType === 'by_category' && el(
							'div',
							{
								className: 'category-result-wrapper',
							},
							renderCategories(),
						),
						attributes.queryDisplayType === 'by_category' && renderOrderby(),
					/* Filter by */
						attributes.queryDisplayType === 'filter_by'  && el (
							SelectControl,
							{
								key: 'query-panel-filter',
								// label: i18n.__('Pick one or more categories'),
								value: attributes.queryFilterSelected,
								options: [{
											label: 'Filter by',
											value: '',
										},
										{
											label: i18n.__('Featured products'),
											value: 'featured'
										},
										{
											label: i18n.__('On sale'),
											value: 'on_sale'
										},
										{
											label: i18n.__('Attributes'),
											value: 'attributes'
										}
								],
								onChange: function onChange(value) {
									_destroyQuery();
									props.setAttributes({ queryFilterSelected: value });
									if (value === 'attributes') {
										getAttributes();
									} else {
										let query = getQuery('?per_page=' + attributes.limit + '&' +value+'=1');
										// query = query + _getQueryOrder();
										props.setAttributes({ queryProducts: query });
									}
								}
							},
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected === 'attributes' && el (
							SelectControl,
							{
								key: 'query-panel-attributes',
								// label: i18n.__('Pick one or more categories'),
								value: attributes.queryAttributesSelected,
								options: attributes.queryAttributesOptions,
								onChange: function onChange(value) {
									_destroyQuery();
									props.setAttributes({ queryAttributesSelected: value });
									getAttributesOptions(value);
								}
							},
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected === 'attributes' && attributes.queryAttributesSelected !== '' && el (
							'div',
							{
								className: 'attributes-results-wrapper'
							},
							renderAttributes(),
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected != '' && renderOrderby(),
					/* All products */
						attributes.queryDisplayType === 'all_products'
						 && renderOrderby(),
 						attributes.queryDisplayType !== 'specific' && el(
							RangeControl,
							{
								value: attributes.limit,
								allowReset: false,
								initialPosition: 10,
								min: 2,
								max: 20,
								label: i18n.__( 'Number of Products' ),
								onChange: function( value ) {
									props.setAttributes( { limit: value } );
									_queryLimit(value);
								},
							}
						),
					/* Load all products */
						el(
							'button',
							{
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getProducts();
								},
							},
							_isLoadingText(),
						),
					),
				),
				el(
					'div',
					{
						key: 'gbt-scattered-list-main-wrapper',
					},
					attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(),
					renderResults(),
				),
			];
		},

		save: function() {
        	return null;
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InnerBlock 		= blockEditor.InnerBlocks;

	const SVG 				= components.SVG;
	const Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-reveal', {
		title: i18n.__( 'Lookbook - Product Reveal' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M 7.1875 2.9941406 C 6.409 3.0139688 5.6767969 3.4902656 5.3730469 4.2597656 L 4.2929688 7 L 6.4433594 7 L 7.234375 4.9921875 L 12.326172 7 L 17.779297 7 L 7.96875 3.1328125 C 7.713 3.0320625 7.447 2.9875312 7.1875 2.9941406 z M 5 9 C 3.9069372 9 3 9.9069372 3 11 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 11 C 21 9.9069372 20.093063 9 19 9 L 5 9 z M 5 11 L 14 11 L 14 19 L 5 19 L 5 11 z M 16 11 L 19 11 L 19 19 L 16 19 L 16 11 z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},

		edit: function( props ) {

			let attributes = props.attributes;

			return [
				el( 'div',
					{
						key: 		'gbt_18_lookbook_reveal_topbar',
						className: 	'gbt_18_lookbook_reveal_topbar'
					},
					el( 'div',
						{
							key: 		'gbt_18_lookbook_reveal_topbar_title',
							className: 	'gbt_18_lookbook_reveal_topbar_title',
						},
						el( SVG,
							{
								key: 'gbt_18_lookbook_reveal_topbar_title_icon',
								className: 'gbt_18_lookbook_reveal_topbar_title_icon',
								xmlns:"http://www.w3.org/2000/svg",
								viewBox:"0 0 24 24"
							},
							el( Path,
								{
									key: 'gbt_18_lookbook_reveal_topbar_title_icon_path',
									d:"M 7.1875 2.9941406 C 6.409 3.0139688 5.6767969 3.4902656 5.3730469 4.2597656 L 4.2929688 7 L 6.4433594 7 L 7.234375 4.9921875 L 12.326172 7 L 17.779297 7 L 7.96875 3.1328125 C 7.713 3.0320625 7.447 2.9875312 7.1875 2.9941406 z M 5 9 C 3.9069372 9 3 9.9069372 3 11 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 11 C 21 9.9069372 20.093063 9 19 9 L 5 9 z M 5 11 L 14 11 L 14 19 L 5 19 L 5 11 z M 16 11 L 19 11 L 19 19 L 16 19 L 16 11 z"
								}
							)
						),
						i18n.__('Lookbook - Product Reveal')
					),
				),
				el( InnerBlock,
					{
						key: 			'gbt_18_lookbook_reveal_inner_product',
						allowedBlocks: [ 'getbowtied/lookbook-reveal-product' ],
					},
				),
			];
		},

		save: function( props ) {
			return el(
				'div',
				{
					key: 		'gbt_18_lookbook_reveal_wrapper',
					className: 	'gbt_18_lookbook_reveal_wrapper'
				},
				el( InnerBlock.Content, { key: 'gbt_18_lookbook_reveal_wrapper' } )
			);
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls = blockEditor.InspectorControls;
	const ColorSettings		= blockEditor.PanelColorSettings;

	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const RangeControl		= components.RangeControl;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-reveal-product', {
		title: i18n.__( 'Lookbook Product' ),
		icon: 	el( SVG, { xmlns:'http://www.w3.org/2000/svg', viewBox:'0 0 24 24' },
					el( Path, { d:'M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13zm-7-9.5h6V11h-6zm0 2.5h6v1.5h-6zm0 2.5h6V16h-6z' } )
				),
		category: 'product_blocks',
		parent: [ 'getbowtied/lookbook-reveal' ],
		attributes: {
			productIDs: {
				type: 'string',
				default: '',
			},
		/* Products source */
			queryProducts: {
				type: 'string',
				default: '',
			},
			queryProductsLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'default',
			},
		/* loader */
			isLoading: {
				type: 'bool',
				default: false,
			},
		/* Manually pick products */
			selectedIDS: {
				type: 'string',
				default: '',
			},
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
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			bgColor: {
	        	type: 'string',
	        	default: '#d3d5d9'
	        },
	        textColor: {
	        	type: 'string',
	        	default: '#ffffff'
	        },
	        animation: {
	        	type: 'string',
	        	default: 'animation-1'
	        },
		},

		edit: function( props ) {

			let attributes = props.attributes;
			attributes.result = attributes.result || [];
			attributes.doneFirstLoad = attributes.doneFirstLoad || false;

			const colors = [
				{ name: 'red', 				color: '#d02e2e' },
				{ name: 'orange', 			color: '#f76803' },
				{ name: 'yellow', 			color: '#fbba00' },
				{ name: 'green', 			color: '#43d182' },
				{ name: 'blue', 			color: '#2594e3' },
				{ name: 'white', 			color: '#ffffff' },
				{ name: 'dark-gray', 		color: '#abb7c3' },
				{ name: 'black', 			color: '#000' 	 },
			];

		//==============================================================================
		//	Helper functions
		//==============================================================================
			function toArray(s) {
				let ret = [];
				if ( s.length > 0 ) {
					ret = s.split(",");
				}
				for ( let i = 0; i < ret.length; i++) {
					if ( ret[i] == '') {
						ret.splice(i, 1);
					} else {
						ret[i] = Number(ret[i]);
					}
				}

				return ret;

			}
			function _searchResultClass(theID){
				let haystack = toArray(attributes.selectedIDS);
				const index = haystack.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
			}

			function _isDonePossible() {
				return ( (attributes.queryProducts.length == 0) || (attributes.queryProducts === attributes.queryProductsLast) );
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

			function _destroyTempAtts() {
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
			}

			function _isSearchDisabled() {
				return attributes.querySearchSelected.length > 0;
			}

			function _searchDisabledClass() {
				return (attributes.querySearchSelected.length > 0 || toArray(attributes.selectedIDS).length > 0) ? "is-disabled" : "";
			}

		//==============================================================================
		//	Get & Show Products
		//==============================================================================
			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				const query = attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: products });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < products.length; i++) {
							IDs += products[i].id + ',';
						}
						props.setAttributes({ productIDs: IDs});
						props.setAttributes({ selectedSlide: 0});
					});
				}
			}

			function renderResults() {
				let products = attributes.result;

				let productElements = [];
				let wrapper = [];

				if( products.length > 0 ) { // generate content

					let dots 		 = '';
					let class_prefix = 'gbt_18_editor_lookbook_product';

					for ( let i = 0; i < products.length; i++ ) {

						if( products[i]['name'].length > 35 ) { dots = '...'; } else { dots = ''; }

						productElements.push(
							el( 'div',
								{
									key: 		class_prefix + '_content' + 'item-' + products[i].id,
									className: 	class_prefix + '_content'
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_left',
										className: 	class_prefix + '_content_left'
									},
									el( 'div',
										{
											key: 		class_prefix + '_content_left_inner_top',
											className: 	class_prefix + '_content_left_inner_top'
										},
										el( 'h2',
											{
												key: 		class_prefix + '_title',
												style: 		{ color: attributes.textColor },
												className: 	class_prefix + '_title'
											},
											products[i]['name'].substring(0,35) + dots
										),
										el( 'div',
											{
												key: 						class_prefix + '_text',
												style: 						{ color: attributes.textColor },
												className: 					class_prefix + '_text',
												dangerouslySetInnerHTML: 	{ __html: products[i]['short_description'] }
											}
										),
									),
									el( 'div',
										{
											key: 		class_prefix + '_content_left_inner_bottom',
											className: 	class_prefix + '_content_left_inner_bottom'
										},
										el( 'p',
											{
												key: 						class_prefix + '_price',
												style: 						{ color: attributes.textColor },
												className: 					class_prefix + '_price',
												dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] }
											}
										),
										el( 'button',
											{
												key: 		class_prefix + '_button',
												style: 		{ color: attributes.textColor, borderBottomColor: attributes.textColor },
												className: 	class_prefix + '_button'
											},
											'Add To Cart'
										),
									),
								),
								el( 'div',
									{
										key: 		class_prefix + '_content_right',
										className: 	class_prefix + '_content_right'
									},
									el( 'div',
										{
											key: 		class_prefix + '_image',
											style: 		{ backgroundImage: 'url('+products[i]['images'][0]['src']+')' } ,
											className: 	class_prefix + '_image'
										}
									)
								)
							));
					}

					wrapper.push(
						el( 'div',
							{
								className: 	'gbt_18_lookbook_reveal_product_wrapper',
								key: 		'gbt_18_lookbook_reveal_product_wrapper',
								style: 		{ backgroundColor: attributes.bgColor }
							},
							productElements
						)
					);

				} else { //generate placeholder content

					var class_prefix = 'gbt_18_editor_placeholder_lookbook_product';

					wrapper.push(
						el( 'div',
							{
								key: 		class_prefix + '_wrapper',
								className: 	'gbt_18_editor_lookbook_product_wrapper placeholder'
							},
							el( 'div',
								{
									key: 		class_prefix + '_content',
									className: 	'gbt_18_editor_lookbook_product_content placeholder'
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_left',
										className: 	class_prefix + '_content_left'
									},
									el( 'div',
										{
											key: 		class_prefix + '_content_left_inner_top',
											className: 	class_prefix + '_content_left_inner_top'
										},
										el('div', { className: class_prefix + '_title', key: class_prefix + '_title' } ),
										el('div', { className: class_prefix + '_text1', key: class_prefix + '_text1' } ),
										el('div', { className: class_prefix + '_text2', key: class_prefix + '_text2' } ),
									),
									el( 'div',
										{
											key: 		class_prefix + '_content_left_inner_bottom',
											className: 	class_prefix + '_content_left_inner_bottom'
										},
										el( 'div', 	  { className: class_prefix + '_price',  key: class_prefix + '_price'  } ),
										el( 'button', { className: class_prefix + '_button', key: class_prefix + '_button' }, 'Add To Cart' ),
									),
								),
								el( 'div',
									{
										key: 		class_prefix + '_content_right',
										className: 	class_prefix + '_content_right'
									},
									el( 'div', { className: class_prefix + '_image', key: class_prefix + '_image' } )
								)
							)
						)
					);
				}


				return wrapper;
			}

		//==============================================================================
		//	Display ajax results
		//==============================================================================
			function renderSearchResults() {
				let productElements = [];

				if ( attributes.querySearchNoResults === true) {
					return el('span', {className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for (let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 		'item-' + products[i].id +i,
								className: _searchResultClass(products[i].id) + ' ' + _searchDisabledClass(),
								title: products[i].name,
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
											if (toArray(attributes.selectedIDS).length > 0) return;
											const _this = evt.target;
											let qSR = toArray(attributes.selectedIDS);
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR.join(',') });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: '' });
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ className: 'dashicons dashicons-yes'}),
								el('span',{ className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				let productElements = [];
				const products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img= '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 		'item-' + products[i].id,
								className:'single-result',
								title: products[i].name,
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
											let qSS = toArray(attributes.selectedIDS);

											if ( qSS.length < 1 && attributes.querySearchSelected.length > 0) {
												for ( let i = 0; i < attributes.querySearchSelected.length; i++ ) {
													qSS.push(attributes.querySearchSelected[i].id);
												}
											}
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS.join(',') });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
												apiFetch({ path: query }).then(function (products) {
													props.setAttributes({ querySearchSelected: products});
												});
											} else {
												props.setAttributes({queryProducts: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								products[i].name,
								el('span',{ className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return productElements;
			}

			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-reveal-inspector'
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
					/* Pick specific producs */
						el(
							'div',
							{
								className: 'products-ajax-search-wrapper ' + _searchDisabledClass(),
							},
							el(
								TextControl,
								{
									key: 'query-panel-string',
			          				type: 'search',
			          				className: 'products-ajax-search',
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for products to display'),
			          				disabled: _isSearchDisabled(),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        const query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (products) {
								        	if ( products.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: products});
										});

									},
								},
							),
						),
						attributes.querySearchResults.length > 0 && attributes.querySearchString != '' && el(
							'div',
							{
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.querySearchSelected.length > 0 && el(
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
					/* Load all products */
						el(
							'button',
							{
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getProducts();
								},
							},
							_isLoadingText(),
						),
						el(
							ColorSettings,
							{
								key: 'lookbook-reveal-colors',
								title: i18n.__( 'Colors' ),
								colors: colors,
								colorSettings: [
									{
										label: i18n.__( 'Background Color' ),
										value: attributes.bgColor,
										onChange: function( newColor) {
											props.setAttributes( { bgColor: newColor } );
										},
									},
									{
										label: i18n.__( 'Text Color' ),
										value: attributes.textColor,
										onChange: function( newColor) {
											props.setAttributes( { textColor: newColor } );
										},
									},
								]
							},
						),
					),
				),
				attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(),
				renderResults(),
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InnerBlock 			= blockEditor.InnerBlocks;
	const RichText				= blockEditor.RichText;
	const MediaUpload			= blockEditor.MediaUpload;
	const ColorSettings			= blockEditor.PanelColorSettings;
	const InspectorControls 	= blockEditor.InspectorControls;

	const Button				= components.Button;
	const SVG 					= components.SVG;
	const Path 					= components.Path;
	const Circle				= components.Circle;

	var attributes = {
		title: {
			type: 'string',
			default: 'Lookbook Title',
		},
		subtitle: {
			type: 'string',
			default: 'Lookbook Subtitle',
		},
		imgURL: {
			type: 'string',
			attribute: 'src',
			default: '',
		},
		imgID: {
			type: 'number',
		},
		imgAlt: {
			type: 'string',
			attribute: 'alt',
		},
		bgColor: {
			type: 'string',
			default: '#d3d5d9'
		},
		textColor: {
			type: 'string',
			default: '#000'
		},
	};

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-shop-by-outfit', {
		title: i18n.__( 'Lookbook - Shop by Outfit' ),
		icon: el( SVG, { key: 'getbowtied-lookbook-sbo-icon', xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 24 24" },
				el( Path,{ d:"M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zm-9.2 3.8L7.87 7.79l7.35-3.04h.01l4.95 11.95-7.35 3.05z" }),
				el( Circle, {cx: "11", cy: "9", r: "1"}),
				el( Path, { d:"M5.88 19.75c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z" })
			  ),
		category: 'product_blocks',
		supports: {
			align: ['full']
		},
		attributes: attributes,

		edit: function( props ) {

			let attributes = props.attributes;

			const colors = [
				{ name: 'red', 				color: '#d02e2e' },
				{ name: 'orange', 			color: '#f76803' },
				{ name: 'yellow', 			color: '#fbba00' },
				{ name: 'green', 			color: '#43d182' },
				{ name: 'blue', 			color: '#2594e3' },
				{ name: 'white', 			color: '#ffffff' },
				{ name: 'dark-gray', 		color: '#abb7c3' },
				{ name: 'black', 			color: '#000' 	 },
			];

			if( 'full' != props.attributes.align ){ props.setAttributes({ align: 'full' }); }

			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-shop-by-outfit-inspector'
					},
					el(
						'div',
						{
							key: 'lookbook-shop-by-outfit-inspector'
						},
						el(
							ColorSettings,
							{
								key: 'lookbook-shop-by-outfit-colors',
								title: i18n.__( 'Colors' ),
								colors: colors,
								colorSettings: [
									{
										label: i18n.__( 'Background Color' ),
										value: attributes.bgColor,
										onChange: function( newColor) {
											props.setAttributes( { bgColor: newColor } );
										},
									},
									{
										label: i18n.__( 'Text Color' ),
										value: attributes.textColor,
										onChange: function( newColor) {
											props.setAttributes( { textColor: newColor } );
										},
									},
								]
							},
						),
					),
				),
				el( 'div',
					{
						key: 		'gbt_18_lookbook_sts_hero_item',
						className: 	'gbt_18_lookbook_sts_hero_item'
					},
					el( 'div',
						{
							key: 		'gbt_18_lookbook_sts_hero_media_upload',
							className: 	'gbt_18_lookbook_sts_hero_media_upload'
						},
						el(
							MediaUpload,
							{
								key: 'gbt_18_hero_section_image',
								allowedTypes: [ 'image' ],
								allowedFormats: [ 'align' ],
								buttonProps: { className: 'components-button button button-large' },
		              			value: attributes.imgID,
								onSelect: function( img ) {
									props.setAttributes( {
										imgID: img.id,
										imgURL: img.url,
										imgAlt: img.alt,
									} );
								},
		              			render: function( img ) {
		              				return [
			              				! attributes.imgID && el(
			              					Button,
			              					{
			              						key: 'gbt_18_hero_section_add_image_button',
			              						className: 'button add_image',
			              						onClick: img.open
			              					},
			              					i18n.__( 'Add Image' )
		              					),
		              					!! attributes.imgID && el(
		              						Button,
											{
												key: 'gbt_18_hero_section_remove_image_button',
												className: 'button remove_image',
												onClick: function() {
													img.close;
													props.setAttributes({
										            	imgID: null,
										            	imgURL: null,
										            	imgAlt: null,
										            });
												}
											},
											i18n.__( 'Remove Image' )
										),
		              				];
		              			},
							},
						),
					),
					el( 'div',
						{
							key: 		'gbt_18_lookbook_sts_hero_section_content',
							className: 	'gbt_18_lookbook_sts_hero_section_content',
							style:
							{
								backgroundColor: attributes.bgColor,
								backgroundImage: 'url(' + attributes.imgURL + ')'
							},
						},
						el( 'div',
							{
								key: 		'gbt_18_hero_section_text',
								className: 	'gbt_18_hero_section_text'
							},
							el( RichText,
								{
									key: 'gbt_18_hero_section_title',
									className: 'gbt_18_hero_section_title',
									formattingControls: [],
									tagName: 'h2',
									format: 'string',
									value: attributes.title,
									placeholder: i18n.__( 'Lookbook Title' ),
									style:
									{
										color: attributes.textColor
									},
									onChange: function( newTitle) {
										props.setAttributes( { title: newTitle } );
									}
								}
							),
							el( RichText,
								{
									key: 'gbt_18_hero_section_subtitle',
									className: 'gbt_18_hero_section_subtitle',
									formattingControls: [],
									tagName: 'p',
									format: 'string',
									value: attributes.subtitle,
									placeholder: i18n.__( 'Lookbook Subtitle' ),
									style:
									{
										color: attributes.textColor
									},
									onChange: function( newTitle) {
										props.setAttributes( { subtitle: newTitle } );
									}
								}
							),
							el( SVG,
								{
									key: 		'gbt_18_lookbook_sts_scroll_down_button',
									className: 	'gbt_18_lookbook_sts_scroll_down_button',
									xmlns: 		'http://www.w3.org/2000/svg',
									viewBox: 	'0 0 24 24',
									style:
									{
										fill: attributes.textColor,
										border: '1px solid ' + attributes.textColor
									}
								},
								el( Path,
									{
										d:"M 11 3 L 11 17.070312 L 6.4296875 12.5 L 4.9296875 14 L 12 21.070312 L 19.070312 14 L 17.570312 12.5 L 13 17.070312 L 13 3 L 11 3 z"
									}
								),
						  	)
						),
					),
				),
				el( InnerBlock,
					{
						key: 		   'gbt_18_lookbook_reveal_inner_product',
						allowedBlocks: [ 'getbowtied/lookbook-shop-by-outfit-product' ],
					},
				),
			];
		},

		save: function( props ) {

			props.attributes.title = props.attributes.title || "";

			props.attributes.subtitle 	= props.attributes.subtitle || "";
			props.attributes.imgURL 	= props.attributes.imgURL || "";
	        props.attributes.bgColor 	= props.attributes.bgColor || "";
	        props.attributes.textColor 	= props.attributes.textColor || "";

			return el( 'div',
				{
					key: 		'gbt_18_snap_look_book',
					className: 	'gbt_18_snap_look_book'
				},
				el( 'section',
					{
						key: 		'gbt_18_hero_look_book_item',
						className: 	'gbt_18_look_book_item gbt_18_hero_look_book_item',
						style:
						{
							backgroundImage: 'url(' + (props.attributes.imgURL || "") + ')',
							backgroundColor: props.attributes.bgColor,
							color: props.attributes.textColor
						}
					},
					el( 'div',
						{
							key: 		'gbt_18_hero_section_content',
							className: 	'gbt_18_hero_section_content'
						},
						el( 'h2',
							{
								key: 		'gbt_18_hero_title',
								className: 	'gbt_18_hero_title',
								style:
								{
									color: props.attributes.textColor
								},
								dangerouslySetInnerHTML: { __html: props.attributes.title }
							},
						),
						el( 'p',
							{
								key: 		'gbt_18_hero_subtitle',
								className: 	'gbt_18_hero_subtitle',
								dangerouslySetInnerHTML: { __html: props.attributes.subtitle }
							},
						),
					),
					el( 'span',
						{
							key: 		'gbt_18_scroll_down_button',
							className: 	'gbt_18_scroll_down_button',
							style:
							{
								borderColor: props.attributes.textColor
							}
						},
						el( SVG,
							{
								key: 'gbt_18_scroll_down_button-svg',
								xmlns:"http://www.w3.org/2000/svg",
								viewBox:"0 0 24 24",
								style:
								{
									fill: props.attributes.textColor,
								}
							},
							el( Path,
								{
									key: 'gbt_18_scroll_down_button-svg-path',
									d:"M 11 3 L 11 17.070312 L 6.4296875 12.5 L 4.9296875 14 L 12 21.070312 L 19.070312 14 L 17.570312 12.5 L 13 17.070312 L 13 3 L 11 3 z",
								}
							)
						),
					)
				),
				el( InnerBlock.Content, { key: 'gbt_18_lookbook_snap_to_scroll_wrapper' } )
			);
		},

		deprecated: [
			{
				attributes: attributes,

				save: function( props ) {

					props.attributes.title = props.attributes.title || "";

					props.attributes.subtitle 	= props.attributes.subtitle || "";
					props.attributes.imgURL 	= props.attributes.imgURL || "";
			        props.attributes.bgColor 	= props.attributes.bgColor || "";
			        props.attributes.textColor 	= props.attributes.textColor || "";

					return el( 'div',
						{
							key: 		'gbt_18_snap_look_book',
							className: 	'gbt_18_snap_look_book'
						},
						el( 'section',
							{
								key: 		'gbt_18_hero_look_book_item',
								className: 	'gbt_18_look_book_item gbt_18_hero_look_book_item',
								style:
								{
									backgroundImage: 'url(' + (props.attributes.imgURL || "") + ')',
									backgroundColor: props.attributes.bgColor,
									color: props.attributes.textColor
								}
							},
							el( 'div',
								{
									key: 		'gbt_18_hero_section_content',
									className: 	'gbt_18_hero_section_content'
								},
								el( 'h2',
									{
										key: 		'gbt_18_hero_title',
										className: 	'gbt_18_hero_title',
										style:
										{
											color: props.attributes.textColor
										},
										dangerouslySetInnerHTML: { __html: props.attributes.title }
									},
								),
								el( 'p',
									{
										key: 		'gbt_18_hero_subtitle',
										className: 	'gbt_18_hero_subtitle',
										dangerouslySetInnerHTML: { __html: props.attributes.subtitle }
									},
								),
							),
							el( 'span',
								{
									key: 		'gbt_18_scroll_down_button',
									className: 	'gbt_18_scroll_down_button',
									style:
									{
										borderColor: props.attributes.textColor
									}
								},
								el( SVG,
									{
										key: 'gbt_18_scroll_down_button-svg',
										xmlns:"http://www.w3.org/2000/svg",
										Focusable: 'false',
										viewBox:"0 0 24 24",
										style:
										{
											fill: props.attributes.textColor,
										}
									},
									el( Path,
										{
											key: 'gbt_18_scroll_down_button-svg-path',
											d:"M 11 3 L 11 17.070312 L 6.4296875 12.5 L 4.9296875 14 L 12 21.070312 L 19.070312 14 L 17.570312 12.5 L 13 17.070312 L 13 3 L 11 3 z",
										}
									)
								),
							)
						),
						el( InnerBlock.Content, { key: 'gbt_18_lookbook_snap_to_scroll_wrapper' } )
					);
				},
			}
		]

	} );

} )(
	window.wp.blocks,
	window.wp.components,
	window.wp.editor,
	window.wp.i18n,
	window.wp.element,
	jQuery
);

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls = blockEditor.InspectorControls;
	const MediaUpload		= blockEditor.MediaUpload;

	const Button			= components.Button;
	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const RangeControl		= components.RangeControl;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-shop-by-outfit-product', {
		title: i18n.__( 'Lookbook - Shop by Outfit Product' ),
		icon: 	el( SVG, { key: 'getbowtied-lookbook-sbo-product-icon', xmlns:'http://www.w3.org/2000/svg', viewBox:'0 0 24 24' },
					el( Path, { d:'M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13zm-7-9.5h6V11h-6zm0 2.5h6v1.5h-6zm0 2.5h6V16h-6z' } )
				),
		category: 'product_blocks',
		parent: [ 'getbowtied/lookbook-shop-by-outfit' ],
		supports: {
			align: ['full']
		},
		attributes: {
			productIDs: {
				type: 'string',
				default: ''
			},
			image_position: {
				type: 'string',
				default: 'image-right'
			},
			imgURL: {
	            type: 'string',
	            attribute: 'src',
	            default: '',
	        },
	        imgID: {
	            type: 'int',
	        },
	        imgAlt: {
	            type: 'string',
	            attribute: 'alt',
	        },
	        /* Products source */
			queryProducts: {
				type: 'string',
				default: '',
			},
			queryProductsLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'default',
			},
		/* loader */
			isLoading: {
				type: 'bool',
				default: false,
			},
		/* Manually pick products */
			selectedIDS: {
				type: 'string',
				default: '',
			},
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
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			old_align: {
				type: 'string',
				default: '',
			},
			selectedSlide: {
				type: 'int',
				default: 0,
			},
			align: {
				type: 'string',
				default: 'full'
			},
		},

		edit: function( props ) {

			let attributes = props.attributes;

			attributes.result 						= attributes.result || [];
			attributes.isLoading 					= attributes.isLoading || false;
			attributes.querySearchString    		= attributes.querySearchString || '';
			attributes.querySearchResults   		= attributes.querySearchResults || [];
			attributes.querySearchNoResults 		= attributes.querySearchNoResults || false;
			attributes.doneFirstLoad 				= attributes.doneFirstLoad || false;

			if( 'full' != attributes.align ){ props.setAttributes({ align: 'full' }); }

			const colors = [
				{ name: 'red', 				color: '#d02e2e' },
				{ name: 'orange', 			color: '#f76803' },
				{ name: 'yellow', 			color: '#fbba00' },
				{ name: 'green', 			color: '#43d182' },
				{ name: 'blue', 			color: '#2594e3' },
				{ name: 'white', 			color: '#ffffff' },
				{ name: 'dark-gray', 		color: '#abb7c3' },
				{ name: 'black', 			color: '#000' 	 },
			];

		//==============================================================================
		//	Helper functions
		//==============================================================================

			function toArray(s) {
				let ret = [];
				if ( s.length > 0 ) {
					ret = s.split(",");
				}
				for ( let i = 0; i < ret.length; i++) {
					if ( ret[i] == '') {
						ret.splice(i, 1);
					} else {
						ret[i] = Number(ret[i]);
					}
				}

				return ret;

			}
			function _searchResultClass(theID){
				let haystack = toArray(attributes.selectedIDS);
				const index = haystack.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
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
				props.setAttributes({ queryProducts: ''});
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
				props.setAttributes({ querySearchSelected: []});
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
				return ( (attributes.queryProducts.length == 0) || (attributes.queryProducts === attributes.queryProductsLast) );
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

			function _isSearchDisabled() {
				return attributes.querySearchSelected.length > 5;
			}

			function _searchDisabledClass() {
				return (attributes.querySearchSelected.length > 5 || toArray(attributes.selectedIDS).length > 5) ? "is-disabled" : "";
			}

		//==============================================================================
		//	Show products functions
		//==============================================================================
			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				const query = attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: products });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < products.length; i++) {
							IDs += products[i].id + ',';
						}
						props.setAttributes({ productIDs: IDs});
						props.setAttributes({ selectedSlide: 0});
					});
				}
			}

			function renderResults() {
				let products = attributes.result;

				let productElements = [];
				let wrapper = [];

				if( products.length > 0) {

					const class_prefix = 'gbt_18_lookbook_sts_product';

					for ( let i = 0; i < products.length; i++ ) {
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + '_' + products[i].id,
									className: 	class_prefix
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper_' + products[i].id + '-' + i,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail_' + products[i].id + '-' + i,
											className: 	class_prefix + '_thumbnail',
											style:
											{
												backgroundImage: 'url(' + products[i]['images'][0]['src'] + ')'
											}
										}
									),
									el( 'h4',
										{
											key: 		class_prefix + '_title_' + products[i].id + '-' + i,
											className: 	class_prefix + '_title'
										},
										products[i]['name']
									),
									el( 'span',
										{
											key: 						class_prefix + '_price_' + products[i].id + '-' + i,
											className: 					class_prefix + '_price',
											dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] }
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button_' + products[i].id + '-' + i,
											className: 	class_prefix + '_button'
										},
										i18n.__("Add To Cart")
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
						{
							key: 		'gbt_18_lookbook_sts_products_wrapper',
							className: 	'gbt_18_lookbook_sts_products_wrapper'
						},
							el( 'ul',
								{
									key: 		'gbt_18_lookbook_sts_products ',
									className: 	'gbt_18_lookbook_sts_products products-' + products.length
								},
								productElements,
							)
						),
					);

				} else {

					const class_prefix = 'gbt_18_placeholder_lookbook_sts_product';

					for ( let i = 0; i < 2; i++ ) {
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + '_' + i,
									className: 	class_prefix
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper_' + i,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail_' + i,
											className: 	class_prefix + '_thumbnail',
										}
									),
									el( 'div',
										{
											key: 		class_prefix + '_title_' + i,
											className: 	class_prefix + '_title'
										},
									),
									el( 'div',
										{
											key: 						class_prefix + '_price_' + i,
											className: 					class_prefix + '_price',
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button_' + i,
											className: 	class_prefix + '_button'
										},
										i18n.__("Add To Cart")
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
						{
							key: 		'gbt_18_placeholder_lookbook_sts_products_wrapper',
							className: 	'gbt_18_placeholder_lookbook_sts_products_wrapper'
						},
							el( 'ul',
								{
									key: 		'gbt_18_placeholder_lookbook_sts_products ',
									className: 	'gbt_18_placeholder_lookbook_sts_products '
								},
								productElements,
							)
						),
					);
				}

				return wrapper;
			}

			function _queryOrder(value) {
				let query = attributes.queryProducts;
				const idx = query.indexOf('&orderby');
				if ( idx > -1) {
					query = query.substring(idx, -25);
				}

				switch ( value ) {
					case 'date_desc':
						query +='&orderby=date&order=desc';
					break;
					case 'date_asc':
						query +='&orderby=date&order=asc';
					break;
					case 'title_desc':
						query +='&orderby=title&order=desc';
					break;
					case 'title_asc':
						query +='&orderby=title&order=asc';
					break;
					default:

					break;
				}
				props.setAttributes({ queryProducts: query });
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
				let productElements = [];

				if ( attributes.querySearchNoResults === true) {
					return el('span', {key: 'gbt-sbo-product-no-results', className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for ( let i = 0; i < products.length; i++ ) {
					let img= '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { key: 'gbt-sbo-product-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-sbo-product-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-sbo-product-search-result-item-' + i,
								className: _searchResultClass(products[i].id) + ' ' + _searchDisabledClass(),
								title: products[i].name,
								'data-index': i,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-sbo-product-search-result-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-sbo-product-search-result-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											if ( toArray(attributes.selectedIDS).length > 5) return;
											const _this = evt.target;
											let qSR = toArray(attributes.selectedIDS);
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR.join(',') });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: '' });
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-sbo-product-search-result-item-dashicon-yes-' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'gbt-sbo-product-search-result-item-dashicon-noalt-' + i, className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				let productElements = [];

				let products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img= '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { key: 'gbt-sbo-product-search-result-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-sbo-product-search-result-img-wrapper',className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-sbo-product-search-result-item-' + i,
								className:'single-result',
								title: products[i].name,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-sbo-product-search-result-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-sbo-product-search-result-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;


											let qSS = toArray(attributes.selectedIDS);

											if ( qSS.length < 1 && attributes.querySearchSelected.length > 0) {
												for ( let i = 0; i < attributes.querySearchSelected.length; i++ ) {
													qSS.push(attributes.querySearchSelected[i].id);
												}
											}
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS.join(',') });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
												apiFetch({ path: query }).then(function (products) {
													props.setAttributes({ querySearchSelected: products});
												});
											} else {
												props.setAttributes({queryProducts: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-sbo-product-search-result-item-dashicon-noalt' + i, className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return productElements;
			}

		//==============================================================================
		//	Main controls
		//==============================================================================
			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-shop-by-outfit-product-inspector'
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
					/* Pick specific producs */
						el(
							'div',
							{
								className: 'products-ajax-search-wrapper ' + _searchDisabledClass(),
							},
							el(
								TextControl,
								{
									key: 'query-panel-string',
			          				type: 'search',
			          				className: 'products-ajax-search',
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for products to display'),
			          				disabled: _isSearchDisabled(),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        const query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (products) {
								        	if ( products.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: products});
										});

									},
								},
							),
						),
						attributes.querySearchResults.length > 0 && attributes.querySearchString != '' && el(
							'div',
							{
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.querySearchSelected.length > 0 && el(
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
					/* Load all products */
						el(
							'button',
							{
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getProducts();
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
							SelectControl,
							{
								key: 'lookbook-shop-by-outfit-image-position',
								options:
									[
										{ value: 'image-right', label: 'Right' },
										{ value: 'image-left',   label: 'Left' },
									],
	              				label: i18n.__( 'Image Position' ),
	              				value: attributes.image_position,
	              				onChange: function( newPosition ) {
	              					props.setAttributes( { image_position: newPosition } );
								},
							}
						),
					),
				),
				el( 'div',
					{
						key: 		'gbt_18_editor_lookbook_sts_product_content',
						className: 	'gbt_18_editor_lookbook_sts_product_content ' + attributes.image_position
					},
					el( 'div',
						{
							key: 		'gbt_18_editor_lookbook_sts_product_content_left',
							className: 	'gbt_18_editor_lookbook_sts_product_content_left'
						},
						attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(),
						renderResults(),
					),
					el( 'div',
						{
							key: 		'gbt_18_editor_lookbook_sts_product_content_right',
							className: 	'gbt_18_editor_lookbook_sts_product_content_right'
						},
						el( 'div',
							{
								key: 		'gbt_18_editor_lookbook_sts_product_media_upload',
								className: 	'gbt_18_editor_lookbook_sts_product_media_upload'
							},
							el(
								MediaUpload,
								{
									key: 'gbt_18_editor_product_media_upload',
									allowedTypes: [ 'image' ],
									formattingControls: [ 'align' ],
									buttonProps: { className: 'components-button button button-large' },
			              			value: attributes.imgID,
									onSelect: function( img ) {
										props.setAttributes( {
											imgID: img.id,
											imgURL: img.url,
											imgAlt: img.alt,
										} );
									},
			              			render: function( img ) {
			              				return [
				              				! attributes.imgID && el(
				              					Button,
				              					{
				              						key: 'gbt_18_lookbook_sts_product_add_image_button',
				              						className: 'button add_image',
				              						onClick: img.open
				              					},
				              					i18n.__( 'Add Image' )
			              					),
			              					!! attributes.imgID && el(
			              						Button,
												{
													key: 'gbt_18_lookbook_sts_product_remove_image_button',
													className: 'button remove_image',
													onClick: function() {
														img.close;
														props.setAttributes({
											            	imgID: null,
											            	imgURL: null,
											            	imgAlt: null,
											            });
													}
												},
												i18n.__( 'Remove Image' )
											),
			              				];
			              			},
								},
							),
						),
						el( 'div',
							{
								key: 		'gbt_18_editor_lookbook_sts_product_content_image',
								className: 	'gbt_18_editor_lookbook_sts_product_content_image',
								style:
								{
									backgroundImage: 'url(' + attributes.imgURL + ')'
								},
							}
						)
					)
				)
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
	window.wp.element
);

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;
	const InspectorControls   = blockEditor.InspectorControls;

	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const ToggleControl		= components.ToggleControl;
	const RangeControl		= components.RangeControl;
	const Button 			= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-carousel', {
		title: i18n.__( 'Product Carousel' ),
		icon: el(SVG,{key: 'getbowtied-product-carousel-icon', xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{key: 'getbowtied-product-carousel-icon-path', d:"M 7 3 A 1.0001 1.0001 0 0 0 6 4 L 6 5 L 3 5 A 1.0001 1.0001 0 0 0 2 6 L 2 18 A 1.0001 1.0001 0 0 0 3 19 L 6 19 L 6 20 A 1.0001 1.0001 0 0 0 7 21 L 17 21 A 1.0001 1.0001 0 0 0 18 20 L 18 19 L 21 19 A 1.0001 1.0001 0 0 0 22 18 L 22 6 A 1.0001 1.0001 0 0 0 21 5 L 18 5 L 18 4 A 1.0001 1.0001 0 0 0 17 3 L 7 3 z M 8 5 L 16 5 L 16 5.8320312 A 1.0001 1.0001 0 0 0 16 6.1582031 L 16 17.832031 A 1.0001 1.0001 0 0 0 16 18.158203 L 16 19 L 8 19 L 8 18.167969 A 1.0001 1.0001 0 0 0 8 17.841797 L 8 6.1679688 A 1.0001 1.0001 0 0 0 8 5.8417969 L 8 5 z M 4 7 L 6 7 L 6 17 L 4 17 L 4 7 z M 18 7 L 20 7 L 20 17 L 18 17 L 18 7 z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
		/* Products source */
			queryProducts: {
				type: 'string',
				default: 'wc/v3/products?per_page=10',
			},
			queryProductsLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'all_products',
			},
		/* Manually pick products */
			selectedIDS: {
				type: 'string',
				default: '',
			},
			productIDs: {
				type: 'string',
				default: '',
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
		/* Display by category */
			queryCategoryOptions: {
				type: 'array',
				default: ''
			},
			queryCategorySelected: {
				type: 'array',
				default: [],
			},
		/* Filter by */
			queryFilterSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesOptions: {
				type: 'array',
				default: [],
			},
			queryAttributesOptionsValues: {
				type: 'array',
				default: []
			},
			queryAttributesSelectedSlug: {
				type: 'string',
				default: '',
			},
			queryAttributesOptionsSelected: {
				type: 'array',
				default: [],
			},
		/* Order by */
			queryOrder: {
				type: 'string',
				default: '',
			},
		/* Columns */
			columns: {
				type: 'int',
				default: 3
			},
		/* Space Between */
			spaceBetween: {
				type: 'int',
				default: 30
			},
		/* Limit */
			limit: {
				type: 'int',
				default: 10
			}
		},
		edit: function( props ) {

			let attributes = props.attributes;
			attributes.selectedSlide 				= attributes.selectedSlide || 0;
			attributes.result 						= attributes.result || [];
			attributes.isLoading 					= attributes.isLoading || false;
			attributes.querySearchString    		= attributes.querySearchString || '';
			attributes.querySearchResults   		= attributes.querySearchResults || [];
			attributes.querySearchNoResults 		= attributes.querySearchNoResults || false;
			attributes.doneFirstLoad 				= attributes.doneFirstLoad || false;

		//==============================================================================
		//	Helper functions
		//==============================================================================

			function _categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			function toArray(s) {
				let ret = [];
				if ( s.length > 0 ) {
					ret = s.split(",");
				}
				for ( let i = 0; i < ret.length; i++) {
					if ( ret[i] == '') {
						ret.splice(i, 1);
					} else {
						ret[i] = Number(ret[i]);
					}
				}

				return ret;

			}
			function _searchResultClass(theID){
				let haystack = toArray(attributes.selectedIDS);
				const index = haystack.indexOf(theID);
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
						_sortCategories(arr[i].value, arr, newarr, level + 1 );
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
				props.setAttributes({ queryProducts: ''});
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
				props.setAttributes({ querySearchSelected: []});
				props.setAttributes({ selectedIDS: []});
				props.setAttributes({ queryAttributesOptionsSelected: []});
				props.setAttributes({ queryCategorySelected: [] });
				props.setAttributes({ result: []});
			}

			function _destroyTempAtts() {
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
			}

			function _isChecked( needle, haystack ) {
				let idx = haystack.indexOf(needle.toString());
				if ( idx != - 1) {
					return true;
				}
				return false;
			}

			function _isDonePossible() {
				return ( (attributes.queryProducts.length == 0) || (attributes.queryProducts === attributes.queryProductsLast) );
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
				return 'wc/v3/products' + query;
			}

			function getProducts() {
				let query = attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						let products_final = [];
						let index = 0;
						for ( let i = 0; i < products.length; i++) {
							if( products[i].catalog_visibility != 'hidden' ) {
								products_final[index] = products[i];
								index++;
							}
						}
						products = products_final;
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: products });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < products.length; i++) {
							if( products[i].catalog_visibility != 'hidden' ) {
								IDs += products[i].id + ',';
							}
						}
						props.setAttributes({ productIDs: IDs});
						props.setAttributes({ selectedSlide: 0});
					});
				}
			}

			function renderResults() {
				let products = attributes.result;
				let productElements = [];
				let wrapper = [];

				function _isVisible(idx) {
					if ( attributes.selectedSlide <= idx && idx < attributes.selectedSlide + attributes.columns ) {
						return ' is-visible';
					}

					return '';
				}

				function _isNext() {
					return (products.length-1 < attributes.selectedSlide + attributes.columns);
				}

				function _isPrev() {
					return (attributes.selectedSlide == 0);
				}

				if( products.length > 0) {

					let class_prefix = 'gbt_18_carousel_product';

					for ( let i = 0; i < products.length; i++ ) {
						let img = '';
						if ( products[i].images.length && typeof products[i].images[0] !== 'undefined' && products[i].images[0].src != '' ) {
							img = products[i].images[0].src;
						} else {
							img = getbowtied_pbw.woo_placeholder_image;
						}
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + products[i].id,
									className: 	class_prefix + _isVisible(i),
									style: 		{ width: 100/products.length+"%", paddingRight: (attributes.spaceBetween/2)+'px', paddingLeft: (attributes.spaceBetween/2)+'px'}
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper' + i,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail' + i,
											className: 	class_prefix + '_thumbnail',
											style: { backgroundImage: "url("+img+")" }
										}
									),
									el( 'h4',
										{
											key: 		class_prefix + '_title' + i,
											className: 	class_prefix + '_title'
										},
										products[i]['name']
									),
									el( 'span',
										{
											key: 						class_prefix + '_price' + i,
											className: 					class_prefix + '_price',
											dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] }
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button' + i,
											className: 	class_prefix + '_button'
										},
										i18n.__("Add To Cart")
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
						{
							key: 		'gbt_18_product_carousel_wrapper',
							className: 	'gbt_18_product_carousel_wrapper'
						},
							el(
								'div',
								{
									key: 'gbt_18_product_carousel_scrollable_wrapper',
									className: 'scrollable_wrapper',
								},
								el( 'ul',
									{
										key: 		'gbt_18_carousel_products gbt_18_carousel_slider',
										className: 	'gbt_18_carousel_products gbt_18_carousel_slider columns-'+attributes.columns,
										style: 		{ width: productElements.length*100/attributes.columns+"%", marginLeft: -attributes.selectedSlide*(100/attributes.columns)+"%"}
									},
									productElements,
								),
							),
							el( 'button',
								{
									key: 'gbt_18_carousel_toggle-prev-button',
									className: 	'toggle-prev-button',
									disabled: 	_isPrev(),
									onClick: 	function onClick() {
										let idx = attributes.selectedSlide;
										if ( idx - 1 >= 0) {
											props.setAttributes({ selectedSlide: idx - 1});
										} else {
											props.setAttributes({ selectedSlide: productElements.length - 1});
										}
									},
								},
								el( SVG,
									{
										key: 'gbt_18_carousel_toggle-prev-button-svg',
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-prev',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 1024 1024",
										width: '16',
										height: '16'
									},
									el( Path,
										{
											key: 'gbt_18_carousel_toggle-prev-button-svg-path',
											d:"M427.699 171.705c9.999-9.996 10.001-26.205 0.005-36.204s-26.205-10.001-36.204-0.005l-307.2 307.107c-9.999 9.996-10.001 26.205-0.005 36.204l307.2 307.293c9.996 9.999 26.205 10.001 36.204 0.005s10.001-26.205 0.005-36.204l-289.101-289.188 289.095-289.008zM102.4 435.2c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6h819.2c14.138 0 25.6-11.462 25.6-25.6s-11.462-25.6-25.6-25.6h-819.2z"
										}
									)
								),
							),
							el( 'button',
								{
									key: 'gbt_18_carousel_toggle-next-button',
									className: 	'toggle-next-button',
									disabled:  _isNext(),
									onClick: 	function onClick() {
										let idx = attributes.selectedSlide;
										if ( idx + 1 < productElements.length) {
											props.setAttributes({ selectedSlide: idx + 1});
										} else {
											props.setAttributes({ selectedSlide: 0 });
										}
									},
								},
								el( SVG,
									{
										key: 'gbt_18_carousel_toggle-next-button-svg',
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-next',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 1024 1024",
										width: '16',
										height: '16'
									},
									el( Path,
										{
											key: 'gbt_18_carousel_toggle-next-button-svg-path',
											d:"M596.301 749.895c-9.999 9.996-10.001 26.205-0.005 36.204s26.205 10.001 36.204 0.005l307.2-307.107c9.999-9.996 10.001-26.205 0.005-36.204l-307.2-307.293c-9.996-9.999-26.205-10.001-36.204-0.005s-10.001 26.205-0.005 36.204l289.101 289.188-289.095 289.008zM921.6 486.4c14.138 0 25.6-11.462 25.6-25.6s-11.462-25.6-25.6-25.6h-819.2c-14.138 0-25.6 11.462-25.6 25.6s11.462 25.6 25.6 25.6h819.2z"
										}
									)
								),
							),
						),
					);

				} else {
					let class_prefix = 'gbt_18_carousel_placeholder_product';

					for( let j = 0; j <= 2; j++ ) {
						productElements.push(
							el( 'li',
								{
									key: 		class_prefix + '_item-' + j,
									className: 	class_prefix + ' item-' + j,
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper' + j,
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail' + j,
											className: 	class_prefix + '_thumbnail',
										}
									),
									el( 'div',
										{
											key: 		class_prefix + '_title' + j,
											className: 	class_prefix + '_title'
										},
									),
									el( 'div',
										{
											key: 		class_prefix + '_price' + j,
											className: 	class_prefix + '_price',
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button' + j,
											className: 	class_prefix + '_button'
										},
										i18n.__("Add To Cart")
									)
								)
							)
						);
					}

					wrapper.push(
						el( 'div',
							{
								key: 		'gbt_18_product_carousel_placeholder_wrapper',
								className: 	'gbt_18_product_carousel_placeholder_wrapper'
							},
							el( 'ul',
								{
									key: 		'gbt_18_carousel_products_placeholder',
									className: 	'gbt_18_carousel_products_placeholder',
								},
								productElements,
							),
							el( 'button',
								{
									key: 'gbt_18_carousel_placeholder_toggle-prev-button',
									className: 'toggle-prev-button',
								},
								el( SVG,
									{
										key: 'gbt_18_carousel_placeholder_toggle-prev-button-svg',
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-prev',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
											key: 'gbt_18_carousel_placeholder_toggle-prev-button-svg-path',
											d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
										}
									)
								),
							),
							el( 'button',
								{
									key: 'gbt_18_carousel_placeholder_toggle-next-button',
									className: 'toggle-next-button',
								},
								el( SVG,
									{
										key: 'gbt_18_carousel_placeholder_toggle-next-button-svg',
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-next',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
											key: 'gbt_18_carousel_placeholder_toggle-next-button-svg-path',
											d:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
										}
									)
								),
							),
						),
					);
				}

				return wrapper;
			}

			function _queryLimit(old_limit, limit){
				let query = attributes.queryProducts;
				let newQ = query.replace('per_page='+old_limit, 'per_page='+limit);

				props.setAttributes({ queryProducts: newQ});

				return newQ;
			}

			function _queryOrder(value) {
				let query = attributes.queryProducts;
				if ( query.length < 1) return;
				let idx = query.indexOf('&orderby');
				if ( idx > -1) {
					query = query.substring(idx, -25);
				}

				switch ( value ) {
					case 'date_desc':
						query +='&orderby=date&order=desc';
					break;
					case 'date_asc':
						query +='&orderby=date&order=asc';
					break;
					case 'title_desc':
						query +='&orderby=title&order=desc';
					break;
					case 'title_asc':
						query +='&orderby=title&order=asc';
					break;
					default:

					break;
				}
				props.setAttributes({ queryProducts: query });
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
				let productElements = [];

				if ( attributes.querySearchNoResults === true) {
					return el('span', {key: 'gbt_18_carousel_search-no-results', className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { key: 'gbt_18_carousel_search-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt_18_carousel_search-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-carousel-search-result-item-' + products[i].id,
								className: _searchResultClass(products[i].id),
								title: products[i].name,
								'data-index': i,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-carousel-search-result-item-title-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-carousel-search-result-item-input-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;
											let qSR = toArray(attributes.selectedIDS);
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR.join(',') });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: '' });
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-carousel-search-result-item-dashicon-yes-' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'gbt-carousel-search-result-item-dashicon-noalt-' + i, className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				let productElements = [];
				let i;

				let products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { key: 'gbt_18_carousel_search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt_18_carousel_search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'single-result-' + products[i].id,
								className: 'single-result',
								title: products[i].name,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-carousel-search-selected-item-label-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-carousel-search-selected-item-checkbox-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;


											let qSS = toArray(attributes.selectedIDS);

											if ( qSS.length < 1 && attributes.querySearchSelected.length > 0) {
												for ( let i = 0; i < attributes.querySearchSelected.length; i++ ) {
													qSS.push(attributes.querySearchSelected[i].id);
												}
											}
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS.join(',') });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
												apiFetch({ path: query }).then(function (products) {
													props.setAttributes({ querySearchSelected: products});
												});
											} else {
												props.setAttributes({queryProducts: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-carousel-search-selected-item-dashicon-noalt-' + i, className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return productElements;
			}

			function renderCategories( parent = 0, level = 0 ) {
				let categoryElements = [];
				let catArr = attributes.queryCategoryOptions;
				if ( catArr.length > 0 )
				{
					for ( let i = 0; i < catArr.length; i++ ) {
						if ( catArr[i].parent !=  parent ) { continue; };
						categoryElements.push(
							el(
								'li',
								{
									key: 'gbt-carousel-category-item-' + catArr[i].value,
									className: 'level-' + catArr[i].level,
								},
								el(
								'label',
									{
										key: 'gbt-carousel-category-item-label-' + i,
										className: _categoryClassName( catArr[i].parent, catArr[i].value ) + ' ' + catArr[i].level,
									},
									el(
									'input',
										{
											type:  'checkbox',
											key:   'category-checkbox-' + catArr[i].value,
											value: catArr[i].value,
											'data-index': i,
											'data-parent': catArr[i].parent,
											checked: _isChecked(catArr[i].value, attributes.queryCategorySelected),
											onChange: function onChange(evt){
												let idx = Number(evt.target.dataset.index);
												if (evt.target.checked === true) {
													let qCS = attributes.queryCategorySelected;
													let index = qCS.indexOf(evt.target.value);
													if (index == -1) {
														qCS.push(evt.target.value);
													}
													for (let j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															let index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 == -1) {
																qCS.push(catArr[j].value.toString());
															}
														} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												} else {
													let qCS = attributes.queryCategorySelected;
													let index = qCS.indexOf(evt.target.value);
													if (index > -1) {
													  qCS.splice(index, 1);
													}
													for (let j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															let index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 > -1) {
																qCS.splice(index2, 1);
															}
															} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												};
												if ( attributes.queryCategorySelected.length > 0 ) {
													let query = getQuery('?per_page=' + attributes.limit + '&category=' + attributes.queryCategorySelected.join(','));
													query = query + _getQueryOrder();
													props.setAttributes({ queryProducts: query});
												} else {
													props.setAttributes({ queryProducts: '' });
												}
											},
										},
									),
									catArr[i].label,
									el(
										'sup',
										{
											key: 'gbt-carousel-category-item-count-' + i,
										},
										catArr[i].count,
									),
								),
								renderCategories( catArr[i].value, level+1)
							),
						);
					}
				}
				if (categoryElements.length > 0 ) {
					let wrapper = el('ul', {key: 'gbt-product-carousel-category-ul', className: 'level-' + level}, categoryElements);
					return wrapper;
				} else {
					return;
				}
			}

			function renderAttributes() {
				let attributeElements = [];
				let attArr = attributes.queryAttributesOptionsValues;
				if ( attArr.length > 0 )
				{
					for ( let i = 0; i < attArr.length; i++ ) {
						attributeElements.push(
							el(
							'label',
								{
									key: 'gbt-attribute-' + attArr[i].value,
									className: 'attribute-label',
								},
								el(
								'input',
									{
										type:  'checkbox',
										key:   'attribute-checkbox-' + attArr[i].value,
										value: attArr[i].value,
										checked: _isChecked(attArr[i].value, attributes.queryAttributesOptionsSelected),
										onChange: function onChange(evt){
											if (evt.target.checked === true) {
												let qCS = attributes.queryAttributesOptionsSelected;
												let index = qCS.indexOf(evt.target.value);
												if (index == -1) {
													qCS.push(evt.target.value);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											} else {
												let qCS = attributes.queryAttributesOptionsSelected;
												let index = qCS.indexOf(evt.target.value);
												if (index > -1) {
												  qCS.splice(index, 1);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											};
											if ( attributes.queryAttributesOptionsSelected.length > 0 ) {
												let query = getQuery('?per_page=' + attributes.limit + '&attribute=' + attributes.queryAttributesSelectedSlug + '&attribute_term='+ attributes.queryAttributesOptionsSelected.join(','));
												query = query + _getQueryOrder();
												props.setAttributes({ queryProducts: query});
											} else {
												props.setAttributes({ queryProducts: '' });
											}
										},
									},
								),
								attArr[i].label,
								el(
									'sup',
									{
										key: 'gbt-attribute-count',
									},
									attArr[i].count,
								),
							),
						);
					}
				}
				return attributeElements;
			}

			function renderOrderby() {
				let _returnArr= [];
				_returnArr.push(
					el(
						SelectControl,
						{
							key: 'query-panel-orderby',
							label: i18n.__('Order By:'),
							value: attributes.queryOrder,
							className: 'orderby-wrapper',
							options: [{
								label: i18n.__('Newness - newest first'),
								value: 'date_desc'
							}, {
								label: i18n.__('Newness - oldest first'),
								value: 'date_asc'
							}, {
								label: i18n.__('Title - ascending'),
								value: 'title_asc'
							}, {
								label: i18n.__('Title - descending'),
								value: 'title_desc'
							}],
							onChange: function onChange(value) {
								props.setAttributes({ queryOrder: value });
								_queryOrder(value);
							},
						},
					),
				);

				return _returnArr;
			}

		//==============================================================================
		//	Get ajax results
		//==============================================================================
			function getCategories() {
				let query = getQuery('/categories?&per_page=100');
				let options = [];
				let sorted = [];

				apiFetch({ path: query }).then(function (categories) {
				 	for ( let i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id, 'parent': categories[i].parent, 'count': categories[i].count };
		        	}

		        	for ( let i = 0; i < options.length; i++ ) {

		        	}
		        	sorted = _sortCategories(0, options);
		        	props.setAttributes({queryCategoryOptions: sorted });
				});
			}

			function getAttributes() {
				let query = getQuery('/attributes');
				let options = [];
				options.push({'label': 'Choose', 'value': ' '});

				apiFetch({ path: query }).then(function (categories) {
				 	for ( let i = 0; i < categories.length; i++ ) {
		        		options.push({'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id });
		        	}

		        	props.setAttributes({queryAttributesOptions: options});
				});
			}

			function getAttributesOptions( term ) {
				let query = getQuery('/attributes/'+term+'/terms');
				let options = [];
				apiFetch({ path: query }).then(function (attributes) {
				 	for ( let i = 0; i < attributes.length; i++ ) {
		        		options[i] = {'label': attributes[i].name.replace(/&amp;/g, '&'), 'value': attributes[i].id, 'count': attributes[i].count};
		        	}

		        	props.setAttributes({queryAttributesOptionsValues: options});
				});

				let query2 = getQuery('/attributes/'+term);

				apiFetch({ path: query2 }).then(function (attributes) {
			     	props.setAttributes({queryAttributesSelectedSlug: attributes.slug});
				});
			}

		//==============================================================================
		//	Main controls
		//==============================================================================
			return [
				el(
					InspectorControls,
					{
						key: 'gbt-product-carousel-inspector'
					},
					el(
						'div',
						{
							key: 'gbt-product-carousel-inspector-wrapper',
							className: 'products-main-inspector-wrapper',
						},
						el(
							SelectControl,
							{
								key: 'gbt-product-carousel-query-panel-select',
								label: i18n.__('Source:'),
								value: attributes.queryDisplayType,
								options: [{
									label: i18n.__('Choose an Option'),
									value: 'default'
								}, {
									label: i18n.__('Manually pick products'),
									value: 'specific'
								}, {
									label: i18n.__('Display by Category'),
									value: 'by_category'
								}, {
									label: i18n.__('Filter Products'),
									value: 'filter_by'
								}, {
									label: i18n.__('All Products'),
									value: 'all_products'
								}],
								onChange: function onChange(value) {
									if ( attributes.queryProducts != '' ) {
										if ( window.confirm(i18n.__("Changing the product source will lose the current selection.")) === false) {
											return;
										}
									}
		          					_destroyQuery();
									if ( value === 'by_category') {
										getCategories();
									}
									if ( value === 'all_products') {
										let query = getQuery('?per_page='+attributes.limit);
										props.setAttributes({queryProducts: query});
									}
									return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
					/* Pick specific producs */
						attributes.queryDisplayType === 'specific' && el(
							'div',
							{
								key: 'gbt-product-carousel-products-ajax-search-wrapper',
								className: 'products-ajax-search-wrapper',
							},
							el(
								TextControl,
								{
									key: 'gbt-product-carousel-query-panel-string',
			          				type: 'search',
			          				className: 'products-ajax-search',
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for products to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        let query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (products) {
								        	if ( products.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: products});
										});

									},
								},
							),
						),
						attributes.queryDisplayType === 'specific' && attributes.querySearchResults.length > 0 && attributes.querySearchString != '' && el(
							'div',
							{
								key: 'gbt-product-carousel-products-ajax-search-results',
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.queryDisplayType === 'specific' && attributes.querySearchSelected.length > 0 && el(
							'div',
							{
								key: 'gbt-product-carousel-products-selected-results-wrapper',
								className: 'products-selected-results-wrapper',
							},
							el(
								'label',
								{
									key: 'gbt-product-carousel-products-selected-results-label',
								},
								i18n.__('Selected Products:'),
							),
							el(
								'div',
								{
									key: 'gbt-product-carousel-products-selected-results',
									className: 'products-selected-results',
								},
								renderSearchSelected(),
							),
						),
					/* Display by category */
						attributes.queryDisplayType === 'by_category' && el(
							'div',
							{
								key: 'gbt-product-carousel-category-result-wrapper',
								className: 'category-result-wrapper',
							},
							renderCategories(),
						),
						attributes.queryDisplayType === 'by_category' && renderOrderby(),
					/* Filter by */
						attributes.queryDisplayType === 'filter_by'  && el (
							SelectControl,
							{
								key: 'gbt-product-carousel-query-panel-filter',
								// label: i18n.__('Pick one or more categories'),
								value: attributes.queryFilterSelected,
								options: [{
											label: 'Filter by',
											value: '',
										},
										{
											label: i18n.__('Featured products'),
											value: 'featured'
										},
										{
											label: i18n.__('On sale'),
											value: 'on_sale'
										},
										{
											label: i18n.__('Attributes'),
											value: 'attributes'
										}
								],
								onChange: function onChange(value) {
									_destroyQuery();
									props.setAttributes({ queryFilterSelected: value });
									if (value === 'attributes') {
										getAttributes();
									} else {
										let query = getQuery('?per_page=' + attributes.limit + '&' +value+'=1');
										props.setAttributes({ queryProducts: query });
									}
								}
							},
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected === 'attributes' && el (
							SelectControl,
							{
								key: 'gbt-product-carousel-query-panel-attributes',
								value: attributes.queryAttributesSelected,
								options: attributes.queryAttributesOptions,
								onChange: function onChange(value) {
									_destroyQuery();
									props.setAttributes({ queryAttributesSelected: value });
									getAttributesOptions(value);
								}
							},
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected === 'attributes' && attributes.queryAttributesSelected !== '' && el (
							'div',
							{
								key: 'gbt-product-carousel-attributes-results-wrapper',
								className: 'attributes-results-wrapper'
							},
							renderAttributes(),
						),
						attributes.queryDisplayType === 'filter_by' && attributes.queryFilterSelected != '' && renderOrderby(),
					/* All products */
						attributes.queryDisplayType === 'all_products'
						 && renderOrderby(),
 						attributes.queryDisplayType !== 'specific' && el(
							RangeControl,
							{
								key: 'gbt-product-carousel-number-of-products',
								value: attributes.limit,
								allowReset: false,
								initialPosition: 10,
								min: 2,
								max: 20,
								label: i18n.__( 'Number of Products' ),
								onChange: function( value ) {
									let old_value = attributes.limit;
									props.setAttributes( { limit: value } );
									_queryLimit(old_value, value);
								},
							}
						),
					/* Load all products */
						el(
							'button',
							{
								key: 'gbt-product-carousel-load-button',
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getProducts();
								},
							},
							_isLoadingText(),
						),
						el('hr',{ key: 'gbt-product-carousel-hr', },),
						el(
							RangeControl,
							{
								key: 'gbt-product-carousel-columns',
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
						el(
							RangeControl,
							{
								key: 'gbt-product-carousel-space-between',
								value: attributes.spaceBetween,
								allowReset: false,
								initialPosition: 30,
								min: 0,
								max: 50,
								label: i18n.__( 'Space Between Products' ),
								onChange: function( newSpace ) {
									props.setAttributes( { spaceBetween: newSpace } );
								},
							}
						),
					),
				),
				el(
					'div',
					{
						key: 		'gbt_18_product_carousel_main_wrapper',
						className: 	'gbt_18_product_carousel'
					},
					attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(),
					renderResults(),
				),
			];
		},

		save: function() {
        	return null;
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls = blockEditor.InspectorControls;

	const TextControl 		= components.TextControl;
	const Button 			= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-slider', {
		title: i18n.__( 'Product Slider' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M21 18H2v2h19v-2zm-2-8v4H4v-4h15m1-2H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm1-4H2v2h19V4z"})),
		category: 'product_blocks',
		supports: {
			align: ['full']
		},
		attributes: {
			productIDs: {
				type: 'string',
				default: '',
			},
		/* Products source */
			queryProducts: {
				type: 'string',
				default: '',
			},
			queryProductsLast: {
				type: 'string',
				default: '',
			},
			queryDisplayType: {
				type: 'string',
				default: 'default',
			},
		/* loader */
			isLoading: {
				type: 'bool',
				default: false,
			},
		/* Manually pick products */
			selectedIDS: {
				type: 'string',
				default: '',
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			old_align: {
				type: 'string',
				default: '',
			},
			align: {
				type: 'string',
				default: 'full'
			},
		},
		edit: function( props ) {

			let attributes = props.attributes;
			attributes.selectedSlide = attributes.selectedSlide || 0;
			attributes.result 						= attributes.result || [];
			attributes.isLoading 					= attributes.isLoading || false;
			attributes.querySearchString    		= attributes.querySearchString || '';
			attributes.querySearchResults   		= attributes.querySearchResults || [];
			attributes.querySearchNoResults 		= attributes.querySearchNoResults || false;
			attributes.doneFirstLoad 				= attributes.doneFirstLoad || false;

			if( 'full' != props.attributes.align ){ props.setAttributes({ align: 'full' }); }


		//==============================================================================
		//	Helper functions
		//==============================================================================

			function toArray(s) {
				let ret = [];
				if ( s.length > 0 ) {
					ret = s.split(",");
				}
				for ( let i = 0; i < ret.length; i++) {
					if ( ret[i] == '') {
						ret.splice(i, 1);
					} else {
						ret[i] = Number(ret[i]);
					}
				}

				return ret;

			}
			function _searchResultClass(theID){
				let haystack = toArray(attributes.selectedIDS);
				const index = haystack.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
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
				props.setAttributes({ queryProducts: ''});
				props.setAttributes({ querySearchString: ''});
				props.setAttributes({ querySearchResults: []});
				props.setAttributes({ querySearchSelected: []});
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
				return ( (attributes.queryProducts.length == 0) || (attributes.queryProducts === attributes.queryProductsLast) );
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
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				const query = attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
						if ( attributes.doneFirstLoad === false ) {
							props.setAttributes({ querySearchSelected: products });
						}
						props.setAttributes({ doneFirstLoad: true});
						let IDs = '';
						for ( let i = 0; i < products.length; i++) {
							IDs += products[i].id + ',';
						}
						props.setAttributes({ productIDs: IDs});
						props.setAttributes({ selectedSlide: 0});
					});
				}
			}

			function renderResults() {
				let products = attributes.result;
				let wrapper = [];

				let productElements = [];
				let selectedSlide = 0;

				function isSelectedSlide( idx ) {
					if ( attributes.selectedSlide == idx ) {
						return 'selected';
					}
					else return '';
				}
				for ( let i = 0; i < products.length; i++ ) {

					let name = products[i]['name'];
					if( name.length > 35) {
						name = name.substring(0, 35) + '...';
					} else {
						name = name.substring(0, 35);
					}

					productElements.push(
						el(
							"div",
							{
								className: "gbt_18_editor_slide_content_item slide " + isSelectedSlide(i),
								key: "gbt_18_slide_content_item" + products[i].id
							},
							el(
								"div",
								{
									className: "gbt_18_editor_slide_content_left",
									key: "gbt_18_editor_slide_content_left" + i,
								},
								el(
									"div",
									{
										className: "gbt_18_editor_slide_content_left_inner",
										key: "gbt_18_editor_slide_content_left_inner" + i,
									},
									el(
										"h2",
										{
											className: "gbt_18_editor_slide_title",
											key: "gbt_18_slide_title" + i,
										},
										name
									),
									el(
										"p",
										{
											className:"gbt_18_editor_slide_price",
											key:"gbt_18_slide_price" + i,
											dangerouslySetInnerHTML: { __html: products[i]['price_html'] }
										},
									),
									el(
										"button",
										{
											className:"gbt_18_editor_add_to_cart",
											key:"gbt_18_editor_add_to_cart" + i,
										},
										i18n.__("Add To Cart"),
									),
									el(
										'div',
										{
											key: "gbt_18_editor_slide_link" + i,
											className: 'gbt_18_editor_slide_link',
										},
										el(
											'i',
											{
												key: "gbt_18_icon_right" + i,
												className: 'gbt_18_icon_right',
											}
										),
										i18n.__('View Product Page'),
									),
								),
							),
							el(
								"div",
								{
									className: "gbt_18_editor_slide_content_right",
									key: "gbt_18_editor_slide_content_right" + i,
								},
								el(
									"div",
									{
										className: "gbt_18_editor_image",
										key: "gbt_18_image" + i,
										style:{backgroundImage: "url("+products[i]['images'][0]['src']+")"}
									},
								),
							),
						)
					);
				}
				if ( productElements.length == 0 ) {
					productElements.push(el( "div", { className: "gbt_18_editor_slide_placeholder_content_item", key: "gbt_18_slide_placeholder_content_item"},
						el( "div", { className: "gbt_18_editor_slide_placeholder_content_left", key: "gbt_18_editor_slide_placeholder_content_left"},
							el("div", { className: "gbt_18_editor_slide_placeholder_title", key: "gbt_18_slide_placeholder_title"}),
							el("div",{className:"gbt_18_editor_slide_placeholder_p1", key:"gbt_18_editor_slide_placeholder_p1"} ),
							el("div",{className:"gbt_18_editor_slide_placeholder_p2", key:"gbt_18_editor_slide_placeholder_p2"} ),
							el("div",{className:"gbt_18_editor_slide_placeholder_p3", key:"gbt_18_editor_slide_placeholder_p3"} ),
							el("div",{className:"gbt_18_editor_slide_placeholder_button", key:"gbt_18_editor_slide_placeholder_button"}),
						),
						el( "div", { className: "gbt_18_editor_slide_placeholder_content_right", key: "gbt_18_editor_slide_placeholder_content_right"},
							el( "div", { className: "gbt_18_editor_placeholder_image", key: "gbt_18_editor_placeholder_image"})
						)
					));
				}

				wrapper.push(el(
							'div',
							{
								className: 'gbt_18_editor_content',
								key: 'gbt_18_content',
							},
							el(
								'div',
								{
									className: 'gbt_18_editor_content_wrapper',
									key: 'gbt_18_content_wrapper',
								},
								el(
									'div',
									{
										className: 'gbt_18_editor_slide_content slider',
										key: 'gbt_18_slide_content',
									},
									productElements,
								),
								productElements.length > 1 && el(
									'div',
									{
										key: 'gbt_18_slide_content_arrows',
										className: 'gbt_18_slide_content_arrows'
									},
									el(
										'button',
										{
											className: 'toggle-prev toggle-arrow',
											onClick: function onClick() {
												const idx = attributes.selectedSlide;
												if ( idx - 1 >= 0) {
													props.setAttributes({ selectedSlide: idx - 1});
												} else {
													props.setAttributes({ selectedSlide: productElements.length - 1});
												}
											}
										},
										el( SVG,
											{
												key: 'gbt_18_slide_content_toggle-prev-button-svg',
												className: 'toggle-prev-icon',
												xmlns:"http://www.w3.org/2000/svg",
												viewBox:"0 0 1024 1024"
											},
											el( Path,
												{
													key: 'gbt_18_slide_content_toggle-prev-button-svg-path',
													d:"M512.088 87.404l289.008 289.095c9.996 9.999 26.205 10.001 36.204 0.005s10.001-26.205 0.005-36.204l-307.107-307.2c-9.996-9.999-26.205-10.001-36.204-0.005l-307.293 307.2c-9.999 9.996-10.001 26.205-0.005 36.204s26.205 10.001 36.204 0.005l289.188-289.101zM537.601 51.2c0-14.138-11.462-25.6-25.6-25.6s-25.6 11.462-25.6 25.6v819.2c0 14.138 11.462 25.6 25.6 25.6s25.6-11.462 25.6-25.6v-819.2z"
												}
											)
										),
									),
									el(
										'button',
										{
											className: 'toggle-next toggle-arrow',
											onClick: function onClick() {
												const idx = attributes.selectedSlide;
												if ( idx + 1 < productElements.length) {
													props.setAttributes({ selectedSlide: idx + 1});
												} else {
													props.setAttributes({ selectedSlide: 0 });
												}
											}
										},
										el( SVG,
											{
												key: 'gbt_18_slide_content_toggle-next-button-svg',
												className: 'toggle-next-icon',
												xmlns:"http://www.w3.org/2000/svg",
												viewBox:"0 0 1024 1024"
											},
											el( Path,
												{
													key: 'gbt_18_slide_content_toggle-next-button-svg-path',
													d:"M222.905 545.101c-9.996-9.999-26.205-10.001-36.204-0.005s-10.001 26.205-0.005 36.204l307.107 307.2c9.996 9.999 26.205 10.001 36.204 0.005l307.293-307.2c9.999-9.996 10.001-26.205 0.005-36.204s-26.205-10.001-36.204-0.005l-289.188 289.101-289.008-289.095zM486.4 870.4c0 14.138 11.462 25.6 25.6 25.6s25.6-11.462 25.6-25.6v-819.2c0-14.138-11.462-25.6-25.6-25.6s-25.6 11.462-25.6 25.6v819.2z"
												}
											)
										),
									),
								)
							)
						)
				);

				return wrapper;
			}

			function _queryOrder(value) {
				let query = attributes.queryProducts;
				const idx = query.indexOf('&orderby');
				if ( idx > -1) {
					query = query.substring(idx, -25);
				}

				switch ( value ) {
					case 'date_desc':
						query +='&orderby=date&order=desc';
					break;
					case 'date_asc':
						query +='&orderby=date&order=asc';
					break;
					case 'title_desc':
						query +='&orderby=title&order=desc';
					break;
					case 'title_asc':
						query +='&orderby=title&order=asc';
					break;
					default:

					break;
				}
				props.setAttributes({ queryProducts: query });
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
				let productElements = [];

				if ( attributes.querySearchNoResults === true) {
					return el('span', {key: 'gbt-vertical-slider-search-results-no-results', className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for (let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { key: 'gbt-vertical-slider-search-results-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-vertical-slider-search-results-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-vertical-slider-search-result-item-' + products[i].id,
								className: _searchResultClass(products[i].id),
								title: products[i].name,
								'data-index': i,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-vertical-slider-search-result-item-title-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-vertical-slider-search-result-item-checkbox-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;
											let qSR = toArray(attributes.selectedIDS);
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR.join(',') });

											let query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
											if ( qSR.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: '' });
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-vertical-slider-search-result-item-dashicon-yes-' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'gbt-vertical-slider-search-result-item-dashicon-no-alt-' + i, className: 'dashicons dashicons-no-alt'}),
							),
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				let productElements = [];
				const products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img= '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { key: 'gbt-vertical-slider-search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { key: 'gbt-vertical-slider-search-selected-img-wrapper', className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span',
							{
								key: 'gbt-vertical-slider-search-selected-item-' + products[i].id,
								className:'single-result',
								title: products[i].name,
							},
							img,
							el(
								'label',
								{
									key: 'gbt-vertical-slider-search-selected-item-title-' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'gbt-vertical-slider-search-selected-item-checkbox-' + i,
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;


											let qSS = toArray(attributes.selectedIDS);

											if ( qSS.length < 1 && attributes.querySearchSelected.length > 0) {
												for ( let i = 0; i < attributes.querySearchSelected.length; i++ ) {
													qSS.push(attributes.querySearchSelected[i].id);
												}
											}
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS.join(',') });

											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
												apiFetch({ path: query }).then(function (products) {
													props.setAttributes({ querySearchSelected: products});
												});
											} else {
												props.setAttributes({queryProducts: ''});
												props.setAttributes({ querySearchSelected: []});
											}
										},
									},
								),
								products[i].name,
								el('span',{ key: 'gbt-vertical-slider-search-selected-item-dashicon-no-alt-' + i, className: 'dashicons dashicons-no-alt'})
							),
						)
					);
				}
				return productElements;
			}

		//==============================================================================
		//	Main controls
		//==============================================================================
			return [
				el(
					InspectorControls,
					{
						key: 'gbt-product-slider-inspector'
					},
					el(
						'div',
						{
							key: 'gbt-product-slider-inspector-wrapper',
							className: 'products-main-inspector-wrapper',
						},
					/* Pick specific producs */
						el(
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
			          				value: attributes.querySearchString,
			          				placeholder: i18n.__( 'Search for products to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        const query = getQuery('?per_page=10&search=' + newQuery);
								        apiFetch({ path: query }).then(function (products) {
								        	if ( products.length == 0) {
								        		props.setAttributes({ querySearchNoResults: true});
								        	} else {
								        		props.setAttributes({ querySearchNoResults: false});
								        	}
											props.setAttributes({ querySearchResults: products});
										});

									},
								},
							),
						),
						attributes.querySearchResults.length > 0 && attributes.querySearchString != '' && el(
							'div',
							{
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						attributes.querySearchSelected.length > 0 && el(
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
					/* Load all products */
						el(
							'button',
							{
								className: 'render-results components-button is-button is-default is-primary is-large ' + _isLoading(),
								disabled: _isDonePossible(),
								onClick: function onChange(e) {
									props.setAttributes({ isLoading: true });
									_destroyTempAtts();
									getProducts();
								},
							},
							_isLoadingText(),
						),
					),
				),
				el(
					'div',
					{
						key: 'gbt_18_default_slider_main_wrapper',
					},
					el(
						'div',
						{
							className: 'gbt_18_editor_default_slider',
							key: 'gbt_18_default_slider_products_wrapper',
						},
						attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(),
						renderResults(),
					),
				),
			];
		},

		save: function() {
        	return null;
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


( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var SelectControl		= components.SelectControl;
	var Button 				= components.Button;

	var apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-main', {
		title: i18n.__( 'GetBowtied Products' ),
		icon: 'layout',
		category: 'product_blocks',
		supports: {
			align: [ 'wide', 'full' ],
		},
		attributes: {
			product_ids: {
				type: 'string',
				default: ''
			},
			result: {
				type: 'array',
				default: [],
			},
			queryProducts: {
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
			querySearchSelectedIDs: {
				type: 'array',
				default: [],
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			queryDisplayType: {
				type: 'string',
				default: 'default',
			},
			queryCategoryOptions: {
				type: 'array',
				default: [],
			},
			queryCategorySelected: {
				type: 'array',
				default: [],
			},
			queryFilterSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesOptions: {
				type: 'array',
				default: '',
			},
			queryAttributesSelected: {
				type: 'string',
				default: '',
			},
			queryAttributesSelectedSlug: {
				type: 'string',
				default: '',
			},
			queryAttributesOptionsValues: {
				type: 'array',
				default: '',
			},
			queryAttributesOptionsSelected: {
				type: 'array',
				default: [],
			},
			queryOrder: {
				type: 'string',
				default: '',
			},
		},
		edit: function( props ) {

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

			function _searchResultClass(theID){
				var index = props.attributes.querySearchSelectedIDs.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
			}

			function _sortCategories( index, arr, newarr = [], level = 0) {
				for ( var i = 0; i < arr.length; i++ ) {
					if ( arr[i].parent == index) {
						arr[i].level = level;
						newarr.push(arr[i]);
						_sortCategories(arr[i].value, arr, newarr, level + 1 );
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
				props.setAttributes({ queryProducts: ''});
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

			//==============================================================================
			//	Show products functions
			//==============================================================================
			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				var query = props.attributes.queryProducts;
				var order = props.attributes.queryOrder;
				console.log(order);
				switch ( order) {
					case 'date_desc':
						query += '&orderby=date&order=desc';
					break;
					case 'date_asc':
						query += '&orderby=date&order=asc';
					break;
					case 'title_desc':
						query += '&orderby=title&order=desc';
					break;
					case 'title_asc':
						query += '&orderby=title&order=asc';
					break;
					default: 
						
					break;
				}

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
					});
				}
			}
			function renderResults() {
				var products = props.attributes.result;
				var sorted = [];
				if ( props.attributes.queryDisplayType === 'specific' ) {
					sorted = _sortByKeys(props.attributes.querySearchSelectedIDs, props.attributes.result );
				}
				if ( sorted.length ) { products = sorted; }
				var productElements = [];
				for ( i = 0; i < products.length; i++ ) {
					productElements.push(el('div', {className:'single-result'}, products[i].name));
				}
				return productElements;
			}

			//==============================================================================
			//	Display ajax results
			//==============================================================================
			function renderSearchResults() {
				var productElements = [];

				if ( props.attributes.querySearchNoResults === true) {
					return el('span', {className: 'no-results'}, i18n.__('No products matching.'));
				}
				var products = props.attributes.querySearchResults;
				for ( var i = 0; i < products.length; i++ ) {
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span', 
							{
								className: _searchResultClass(products[i].id),
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
											var _this = evt.target;
											var qSR = props.attributes.querySearchSelectedIDs;
											var index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ querySearchSelectedIDs: qSR });
											
											var query = getQuery('?include=' + qSR.join(','));
											props.setAttributes({queryProducts: query});
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
				var productElements = [];
				var i;

				var products = props.attributes.querySearchSelected;
				var sorted = _sortByKeys(props.attributes.querySearchSelectedIDs, props.attributes.querySearchSelected );


				if ( props.attributes.querySearchSelectedIDs.length < 1 ) {
					var bugFixer = [];
					for ( var i = 0; i < products.length; i++ ) {
						bugFixer.push(products[i].id);
					}
					props.setAttributes({ querySearchSelectedIDs: bugFixer});
				}

				if ( sorted.length > 0 ) { products= sorted;}
				for ( var i = 0; i < products.length; i++ ) {
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						var img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span', 
							{
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
											var _this = evt.target;

											
											var qSS = props.attributes.querySearchSelectedIDs;
											var index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ querySearchSelectedIDs: qSS });
											
											var query = getQuery('?include=' + qSS.join(','));
											props.setAttributes({queryProducts: query});
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
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

			function renderCategories( parent = 0, level = 0 ) {
				var categoryElements = [];
				var catArr = props.attributes.queryCategoryOptions;
				if ( catArr.length > 0 )
				{
					for ( var i = 0; i < catArr.length; i++ ) {
						if ( catArr[i].parent !=  parent ) { continue; };
						categoryElements.push(
							el(
								'li',
								{
									className: 'level-' + catArr[i].level,
								},
								el(
								'label',
									{
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
											checked: _isChecked(catArr[i].value, props.attributes.queryCategorySelected),
											onChange: function onChange(evt){
												var idx = Number(evt.target.dataset.index);
												if (evt.target.checked === true) {
													var qCS = props.attributes.queryCategorySelected;
													var index = qCS.indexOf(evt.target.value);
													if (index == -1) {
														qCS.push(evt.target.value);
													}
													for (var j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															var index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 == -1) {
																qCS.push(catArr[j].value.toString());
															}
														} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												} else {
													var qCS = props.attributes.queryCategorySelected;
													var index = qCS.indexOf(evt.target.value);
													if (index > -1) {
													  qCS.splice(index, 1);
													}
													for (var j = idx + 1; j < catArr.length - 1; j++) {
														if ( catArr[idx].level < catArr[j].level) {
															var index2 = qCS.indexOf(catArr[j].value.toString());
															if (index2 > -1) {
																qCS.splice(index2, 1);
															}
															} else {
															break;
														}
													}
													props.setAttributes({ queryCategorySelected: qCS });
												};
												var query = getQuery('?per_page=100&category=' + props.attributes.queryCategorySelected.join(','));
												props.setAttributes({ queryProducts: query});
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
									// typeof catArr[i+1] !== 'undefined' && catArr[i+1].parent == catArr[i].value && el(
									// 	'span',
									// 	{
									// 		className: 'expand dashicons dashicons-arrow-down-alt2',
									// 		'data-toggle': 'child-' + props.attributes.queryCategoryOptions[i].value,
									// 		onClick: function onClick(evt) {
									// 			var _this =$(evt.target);
									// 			var toggle = evt.target.dataset.toggle;
									// 			evt.preventDefault();
									// 			_this.parent('label').toggleClass('expanded');
									// 			_this.parent('label').nextAll('label.' + toggle ).toggleClass('expanded');
									// 		}
									// 	},
									// )
								),
								renderCategories( catArr[i].value, level+1)
							),
						);
					} 
				}	
				if (categoryElements.length > 0 ) {
					var wrapper = el('ul', {className: 'level-' + level}, categoryElements);
					return wrapper;		
				} else {
					return;
				}
			}

			function renderAttributes() {
				var attributeElements = [];
				var attArr = props.attributes.queryAttributesOptionsValues;
				if ( attArr.length > 0 )
				{
					for ( i = 0; i < attArr.length; i++ ) {
						attributeElements.push(
							el(
							'label',
								{
									className: 'attribute-label',
								},
								el(
								'input', 
									{
										type:  'checkbox',
										key:   'attribute-checkbox-' + attArr[i].value,
										value: attArr[i].value,
										checked: _isChecked(attArr[i].value, props.attributes.queryAttributesOptionsSelected),
										onChange: function onChange(evt){
											if (evt.target.checked === true) {
												var qCS = props.attributes.queryAttributesOptionsSelected;
												var index = qCS.indexOf(evt.target.value);
												if (index == -1) {
													qCS.push(evt.target.value);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											} else {
												var qCS = props.attributes.queryAttributesOptionsSelected;
												var index = qCS.indexOf(evt.target.value);
												if (index > -1) {
												  qCS.splice(index, 1);
												}
												props.setAttributes({ queryAttributesOptionsSelected: qCS });
											};
											var query = getQuery('?attribute=' + props.attributes.queryAttributesSelectedSlug + '&attribute_term='+ props.attributes.queryAttributesOptionsSelected.join(','));
											props.setAttributes({ queryProducts: query});
										},
									}, 
								),
								attArr[i].label,
							),
						);
					} 
				}	
				return attributeElements;		
			}

			function renderOrderby() {
				var _returnArr= [];
				_returnArr.push(
					el(
						SelectControl,
						{
							key: 'query-panel-orderby',
							label: i18n.__('Order By:'),
							value: props.attributes.queryOrder,
							className: 'orderby-wrapper',
							options: [{
								label: i18n.__('Choose an Option'),
								value: 'default'
							}, {
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
							}
						},
					),
				);

				return _returnArr;
			}

			//==============================================================================
			//	Get ajax results
			//==============================================================================
			function getCategories() {
				var query = getQuery('/categories?&per_page=100');
				var options = [];
				var sorted = [];

				apiFetch({ path: query }).then(function (categories) {
				 	for( i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id, 'parent': categories[i].parent, 'count': categories[i].count };
		        	}

		        	for ( i = 0; i < options.length; i++ ) {

		        	}
		        	sorted = _sortCategories(0, options);
		        	props.setAttributes({queryCategoryOptions: sorted });
				});
			}

			function getAttributes() {
				var query = getQuery('/attributes');
				var options = [];
				options.push({'label': 'Choose', 'value': ' '});

				apiFetch({ path: query }).then(function (categories) {
				 	for( i = 0; i < categories.length; i++ ) {
		        		options.push({'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id });
		        	}

		        	props.setAttributes({queryAttributesOptions: options});
				});
			}

			function getAttributesOptions( term ) {
				var query = getQuery('/attributes/'+term+'/terms');
				var options = [];
				apiFetch({ path: query }).then(function (categories) {
				 	for( i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id };
		        	}

		        	props.setAttributes({queryAttributesOptionsValues: options});
				});

				var query = getQuery('/attributes/'+term);

				apiFetch({ path: query }).then(function (categories) {
			     	props.setAttributes({queryAttributesSelectedSlug: categories.slug});
				});
			}

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
								key: 'query-panel-select',
								label: i18n.__('Source:'),
								value: props.attributes.queryDisplayType,
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
									if ( props.attributes.queryProducts != '' ) {
										if ( window.confirm(i18n.__("Changing the product source will lose the current selection.")) === false) {
											return;
										}
									}
		          					_destroyQuery();
									if ( value === 'by_category') {
										getCategories();
									}
									if ( value === 'all_products') {
										var query = getQuery('?per_page=100');
										props.setAttributes({queryProducts: query});
									}
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
			          				placeholder: i18n.__( 'Search for products to display'),
			          				onChange: function( newQuery ) {
			          					props.setAttributes({ querySearchString: newQuery});
			          					if (newQuery.length < 3) return;

								        var query = getQuery('?per_page=10&search=' + newQuery);
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
							props.attributes.querySearchString != '' &&  el(
								'span',
								{
									className: 'dashicons dashicons-dismiss clear-query',
									onClick: function onClick() {
										props.setAttributes({ querySearchString: '' });
									}
								}
							),
						),
						props.attributes.queryDisplayType === 'specific' && props.attributes.querySearchResults.length > 0 && props.attributes.querySearchString != '' && el(
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
						props.attributes.queryDisplayType === 'by_category' && el(
							'div',
							{
								className: 'category-result-wrapper',
							},
							renderCategories(),
						),
						props.attributes.queryDisplayType === 'by_category' && renderOrderby(),
						props.attributes.queryDisplayType === 'filter_by'  && el (
							SelectControl,
							{
								key: 'query-panel-filter',
								// label: i18n.__('Pick one or more categories'),
								value: props.attributes.queryFilterSelected,
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
										var query = getQuery('?'+value+'=1');
										props.setAttributes({ queryProducts: query });
									}
								}
							},
						),
						props.attributes.queryDisplayType === 'filter_by' && props.attributes.queryFilterSelected === 'attributes' && el (
							SelectControl,
							{
								key: 'query-panel-attributes',
								// label: i18n.__('Pick one or more categories'),
								value: props.attributes.queryAttributesSelected,
								options: props.attributes.queryAttributesOptions,
								onChange: function onChange(value) {
									_destroyQuery();
									props.setAttributes({ queryAttributesSelected: value });
									getAttributesOptions(value);
								}
							},
						),
						props.attributes.queryDisplayType === 'filter_by' && props.attributes.queryFilterSelected === 'attributes' && props.attributes.queryAttributesSelected !== '' && el (
							'div',
							{ 
								className: 'attributes-results-wrapper'
							},
							renderAttributes(),
						),
						props.attributes.queryDisplayType === 'filter_by' && props.attributes.queryFilterSelected != '' && renderOrderby(),
						props.attributes.queryDisplayType === 'all_products' && renderOrderby(),
						el(
							'button',
							{
								className: 'render-results',
								onClick: function onChange(e) {
									_destroyTempAtts();
									getProducts();
								},
							},
							i18n.__('Done'),
						),
					),
				),
				el(
					'div',
					{
						className: 'search-results',
					},
					'This is where the products are gonna be displayed:',
					renderResults(),
				),
			];
		},

		save: function( props ) {
        	// props.attributes.querySearchString = '';
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
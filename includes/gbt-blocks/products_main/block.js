( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var RadioControl        = components.RadioControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;
	var Button 				= components.Button;

	var xhr;
	var apiFetch = wp.apiFetch;

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
		},
		edit: function( props ) {


			var attributes = props.attributes;

			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				var query = props.attributes.queryProducts;
				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
					});
				}
			}

			/* Helper function */
			function _categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			/* Helper function */
			function _sortCategories( index, arr, newarr = [], level = 0) {
				for ( var i = 0; i < arr.length; i++ ) {
					if ( arr[i].parent == index) {
						arr[i].level = 'level-' + level;
						newarr.push(arr[i]);
						_sortCategories(arr[i].value, arr, newarr, level + 1 );
					}
				}

				return newarr;
			}

			/* Helper function */
			function _destroyQuery() {
				props.setAttributes({ queryAttributesOptionsSelected: [] });
				props.setAttributes({ queryCategorySelected: [] });
				props.setAttributes({result: []});
			}

			//==============================================================================
			//	This is where the products are gonna be displayed
			//==============================================================================
			function renderResults() {
				var productElements = [];
				for ( i = 0; i < props.attributes.result.length; i++ ) {
					productElements.push(el('div', {className:'single-result'}, props.attributes.result[i].name));
				}
				return productElements;
			}

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
								className:'single-result', 
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
											$(_this).parents('.single-result').toggleClass('selected');
											var qSR = props.attributes.querySearchSelectedIDs;
											var index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ querySearchSelectedIDs: qSR });
											
											var query = getQuery('?include=' + qSR.join(','));
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
							),
							el('span',{ className: 'dashicons dashicons-yes'})
						)
					);
				}
				return productElements;
			}

			function renderSearchSelected() {
				console.log(props.attributes.querySearchSelected);
				var productElements = [];

				var products = props.attributes.querySearchSelected;
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
							el('span', {className: 'title-wrapper'},products[i].name), 
							// el('span',{ className: 'dashicons dashicons-yes'})
						)
					);
				}
				return productElements;
			}

			function renderCategories() {
				var categoryElements = [];
				var catArr = props.attributes.queryCategoryOptions;
				if ( catArr.length > 0 )
				{
					for ( i = 0; i < catArr.length; i++ ) {
						categoryElements.push(
							el(
							'label',
								{
									className: _categoryClassName( catArr[i].parent, catArr[i].value ),
								},
								el(
								'input', 
									{
										type:  'checkbox',
										key:   'category-checkbox-' + catArr[i].value,
										value: catArr[i].value,
										'data-id': catArr[i].value,
										'data-parent': catArr[i].parent,
										onChange: function onChange(evt){
											if (evt.target.dataset.parent == 0) {
												if ( evt.target.checked === true ) {
													// $('span.expand[data-toggle="child-' + evt.target.dataset.id + '"').trigger('click');
													var qCS = props.attributes.queryCategorySelected;
													$('input[data-parent="' + evt.target.dataset.id + '"').each(function(){
														var index = qCS.indexOf($(this).attr('data-id'));
														if (index == -1) {
															qCS.push($(this).attr('data-id'));
														}
														$(this).prop('checked', true);
													});
													props.setAttributes({ queryCategorySelected: qCS });
												} else {
													var qCS = props.attributes.queryCategorySelected;
													$('input[data-parent="' + evt.target.dataset.id + '"').each(function(){
														var index = qCS.indexOf($(this).attr('data-id'));
														if (index > -1) {
														  qCS.splice(index, 1);
														}
														$(this).prop('checked', false);
													});
													props.setAttributes({ queryCategorySelected: qCS });
												}
											}
											if (evt.target.checked === true) {
												var qCS = props.attributes.queryCategorySelected;
												var index = qCS.indexOf(evt.target.value);
												if (index == -1) {
													qCS.push(evt.target.value);
												}
												props.setAttributes({ queryCategorySelected: qCS });
											} else {
												var qCS = props.attributes.queryCategorySelected;
												var index = qCS.indexOf(evt.target.value);
												if (index > -1) {
												  qCS.splice(index, 1);
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
									'span',
									{
										className: 'category-count',
									},
									catArr[i].count,
								),
								catArr[i].parent == 0 && typeof catArr[i+1] !== 'undefined' && catArr[i+1].parent == catArr[i].value && el(
									'span',
									{
										className: 'expand dashicons dashicons-arrow-down-alt2',
										'data-toggle': 'child-' + props.attributes.queryCategoryOptions[i].value,
										onClick: function onClick(evt) {
											var _this =$(evt.target);
											var toggle = evt.target.dataset.toggle;
											evt.preventDefault();
											_this.parent('label').toggleClass('expanded');
											_this.parent('label').nextAll('label.' + toggle ).toggleClass('expanded');
										}
									},
								)
							),
						);
					} 
				}	
				return categoryElements;		
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

			function getCategories() {
				var query = getQuery('/categories?&per_page=100');
				var options = [];
				var sorted = [];

				apiFetch({ path: query }).then(function (categories) {
					// console.log(categories);
				 	for( i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id, 'parent': categories[i].parent, 'count': categories[i].count };
		        	}

		        	for ( i = 0; i < options.length; i++ ) {

		        	}
		        	sorted = _sortCategories(0, options);
		        	console.log(sorted);
		        	props.setAttributes({queryCategoryOptions: sorted });
				});
			}

			function getAttributes() {
				var query = getQuery('/attributes');
				var options = [];
				options.push({'label': 'Choose', 'value': ' '});

				apiFetch({ path: query }).then(function (categories) {
					// console.log(categories);
				 	for( i = 0; i < categories.length; i++ ) {
		        		options.push({'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id });
		        	}

		        	props.setAttributes({queryAttributesOptions: options});
				});
			}

			function getAttributesOptions( term ) {
				var query = getQuery('/attributes/'+term+'/terms');
				var options = [];
				//options[0] = {'label': 'Choose', 'value': ''};
				apiFetch({ path: query }).then(function (categories) {
					// console.log(categories);
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
								label: i18n.__('Display Products By'),
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
		          					_destroyQuery();
									if ( value === 'by_category') {
										getCategories();
									}
									return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
						/* Pick specific producs */
						props.attributes.queryDisplayType === 'specific' && el(
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
						typeof props.attributes.querySearchResults !== 'undefined' && props.attributes.queryDisplayType === 'specific' && el(
							'div',
							{ 
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						props.attributes.querySearchSelected.length > 0 && props.attributes.queryDisplayType === 'specific' && el(
							'div',
							{
								className: 'products-selected-results',
							},
							el(
								'label',
								{},
								i18n.__('Selected Products:'),
							),
							renderSearchSelected(),
						),
						props.attributes.queryDisplayType === 'by_category'  && el(
							'div',
							{
								className: 'category-result-wrapper',
							},
							renderCategories(),
						),
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
						props.attributes.queryFilterSelected === 'attributes' && props.attributes.queryDisplayType === 'filter_by'  && el (
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
						props.attributes.queryAttributesSelected !== '' && props.attributes.queryDisplayType === 'filter_by' && props.attributes.queryFilterSelected === 'attributes' && el (
							'div',
							{ 
								className: 'attributes-results-wrapper'
							},
							renderAttributes(),
						),
						el(
							'button',
							{
								className: 'render-results',
								onClick: function onChange(e) {
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
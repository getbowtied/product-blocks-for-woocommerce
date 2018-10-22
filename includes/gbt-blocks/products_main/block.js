( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var RadioControl        = components.RadioControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;

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
			// queryCategorySelected: {
			// 	type: 'int',
			// 	default: 0,
			// },
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
				type: 'string',
				default: '',
			},
		},
		edit: function( props ) {

			var attributes = props.attributes;

			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function renderResults() {
				var productElements = [];
				for ( i = 0; i < props.attributes.result.length; i++ ) {
					productElements.push(el('div', {className:'single-result'}, props.attributes.result[i].name));
				}
				return productElements;
			}

			function categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			function renderCategories() {
				var categoryElements = [];
				if ( props.attributes.queryCategoryOptions.length > 0 )
				{
					for ( i = 0; i < props.attributes.queryCategoryOptions.length; i++ ) {
						categoryElements.push(
							el(
							'label',
								{
									className: categoryClassName( props.attributes.queryCategoryOptions[i].parent, props.attributes.queryCategoryOptions[i].value ),
								},
								el(
								'input', 
									{
										type:  'checkbox',
										key:   'category-checkbox-' + props.attributes.queryCategoryOptions[i].value,
										value: props.attributes.queryCategoryOptions[i].value,
										'data-id': props.attributes.queryCategoryOptions[i].value,
										'data-parent': props.attributes.queryCategoryOptions[i].parent,
										onChange: function onChange(evt){
											if (evt.target.dataset.parent == 0) {
												if ( evt.target.checked === true ) {
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
											apiFetch({ path: query }).then(function (products) {
									        	props.setAttributes({ result: products});
											});
										},
									}, 
								),
							props.attributes.queryCategoryOptions[i].label,
							),
						);
					} 
				}	
				return categoryElements;		
			}

			function getCategories() {
				var query = getQuery('/categories?&per_page=100');
				var options = [];

				apiFetch({ path: query }).then(function (categories) {
					console.log(categories);
				 	for( i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id, 'parent': categories[i].parent };
		        	}

		        	props.setAttributes({queryCategoryOptions: options});
				});
			}

			function getAttributes() {
				var query = getQuery('/attributes');
				var options = [];
				//options[0] = {'label': 'Choose', 'value': ''};

				apiFetch({ path: query }).then(function (categories) {
					// console.log(categories);
				 	for( i = 0; i < categories.length; i++ ) {
		        		options[i] = {'label': categories[i].name.replace(/&amp;/g, '&'), 'value': categories[i].id };
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
						'div',
						{
							className: 'test',
							value: 'test2',
							onClick: function onClick(e) {
								console.log(e.target);
								console.log(e.target.value);
								props.setState({ test: 'test1'});
							}
						},
						'click me',
					),
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
	          				value: attributes.query,
	          				placeholder: i18n.__( 'Search for products to display'),
	          				onChange: function( newQuery ) {
	          					
	          					props.setAttributes( { query: newQuery } );
	          					if (newQuery.length < 3) return;

						        var query = getQuery('?per_page=10&search=' + newQuery);

						        apiFetch({ path: query }).then(function (products) {
						        	props.setAttributes({ result: products});
								});
							},
						},
					),

					/* Display products by categories */
					// props.attributes.queryDisplayType === 'by_category'  && el (
					// 	SelectControl,
					// 	{
					// 		key: 'query-panel-categories',
					// 		label: i18n.__('Pick one or more categories'),
					// 		value: props.attributes.queryCategorySelected,
					// 		options: props.attributes.queryCategoryOptions,
					// 		onChange: function onChange(value) {
					// 			props.setAttributes({ queryCategorySelected: value });
					// 			var query = getQuery('?category=' + value);
					// 			apiFetch({ path: query }).then(function (products) {
					// 	        	props.setAttributes({ result: products});
					// 			});
					// 		}
					// 	},
					// ),
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
								props.setAttributes({ queryFilterSelected: value });
								if (value === 'attributes') {
									getAttributes();
								} else {
									var query = getQuery('?'+value+'=1');
									apiFetch({ path: query }).then(function (products) {
							        	props.setAttributes({ result: products});
									});
								}
							}
						},
					),
					props.attributes.queryFilterSelected === 'attributes'  && el (
						SelectControl,
						{
							key: 'query-panel-attributes',
							// label: i18n.__('Pick one or more categories'),
							value: props.attributes.queryAttributesSelected,
							options: props.attributes.queryAttributesOptions,
							onChange: function onChange(value) {
								props.setAttributes({ queryAttributesSelected: value });
								getAttributesOptions(value);
							}
						},
					),
					props.attributes.queryAttributesSelected !== ''  && el (
						SelectControl,
						{
							key: 'query-panel-attributes-values',
							// label: i18n.__('Pick one or more categories'),
							value: props.attributes.queryAttributesOptionsSelected,
							options: props.attributes.queryAttributesOptionsValues,
							onChange: function onChange(value) {
								console.log(props.attributes.queryAttributesSelectedSlug);
								props.setAttributes({ queryAttributesOptionsSelected: value });
								var query = getQuery('?attribute=' + props.attributes.queryAttributesSelectedSlug + '&attribute_term='+ value);
								apiFetch({ path: query }).then(function (products) {
						        	props.setAttributes({ result: products});
								});
							}
						},
					),
					el(
						'div',
						{
							className: 'search-results',
						},
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
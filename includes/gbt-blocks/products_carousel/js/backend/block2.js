( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var RadioControl        = components.RadioControl;
	var SelectControl		= components.SelectControl;
	var ToggleControl		= components.ToggleControl;
	var RangeControl		= components.RangeControl;

	var xhr;
	var apiFetch = wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-carousel', {
		title: i18n.__( 'Product Carousel' ),
		icon: 'slides',
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			product_ids: {
				type: 'array',
				default: []
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
			columns: {
				type: 'number',
				default: '3'
			},
			products_no: {
				type: 'number',
				default: '6'
			},
			products : {
				type: 'string',
				default: ''
			},
			order: {
				type: 'string',
				default: 'newness'
			},
		},
		edit: function( props ) {

			var attributes = props.attributes;

			function getQuery( query ) {
				return '/wc/v2/products' + query;
			}

			function categoryClassName(parent, value) {
				if ( parent == 0) {
					return 'parent parent-' + value;
				} else {
					return 'child child-' + parent;
				}
			}

			//==============================================================================
			//	This is where the products are gonna be displayed
			//==============================================================================
			function renderResults(products, columns) {

				var products = products || attributes.result;
				var columns = columns || attributes.columns;

				var final_output = [];
				var products_list = [];
				var index = 0;

				props.setAttributes( { products: ' ' } );

				for ( i = 0; i < products.length; i++ ) {

					products_list[index] = 
						el("li",{className:"gbt-product product", key:"gbt-product"},
							el("a",{className:"woocommerce-loop-product__link", key:"gbt-product-link"},
								el("div",{key:"gbt-product-thumbnail", className: "gbt-product-thumbnail", style: { backgroundImage: "url("+products[i]['images'][0]['src']+")" } } ),
								el("h4",{className:"gbt-product-title", key:"gbt-product-title"}, products[i]['name']),
								el("span",{className:"gbt-product-price", key:"gbt-price", dangerouslySetInnerHTML: { __html: products[i]['price_html'] } } ),
								el("button",{className:"gbt-add-to-cart", key:"gbt-add-to-cart"}, "Add To Cart")
							)
						);

					index++;

					if( index == columns ) {

						final_output.push( el("div", {className:"slide"}, el("ul", {className:"products columns-" + columns}, products_list)) );
						index = 0;
						products_list = [];
					}
				}

				if( index > 0 && index < columns ) {

					final_output.push( el("div", {className:"slide"}, el("ul", {className:"products columns-" + columns}, products_list)) );
					index = 0;
					products_list = [];
				}

				final_output = el( "div", {className:"flexslider", id:"flexslider"},el( "div", {className: "slider"}, final_output	));;

				props.setAttributes( { products: final_output } );
				createSlider();
			}

			function createSlider() {

				jQuery('.flexslider').flexslider({
					selector: ".slider > .slide",
					animation: "slide",
					slideshow: false,
					smoothHeight: true,
					prevText: "",
					nextText: "",
				});
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
									className: categoryClassName( catArr[i].parent, catArr[i].value ),
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
											apiFetch({ path: query }).then(function (products) {
									        	props.setAttributes({ result: products});

									        	var ids = [];
									        	for( var i = 0; i < products.length; i++) {
									        		ids.push(products[i]['id']);
									        	}
									        	props.setAttributes({ product_ids: ids});

									        	setTimeout(function(){
												renderResults(products, null);
											},500);
											});										
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
											apiFetch({ path: query }).then(function (products) {
									        	props.setAttributes({ result: products});
									        	renderResults(products, null);
											});
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

			function sortCategories( index, arr, newarr = [], level = 0) {
				for ( var i = 0; i < arr.length; i++ ) {
					if ( arr[i].parent == index) {
						arr[i].level = 'level-' + level;
						newarr.push(arr[i]);
						sortCategories(arr[i].value, arr, newarr, level + 1 );
					}
				}

				return newarr;
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
		        	sorted = sortCategories(0, options);
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
									props.setAttributes({result: []});
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
							        	renderResults(products, null);
									});
								},
							},
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
									props.setAttributes({ queryFilterSelected: value });
									if (value === 'attributes') {
										getAttributes();
									} else {
										var query = getQuery('?'+value+'=1');
										apiFetch({ path: query }).then(function (products) {
								        	props.setAttributes({ result: products});
								        	renderResults(products, null);
										});
									}
								}
							},
						),
						props.attributes.queryFilterSelected === 'attributes' && props.attributes.queryDisplayType === 'filter_by'  && el (
							SelectControl,
							{
								key: 'query-panel-attributes',
								value: props.attributes.queryAttributesSelected,
								options: props.attributes.queryAttributesOptions,
								onChange: function onChange(value) {
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
									renderResults(null, newColumns);
								},
							}
						),
						el(
							RangeControl,
							{
								key: "products-carousel-products-number",
								value: attributes.products_no,
								allowReset: false,
								initialPosition: 6,
								min: 1,
								max: 18,
								label: i18n.__( 'Number of Products' ),
								onChange: function( newNumber ) {
									props.setAttributes( { products_no: newNumber } );
								},
							}
						),
						props.attributes.queryDisplayType !== 'specific' && el(
							SelectControl,
							{
								key: 'products-carousel-products-order',
								label: i18n.__('Order Products By'),
								value: props.attributes.order,
								options: [{
									label: i18n.__('Newness - Newness First'),
									value: 'newness'
								}, {
									label: i18n.__('Price - Low to High'),
									value: 'price_asc'
								}, {
									label: i18n.__('Price - High to Low'),
									value: 'price_desc'
								}, {
									label: i18n.__('Rating - Highest First'),
									value: 'rating'
								}, {
									label: i18n.__('Sales - Most First'),
									value: 'sales'
								}, {
									label: i18n.__('Title - Alphabetical'),
									value: 'title'
								}],
								onChange: function onChange(value) {
									// props.setAttributes({result: []});
									// return props.setAttributes({ queryDisplayType: value });
								}
							}
						),
					),
				),
				el( "div",
					{
						className: "gbt-product-carousel",
						key: "gbt-product-carousel",	
					},
					attributes.products
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
	window.wp.element,
	jQuery
);
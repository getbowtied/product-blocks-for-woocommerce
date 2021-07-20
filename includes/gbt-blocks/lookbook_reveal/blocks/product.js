( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType = blocks.registerBlockType;

	const {
		TextControl,
		SelectControl,
		RangeControl,
		SVG,
		Path,
	} = components;

	const {
		InspectorControls,
		PanelColorSettings,
	} = wp.blockEditor;

	const apiFetch  = wp.apiFetch;
	const useEffect = wp.element.useEffect;

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
				type: 'boolean',
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
				type: 'boolean',
				default: false,
			},
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			bgColor: {
	        	type: 'string',
	        	default: '#abb7c3'
	        },
	        textColor: {
	        	type: 'string',
	        	default: '#ffffff'
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

			function getProducts( query ) {
				if( query === null ) {
					query = attributes.queryProducts;

					useEffect( function() {
						props.setAttributes({ queryProductsLast: query});
					});
				}

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
									let query = attributes.queryProducts;

									props.setAttributes({ isLoading: true });
									_destroyTempAtts();

									props.setAttributes({ queryProductsLast: query});
									getProducts(query);
								},
							},
							_isLoadingText(),
						),
						el(
							PanelColorSettings,
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
				attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(null),
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

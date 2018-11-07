(function( $ ) {

    'use strict';

} )( jQuery );

( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var TextControl 		= components.TextControl;
	var Button 				= components.Button;
	var SVG 				= components.SVG;
	var Path 				= components.Path;
	
	var apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-slider', {
		title: i18n.__( 'Product Slider' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M21 18H2v2h19v-2zm-2-8v4H4v-4h15m1-2H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm1-4H2v2h19V4z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
			productIDs: {
				type: 'string',
				default: '',
			},
		/* Products source */
			result: {
				type: 'array',
				default: [],
			},
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
			old_align: {
				type: 'string',
				default: '',
			},
			selectedSlide: {
				type: 'int',
				default: 0,
			}
		},
		edit: function( props ) {

		//==============================================================================
		//	Helper functions
		//==============================================================================
			
			function _searchResultClass(theID){
				var index = props.attributes.querySearchSelectedIDs.indexOf(theID);
				if ( index == -1) {
					return 'single-result';
				} else {
					return 'single-result selected';
				}
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
				var idx = haystack.indexOf(needle.toString());
				if ( idx != - 1) {
					return true;
				}
				return false;
			}

			function _isDonePossible() {
				return ( (props.attributes.queryProducts.length == 0) || (props.attributes.queryProducts === props.attributes.queryProductsLast) );
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
				return '/wc/v2/products' + query;
			}

			function getProducts() {
				var query = props.attributes.queryProducts;
				props.setAttributes({ queryProductsLast: query});

				if (query != '') {
					apiFetch({ path: query }).then(function (products) {
						props.setAttributes({ result: products});
						props.setAttributes({ isLoading: false});
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
				var products = props.attributes.result;
				var wrapper = [];

				var productElements = [];
				let dots;
				let selectedSlide = 0;

				function isSelectedSlide( idx ) {
					if ( props.attributes.selectedSlide == idx ) {
						return 'selected';
					}
					else return '';
				}
				for ( let i = 0; i < products.length; i++ ) {
					if( products[i]['name'].length > 35 ) { dots = '...'; } else { dots = ''; }
					productElements.push(
						el( 'div',
							{
								key: 		'gbt_18_slide_content_item' + i,
							 	className: 	'gbt_18_editor_slide_content_item slide ' + isSelectedSlide(i)
							},
							el( 'div', 
								{
									key: 		'gbt_18_editor_slide_content_left' + i,
									className: 	'gbt_18_editor_slide_content_left'
								},
								el( 'div', 
									{
										key: 		'gbt_18_editor_slide_content_left_inner' + i,
										className: 	'gbt_18_editor_slide_content_left_inner'
									},
									el( 'h2',
										{
											key: 		'gbt_18_slide_title' + i,
											className: 	'gbt_18_editor_slide_title',
										},
										products[i]['name']
									),
									el( 'p', 
										{
											key: 					 'gbt_18_slide_price' + i,
											className: 				 'gbt_18_editor_slide_price',
											dangerouslySetInnerHTML: { __html: products[i]['price_html'] }
										}
									),
									el( 'div',
										{
											key: 					 'gbt_18_slide_text' + i,
											className: 				 'gbt_18_editor_slide_text',
											dangerouslySetInnerHTML: { __html: products[i]['short_description'] }
										}
									),
									el( 'button',
										{
											key: 		'gbt_18_editor_add_to_cart' + i,
											className: 	'gbt_18_editor_add_to_cart'
										}, 
										i18n.__( 'Add To Cart' )
									),
								),
							),
							el( 'div', 
								{ 
									key: 		'gbt_18_editor_slide_content_right' + i,
									className: 	'gbt_18_editor_slide_content_right'
								},
								el( 'div', 
									{
										key: 		'gbt_18_image' + i,
										className: 	'gbt_18_editor_image',
										style: 		{ backgroundImage: 'url('+products[i]['images'][0]['src']+')' } 
									}
								)
							)
						)
					);
				}

				// placeholder
				if ( productElements.length == 0 ) {
					productElements.push(
						el( 'div', 
							{
								key: 		'gbt_18_slide_placeholder_content_item',
								className: 	'gbt_18_editor_slide_placeholder_content_item'
							},
						el( 'div',
							{
								key: 		'gbt_18_editor_slide_placeholder_content_left',
								className: 	'gbt_18_editor_slide_placeholder_content_left'
							},
							el( 'div', 
								{
									key: 		'gbt_18_slide_placeholder_title',
									className: 	'gbt_18_editor_slide_placeholder_title'
								}
							),
							el( 'div',
								{
									key: 		'gbt_18_editor_slide_placeholder_p1',
									className: 	'gbt_18_editor_slide_placeholder_p1'
								}
							),
							el( 'div',
								{
									key: 		'gbt_18_editor_slide_placeholder_p2',
									className: 	'gbt_18_editor_slide_placeholder_p2'
								}
							),
							el( 'div',
								{
									key: 		'gbt_18_editor_slide_placeholder_p3',
									className: 	'gbt_18_editor_slide_placeholder_p3'
								}
							),
							el( 'button',
								{
									key: 		'gbt_18_editor_placeholder_add_to_cart',
									className: 	'gbt_18_editor_add_to_cart'
								}, 
								i18n.__( 'Add To Cart' )
							),
						),
						el( 'div', 
							{
								key: 		'gbt_18_editor_slide_placeholder_content_right',
								className: 	'gbt_18_editor_slide_placeholder_content_right'
							},
							el( 'div', 
								{ 
									key: 		'gbt_18_editor_placeholder_image',
									className: 	'gbt_18_editor_placeholder_image'
								}
							)
						)
					));
				}

				wrapper.push(el( 
							'div',
							{
								key: 		'gbt_18_content',
								className: 	'gbt_18_editor_content'	
							},
							el( 
								'div',
								{
									key: 		'gbt_18_content_wrapper',
									className: 	'gbt_18_editor_content_wrapper',
								},
								el( 
									'div',
									{
										key: 		'gbt_18_slide_content',
										className: 	'gbt_18_editor_slide_content slider'
									},
									productElements,
								),
								el( 'div',
									{
										key: 'gbt_18_slide_content_arrows',
										className: 'gbt_18_slide_content_arrows'
									},
									el(
										'button',
										{
											className: 'toggle-prev toggle-arrow',
											onClick: function onClick() {
												let idx = props.attributes.selectedSlide;
												if ( idx - 1 >= 0) {
													props.setAttributes({ selectedSlide: idx - 1});
												} else {
													props.setAttributes({ selectedSlide: productElements.length - 1});
												}
											}
										},
									),
									el(
										'button',
										{
											className: 'toggle-next toggle-arrow',
											onClick: function onClick() {
												let idx = props.attributes.selectedSlide;
												console.log(idx + 1);
												if ( idx + 1 < productElements.length) {
													props.setAttributes({ selectedSlide: idx + 1});
												} else {
													props.setAttributes({ selectedSlide: 0 });
												}
											}
										},
									)
								)
							)
						)
				);

				return wrapper;
			}

			function _queryOrder(value) {
				var query = props.attributes.queryProducts;
				var idx = query.indexOf('&orderby');
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
				var productElements = [];

				if ( props.attributes.querySearchNoResults === true) {
					return el('span', {className: 'no-results'}, i18n.__('No products matching.'));
				}
				var products = props.attributes.querySearchResults;
				for ( var i = 0; i < products.length; i++ ) {
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						var img = el('span', { key: 'img-wrapper' + i, className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span', 
							{
								key: _searchResultClass(products[i].id) + i,
								className: _searchResultClass(products[i].id),
								title: products[i].name,
								'data-index': i,
							}, 
							img,
							el(
								'label', 
								{
									key: 'title-wrapper' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'title-input' + i,
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
											
											var query = getQuery('?include=' + qSR.join(',') + '&orderby=include');
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
								el('span',{ key: 'dashicons-yes' + i, className: 'dashicons dashicons-yes'}),
								el('span',{ key: 'dashicons-no-alt' + i, className: 'dashicons dashicons-no-alt'}),
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
				if ( props.attributes.querySearchSelectedIDs.length < 1 ) {
					var bugFixer = [];
					for ( var i = 0; i < products.length; i++ ) {
						bugFixer.push(products[i].id);
					}
					props.setAttributes({ querySearchSelectedIDs: bugFixer});
				}

				for ( var i = 0; i < products.length; i++ ) {
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						var img = el('span', { key: 'img-wrapper' + i, className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span', 
							{
								key: 'single-result' + i,
								className: 'single-result', 
								title: products[i].name,
							}, 
							img, 
							el(
								'label', 
								{
									key: 'title-wrapper' + i,
									className: 'title-wrapper'
								},
								el(
									'input',
									{
										key: 'title-input' + i,
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
											
											var query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
											if ( qSS.length > 0 ) {
												props.setAttributes({queryProducts: query});
											} else {
												props.setAttributes({queryProducts: ''});
											}
											apiFetch({ path: query }).then(function (products) {
												props.setAttributes({ querySearchSelected: products});
											});
										},
									},
								),
								products[i].name,
								el('span',{ key: 'dashicons-no-alt' + i, className: 'dashicons dashicons-no-alt'})
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
						key: 'products-slider-inspector',
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
						),
						props.attributes.querySearchResults.length > 0 && props.attributes.querySearchString != '' && el(
							'div',
							{ 
								className: 'products-ajax-search-results',
							},
							renderSearchResults(),
						),
						props.attributes.querySearchSelected.length > 0 && el(
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
					},
					el( 
						'div',
						{
							className: 'gbt_18_editor_default_slider',
							key: 'gbt_18_default_slider',	
						},
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
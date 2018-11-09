( function( blocks, components, editor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls 	= editor.InspectorControls;

	const TextControl 		= components.TextControl;
	const Button 				= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;
	
	const apiFetch 			= wp.apiFetch;

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
			querySearchSelected: {
				type: 'array',
				default: [],
			},
			old_align: {
				type: 'string',
				default: '',
			}
		},
		edit: function( props ) {

			let attributes = props.attributes;
			attributes.selectedIDS = attributes.selectedIDS || [];
			attributes.selectedSlide = attributes.selectedSlide || 0;

		//==============================================================================
		//	Helper functions
		//==============================================================================
			
			function _searchResultClass(theID){
				const index = attributes.selectedIDS.indexOf(theID);
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

					let description = products[i]['short_description'].replace(/<\/?[^>]+(>|$)/g, "");
					if( description.length > 100) {
						description = description.substring(0, 100) + '...';
					} else {
						description = description.substring(0, 100);
					}

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
								key: "gbt_18_slide_content_item" + 'item-' + products[i].id
							},
							el( 
								"div", 
								{
									className: "gbt_18_editor_slide_content_left", 
									key: "gbt_18_editor_slide_content_left"
								},
								el( 
									"div", 
									{ 
										className: "gbt_18_editor_slide_content_left_inner", 
										key: "gbt_18_editor_slide_content_left_inner"
									},
									el(
										"h2", 
										{ 
											className: "gbt_18_editor_slide_title", 
											key: "gbt_18_slide_title"
										}, 
										name
									),
									el(
										"p",
										{
											className:"gbt_18_editor_slide_price", 
											key:"gbt_18_slide_price", 
											dangerouslySetInnerHTML: { __html: products[i]['price_html'] } 
										},
									),
									el(
										"div",
										{
											className:"gbt_18_editor_slide_text", 
											key:"gbt_18_slide_text", 
											dangerouslySetInnerHTML: { __html: description } 
										},
									),
									el(
										"button",
										{
											className:"gbt_18_editor_add_to_cart", 
											key:"gbt_18_editor_add_to_cart"
										}, 
										i18n.__("Add To Cart"),
									),
								),
							),
							el( 
								"div", 
								{ 
									className: "gbt_18_editor_slide_content_right", 
									key: "gbt_18_editor_slide_content_right"
								},
								el( 
									"div", 
									{ 
										className: "gbt_18_editor_image", 
										key: "gbt_18_image", 
										style:{backgroundImage: "url("+products[i]['images'][0]['src']+")"} 
									},
								),
							)
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
										}
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
					return el('span', {className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for (let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
					}
					productElements.push(
						el(
							'span', 
							{
								key: 		'item-' + products[i].id +i,
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
										key: 'some fucking key',
										type: 'checkbox',
										value: i,
										onChange: function onChange(evt) {
											const _this = evt.target;
											let qSR = attributes.selectedIDS;
											let index = qSR.indexOf(products[evt.target.value].id);
											if (index == -1) {
												qSR.push(products[evt.target.value].id);
											} else {
												qSR.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSR });
											
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

				if ( attributes.selectedIDS.length < 1 && products.length > 0) {
					let bugFixer = [];
					for ( let i = 0; i < products.length; i++ ) {
						bugFixer.push(products[i].id);
					}
					props.setAttributes({ selectedIDS: bugFixer});
				}

				for ( let i = 0; i < products.length; i++ ) {
					let img= '';
					if ( typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
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
											const _this = evt.target;

											
											let qSS = attributes.selectedIDS;
											let index = qSS.indexOf(products[evt.target.value].id);
											if (index != -1) {
												qSS.splice(index,1);
											}
											props.setAttributes({ selectedIDS: qSS });
											
											let query = getQuery('?include=' + qSS.join(',') + '&orderby=include');
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
								el('span',{ className: 'dashicons dashicons-no-alt'})
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
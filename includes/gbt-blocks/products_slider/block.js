( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType = blocks.registerBlockType;

	const {
		TextControl,
		Button,
		SVG,
		Path,
	} = components;

	const {
		InspectorControls,
	} = wp.blockEditor;

	const apiFetch  = wp.apiFetch;
	const useEffect = wp.element.useEffect;

	/* Register Block */
	registerBlockType( 'getbowtied/products-slider', {
		title: i18n.__( 'Product Slider' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M21 18H2v2h19v-2zm-2-8v4H4v-4h15m1-2H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1zm1-4H2v2h19V4z"})),
		category: 'product_blocks',
		description: i18n.__( 'Display products from your store in a full width vertical slider.' ),
		keywords: [ i18n.__( 'products' ), i18n.__( 'carousel' ), i18n.__( 'slider' ) ],
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
				type: 'boolean',
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

			function getProducts(query) {
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
											if( query !== '' ) {
												if ( ( qSR.length > 0 ) ) {
													props.setAttributes({ queryProducts: query });
												} else {
													props.setAttributes({queryProducts: '' });
												}
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
									const query = attributes.queryProducts;

									props.setAttributes({ isLoading: true });
									_destroyTempAtts();

									props.setAttributes({ queryProductsLast: query});
									getProducts(query);
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
						attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(null),
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

( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const {
		TextControl,
		SelectControl,
		RangeControl,
		Button,
		SVG,
		Path,
	} = components;

	const {
		InspectorControls,
		MediaUpload,
	} = wp.blockEditor;

	const apiFetch  = wp.apiFetch;
	const useEffect = wp.element.useEffect;

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
	            type: 'number',
				default: 0,
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
			old_align: {
				type: 'string',
				default: '',
			},
			selectedSlide: {
				type: 'integer',
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

			if( 'full' != attributes.align ) {
				useEffect( function() {
					props.setAttributes({ align: 'full' });
				});
			}

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
									let query = attributes.queryProducts;

									props.setAttributes({ isLoading: true });
									_destroyTempAtts();

									props.setAttributes({ queryProductsLast: query});
									getProducts(query);
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
						attributes.result.length < 1 && attributes.doneFirstLoad === false && getProducts(null),
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

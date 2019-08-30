( function( blocks, components, editor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InspectorControls 	= editor.InspectorControls;

	const TextControl 		= components.TextControl;
	const SelectControl		= components.SelectControl;
	const ToggleControl		= components.ToggleControl;
	const RangeControl		= components.RangeControl;
	const Button 				= components.Button;
	const SVG 				= components.SVG;
	const Path 				= components.Path;

	const apiFetch 			= wp.apiFetch;

	/* Register Block */
	registerBlockType( 'getbowtied/products-carousel', {
		title: i18n.__( 'Product Carousel' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M 7 3 A 1.0001 1.0001 0 0 0 6 4 L 6 5 L 3 5 A 1.0001 1.0001 0 0 0 2 6 L 2 18 A 1.0001 1.0001 0 0 0 3 19 L 6 19 L 6 20 A 1.0001 1.0001 0 0 0 7 21 L 17 21 A 1.0001 1.0001 0 0 0 18 20 L 18 19 L 21 19 A 1.0001 1.0001 0 0 0 22 18 L 22 6 A 1.0001 1.0001 0 0 0 21 5 L 18 5 L 18 4 A 1.0001 1.0001 0 0 0 17 3 L 7 3 z M 8 5 L 16 5 L 16 5.8320312 A 1.0001 1.0001 0 0 0 16 6.1582031 L 16 17.832031 A 1.0001 1.0001 0 0 0 16 18.158203 L 16 19 L 8 19 L 8 18.167969 A 1.0001 1.0001 0 0 0 8 17.841797 L 8 6.1679688 A 1.0001 1.0001 0 0 0 8 5.8417969 L 8 5 z M 4 7 L 6 7 L 6 17 L 4 17 L 4 7 z M 18 7 L 20 7 L 20 17 L 18 17 L 18 7 z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},
		attributes: {
		/* Products source */
			queryProducts: {
				type: 'string',
				default: 'wc/v2/products?per_page=10',
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
				default: 20
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
									key: 		class_prefix,
									className: 	class_prefix + _isVisible(i),
									style: 		{ width: 100/products.length+"%", paddingRight: attributes.spaceBetween+'px'}
								},
								el( 'div',
									{
										key: 		class_prefix + '_content_wrapper',
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail',
											className: 	class_prefix + '_thumbnail',
											style: { backgroundImage: "url("+img+")" }
										}
									),
									el( 'h4',
										{
											key: 		class_prefix + '_title',
											className: 	class_prefix + '_title'
										},
										products[i]['name']
									),
									el( 'span',
										{
											key: 						class_prefix + '_price',
											className: 					class_prefix + '_price',
											dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] }
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button',
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
									className: 'scrollable_wrapper',
								},
								el( 'ul',
									{
										key: 		'gbt_18_carousel_products gbt_18_carousel_slider ',
										className: 	'gbt_18_carousel_products gbt_18_carousel_slider columns-'+attributes.columns,
										style: 		{ width: productElements.length*100/attributes.columns+"%", marginLeft: -attributes.selectedSlide*(100/attributes.columns)+"%"}
									},
									productElements,
								),
							),
							el( 'button',
								{
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
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-prev',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
											d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
										}
									)
								),
							),
							el( 'button',
								{
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
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-next',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
											d:"M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"
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
										key: 		class_prefix + '_content_wrapper',
										className: 	class_prefix + '_content_wrapper'
									},
									el( 'div',
										{
											key: 		class_prefix + '_thumbnail',
											className: 	class_prefix + '_thumbnail',
										}
									),
									el( 'div',
										{
											key: 		class_prefix + '_title',
											className: 	class_prefix + '_title'
										},
									),
									el( 'div',
										{
											key: 		class_prefix + '_price',
											className: 	class_prefix + '_price',
										}
									),
									el( 'button',
										{
											key: 		class_prefix + '_button',
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
									className: 'toggle-prev-button',
								},
								el( SVG,
									{
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-prev',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
											d:"M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"
										}
									)
								),
							),
							el( 'button',
								{
									className: 'toggle-next-button',
								},
								el( SVG,
									{
										className: 'gbt_18_carousel_products_placeholder_toggle toggle-next',
										xmlns:"http://www.w3.org/2000/svg",
										viewBox:"0 0 24 24"
									},
									el( Path,
										{
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
					return el('span', {className: 'no-results'}, i18n.__('No products matching.'));
				}
				let products = attributes.querySearchResults;
				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
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
				let i;

				let products = attributes.querySearchSelected;

				for ( let i = 0; i < products.length; i++ ) {
					let img = '';
					if ( products[i].images.length && typeof products[i].images[0].src !== 'undefined' && products[i].images[0].src != '' ) {
						 img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+products[i].images[0].src+'\')"></span>'}});
					} else {
						img = el('span', { className: 'img-wrapper', dangerouslySetInnerHTML: { __html: '<span class="img" style="background-image: url(\''+getbowtied_pbw.woo_placeholder_image+'\')"></span>'}});
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
								el('span',{ className: 'dashicons dashicons-no-alt'})
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
						el('hr',{},),
						el(
							RangeControl,
							{
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
								value: attributes.spaceBetween,
								allowReset: false,
								initialPosition: 20,
								min: 0,
								max: 50,
								label: i18n.__( 'Space Between' ),
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
						className: 'gbt_18_product_carousel'
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

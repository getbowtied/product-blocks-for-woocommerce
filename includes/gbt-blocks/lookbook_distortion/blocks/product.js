( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InspectorControls 	= editor.InspectorControls;

	var SelectControl		= components.SelectControl;
	var RangeControl		= components.RangeControl;
	var ColorSettings		= editor.PanelColorSettings;
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-distortion-product', {
		title: i18n.__( 'Lookbook Product' ),
		icon: 	el( SVG, { xmlns:'http://www.w3.org/2000/svg', viewBox:'0 0 24 24' },
					el( Path, { d:'M21 4H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM3 19V6h8v13H3zm18 0h-8V6h8v13zm-7-9.5h6V11h-6zm0 2.5h6v1.5h-6zm0 2.5h6V16h-6z' } ) 
				),
		category: 'widgets',
		parent: [ 'getbowtied/lookbook-distortion' ],
		attributes: {
			product_id: {
				type: 'number',
				default: ''
			},
			result: {
				type: 'array',
				default: []
			},
			bg_color: {
	        	type: 'string',
	        	default: '#d3d5d9'
	        },
	        text_color: {
	        	type: 'string',
	        	default: '#ffffff'
	        },
	        animation: {
	        	type: 'string',
	        	default: 'animation-1'
	        },
		},

		edit: function( props ) {

			var attributes = props.attributes;

			var colors = [
				{ name: 'red', 				color: '#d02e2e' },
				{ name: 'orange', 			color: '#f76803' },
				{ name: 'yellow', 			color: '#fbba00' },
				{ name: 'green', 			color: '#43d182' },
				{ name: 'blue', 			color: '#2594e3' },
				{ name: 'white', 			color: '#ffffff' },
				{ name: 'dark-gray', 		color: '#abb7c3' },
				{ name: 'black', 			color: '#000' 	 },
			];

			function renderResults() {
				var products = props.attributes.result;

				var productElements = [];
				var wrapper = [];

				if( products.length > 0 ) { // generate content

					var dots 		 = '';
					var class_prefix = 'gbt_18_editor_lookbook_product';

					for ( i = 0; i < products.length; i++ ) {
						
						if( products[i]['name'].length > 35 ) { dots = '...'; } else { dots = ''; }

						productElements.push(
							el( 'div', 
								{
									key: 		class_prefix + '_content',
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
												style: 		{ color: attributes.text_color },
												className: 	class_prefix + '_title' 
											}, 
											products[i]['name'].substring(0,35) + dots 
										),
										el( 'div',
											{
												key: 						class_prefix + '_text', 
												style: 						{ color: attributes.text_color },
												className: 					class_prefix + '_text', 
												dangerouslySetInnerHTML: 	{ __html: products[i]['short_description'].substring(0,100) } 
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
												style: 						{ color: attributes.text_color }, 
												className: 					class_prefix + '_price', 
												dangerouslySetInnerHTML: 	{ __html: products[i]['price_html'] } 
											}
										),
										el( 'button',
											{
												key: 		class_prefix + '_button', 
												style: 		{ color: attributes.text_color, borderBottomColor: attributes.text_color },
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
								className: 	'gbt_18_lookbook_distortion_product_wrapper',
								key: 		'gbt_18_lookbook_distortion_product_wrapper',
								style: 		{ backgroundColor: attributes.bg_color }
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

			function createProduct() {

				wp.apiFetch({ path: '/wc/v2/products?per_page=1' }).then(function (products) { 

					var product_id = products[0]['id'];

					props.setAttributes( { product_id: product_id } );
					props.setAttributes( { result: products } );

				});

			}

			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-distortion-inspector'
					},
					el(
						'div',
						{
							className: 'products-main-inspector-wrapper',
						},
						el(
							SelectControl,
							{
								key: 'lookbook-distortion-order-by',
								options:
									[
										{ value: 'datef',   label: 'Newest - newest first' },
										{ value: 'menu_order', label: 'Menu Order' },
									],
	              				label: i18n.__( 'Order By' ),
	              				value: attributes.orderby,
	              				onChange: function( newOrderBy ) {
	              					props.setAttributes( { orderby: newOrderBy } );
									createProduct();
								},
							}
						),
						el(
							SelectControl,
							{
								key: 'lookbook-distortion-animation',
								options:
									[
										{ value: 'animation-1',   label: 'Animation 1' },
										{ value: 'animation-2',   label: 'Animation 2' },
										{ value: 'animation-3',   label: 'Animation 3' },
									],
	              				label: i18n.__( 'Animation Type' ),
	              				value: attributes.animation,
	              				onChange: function( newAnimation ) {
	              					props.setAttributes( { animation: newAnimation } );
								},
							}
						),
						el(
							ColorSettings,
							{
								key: 'lookbook-distortion-colors',
								title: i18n.__( 'Colors' ),
								colors: colors,
								colorSettings: [
									{ 
										label: i18n.__( 'Background Color' ),
										value: attributes.bg_color,
										onChange: function( newColor) {
											props.setAttributes( { bg_color: newColor } );
										},
									},
									{ 
										label: i18n.__( 'Text Color' ),
										value: attributes.text_color,
										onChange: function( newColor) {
											props.setAttributes( { text_color: newColor } );
										},
									},
								]
							},
						),
					),
				),
				renderResults()
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
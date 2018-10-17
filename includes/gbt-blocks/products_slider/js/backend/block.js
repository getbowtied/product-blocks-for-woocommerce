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

	/* Register Block */
	registerBlockType( 'getbowtied/products-slider', {
		title: i18n.__( 'Products Slider' ),
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
			grid: {
				type: 'string',
				default: ''
			},
		},
		edit: function( props ) {

			var attributes = props.attributes;

			function getCategoriesGrid( product_ids ) {

				product_ids = 	product_ids	|| attributes.product_ids;

				var data = {
					action 		: 'getbowtied_render_backend_products_slider',
					attributes  : {
						'product_ids'						   : product_ids,
					}
				};

				jQuery.post( 'admin-ajax.php', data, function(response) { 
					response = jQuery.parseJSON(response);
					props.setAttributes( { grid: response } );
				});	
			}

			return [
					el(
						'div',
						{
							className: 'wp-block-gbt-products-slider'
						},
						props.isSelected && el(
							TextControl,
							{
								key: 'products-ids-option',
		          				label: i18n.__( 'Search for a Product:' ),
		          				type: 'text',
		          				value: attributes.query,
		          				placeholder: i18n.__( 'Product Name...'),
		          				onChange: function( newQuery ) {
		          					
		          					props.setAttributes( { query: newQuery } );
		          					if (newQuery.length < 3) return;

		          					props.setAttributes( { resultList: ''} );
		          					var data = {
		          						action: 'getbowtied_search_category',
		          						attributes: {
		          							'query': newQuery
		          						}	
		          					};

		          					if(xhr && xhr.readyState != 4){
							            xhr.abort();
							        }
							        xhr = jQuery.ajax({
									    type: "POST",
									    url: 'admin-ajax.php',
									    data: data,
									    success: function(response){
									    	props.setAttributes( { resultList: ''} );
									      	response = jQuery.parseJSON(response);
											var arr = response.ids;
											props.setAttributes( { products: response.ids } );
											props.setAttributes( { resultList: response.html} );
											for (var i = 0, len = arr.length; i < len; i++) {
												var tempArr = props.attributes.product_ids.split(",");
												var index = tempArr.indexOf(arr[i]['value']);
												if ( index > -1 ){
													$('#search-result-'+arr[i]['value']).addClass('selected');
												}
											}
									    }
									});
								},
							},
						),
						props.isSelected && el(
							'div',
							{
								className: 'search-results-wrapper'
							},
							eval(attributes.resultList)
						),
					),
				eval( attributes.grid ),
				attributes.grid == '' && getCategoriesGrid( null )
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
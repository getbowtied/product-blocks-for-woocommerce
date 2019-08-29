( function( blocks, components, editor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const InnerBlock 			= editor.InnerBlocks;
	const RichText				= editor.RichText;
	const MediaUpload			= editor.MediaUpload;
	const ColorSettings			= editor.PanelColorSettings;
	const InspectorControls 	= editor.InspectorControls;

	const Button				= components.Button;
	const SVG 					= components.SVG;
	const Path 					= components.Path;
	const Circle				= components.Circle;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-shop-by-outfit', {
		title: i18n.__( 'Lookbook - Shop by Outfit' ),
		icon: el( SVG, { xmlns:"http://www.w3.org/2000/svg", viewBox:"0 0 24 24" },
				el( Path,{ d:"M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zm-9.2 3.8L7.87 7.79l7.35-3.04h.01l4.95 11.95-7.35 3.05z" }),
				el( Circle, {cx: "11", cy: "9", r: "1"}),
				el( Path, { d:"M5.88 19.75c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z" })
			  ),
		category: 'product_blocks',
		attributes: {
			title: {
				type: 'string',
				default: 'Lookbook Title',
			},
			subtitle: {
				type: 'string',
				default: 'Lookbook Subtitle',
			},
			imgURL: {
	            type: 'string',
	            attribute: 'src',
	            default: '',
	        },
	        imgID: {
	            type: 'number',
	        },
	        imgAlt: {
	            type: 'string',
	            attribute: 'alt',
	        },
	        bgColor: {
	        	type: 'string',
	        	default: '#d3d5d9'
	        },
	        textColor: {
	        	type: 'string',
	        	default: '#000'
	        },
		},

		edit: function( props ) {

			let attributes = props.attributes;

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

			return [
				el(
					InspectorControls,
					{
						key: 'lookbook-shop-by-outfit-inspector'
					},
					el(
						'div',
						{
						},
						el(
							ColorSettings,
							{
								key: 'lookbook-shop-by-outfit-colors',
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
				el( 'div',
					{
						key: 		'gbt_18_lookbook_sts_hero_item',
						className: 	'gbt_18_lookbook_sts_hero_item'
					},
					el( 'div',
						{
							key: 		'gbt_18_lookbook_sts_hero_media_upload',
							className: 	'gbt_18_lookbook_sts_hero_media_upload'
						},
						el(
							MediaUpload,
							{
								key: 'gbt_18_hero_section_image',
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
			              						key: 'gbt_18_hero_section_add_image_button',
			              						className: 'button add_image',
			              						onClick: img.open
			              					},
			              					i18n.__( 'Add Image' )
		              					),
		              					!! attributes.imgID && el(
		              						Button,
											{
												key: 'gbt_18_hero_section_remove_image_button',
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
							key: 		'gbt_18_lookbook_sts_hero_section_content',
							className: 	'gbt_18_lookbook_sts_hero_section_content',
							style:
							{
								backgroundColor: attributes.bgColor,
								backgroundImage: 'url(' + attributes.imgURL + ')'
							},
						},
						el( 'div',
							{
								key: 		'gbt_18_hero_section_text',
								className: 	'gbt_18_hero_section_text'
							},
							el( RichText,
								{
									key: 'gbt_18_hero_section_title',
									className: 'gbt_18_hero_section_title',
									formattingControls: [],
									tagName: 'h2',
									format: 'string',
									value: attributes.title,
									placeholder: i18n.__( 'Lookbook Title' ),
									style:
									{
										color: attributes.textColor
									},
									onChange: function( newTitle) {
										props.setAttributes( { title: newTitle } );
									}
								}
							),
							el( RichText,
								{
									key: 'gbt_18_hero_section_subtitle',
									className: 'gbt_18_hero_section_subtitle',
									formattingControls: [],
									tagName: 'p',
									format: 'string',
									value: attributes.subtitle,
									placeholder: i18n.__( 'Lookbook Subtitle' ),
									style:
									{
										color: attributes.textColor
									},
									onChange: function( newTitle) {
										props.setAttributes( { subtitle: newTitle } );
									}
								}
							),
							el( SVG,
								{
									key: 		'gbt_18_lookbook_sts_scroll_down_button',
									className: 	'gbt_18_lookbook_sts_scroll_down_button',
									xmlns: 		'http://www.w3.org/2000/svg',
									viewBox: 	'0 0 24 24',
									style:
									{
										fill: attributes.textColor,
										border: '1px solid ' + attributes.textColor
									}
								},
								el( Path,
									{
										d:"M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
									}
								),
						  	)
						),
					),
				),
				el( InnerBlock,
					{
						key: 				'gbt_18_lookbook_reveal_inner_product',
						allowedBlocksNames: [ 'getbowtied/lookbook-shop-by-outfit-product' ],
					},
				),
			];
		},

		save: function( props ) {

			props.attributes.title = props.attributes.title || "";

			props.attributes.subtitle 	= props.attributes.subtitle || "";
			props.attributes.imgURL 	= props.attributes.imgURL || "";
	        props.attributes.bgColor 	= props.attributes.bgColor || "";
	        props.attributes.textColor 	= props.attributes.textColor || "";

			return el( 'div',
				{
					key: 		'gbt_18_snap_look_book',
					className: 	'gbt_18_snap_look_book'
				},
				el( 'section',
					{
						key: 		'gbt_18_hero_look_book_item',
						className: 	'gbt_18_look_book_item gbt_18_hero_look_book_item',
						style:
						{
							backgroundImage: 'url(' + (props.attributes.imgURL || "") + ')',
							backgroundColor: props.attributes.bgColor,
							color: props.attributes.textColor
						}
					},
					el( 'div',
						{
							key: 		'gbt_18_hero_section_content',
							className: 	'gbt_18_hero_section_content'
						},
						el( 'h1',
							{
								key: 		'gbt_18_hero_title',
								className: 	'gbt_18_hero_title',
								style:
								{
									color: props.attributes.textColor
								}
							},
							props.attributes.title
						),
						el( 'p',
							{
								key: 		'gbt_18_hero_subtitle',
								className: 	'gbt_18_hero_subtitle'
							},
							props.attributes.subtitle
						),
					),
					el( 'span',
						{
							key: 		'gbt_18_scroll_down_button',
							className: 	'gbt_18_scroll_down_button',
							style:
							{
								borderColor: props.attributes.textColor
							}
						},
					)
				),
				el( InnerBlock.Content, { key: 'gbt_18_lookbook_snap_to_scroll_wrapper' } )
			);
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

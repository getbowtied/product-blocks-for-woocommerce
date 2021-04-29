( function( blocks, components, blockEditor, i18n, element ) {

	"use strict";

	const el = element.createElement;

	/* Blocks */
	const registerBlockType   = blocks.registerBlockType;

	const {
		InspectorControls,
		InnerBlocks
	} = wp.blockEditor;

	const {
		SVG,
		Path,
	} = components;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-reveal', {
		title: i18n.__( 'Lookbook - Product Reveal' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M 7.1875 2.9941406 C 6.409 3.0139688 5.6767969 3.4902656 5.3730469 4.2597656 L 4.2929688 7 L 6.4433594 7 L 7.234375 4.9921875 L 12.326172 7 L 17.779297 7 L 7.96875 3.1328125 C 7.713 3.0320625 7.447 2.9875312 7.1875 2.9941406 z M 5 9 C 3.9069372 9 3 9.9069372 3 11 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 11 C 21 9.9069372 20.093063 9 19 9 L 5 9 z M 5 11 L 14 11 L 14 19 L 5 19 L 5 11 z M 16 11 L 19 11 L 19 19 L 16 19 L 16 11 z"})),
		category: 'product_blocks',
		description: i18n.__( 'Display products from your store in a lookbook layout.' ),
		keywords: [ i18n.__( 'products' ), i18n.__( 'lookbook' ) ],
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},

		edit: function( props ) {

			let attributes = props.attributes;

			return [
				el( 'div',
					{
						key: 		'gbt_18_lookbook_reveal_topbar',
						className: 	'gbt_18_lookbook_reveal_topbar'
					},
					el( 'div',
						{
							key: 		'gbt_18_lookbook_reveal_topbar_title',
							className: 	'gbt_18_lookbook_reveal_topbar_title',
						},
						el( SVG,
							{
								key: 'gbt_18_lookbook_reveal_topbar_title_icon',
								className: 'gbt_18_lookbook_reveal_topbar_title_icon',
								xmlns:"http://www.w3.org/2000/svg",
								viewBox:"0 0 24 24"
							},
							el( Path,
								{
									key: 'gbt_18_lookbook_reveal_topbar_title_icon_path',
									d:"M 7.1875 2.9941406 C 6.409 3.0139688 5.6767969 3.4902656 5.3730469 4.2597656 L 4.2929688 7 L 6.4433594 7 L 7.234375 4.9921875 L 12.326172 7 L 17.779297 7 L 7.96875 3.1328125 C 7.713 3.0320625 7.447 2.9875312 7.1875 2.9941406 z M 5 9 C 3.9069372 9 3 9.9069372 3 11 L 3 19 C 3 20.093063 3.9069372 21 5 21 L 19 21 C 20.093063 21 21 20.093063 21 19 L 21 11 C 21 9.9069372 20.093063 9 19 9 L 5 9 z M 5 11 L 14 11 L 14 19 L 5 19 L 5 11 z M 16 11 L 19 11 L 19 19 L 16 19 L 16 11 z"
								}
							)
						),
						i18n.__('Lookbook - Product Reveal')
					),
				),
				el( InnerBlocks,
					{
						key: 			'gbt_18_lookbook_reveal_inner_product',
						allowedBlocks: [ 'getbowtied/lookbook-reveal-product' ],
					},
				),
			];
		},

		save: function( props ) {
			return el(
				'div',
				{
					key: 		'gbt_18_lookbook_reveal_wrapper',
					className: 	'gbt_18_lookbook_reveal_wrapper'
				},
				el( InnerBlocks.Content, { key: 'gbt_18_lookbook_reveal_wrapper' } )
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

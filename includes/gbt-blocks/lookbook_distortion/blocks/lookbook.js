( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InnerBlock 			= editor.InnerBlocks;
	
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-distortion', {
		title: i18n.__( 'Lookbook - Distortion Motion Reveal' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M4 6v12h17V6H4zm15 10H6v-3h13v3zM6 11V8h13v3H6z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'center', 'wide', 'full' ],
		},

		edit: function( props ) {

			var attributes = props.attributes;

			return [
				el( 'div',
					{ 
						key: 		'gbt_18_lookbook_distortion_topbar',
						className: 	'gbt_18_lookbook_distortion_topbar'
					},
					el( 'h4',
						{
							key: 		'gbt_18_lookbook_distortion_topbar_title',
							className: 	'gbt_18_lookbook_distortion_topbar_title',
						},
						i18n.__('Lookbook - Distortion Motion Reveal')
					),
				),
				el( InnerBlock,
					{
						key: 				'gbt_18_lookbook_distortion_inner_product',
						allowedBlocksNames: [ 'getbowtied/lookbook-distortion-product' ],
					},
				),
			];
		},

		save: function( props ) {
			return el(
				'div',
				{
					key: 		'gbt_18_lookbook_distortion_wrapper',
					className: 	'gbt_18_lookbook_distortion_wrapper'
				},
				el( InnerBlock.Content, { key: 'gbt_18_lookbook_distortion_wrapper' } )
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
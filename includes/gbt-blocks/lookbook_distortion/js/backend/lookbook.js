( function( blocks, components, editor, i18n, element ) {

	var el = element.createElement;

	/* Blocks */
	var registerBlockType   = blocks.registerBlockType;

	var InnerBlock 			= editor.InnerBlocks;
	
	var SVG 				= components.SVG;
	var Path 				= components.Path;

	/* Register Block */
	registerBlockType( 'getbowtied/lookbook-distortion-lookbook', {
		title: i18n.__( 'Lookbook - Distortion Motion Reveal' ),
		icon: el(SVG,{xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 24 24"},el(Path,{d:"M2 6h4v11H2zm5 13h10V4H7v15zM9 6h6v11H9V6zm9 0h4v11h-4z"})),
		category: 'product_blocks',
		supports: {
			align: [ 'wide', 'full' ],
		},

		edit: function( props ) {

			var attributes = props.attributes;

			return [
				el( 
					'div',
					{ 
						key: 'wp-block-slider-title-wrapper',
						className: 'wp-block-slider-title-wrapper'
					},
					el(
						'h4',
						{
							key: 'wp-block-slider-title',
							className: 'wp-block-slider-title',
						},
						el(
							'span',
							{
								key: 'wp-block-slider-dashicon',
								className: 'dashicon dashicons-slides',
							},
						),
						i18n.__('Lookbook - Distortion Motion Reveal')
					),
				),
				el(
					InnerBlock,
					{
						key: 'gbt_18_lookbook_distortion_inner_product',
						allowedBlocksNames: [ 'getbowtied/lookbook-distortion-product' ],
					},
				),
			];
		},

		save: function( props ) {
			return el(
				'div',
				{
					key: 'gbt_18_lookbook_distortion_wrapper',
					className: 'gbt_18_lookbook_distortion_wrapper'
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
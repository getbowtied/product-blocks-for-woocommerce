imagesLoaded( document.querySelectorAll('img'), () => {
    document.body.classList.remove('loading');
});

Array.from(document.querySelectorAll('.gbt_18_distorsion_image')).forEach((el) => {
    const imgs = Array.from(el.querySelectorAll('img'));
    new hoverEffect({
        parent: el,
        intensity: el.dataset.intensity || undefined,
        speedIn: el.dataset.speedin || undefined,
        speedOut: el.dataset.speedout || undefined,
        easing: el.dataset.easing || undefined,
        hover: el.dataset.hover || undefined,
        image1: imgs[0].getAttribute('src'),
        image2: imgs[1].getAttribute('src'),
        displacementImage: el.dataset.displacement
    });
});
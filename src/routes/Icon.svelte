<script>
    // @ts-nocheck
    import {
        animationSvg,
        collapseSvg,
        environmentSvg,
        expandSvg,
        exportSvg,
        geometrySvg,
        horzLeftSvg,
        horzRightSvg,
        infoSvg,
        pauseFilledSvg,
        pauseSvg,
        playFilledSvg,
        playSvg,
        resetSvg,
        rotateSvg,
        vertBottomSvg,
        vertTopSvg,
        trashSvg,
        menuSvg,
        closeSvg,
    } from './svg';

    export let name;
    export let width = '24px';
    export let height = '24px';
    export let focusable = false;
    export let color = '--hl-primary';
    export let hover = null;
    export let filled = false;
    let isHovered = false;
    let icons = [
        {
            box: 24,
            name: 'animation',
            svg: animationSvg(color),
        },
        {
            box: 24,
            name: 'collapse',
            svg: collapseSvg(color),
        },
        {
            box: 24,
            name: 'environment',
            svg: environmentSvg(color),
        },
        {
            box: 24,
            name: 'expand',
            svg: expandSvg(color),
        },
        {
            box: 24,
            name: 'export',
            svg: exportSvg(color),
        },
        {
            box: 24,
            name: 'geometry',
            svg: geometrySvg(color),
        },
        {
            box: 24,
            name: 'horz-left',
            svg: horzLeftSvg(color),
        },
        {
            box: 24,
            name: 'horz-right',
            svg: horzRightSvg(color),
        },
        {
            box: 24,
            name: 'info',
            svg: infoSvg(color),
        },
        {
            box: 24,
            name: 'pause',
            svg: pauseSvg(color),
            svgFilled: pauseFilledSvg(color),
        },
        {
            box: 24,
            name: 'play',
            svg: playSvg(color),
            svgFilled: playFilledSvg(color),
        },
        {
            box: 24,
            name: 'rotate',
            svg: rotateSvg(color),
        },
        {
            box: 24,
            name: 'vert-bottom',
            svg: vertBottomSvg(color),
        },
        {
            box: 24,
            name: 'vert-top',
            svg: vertTopSvg(color),
        },
        {
            box: 24,
            name: 'reset',
            svg: resetSvg(color),
        },
        {
            box: 24,
            name: 'trash',
            svg: trashSvg(color),
        },
        {
            box: 24,
            name: 'menu',
            svg: menuSvg(color),
        },
        {
            box: 24,
            name: 'close',
            svg: closeSvg(color),
        },
    ];
    let displayIcon = icons.find((e) => e.name === name);
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<svg
    class={$$props.class}
    {focusable}
    {width}
    {height}
    fill="none"
    viewBox="0 0 {displayIcon.box} {displayIcon.box}"
    on:mouseover={() => (hover == null ? (isHovered = true) : null)}
    on:mouseleave={() => (hover == null ? (isHovered = false) : null)}
>
    {#if displayIcon.svgFilled && (isHovered == true || hover == true)}
        {@html displayIcon.svgFilled}
    {:else if filled == true}
        {@html displayIcon.svgFilled}
    {:else if hover == false}
        {@html displayIcon.svg}
    {:else}
        {@html displayIcon.svg}
    {/if}
</svg>

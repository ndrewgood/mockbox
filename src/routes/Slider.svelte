<script>
    // @ts-nocheck
    import { createEventDispatcher } from 'svelte';
    import { fly, fade } from 'svelte/transition';
    import { onMount } from 'svelte';

    // Props
    export let min = 0;
    export let max = 100;
    export let initialValue = 0;
    export let id = null;
    export let step = 1;
    export let value = typeof initialValue === 'string' ? parseFloat(initialValue) : initialValue;

    // Node Bindings
    let container = null;
    let thumb = null;
    let progressBar = null;
    let element = null;

    // Internal State
    let elementX = null;
    let currentThumb = null;
    let holding = false;
    let thumbHover = false;
    let keydownAcceleration = 0;
    let accelerationTimer = null;

    // Dispatch 'change' events
    const dispatch = createEventDispatcher();

    // Move the shield creation into a browser-only context
    let mouseEventShield;

    onMount(() => {
        mouseEventShield = document.createElement('div');
        mouseEventShield.setAttribute('class', 'mouse-over-shield');
        mouseEventShield.addEventListener('mouseover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    function resizeWindow() {
        elementX = element.getBoundingClientRect().left;
    }

    // Allows both bind:value and on:change for parent value retrieval
    function setValue(val) {
        // Round to nearest step
        const steps = Math.round((val - min) / step);
        value = min + steps * step;
        // Ensure value stays within bounds
        value = Math.min(max, Math.max(min, value));
        dispatch('change', { value });
    }

    function onTrackEvent(e) {
        // Update value immediately before beginning drag
        updateValueOnEvent(e);
        onDragStart(e);
    }

    function onHover(e) {
        thumbHover = thumbHover ? false : true;
    }

    function onDragStart(e) {
        // If mouse event add a pointer events shield
        if (e.type === 'mousedown') document.body.append(mouseEventShield);
        currentThumb = thumb;
    }

    function onDragEnd(e) {
        // If using mouse - remove pointer event shield
        if (e.type === 'mouseup') {
            if (document.body.contains(mouseEventShield)) document.body.removeChild(mouseEventShield);
            // Needed to check whether thumb and mouse overlap after shield removed
            if (isMouseInElement(e, thumb)) thumbHover = true;
        }
        currentThumb = null;
    }

    // Check if mouse event cords overlay with an element's area
    function isMouseInElement(event, element) {
        let rect = element.getBoundingClientRect();
        let { clientX: x, clientY: y } = event;
        if (x < rect.left || x >= rect.right) return false;
        if (y < rect.top || y >= rect.bottom) return false;
        return true;
    }

    // Accessible keypress handling
    function onKeyPress(e) {
        if (keydownAcceleration < 50) keydownAcceleration++;
        let throttled = Math.ceil(keydownAcceleration / 5);
        // Multiply throttled value by step
        let stepIncrement = throttled * step;

        if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            if (value + stepIncrement > max || value >= max) {
                setValue(max);
            } else {
                setValue(value + stepIncrement);
            }
        }
        if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            if (value - stepIncrement < min || value <= min) {
                setValue(min);
            } else {
                setValue(value - stepIncrement);
            }
        }

        // Reset acceleration after 100ms of no events
        clearTimeout(accelerationTimer);
        accelerationTimer = setTimeout(() => (keydownAcceleration = 1), 100);
    }

    function calculateNewValue(clientX) {
        // Find distance between cursor and element's left cord (20px / 2 = 10px) - Center of thumb
        let delta = clientX - (elementX + 16);

        // Use width of the container minus (5px * 2 sides) offset for percent calc
        let percent = (delta * 100) / (container.clientWidth - 16);

        // Limit percent 0 -> 100
        percent = percent < 0 ? 0 : percent > 100 ? 100 : percent;

        // Calculate raw value and round to nearest step
        let rawValue = (percent * (max - min)) / 100 + min;
        let steps = Math.round((rawValue - min) / step);
        let steppedValue = min + steps * step;

        // Use Number to ensure we maintain decimal precision
        setValue(Number(steppedValue.toFixed(10)));
    }

    // Handles both dragging of touch/mouse as well as simple one-off click/touches
    function updateValueOnEvent(e) {
        // touchstart && mousedown are one-off updates, otherwise expect a currentPointer node
        if (!currentThumb && e.type !== 'touchstart' && e.type !== 'mousedown') return false;

        if (e.stopPropagation) e.stopPropagation();
        if (e.preventDefault) e.preventDefault();

        // Get client's x cord either touch or mouse
        const clientX = e.type === 'touchmove' || e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;

        calculateNewValue(clientX);
    }

    // React to left position of element relative to window
    $: if (element) elementX = element.getBoundingClientRect().left;

    // Set a class based on if dragging
    $: holding = Boolean(currentThumb);

    // Update progressbar and thumb styles to represent value
    $: if (progressBar && thumb) {
        // Limit value min -> max
        value = value > min ? value : min;
        value = value < max ? value : max;

        let percent = ((value - min) * 100) / (max - min);
        let offsetLeft = (container.clientWidth - 20) * (percent / 100) + 6;

        // Update thumb position + active range track width
        thumb.style.left = `${offsetLeft}px`;
        progressBar.style.width = `${offsetLeft}px`;
    }
</script>

<svelte:window on:touchmove|nonpassive={updateValueOnEvent} on:touchcancel={onDragEnd} on:touchend={onDragEnd} on:mousemove={updateValueOnEvent} on:mouseup={onDragEnd} on:resize={resizeWindow} />
<div class="range">
    <div
        class="range__wrapper"
        tabindex="0"
        on:keydown={onKeyPress}
        bind:this={element}
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        {id}
        on:mousedown={onTrackEvent}
        on:touchstart={onTrackEvent}
    >
        <div class="range__track" bind:this={container}>
            <div class="range__track--highlighted" bind:this={progressBar} />
            <!-- svelte-ignore a11y-mouse-events-have-key-events -->
            <!-- svelte-ignore a11y-no-static-element-interactions -->
            <div
                class="range__thumb"
                class:range__thumb--holding={holding}
                bind:this={thumb}
                on:touchstart={onDragStart}
                on:mousedown={onDragStart}
                on:mouseover={() => (thumbHover = true)}
                on:mouseout={() => (thumbHover = false)}
            >
                <div class="thumb__highlight"></div>
            </div>
        </div>
    </div>
</div>

<svelte:head>
    <style>
        .mouse-over-shield {
            position: fixed;
            top: 0px;
            left: 0px;
            height: 100%;
            width: 100%;
            background-color: rgba(255, 0, 0, 0);
            z-index: 10000;
            cursor: grabbing;
        }
    </style>
</svelte:head>

<style>
    .range {
        position: relative;
        flex: 1;
        --track-focus: var(--bg-primary);
        --track-highlight-bgcolor: var(--hl-primary-50);
        --track-bgcolor: var(--hl-primary-10);
        --thumb-bgcolor: var(--hl-primary);
        --thumb-boxshadow: 0 0px 2px 1px var(--hl-primary-30);
        --thumb-holding-outline: var(--hl-primary-20);
        --thumb-border: 1.5px solid var(--bg-primary-20);
    }

    .range__wrapper {
        min-width: 100%;
        position: relative;
        padding: 0.5rem;
        box-sizing: border-box;
        outline: none;
    }

    .range__wrapper:focus-visible > .range__track {
        box-shadow:
            0 0 0 2px white,
            0 0 0 3px var(--track-focus);
    }

    .range__track {
        height: 3px;
        background-color: var(--track-bgcolor);
        border-radius: 999px;
    }

    .range__track--highlighted {
        background-color: var(--track-highlight-bgcolor);
        width: 0;
        height: 3px;
        position: absolute;
        border-radius: 999px;
    }

    .range__thumb {
        display: flex;
        align-items: center;
        justify-content: center;
        position: absolute;
        width: 26px;
        height: 16px;
        background-color: var(--thumb-bgcolor);
        cursor: pointer;
        border-radius: 6px;
        margin-top: -7px;
        transition: box-shadow 100ms;
        user-select: none;
        box-shadow: none;
        border-bottom: var(--thumb-border);
    }

    .range__thumb:hover {
        box-shadow: var(--thumb-boxshadow);
    }

    .range__thumb--holding {
        box-shadow:
            0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 1px 2px 1px rgba(0, 0, 0, 0.2),
            0 0 0 3px var(--thumb-holding-outline);
    }

    .thumb__highlight {
        width: 1px;
        height: 6px;
        background-color: var(--hl-800);
    }
</style>

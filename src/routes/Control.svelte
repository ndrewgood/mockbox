<script>
    // @ts-nocheck
    import Icon from './Icon.svelte';
    import { fade, fly } from 'svelte/transition';
    import SelectIcon from './SelectIcon.svelte';
    import { onMount } from 'svelte';
    import Slider from './Slider.svelte';
    import { globalData, environmentData, bgImage } from './database';
    import ColorThief from 'colorthief';
    import chroma from 'chroma-js';
    import { colorVars, setHue } from './utils';

    export let control;
    export let context = null;

    let active = false;

    // Add these variables to track button widths
    let buttonOneWidth;
    let buttonTwoWidth;

    let activeValue = control.value;

    // Add new variable to store image dimensions
    let bgImageWidth = 0;
    let bgImageHeight = 0;

    const round = (num) => {
        let r = 1 / control.step;
        return Math.round(num * r) / r;
    };

    const handleNumInput = (e, value) => {
        let num = e.target.value;
        if (!isNaN(num) && num >= control.minVal && num <= control.maxVal && num !== '') {
            num = parseFloat(num);
            if (context == 'Width') {
                control.value.width = round(num);
            } else if (context == 'Height') {
                control.value.height = round(num);
            } else if (context == 'Depth') {
                control.value.depth = round(num);
            } else {
                control.value = round(num);
            }
            e.target.value = round(num);
        } else {
            e.target.value = round(value);
        }
    };

    const handleResetValue = () => {
        if (control.label == 'Scale') {
            if (context == 'Width') {
                control.value.width = control.default;
            }
            if (context == 'Height') {
                control.value.height = control.default;
            }
            if (context == 'Depth') {
                control.value.depth = control.default;
            }
        } else {
            control.value = control.default;
        }
    };

    const handleUploadBgImage = (e) => {
        $bgImage = e.target.files[0];

        $globalData.bgImageScale.value = $globalData.bgImageScale.default;
        $globalData.bgImageMode.value = $globalData.bgImageMode.default;

        const colorThief = new ColorThief();
        const img = new Image();

        img.onload = () => {
            $globalData.bgImageWidth = img.width;
            $globalData.bgImageHeight = img.height;

            // Create new ColorThief instance and get the color

            const color = colorThief.getColor(img);
            $globalData.bgDerivedColor = chroma(color[0], color[1], color[2]).hex();

            let derivedHue = chroma($globalData.bgDerivedColor).hsl()[0];

            if (typeof document !== 'undefined') {
                let root = document.documentElement;

                colorVars.forEach((colorVar) => {
                    root.style.setProperty(colorVar, setHue(colorVar, derivedHue));
                });
            }
            console.log($globalData.bgDerivedColor);
        };
        img.src = URL.createObjectURL($bgImage);
    };

    const handleResetBgImage = () => {
        $bgImage = null;
        $globalData.bgImageWidth = 0;
        $globalData.bgImageHeight = 0;
        $globalData.bgDerivedColor = null;

        let bgHue = chroma($globalData.bgColor.value).hsl()[0];

        if (typeof document !== 'undefined') {
            let root = document.documentElement;

            colorVars.forEach((colorVar) => {
                root.style.setProperty(colorVar, setHue(colorVar, bgHue));
            });
        }
    };

    let boolTransitioning = false;

    const toggleBoolTransition = (option) => {
        boolTransitioning = true;
        control.value = option;
        activeValue = option;
        setTimeout(() => {
            boolTransitioning = false;
        }, 200);
    };

    // Update activeValue when control.value changes
    $: activeValue = control.value;
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="control">
    {#if control.label !== 'Spotlight intensity' && control.label !== 'Glossy intensity' && control.label !== 'Background tile scale'}
        <p>{context ? context : control.label}</p>
    {/if}
    <div>
        {#if control.type == 'radio'}
            {#if control.label == 'Scale mode'}
                <div class="bool fill">
                    <div class="background">
                        <button
                            class={control.value == control.options[0] ? 'true' : 'false'}
                            on:click={() => {
                                toggleBoolTransition(control.options[0]);
                            }}
                        >
                            {control.options[0]}
                        </button>
                        <button
                            class={control.value == control.options[1] ? 'true' : 'false'}
                            on:click={() => {
                                toggleBoolTransition(control.options[1]);
                            }}
                        >
                            {control.options[1]}
                        </button>
                    </div>
                    <div
                        class="mask"
                        style:transition-duration={boolTransitioning ? '0.2s' : '0s'}
                        style={`clip-path: inset(calc(0px + 5px) calc(${activeValue == control.options[0] ? buttonTwoWidth : `0`}px + 8px) calc(0px + 5px) calc(${activeValue == control.options[0] ? 0 : buttonOneWidth}px + 8px) round 6px)`}
                    >
                        <button bind:clientWidth={buttonOneWidth}>
                            {control.options[0]}
                        </button>
                        <button bind:clientWidth={buttonTwoWidth}>
                            {control.options[1]}
                        </button>
                    </div>
                    <div
                        class="container"
                        style:transition-duration={boolTransitioning ? '0.2s' : '0s'}
                        style={`left: calc(${activeValue == control.options[0] ? '4px' : buttonOneWidth + 'px + 8px'}); width: ${activeValue == control.options[0] ? buttonOneWidth : buttonTwoWidth}px;`}
                    ></div>
                </div>
            {/if}
            {#if control.label !== 'Scale mode'}
                <select bind:value={control.value}>
                    {#each control.options as option}
                        <option value={option}>{option}</option>
                    {/each}
                </select>
            {/if}
        {/if}
        {#if control.type == 'num'}
            {#if control.label !== 'Scale'}
                <div style="width: 100%; height: 100%; margin: auto 0;">
                    <Slider min={control.minVal} max={control.maxVal} bind:value={control.value} step={control.step} />
                </div>
            {/if}
            {#if control.label == 'Scale'}
                <div style="width: 100%; height: 100%; margin: auto 0;">
                    {#if context == 'Width'}
                        <Slider min={control.minVal} max={control.maxVal} bind:value={control.value.width} step={control.step} />
                    {:else if context == 'Height'}
                        <Slider min={control.minVal} max={control.maxVal} bind:value={control.value.height} step={control.step} />
                    {:else}
                        <Slider min={control.minVal} max={control.maxVal} bind:value={control.value.depth} step={control.step} />
                    {/if}
                </div>
            {/if}
            <button
                class={control.value == control.default ||
                (context == 'Width' && control.value.width == control.default) ||
                (context == 'Height' && control.value.height == control.default) ||
                (context == 'Depth' && control.value.depth == control.default)
                    ? 'reset'
                    : 'reset active'}
                on:click={() => handleResetValue()}><Icon name="reset" /></button
            >
            <div class="numInput">
                {#if context == 'Width'}
                    <input type="text" value={control.value.width} on:focus={(e) => (e.target.value = control.value.width)} on:blur={(e) => handleNumInput(e, control.value.width)} />
                {:else if context == 'Height'}
                    <input type="text" value={control.value.height} on:focus={(e) => (e.target.value = control.value.height)} on:blur={(e) => handleNumInput(e, control.value.height)} />
                {:else if context == 'Depth'}
                    <input type="text" value={control.value.depth} on:focus={(e) => (e.target.value = control.value.depth)} on:blur={(e) => handleNumInput(e, control.value.depth)} />
                {:else}
                    <input type="text" value={control.value} on:focus={(e) => (e.target.value = control.value)} on:blur={(e) => handleNumInput(e, control.value)} />
                {/if}
            </div>
        {/if}
        {#if control.type == 'bool'}
            <div class="bool">
                <div class="background">
                    <button
                        on:click={() => {
                            control.value = false;
                            activeValue = false;
                        }}
                    >
                        Off
                    </button>
                    <button
                        on:click={() => {
                            control.value = true;
                            activeValue = true;
                        }}
                    >
                        On
                    </button>
                </div>
                <div
                    class="mask"
                    style={`clip-path: inset(calc(0px + 5px) calc(${activeValue == false ? buttonTwoWidth : `0`}px + 8px) calc(0px + 5px) calc(${activeValue == false ? 0 : buttonOneWidth}px + 8px) round 6px)`}
                >
                    <button
                        bind:clientWidth={buttonOneWidth}
                        on:click={() => {
                            control.value = false;
                            activeValue = false;
                        }}
                    >
                        Off
                    </button>
                    <button
                        bind:clientWidth={buttonTwoWidth}
                        on:click={() => {
                            control.value = true;
                            activeValue = true;
                        }}
                    >
                        On
                    </button>
                </div>
                <div class="container" style={`left: calc(${activeValue == false ? '4px' : buttonOneWidth + 'px + 8px'}); width: ${activeValue == false ? buttonOneWidth : buttonTwoWidth}px;`}></div>
            </div>
            {#if control.label == 'Spotlight'}
                <div class="inlineRadio" style={!control.value ? 'opacity: 0.6; pointer-events: none;' : null}>
                    <select bind:value={$environmentData.spotlightAngle.value}>
                        {#each $environmentData.spotlightAngle.options as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>
            {/if}
        {/if}
        {#if control.type == 'color'}
            <div class="color">
                {#if $bgImage == null}
                    <input type="color" bind:value={control.value} />
                {:else}
                    <!-- svelte-ignore a11y-img-redundant-alt -->
                    <div
                        class="bgImagePreview"
                        style="background-image: url({URL.createObjectURL($bgImage)})"
                        on:click={() => document.getElementById('bgImagePreviewInput').click()}
                        on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? document.getElementById('bgImagePreviewInput').click() : null)}
                        role="button"
                        tabindex="0"
                    >
                        <input type="file" id="bgImagePreviewInput" accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif" style="display: none;" on:change={(e) => handleUploadBgImage(e)} />
                    </div>
                {/if}
                {#if $bgImage == null}
                    <label for="uploadBgImageInput" class="uploadBgImageButton">Upload image</label>
                    <input type="file" id="uploadBgImageInput" accept=".png,.jpg,.jpeg,.gif,image/png,image/jpeg,image/gif" style="display: none;" on:change={(e) => handleUploadBgImage(e)} />
                {:else}
                    <button class="imageResetButton" on:click={() => handleResetBgImage()}>Reset</button>
                    <select bind:value={$globalData.bgImageMode.value}>
                        {#each $globalData.bgImageMode.options as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                {/if}
            </div>
        {/if}
        {#if control.type == 'text'}
            <input type="text" class="textInput" bind:value={control.value} />
        {/if}
    </div>
</div>

<style>
    .control {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        width: auto;
        gap: 10px;
        padding-bottom: 18px;
    }
    .control p {
        margin-block-start: 0em;
        margin-block-end: 0em;
        font-size: 14px;
        font-weight: 500;
        /* text-transform: capitalize; */
    }

    .control div {
        display: flex;
        justify-content: space-between;
    }

    select,
    input,
    button {
        align-self: center;
        color: var(--hl-primary);
    }

    select {
        background-color: var(--bg-450);
        border: none;
        padding: 6px 32px 6px 8px;
        font-size: 14px;
        border-radius: 6px;
        border-right: 8px solid var(--bg-450);
        /* background-position: calc(100% - 8px) center !important; */
    }

    select:hover {
        background-color: var(--bg-400);
        border-radius: 6px;
        border-right: 8px solid var(--bg-400);
    }

    select:focus {
        outline: none;
        background-color: var(--bg-300);
        border-radius: 6px;
        border-right: 8px solid var(--bg-300);
    }

    input[type='text'] {
        outline: none;
        border: none;
    }

    .numInput input[type='text'] {
        background: none;
        width: 28px;
        text-align: left;
    }

    .numGroup {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }

    .numInput,
    .textInput {
        background-color: var(--bg-450);
        border: 1px solid var(--bg-450);
        border-radius: 6px;
        height: fit-content;
        margin: auto 0;
        font-size: 14px;
        transition: 0.3s;
    }

    .numInput:hover,
    .textInput:hover {
        background-color: var(--bg-400);
        border-color: var(--bg-400);
    }

    .textInput {
        width: 100%;
        padding: 10px 10px;
    }

    .textInput:focus {
        border-radius: 6px;
    }

    .numInput {
        display: flex;
        gap: 4px;
        padding: 4px 10px;
    }

    .numLabel {
        opacity: 0.5;
        font-size: 12px;
        font-weight: 500;
        margin: auto;
        user-select: none;
    }

    .notActive {
        opacity: 0.5;
    }

    .reset {
        opacity: 0.3;
        border: none;
        outline: none;
        background: none;
        padding: 2px;
        margin: 0px 4px 0px 0px;
        transition: opacity 0.2s;
    }
    .reset.active {
        opacity: 0.5;
        cursor: pointer;
    }

    .reset.active:hover {
        opacity: 1;
    }

    .bool {
        position: relative;
        background-color: var(--bg-600);
        padding: 4px;
        border-radius: 8px;
    }

    .bool.fill {
        width: 100%;
    }

    .bool .mask {
        position: absolute;
        top: 0;
        left: 4px;
        height: 100%;
        /* padding: 0 4px; */
        z-index: 1;
        will-change: clip-path;
        pointer-events: none;
        -webkit-clip-path: inset(0 100% 0 0);
        clip-path: inset(0 100% 0 0);
        transition-property: clip-path;
        transition-timing-function: var(--transition-timing-function);
    }

    .bool .background,
    .bool .mask {
        gap: 4px;
    }

    .bool .background button {
        opacity: 0.5;
        transition: opacity 0.2s;
    }

    .bool .background button:hover {
        opacity: 1;
    }

    .bool.fill .background {
        width: 100%;
    }
    .bool.fill .mask {
        width: calc(100% - 8px);
    }

    .bool .mask button {
        background-color: var(--hl-primary);
        color: var(--bg-primary);
    }

    .bool button {
        outline: none;
        border: none;
        background: none;
        padding: 6px 28px;
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
    }

    .bool.fill button {
        width: 100%;
    }

    .bool .container {
        position: absolute;
        cursor: pointer;
        transform: translate(0, -50%);
        top: 50%;
        transition-timing-function: var(--transition-timing-function);
        transition-property: left, width, box-shadow;
        z-index: 0;
        background: var(--hl-primary);
        height: calc(100% - 8px);
        border-radius: 6px;
        border-bottom: 2px solid var(--bg-primary-20);
        box-shadow: 0 0px 2px 1px var(--hl-primary-10);
    }

    .bool .container:hover {
        box-shadow: 0 0px 2px 1px var(--hl-primary-30);
    }

    .color {
        display: flex;
        justify-content: left !important;
        gap: 8px;
        width: 100%;
    }

    .uploadBgImageButton {
        font-size: 14px;
        background-color: var(--bg-400);
        padding: 8px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .uploadBgImageButton:hover {
        background-color: var(--bg-300);
    }

    .imageResetButton {
        font-size: 14px;
        padding: 8px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        background-color: var(--bg-450);
        transition: background-color 0.2s;
    }
    .imageResetButton:hover {
        background-color: var(--bg-400);
    }

    input[type='color'] {
        appearance: none;
        -moz-appearance: none;
        -webkit-appearance: none;
        background: none;
        border: 0;
        padding: 0;
        border-radius: 6px;
        cursor: pointer;
        height: 32px;
        width: 30%;
        border: 1px solid var(--bg-400);
        margin-left: 4px;
        /* border-bottom: 2px solid rgba(47, 49, 56, 0.2);
        border-top: 1px solid var(--bg-200); */
        box-shadow: none;
        transition: box-shadow 0.2s;
    }

    .bgImagePreview {
        border-radius: 6px;
        cursor: pointer;
        height: 32px;
        width: 30%;
        border: 1px solid var(--bg-400);
        margin-left: 4px;
        background-size: cover;
        background-position: center;
        box-shadow: none;
        transition: box-shadow 0.2s;
    }

    .bgImagePreview:focus {
        border-radius: 6px;
    }

    *:focus:not(.bgImagePreview) {
        outline: none;
    }

    input[type='color']:hover,
    .bgImagePreview:hover {
        box-shadow:
            0 1px 1px 0 rgba(0, 0, 0, 0.14),
            0 1px 2px 1px rgba(0, 0, 0, 0.2),
            0 0 0 3px var(--bg-400);
    }

    .inlineRadio {
        width: 100%;
        padding-left: 8px;
    }

    ::-webkit-color-swatch-wrapper {
        padding: 0;
    }

    ::-webkit-color-swatch {
        border: 0;
        border-radius: 0;
    }

    ::-moz-color-swatch,
    ::-moz-focus-inner {
        border: 0;
    }

    ::-moz-focus-inner {
        padding: 0;
    }
</style>

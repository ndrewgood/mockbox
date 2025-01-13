<script>
    // @ts-nocheck
    import { onDestroy, onMount } from 'svelte';
    import { slide, fade } from 'svelte/transition';
    import { sineInOut, cubicInOut } from 'svelte/easing';
    import Control from './Control.svelte';
    import { globalData, geometryData, environmentData, animationData, exportData, materialData, bgImage } from './database';
    import { calculateSecondaryAltColor, calculateSecondaryColor, calculateTextPrimaryColor, calculateTextSecondaryColor, colorVars, getRatioSize, setHue, colorVarDefaults } from './utils';
    import lottie from 'lottie-web';

    import Icon from './Icon.svelte';
    import Logo from '../lib/svg/mockbox_logo.svelte';
    import chroma from 'chroma-js';
    import Slider from './Slider.svelte';
    import MockboxLogo from '../lib/svg/mockbox_logo.svelte';
    import MockboxLogoLottie from '$lib/json/mockbox-logo-lottie.json?url';

    let geoDisplay = true;
    let envDisplay = false;
    let aniDisplay = false;
    let exportDisplay = false;
    let playPauseFill = false;
    let collapsedPlayPauseFill = false;

    import texture_cardboard from '$lib/images/textures/texture_cardboard.png';
    import texture_envelope from '$lib/images/textures/texture_envelope.jpg';
    import texture_metal from '$lib/images/textures/texture_metal.jpg';
    import texture_pageStack_tan from '$lib/images/textures/texture_pageStack_tan.png';
    import texture_pageStack_white from '$lib/images/textures/texture_pageStack_white.png';
    import texture_wood_end from '$lib/images/textures/texture_wood_end.png';
    import texture_wood_side from '$lib/images/textures/texture_wood_side.png';
    import texture_wood_top from '$lib/images/textures/texture_wood_top.png';
    import texture_chipboard from '$lib/images/textures/texture_chipboard.jpg';
    import texture_foil from '$lib/images/textures/texture_foil.jpg';
    import texture_paper from '$lib/images/textures/texture_paper.jpg';

    const textureGroups = ['Materials', 'Paper stacks', 'Wood plank'];

    const textureLibrary = [
        {
            label: 'Cardboard',
            image: texture_cardboard,
            group: 'Materials',
            width: 800,
            height: 534,
        },
        {
            label: 'Envelope',
            image: texture_envelope,
            group: 'Materials',
            width: 3000,
            height: 4525,
        },
        {
            label: 'Metal',
            image: texture_metal,
            group: 'Materials',
            width: 2000,
            height: 2000,
        },
        {
            label: 'Paper',
            image: texture_paper,
            group: 'Materials',
            width: 1281,
            height: 1920,
        },
        {
            label: 'Chipboard',
            image: texture_chipboard,
            group: 'Materials',
            width: 1920,
            height: 1282,
        },
        {
            label: 'Foil',
            image: texture_foil,
            group: 'Materials',
            width: 1920,
            height: 1250,
        },
        {
            label: 'Page stack (Tan)',
            image: texture_pageStack_tan,
            group: 'Paper stacks',
            width: 481,
            height: 2803,
        },
        {
            label: 'Page stack (White)',
            image: texture_pageStack_white,
            group: 'Paper stacks',
            width: 481,
            height: 2803,
        },
        {
            label: 'Wood (End)',
            image: texture_wood_end,
            group: 'Wood plank',
            width: 1200,
            height: 237,
        },
        {
            label: 'Wood (Side)',
            image: texture_wood_side,
            group: 'Wood plank',
            width: 1121,
            height: 82,
        },
        {
            label: 'Wood (Top)',
            image: texture_wood_top,
            group: 'Wood plank',
            width: 1121,
            height: 400,
        },
    ];

    $: textureLibrarySelected = false;

    $: selected = $materialData.find((face) => {
        return face.selected == true;
    });

    $: selectedImage = $materialData.find((face) => {
        return face.selected == true;
    })?.image;

    const scaleVals = [$geometryData.scale.value.width, $geometryData.scale.value.height, $geometryData.scale.value.depth];

    function capitalize(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    const handleHorzMirror = (selected) => {
        if ($materialData[$materialData.findIndex((i) => i.label == selected.label)].image !== null) {
            $materialData[$materialData.findIndex((i) => i.label == selected.label)].mirrorHorizontal = !$materialData[$materialData.findIndex((i) => i.label == selected.label)].mirrorHorizontal;
        }
    };

    const handleVertMirror = (selected) => {
        if ($materialData[$materialData.findIndex((i) => i.label == selected.label)].image !== null) {
            $materialData[$materialData.findIndex((i) => i.label == selected.label)].mirrorVertical = !$materialData[$materialData.findIndex((i) => i.label == selected.label)].mirrorVertical;
        }
    };

    const handleRotate = (selected) => {
        if ($materialData[$materialData.findIndex((i) => i.label == selected.label)].image !== null) {
            $materialData[$materialData.findIndex((i) => i.label == selected.label)].rotation += 1;
        }
    };

    const handleUpload = (e) => {
        let index = $materialData.findIndex((i) => i.label == selected.label);
        console.log(e.target.files[0]);
        $materialData[index].uploaded = e.target.files[0];
    };

    const handleSelect = (texture) => {
        let index = $materialData.findIndex((i) => i.label == selected.label);
        $materialData[index].uploaded = {
            type: 'url',
            url: texture.image,
            width: texture.width,
            height: texture.height,
        };
        textureLibrarySelected = false;
    };

    const handleTrash = () => {
        let index = $materialData.findIndex((i) => i.label == selected.label);
        $materialData[index].removed = true;
    };

    const handleResetCamera = () => {
        $animationData.cameraReset = true;
        if (!$animationData.animate.value) {
            $animationData.animateReset = true;
        }
        // $animationData.animate.value = false;
    };

    let previousBgColor = $globalData.bgColor.value;

    globalData.subscribe((data) => {
        if (previousBgColor !== data.bgColor.value) {
            previousBgColor = data.bgColor.value;
            let bgHue = chroma(data.bgColor.value).hsl()[0];

            if (typeof document !== 'undefined') {
                let root = document.documentElement;

                colorVars.forEach((colorVar, i) => {
                    root.style.setProperty(colorVar, setHue(colorVarDefaults[i], bgHue));
                });
            }
        }
    });

    materialData.subscribe((data) => {
        let select = data.find((face) => {
            return face.selected == true;
        });
        if (select == null) {
            textureLibrarySelected = false;
        }
    });

    const transitionPanel = { duration: 200 };
    const transitionPanelDelay = { duration: 200, delay: 200 };
    const transitionGroup = { duration: 300, easing: cubicInOut };
    const transitionSelection = { duration: 300 };

    let geoContentHeight,
        envContentHeight,
        aniContentHeight,
        exportContentHeight = 0;

    // Add these variables to track transition states
    let geoTransitioning = false;
    let envTransitioning = false;
    let aniTransitioning = false;
    let exportTransitioning = false;

    // Modify the toggle functions to handle transition timing
    const toggleGeoDisplay = () => {
        geoTransitioning = true;
        geoDisplay = !geoDisplay;
        setTimeout(() => {
            geoTransitioning = false;
        }, 300); // Match this to your transition duration
    };

    const toggleEnvDisplay = () => {
        envTransitioning = true;
        envDisplay = !envDisplay;
        setTimeout(() => {
            envTransitioning = false;
        }, 300); // Match this to your transition duration
    };

    const toggleAniDisplay = () => {
        aniTransitioning = true;
        aniDisplay = !aniDisplay;
        setTimeout(() => {
            aniTransitioning = false;
        }, 300); // Match this to your transition duration
    };

    const toggleExportDisplay = () => {
        exportTransitioning = true;
        exportDisplay = !exportDisplay;
        setTimeout(() => {
            exportTransitioning = false;
        }, 300); // Match this to your transition duration
    };

    const togglePanelExpansion = () => {
        $globalData.panelTransitioning = true;
        if (lottieContainer && !$globalData.panelExpanded) {
            console.log('test');
            lottie.goToAndStop(0);
            setTimeout(() => {
                lottie.play();
            }, 100);
        }
        $globalData.panelExpanded = !$globalData.panelExpanded;
        setTimeout(() => {
            $globalData.panelTransitioning = false;
        }, 450);
    };

    const toggleModal = () => {
        console.log('test');
        $globalData.modalOpen = !$globalData.modalOpen;
    };

    let lottieContainer;

    onMount(async () => {
        // Fetch the JSON file
        const response = await fetch(MockboxLogoLottie);
        const animationData = await response.json();
        console.log('Animation data loaded:', animationData);

        lottie.loadAnimation({
            container: lottieContainer,
            animationData: animationData,
            renderer: 'svg',
            autoplay: true,
            loop: false,
        });
        lottie.setSpeed(1.4);
    });
</script>

<div id="container" class={$globalData.panelExpanded ? 'expanded' : 'collapsed'} style:transition-duration={$globalData.panelTransitioning ? '0.45s' : '0s'}>
    <div id="title" class={$globalData.panelExpanded ? 'expanded' : 'collapsed'}>
        <div class="left">
            <button class={$globalData.panelExpanded ? 'menuButton expanded' : 'menuButton collapsed'} on:click={() => togglePanelExpansion()}>
                <Icon name="menu" />
            </button>
            <div id="lottieContainer" style:opacity={$globalData.panelExpanded ? '1' : '0'} style:transition-duration={$globalData.panelExpanded ? '0.2s' : '0.2s'}>
                <div id="lottie" bind:this={lottieContainer}></div>
            </div>
        </div>
        {#if $globalData.panelExpanded}<button
                class="infoButton"
                on:click={() => toggleModal()}
                on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleModal() : null)}
                tabindex="0"
                transition:fade={transitionPanel}><Icon name="info" /></button
            >{/if}
    </div>
    <div
        id="globalControlsContainer"
        style:transition-duration={$globalData.panelTransitioning ? '0.45s' : '0s'}
        class={$globalData.panelExpanded ? 'expanded' : 'collapsed'}
        out:fade={transitionPanel}
        in:fade={transitionPanel}
    >
        <div class="shadow top"></div>
        <div id="globalControls">
            <div class={geoDisplay ? 'group expanded' : 'group'} style:height={geoDisplay ? `${geoContentHeight + 52 + 8}px` : '52px'} style:transition-duration={geoTransitioning ? '0.35s' : '0s'}>
                <div class="header" on:click={toggleGeoDisplay} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleGeoDisplay() : null)} role="button" tabindex="0">
                    <div class="title">
                        <Icon name="geometry" width="20px" height="20px" />
                        <h2>Geometry</h2>
                    </div>
                    <button>
                        {#if geoDisplay}<Icon name="collapse" />{:else}<Icon name="expand" />{/if}
                    </button>
                </div>
                <div class="group-content" bind:clientHeight={geoContentHeight}>
                    <Control bind:control={$geometryData.scaleMode} />
                    <div style={$geometryData.scaleMode.value !== 'Manual' ? 'opacity: 0.6; pointer-events: none;' : null}>
                        <Control bind:control={$geometryData.scale} context="Width" />
                        <Control bind:control={$geometryData.scale} context="Height" />
                        <Control bind:control={$geometryData.scale} context="Depth" />
                    </div>
                </div>
            </div>
            <div class={envDisplay ? 'group expanded' : 'group'} style:height={envDisplay ? `${envContentHeight + 52 + 8}px` : '52px'} style:transition-duration={envTransitioning ? '0.35s' : '0s'}>
                <div class="header" on:click={toggleEnvDisplay} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleEnvDisplay() : null)} role="button" tabindex="0">
                    <div class="title">
                        <Icon name="environment" width="20px" height="20px" />
                        <h2>Environment</h2>
                    </div>
                    <button>
                        {#if envDisplay}<Icon name="collapse" />{:else}<Icon name="expand" />{/if}
                    </button>
                </div>
                <div bind:clientHeight={envContentHeight} class="group-content">
                    <Control bind:control={$globalData.bgColor} />
                    {#if $bgImage}
                        <div transition:slide|global={transitionGroup}>
                            {#if $globalData.bgImageMode.value == 'Tile'}
                                <div transition:slide|global={transitionGroup}>
                                    <Control bind:control={$globalData.bgImageScale} />
                                </div>
                            {/if}
                        </div>
                    {/if}
                    <Control bind:control={$environmentData.cameraFov} />
                    <Control bind:control={$environmentData.cameraDefaultPosition} />
                    <Control bind:control={$environmentData.spotlight} />
                    {#if $environmentData.spotlight.value}
                        <div transition:slide|global={transitionGroup}>
                            <Control bind:control={$environmentData.spotlightIntensity} />
                        </div>
                    {/if}
                    <Control bind:control={$environmentData.glossy} />
                    {#if $environmentData.glossy.value}
                        <div transition:slide|global={transitionGroup}>
                            <Control bind:control={$environmentData.glossyIntensity} />
                        </div>
                    {/if}
                </div>
            </div>
            <div class={aniDisplay ? 'group expanded' : 'group'} style:height={aniDisplay ? `${aniContentHeight + 52 + 8}px` : '52px'} style:transition-duration={aniTransitioning ? '0.35s' : '0s'}>
                <div class="header" on:click={toggleAniDisplay} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleAniDisplay() : null)} role="button" tabindex="0">
                    <div class="title">
                        <Icon name="animation" width="20px" height="20px" />
                        <h2>Animation</h2>
                    </div>
                    <button>
                        {#if aniDisplay}<Icon name="collapse" />{:else}<Icon name="expand" />{/if}
                    </button>
                </div>
                <div bind:clientHeight={aniContentHeight} class="group-content">
                    <Control bind:control={$animationData.animateType} />
                    <Control bind:control={$animationData.speed} />
                    <Control bind:control={$animationData.speedType} />
                </div>
            </div>
            <div
                class={exportDisplay ? 'group expanded' : 'group'}
                style:height={exportDisplay ? `${exportContentHeight + 52 + 8}px` : '52px'}
                style:transition-duration={exportTransitioning ? '0.35s' : '0s'}
            >
                <div class="header" on:click={toggleExportDisplay} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleExportDisplay() : null)} role="button" tabindex="0">
                    <div class="title">
                        <Icon name="export" width="20px" height="20px" />
                        <h2>Export</h2>
                    </div>
                    <button>
                        {#if exportDisplay}<Icon name="collapse" />{:else}<Icon name="expand" />{/if}
                    </button>
                </div>
                <div bind:clientHeight={exportContentHeight} class="group-content">
                    <!-- <Control bind:control={$animationData.animate} /> -->
                    <Control bind:control={$exportData.fileType} />
                    <Control bind:control={$exportData.fileName} />
                    <Control bind:control={$exportData.transparentBackground} />
                    <Control bind:control={$exportData.hideCursorOverlay} />
                </div>
            </div>
        </div>
        <div class="shadow bottom"></div>
    </div>
    <!-- {#if $globalData.panelExpanded} -->
    <div
        id="selection"
        class={$globalData.panelExpanded ? 'expanded' : 'collapsed'}
        style:transition-duration={$globalData.panelTransitioning ? '0.45s' : '.45s'}
        out:slide|global={transitionPanel}
        in:slide|global={transitionPanel}
        style={`gap: ${selected && selectedImage ? '8px' : '0px'}`}
    >
        <div class="top" transition:slide|global={transitionSelection} style:transition-duration={$globalData.panelTransitioning ? '0.2s' : '0s'}>
            <div class="selectionInfo">
                <p
                    class={selected && !textureLibrarySelected ? 'selectionTitle active' : textureLibrarySelected ? 'selectionTitle textureLibrary' : 'selectionTitle'}
                    out:slide|global={transitionSelection}
                >
                    {selected && !textureLibrarySelected ? 'Selected: ' : textureLibrarySelected ? 'Texture library' : 'No faces selected'}
                </p>
                {#if selected && !textureLibrarySelected}
                    <p transition:slide|global={transitionSelection} class="selectionStatus">{capitalize(selected.label)} face</p>
                {/if}
            </div>
            {#if selected && selectedImage}
                <button in:slide={transitionSelection} on:click={() => handleTrash(selected)} class="trashButton"><Icon name="trash" /></button>
            {:else if selected && !selectedImage && !textureLibrarySelected}
                <div class="textureInputContainer">
                    <button on:click={() => (textureLibrarySelected = true)}>Select</button>
                    <label for="uploadInput" class="uploadButton">Upload</label>
                    <input type="file" id="uploadInput" style="display: none;" on:change={(e) => handleUpload(e)} />
                </div>
            {:else if textureLibrarySelected}
                <button in:slide={transitionSelection} on:click={() => (textureLibrarySelected = false)} class="trashButton"><Icon name="close" /></button>
            {/if}
        </div>

        {#if textureLibrarySelected}
            <div class="textureLibraryContainer">
                <div class="shadow top"></div>
                <div class="textureLibraryScroll" transition:slide|global={transitionSelection}>
                    <div class="textureLibraryList">
                        {#each textureGroups as group}
                            <div class="textureLibraryGroup">
                                <p>{group}</p>
                                <div class="textureLibraryGroupItems">
                                    {#each textureLibrary.filter((t) => t.group === group) as texture}
                                        <button class="textureLibraryItem" on:click={() => handleSelect(texture)}>
                                            <div class="textureThumbnail">
                                                <img
                                                    src={texture.image}
                                                    alt={texture.label}
                                                    height={getRatioSize(texture.width, texture.height, 75).height + 'px'}
                                                    width={getRatioSize(texture.width, texture.height, 75).width + 'px'}
                                                />
                                            </div>
                                            <p>{texture.label}</p>
                                        </button>
                                    {/each}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
                <div class="shadow bottom"></div>
            </div>
        {/if}

        {#if selected && selectedImage}
            <div id="selectionContainer">
                <div class="previewPlaceholder" transition:slide|global={transitionSelection}>
                    <img
                        src={selectedImage.src}
                        alt="face"
                        height={getRatioSize(selectedImage.width, selectedImage.height, 90).height + 'px'}
                        width={getRatioSize(selectedImage.width, selectedImage.height, 90).width + 'px'}
                        style={`transform: rotate(${selected.rotation * 90}deg) scaleX(${selected.mirrorHorizontal ? -1 : 1}) scaleY(${selected.mirrorVertical ? -1 : 1});`}
                    />
                </div>
                <div id="selectionInputs" transition:slide|global={transitionSelection}>
                    <div class="transformControls">
                        <button on:click={() => handleRotate(selected)}>
                            <Icon name="rotate" />
                        </button>
                        <button on:click={() => handleHorzMirror(selected)}>
                            {#if selected.mirrorHorizontal == false}<Icon name="horz-left" />{:else}<Icon name="horz-right" />{/if}
                        </button>
                        <button on:click={() => handleVertMirror(selected)}>
                            {#if selected.mirrorVertical == false}<Icon name="vert-top" />{:else}<Icon name="vert-bottom" />{/if}
                        </button>
                    </div>
                    <div class="scaleControls">
                        <span class="scale">
                            <p>Scale X</p>
                            <div class="slider">
                                {#if selected.label == 'right'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[0].scaleX} step={0.01} />
                                {:else if selected.label == 'left'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[1].scaleX} step={0.01} />
                                {:else if selected.label == 'top'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[2].scaleX} step={0.01} />
                                {:else if selected.label == 'bottom'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[3].scaleX} step={0.01} />
                                {:else if selected.label == 'front'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[4].scaleX} step={0.01} />
                                {:else if selected.label == 'back'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[5].scaleX} step={0.01} />
                                {/if}
                            </div>
                        </span>
                        <span class="scale">
                            <p>Scale Y</p>
                            <div class="slider">
                                {#if selected.label == 'right'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[0].scaleY} step={0.01} />
                                {:else if selected.label == 'left'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[1].scaleY} step={0.01} />
                                {:else if selected.label == 'top'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[2].scaleY} step={0.01} />
                                {:else if selected.label == 'bottom'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[3].scaleY} step={0.01} />
                                {:else if selected.label == 'front'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[4].scaleY} step={0.01} />
                                {:else if selected.label == 'back'}
                                    <Slider min={0} max={0.5} bind:value={$materialData[5].scaleY} step={0.01} />
                                {/if}
                            </div>
                        </span>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div id="camera" class={$globalData.panelExpanded ? 'expanded' : 'collapsed'} out:fade|global={transitionPanel} in:fade|global={transitionPanel}>
        <div class="left">
            <button
                class="playButton"
                on:click={() => {
                    $animationData.animate.value = !$animationData.animate.value;
                }}
                on:mouseenter={() => (playPauseFill = true)}
                on:mouseleave={() => (playPauseFill = false)}
            >
                {#if $animationData.animate.value}
                    <Icon name="pause" color="--bg-primary" hover="false" filled={playPauseFill} />
                {:else}
                    <Icon name="play" color="--bg-primary" hover="false" filled={playPauseFill} />
                {/if}
            </button>
            <button class="resetCameraButton" on:click={() => handleResetCamera()}>Reset camera</button>
        </div>
        <div class="right">
            <button class="exportButton" on:click={() => ($exportData.download = true)}><Icon name="export" /></button>
        </div>
    </div>
    {#if !$globalData.panelExpanded}
        <div id="collapsedButtons" class={$globalData.panelExpanded ? 'expanded' : 'collapsed'} in:fade|global={transitionPanelDelay} out:fade|global={transitionPanel}>
            <button
                on:click={() => {
                    $animationData.animate.value = !$animationData.animate.value;
                }}
                on:mouseenter={() => (collapsedPlayPauseFill = true)}
                on:mouseleave={() => (collapsedPlayPauseFill = false)}
            >
                {#if $animationData.animate.value}
                    <Icon name="pause" filled={collapsedPlayPauseFill} />
                {:else}
                    <Icon name="play" filled={collapsedPlayPauseFill} />
                {/if}</button
            >
            <button on:click={() => ($exportData.download = true)}><Icon name="export" /></button>
        </div>
    {/if}
</div>

<style>
    #title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 24px 8px 12px 12px;
        /* height: 40px; */
        transition: padding 0.3s;
    }

    #title.collapsed {
        padding: 24px 14px 12px 0px;
    }

    #title .left {
        display: flex;
        gap: 12px;
        align-items: center;
        min-height: 36px;
    }

    #title .left button {
        padding: 0;
        transition: padding 0.3s;
    }

    #title .left button.collapsed {
        padding: 0 12px;
    }

    .header button,
    .menuButton {
        padding: 0;
        margin: 0;
        border: none;
        padding-block: 0px;
        padding-inline: 0px;
        width: 24px;
        height: 24px;
        cursor: pointer;
        background: none;
    }

    #container {
        position: relative;
        background: var(--bg-primary);
        display: flex;
        flex-direction: column;
        height: 100dvh;
        color: var(--hl-primary);
        padding: 0 0 0 16px;
        overflow: hidden;
        transition-property: width, min-width;
        transition-timing-function: var(--tab-easing);
    }

    .expanded {
        --transition-timing: 0ms;
    }

    .collapsed {
        --transition-timing: 0ms;
    }

    #container.expanded {
        width: 350px;
        min-width: 350px;
    }

    #container.collapsed {
        width: 64px;
        min-width: 64px;
        justify-content: space-between;
    }

    #globalControlsContainer {
        height: 100%;
        overflow-y: hidden;
        position: relative;
        min-width: 350px;
        opacity: 1;
        transition: opacity 0.2s;
        transition-timing-function: var(--tab-easing);
        contain: paint;
    }

    #globalControlsContainer.collapsed,
    #selection.collapsed,
    #camera.collapsed {
        opacity: 0;
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    #globalControls {
        height: 100%;
        overflow-y: scroll;
        scrollbar-width: none;
        min-width: 350px;
        transform: translateZ(0);
        will-change: transform;
    }

    #collapsedButtons {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding-right: 16px;
        padding-bottom: 24px;
        position: absolute;
        bottom: 0;
        left: 18px;
    }

    #collapsedButtons button {
        background: none;
        border-radius: 8px;
        padding: 8px;
        transition: background-color 0.2s;
        border: none;
        cursor: pointer;
    }

    #collapsedButtons button:hover {
        background-color: var(--bg-300);
    }

    /* .group:last-child {
        padding-bottom: 48px;
    } */

    .group {
        border: 1px solid var(--bg-400);
        border-radius: 16px;
        padding: 0px 0px;
        margin-left: 1px;
        margin-right: 1px;
        position: relative;
        display: flex;
        flex-direction: column;
        gap: 8px;
        transform: translateZ(0);
        will-change: transform;
        overflow: hidden;
        transition-property: height;
        transition-timing-function: var(--group-easing);
        margin-bottom: 4px;
        background: var(--bg-primary);
        outline: 1px solid var(--bg-primary);
    }

    .group:not(.expanded)::before {
        content: ' ';
        position: absolute;
        top: -2px;
        left: 0px;
        right: 0px;
        /* bottom: 0px; */
        border-top: 1px solid var(--bg-700);
        pointer-events: none;
    }

    .group.expanded {
        border-top: 1px solid var(--bg-300);
        background: var(--bg-550);

        margin-bottom: 8px;
        outline: 1px solid var(--bg-700);
    }

    .group-content {
        padding: 0px 12px;
        opacity: 0;
        transition: opacity 0.2s;
        transition-timing-function: var(--group-easing);
        pointer-events: none;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    .group.expanded .group-content {
        opacity: 1;
        pointer-events: auto;
        user-select: auto;
        -webkit-user-select: auto;
        -moz-user-select: auto;
        -ms-user-select: auto;
    }

    .group:first-child {
        margin-top: 12px;
    }

    .group:last-child {
        margin-bottom: 32px;
    }

    .header {
        position: relative;
        display: flex;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
    }

    .header::before {
        content: '';
        position: absolute;
        z-index: -2;
        inset: 0;
        background: linear-gradient(to bottom, var(--bg-450), var(--bg-primary));
        opacity: 0;
        transition: opacity 0.2s;
    }

    .group.expanded .header::before {
        background: linear-gradient(to bottom, var(--bg-450), var(--bg-550));
    }

    .header:hover::before {
        opacity: 1;
    }

    h2 {
        font-weight: 400;
        font-size: 18px;
    }

    .header button {
        height: 24px;
        align-self: center;
        margin-right: 12px;
    }

    .title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 12px;
    }

    .shadow {
        position: absolute;
        background: linear-gradient(0deg, var(--bg-primary) 0%, transparent 100%);
        width: 100%;
        z-index: 10;
    }

    .shadow.top {
        top: -1px;
        height: 18px;
        background: linear-gradient(180deg, var(--bg-primary) 0%, transparent 100%);
    }

    .shadow.bottom {
        bottom: -1px;
        height: 32px;
        background: linear-gradient(0deg, var(--bg-primary) 0%, transparent 100%);
    }

    #selection,
    #camera {
        width: 100%;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        min-width: 350px;
        transition: opacity 0.2s;
    }

    #selection {
        background-color: var(--bg-400);
        border-top: 1px solid var(--bg-200);
        box-shadow: 0px 4px 6px var(--bg-600);
        /* outline: 1px solid var(--bg-700); */
        margin-top: 8px;
        padding: 16px 0px;
    }

    .slider {
        width: 100%;
        padding-right: 18px;
    }

    #camera {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0px 16px 0px;
    }

    #selection p {
        padding: 0 16px;
        margin-block-start: 0em;
        margin-block-end: 0em;
    }

    #selectionContainer {
        display: flex;
        flex-direction: row;
        gap: 12px;
    }

    .textureInputContainer {
        display: flex;
        flex-direction: row;
        gap: 8px;
    }

    .textureLibraryContainer {
        position: relative;
    }

    .textureLibraryContainer .shadow.top {
        background: linear-gradient(180deg, var(--bg-400) 0%, transparent 100%);
        left: 8px;
    }

    .textureLibraryContainer .shadow.bottom {
        background: linear-gradient(0deg, var(--bg-400) 0%, transparent 100%);
        left: 8px;
    }

    .textureLibraryScroll {
        width: 100%;
        height: 300px;
        overflow-y: scroll;
        padding-top: 16px;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE/Edge */
    }

    .textureLibraryScroll::-webkit-scrollbar {
        display: none; /* Chrome/Safari/Opera */
    }

    .textureLibraryList {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding: 0px 16px 24px 16px;
    }

    .textureLibraryGroup {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .textureLibraryGroup p {
        padding: 0 !important;
        font-size: 14px;
        font-weight: 500;
    }

    .textureLibraryGroupItems {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
    }

    .textureLibraryItem {
        border: none;
        background: none;
        padding: 0px;
        color: var(--hl-primary);
        cursor: pointer;
        display: flex;
        flex-direction: column;
        gap: 4px;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .textureLibraryItem p {
        font-size: 12px;
        text-align: center;
        padding: 0;
        margin: auto;
    }

    .textureThumbnail {
        width: 100%;
        aspect-ratio: 1;
        border-radius: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-primary);
        border: 1px solid var(--bg-200);
    }

    .textureLibraryItem:hover {
        opacity: 1;
    }

    #selectionInputs {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;
        flex: 1;
    }

    #selectionInputs .transformControls {
        display: flex;
        flex-direction: row;
    }

    .scaleControls {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding-right: 0px;
    }

    .trashButton,
    .transformControls button,
    .exportButton,
    .infoButton {
        border: none;
        border-radius: 8px;
        background: none;
        transition: 0.2s;
        cursor: pointer;
        padding: 6px;
        display: flex;
    }

    .exportButton {
        padding: 8px 8px;
    }

    .trashButton:hover,
    .transformControls button:hover {
        background-color: var(--bg-300);
    }

    .infoButton:hover,
    .exportButton:hover {
        background-color: var(--bg-400);
    }

    .trashButton:active,
    .transformControls button:active,
    .exportButton:active,
    .infoButton:active {
        background-color: var(--bg-200);
    }

    .uploadButton,
    .textureInputContainer button {
        border: none;
        border-radius: 8px;
        background-color: var(--bg-300);
        color: var(--hl-primary);
        font-size: 14px;
        padding: 8px 12px;
        cursor: pointer;
        height: fit-content;
        transition: background-color 0.2s;
    }

    .uploadButton:hover,
    .textureInputContainer button:hover {
        background-color: var(--bg-200);
    }

    .textureInputContainer label {
        background-color: var(--hl-primary);
        color: var(--bg-primary);
    }

    .textureInputContainer label:hover {
        background-color: var(--hl-400);
    }

    #selection .top {
        display: flex;
        width: calc(100% - 16px);
        justify-content: space-between;
        align-items: center;
    }

    .selectionTitle {
        opacity: 0.5;
        transition: font-size 0.3s;
    }

    .selectionTitle.active {
        font-size: 13px;
    }

    .selectionTitle.textureLibrary {
        opacity: 1;
        font-size: 18px;
    }

    .selectionStatus {
        font-size: 18px;
    }

    .selectionInfo {
        display: flex;
        flex-direction: column;
        gap: 1px;
        justify-content: center;
        padding: 2px 0px;
    }

    .scale {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-between;
        /* align-items: center; */
        gap: 8px;
    }

    .scale p {
        padding: 0px !important;
        margin-left: 6px;
        width: 80px;
        font-size: 14px;
    }

    .previewPlaceholder {
        width: 110px;
        height: 110px;
        border: 1px solid var(--bg-200);
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        margin-left: 16px;
        background-color: var(--bg-primary);
    }

    #camera .left {
        display: flex;
        padding: 5px 6px 6px 6px;
        border-radius: 32px;
        background-color: var(--bg-400);
        /* box-shadow: 0px 4px 8px var(--bg-600); */
        border-top: 1px solid var(--bg-200);
    }

    #camera .right {
        margin-right: 6px;
    }

    .playButton {
        border: none;
        border-radius: 32px;
        display: flex;
        background-color: var(--hl-primary);
        font-size: 16px;
        padding: 6px 18px;
        cursor: pointer;
        height: fit-content;
        align-items: center;
        gap: 4px;
        border-bottom: 2px solid var(--bg-primary-20);
        box-shadow: 0 0px 2px 1px var(--hl-primary-10);
        transition:
            box-shadow 0.2s,
            padding 0.2s;
    }

    .playButton:hover {
        padding: 6px 22px;
        box-shadow: 0 0px 2px 1px var(--hl-primary-30);
    }

    .resetCameraButton {
        font-size: 14px;
        border: none;
        border-radius: 8px;
        padding: 8px 16px;
        cursor: pointer;
        color: var(--hl-primary);
        opacity: 0.6;
        background: none;
        transition: opacity 0.2s;
    }

    .resetCameraButton:hover {
        opacity: 1;
    }

    #lottie {
        /* width: 100px; */
        height: 23px;
    }

    #lottieContainer {
        width: 210px;
        transition-property: opacity;
    }
    :global(.lottie-fill) {
        fill: var(--hl-primary);
    }

    @media (max-width: 600px) {
        #title {
            display: none;
        }

        #container {
            width: 100% !important;
            min-width: unset !important;
            padding: 0px;
            height: calc(100dvh - 298px);
            transition: height 0.5s var(--tab-easing);
        }

        #globalControlsContainer {
            min-width: unset !important;
            margin: 0px 16px;
            opacity: 1;
        }

        #globalControls {
            min-width: unset !important;
        }

        #selection,
        #camera {
            opacity: 1;
            width: calc(100% - 32px) !important;
            margin-left: 16px;
        }

        #container.collapsed {
            height: 67px;
        }

        #collapsedButtons {
            display: none;
        }

        #selection {
            height: fit-content;
        }

        #globalControlsContainer,
        #selection {
            transition-property: height, margin-top, padding, opacity;
            transition-timing-function: var(--tab-easing);
        }

        #globalControlsContainer.collapsed {
            opacity: 0;
            height: 0px;
            margin-top: 0px;
            padding: 0px;
        }

        #selection.collapsed {
            height: 0px;
            opacity: 0;
            margin-top: 0px;
            padding: 0px;
        }

        #selection .top {
            transition-property: opacity, min-height;
            transition-timing-function: var(--tab-easing);
            min-height: 23.5px;
        }

        #selection.collapsed .top {
            opacity: 0;
            min-height: 0px;
        }

        #camera.collapsed {
            padding-top: 0px;
            opacity: 1;
            pointer-events: auto;
            user-select: auto;
        }

        .textureLibraryScroll {
            height: calc(100dvh - 468px);
        }
    }
</style>

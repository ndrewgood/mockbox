<script>
    // @ts-nocheck

    import MockboxLogo from '$lib/svg/mockbox_logo.svelte';
    import { globalData } from './database';
    import ControlPanel from './ControlPanel.svelte';
    import Icon from './Icon.svelte';
    import ThreeCanvas from './ThreeCanvas.svelte';
    import { fade, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import MockboxLogoLottie from '$lib/json/mockbox-logo-lottie.json?url';
    import lottie from 'lottie-web';

    let lottieMobileContainer;

    const togglePanelExpansion = () => {
        $globalData.panelTransitioning = true;
        $globalData.panelExpanded = !$globalData.panelExpanded;
        setTimeout(() => {
            $globalData.panelTransitioning = false;
        }, 450);
    };

    const toggleModal = () => {
        $globalData.modalOpen = !$globalData.modalOpen;
    };

    let modalTab = 'about';

    const toggleModalTab = (tab) => {
        modalTab = tab;
    };

    onMount(async () => {
        // Fetch the JSON file
        const response = await fetch(MockboxLogoLottie);
        const animationData = await response.json();
        console.log('Animation data loaded:', animationData);

        lottie.loadAnimation({
            container: lottieMobileContainer,
            animationData: animationData,
            renderer: 'svg',
            autoplay: true,
            loop: false,
        });
        lottie.setSpeed(1.4);
    });
</script>

<section>
    {#if $globalData.modalOpen}
        <div
            transition:fade={{ duration: 150 }}
            id="modalContainer"
            on:click={() => toggleModal()}
            on:keydown={(e) => (e.key === 'Enter' || e.key === ' ' ? toggleModal() : null)}
            role="button"
            tabindex="0"
        >
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div id="modal" transition:fly={{ duration: 150, y: 20 }} on:click|stopPropagation on:keydown|stopPropagation role="dialog" tabindex="-1">
                <div class="top">
                    <div class="tabsContainer">
                        <div class="tabs">
                            <button on:click={() => toggleModalTab('about')} class={modalTab === 'about' ? 'active' : ''}>About</button>
                            <button on:click={() => toggleModalTab('keyboard')} class={modalTab === 'keyboard' ? 'active' : ''}>Keyboard shortcuts</button>
                            <button on:click={() => toggleModalTab('colophon')} class={modalTab === 'colophon' ? 'active' : ''}>Colophon</button>
                        </div>
                        <div class="shadow"></div>
                    </div>
                    <button class="closeButton" on:click={() => toggleModal()}><Icon name="close" /></button>
                </div>
                <div class="content">
                    {#if modalTab === 'about'}
                        <div class="aboutContent">
                            <div class="aboutGif"></div>
                            <div class="textContainer">
                                <p><b>Mockbox</b> is a drag-and-drop web tool for visualizing 3D box-shaped objects.</p>
                                <!-- <p>Use Mockbox to:</p>
                                <ul>
                                    <li>Rapidly prototype during design exploration</li>
                                    <li>Export quick renders for presentations</li>
                                    <li>Record animations for portfolios or social media</li>
                                </ul> -->
                            </div>
                            <div class="textContainer">
                                <h1>How to use Mockbox</h1>
                                <p>
                                    Start by adding textures to your box by <b>drag-and-dropping</b> (or manually upload via the face selection window) images onto a face. By default, the cube will
                                    <b>automatically scale</b> to match your texture’s aspect ratio, but you can also adjust this manually.
                                </p>
                                <p>
                                    Customize your scene by adjusting <b>environment settings</b> like background, lighting, and FOV, and experiment with <b>animation settings</b> such as rotation axis,
                                    speed, and easing.
                                </p>
                                <p>
                                    Once you're ready, click the <b>download</b> button to download a still image, or press <b>play</b> and screen-record your screen for a looping animation.
                                </p>
                            </div>
                            <div class="textContainer">
                                <h1>Contact</h1>
                                <p>For questions and inquiries, please contact <a target="_blank" href="mailto:hey@ndrewgood.com">hey@ndrewgood.com</a></p>
                                <p class="caption">
                                    Mockbox is released under the terms of the MIT License, which grants broad permissions to use, modify, and distribute the software, including for commercial
                                    purposes.
                                </p>
                            </div>
                        </div>
                    {/if}
                    {#if modalTab === 'keyboard'}
                        <div class="keyboardContent">
                            <div class="keyboardRow">
                                <p>Play/pause animation</p>
                                <div class="action"><div class="key"><span>A</span></div></div>
                            </div>
                            <div class="keyboardRow">
                                <p>Download screenshot</p>
                                <div class="action"><div class="key"><span>D</span></div></div>
                            </div>

                            <div class="keyboardRow">
                                <p>Collapse/expand sidebar</p>
                                <div class="action"><div class="key"><span>C</span></div></div>
                            </div>
                            <div class="keyboardRow">
                                <p>Reset camera</p>
                                <div class="action"><div class="key"><span>R</span></div></div>
                            </div>
                            <div class="keyboardRow">
                                <p>Randomize mockup</p>
                                <div class="action"><div class="key"><span>`</span></div></div>
                            </div>
                            <div class="keyboardRow">
                                <p>Remove selected texture</p>
                                <div class="action"><div class="key"><span>Delete</span></div></div>
                            </div>
                            <div class="keyboardRow">
                                <p>Rotate camera</p>
                                <div class="action">Drag</div>
                            </div>
                            <div class="keyboardRow">
                                <p>Zoom in/out</p>
                                <div class="action">Pinch or Scroll</div>
                            </div>
                            <div class="keyboardRow">
                                <p>Move camera position</p>
                                <div class="action">
                                    <div class="key"><span>Shift</span></div>
                                    + [drag]
                                </div>
                            </div>
                        </div>
                    {/if}
                    {#if modalTab === 'colophon'}
                        <div class="colophonContent">
                            <div class="colophonRow">
                                <p>Design and Development:</p>
                                <p><a target="_blank" href="https://ndrewgood.com">Andrew Goodridge</a></p>
                            </div>
                            <div class="colophonRow">
                                <p>Stack:</p>
                                <p><a target="_blank" href="https://svelte.dev">Svelte</a> and <a target="_blank" href="https://threejs.org">Three.js</a></p>
                            </div>
                            <div class="colophonRow">
                                <p>Fonts:</p>
                                <p>
                                    <a target="_blank" href="https://www.bnicks.com/shop/p/gamma">BN Gamma</a>,
                                    <a target="_blank" href="https://fonts.google.com/specimen/Libre+Franklin">Libre Franklin</a>,
                                    <a target="_blank" href="https://fonts.google.com/specimen/Spline+Sans+Mono">Spline Sans Mono</a>
                                </p>
                            </div>
                            <div class="colophonRow">
                                <p>Icons:</p>
                                <p><a target="_blank" href="https://v1.heroicons.com/">Heroicons v1</a></p>
                            </div>
                            <p class="caption">
                                Shout out to <a target="_blank" href="https://marco.land/">Marco Land</a> who I recently found out made
                                <a target="_blank" href="https://bookup.marco.land/">a similar tool</a> for books in 2018!
                            </p>
                        </div>
                    {/if}
                </div>
            </div>
        </div>
    {/if}
    <ControlPanel />
    <ThreeCanvas />
    <div id="mobileTitle">
        <div class="left">
            <button class="menuButton" on:click={() => togglePanelExpansion()}><Icon name="menu" /></button>
            <div id="lottieContainer">
                <div id="lottieMobile" bind:this={lottieMobileContainer}></div>
            </div>
        </div>
        <button class="infoButton" on:click={() => toggleModal()}><Icon name="info" /></button>
    </div>
</section>

<style>
    :global(body) {
        margin: 0;
        overflow: hidden;
    }

    :global(:root) {
        --hl-400: #ebefff;
        --hl-primary: #d7dbee; /* UI text */
        --hl-600: #cad3f2;
        --hl-700: #bbc4e2;
        --hl-800: #a8b0cc;

        --bg-200: #4a4c59; /* Selection highlight border */
        --bg-300: #41434e; /* Selection button hover */
        --bg-400: #383a43; /* selection background, group border */
        --bg-450: #33353d; /* input backgrounds */
        --bg-primary: #2f3138; /* UI background */
        --bg-550: #2b2c33; /* expanded panel background */
        --bg-600: #26272c; /* button backgrounds */
        --bg-700: #1b1c22; /* active/hover button background */

        --bg-primary-20: rgba(47, 49, 56, 0.2);

        --hl-primary-10: rgba(215, 219, 238, 0.1);
        --hl-primary-20: rgba(215, 219, 238, 0.2);
        --hl-primary-30: rgba(215, 219, 238, 0.3);
        --hl-primary-50: rgba(215, 219, 238, 0.5);

        --bg-400-50: rgba(56, 58, 67, 0.5);

        --p-primary: #adb1bd;

        --layout-easing: cubic-bezier(0.645, 0.045, 0.355, 1);

        --tab-easing: cubic-bezier(0.645, 0.045, 0.355, 1);
        --group-easing: cubic-bezier(0.17, 0.45, 0.11, 0.9);
    }

    section {
        margin: 0;
        display: flex;
        flex-direction: row;
    }

    #mobileTitle {
        display: none;
        padding: 12px 16px 0px 16px;
        background-color: var(--bg-primary);

        justify-content: space-between;
        align-items: center;
    }

    #mobileTitle .left {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    #lottieContainer {
        width: 210px;
        margin-top: 5px;
    }

    .infoButton,
    .menuButton {
        border: none;
        border-radius: 8px;
        background: none;
        transition: 0.2s;
        cursor: pointer;
        padding: 6px;
        display: flex;
    }

    .infoButton:hover {
        background-color: var(--bg-400);
    }

    .infoButton:active {
        background-color: var(--bg-200);
    }

    #modalContainer {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(6px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    #modal {
        background-color: var(--bg-primary);
        padding: 24px;
        border-radius: 16px;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 1px solid var(--bg-700);
        color: var(--hl-primary);
        width: 600px;
        max-width: calc(100vw - 88px);
        height: 520px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    #modal .top {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 24px;
    }

    .closeButton {
        display: flex;
        outline: none;
        border: none;
        background: none;
        cursor: pointer;
        transition: background-color 0.2s;
        padding: 6px;
        border-radius: 8px;
    }

    .closeButton:hover {
        background-color: var(--bg-400);
    }

    .closeButton:active {
        background-color: var(--bg-200);
    }

    .tabsContainer {
        position: relative;
        height: 100%;
        width: 100%;
        z-index: 8;
        overflow: hidden;
    }

    .tabs {
        display: flex;
        flex-direction: row;
        gap: 8px;
        overflow-x: auto;
        padding-right: 16px;
        -ms-overflow-style: none;
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .tabs button {
        display: flex;
        outline: none;
        border: none;
        background: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        color: var(--hl-primary);
        cursor: pointer;
        white-space: nowrap;
        transition: opacity 0.2s;
        opacity: 0.5;
    }

    .tabs button:hover {
        opacity: 1;
    }

    .tabs button.active {
        opacity: 1;
        display: flex;
        outline: none;
        border: none;
        background: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-size: 14px;
        z-index: 0;
        background: var(--hl-primary);
        border-bottom: 2px solid var(--bg-primary-20);
        box-shadow: 0 0px 2px 1px var(--hl-primary-10);
        color: var(--bg-primary);
        cursor: pointer;
        white-space: nowrap;
    }

    .tabs button.active:hover {
        box-shadow: 0 0px 2px 1px var(--hl-primary-30);
    }

    .tabsContainer .shadow {
        position: absolute;
        background: linear-gradient(-90deg, var(--bg-primary) 0%, transparent 100%);
        height: 100%;
        width: 16px;
        right: 0;
        top: 0;
        z-index: 10;
        pointer-events: none;
    }

    .content {
        font-size: 15px;
        color: var(--p-primary);
        line-height: 1.5;
        height: 100%;
        overflow: scroll;
        -ms-overflow-style: none;
        scrollbar-width: none;
        &::-webkit-scrollbar {
            display: none;
        }
    }

    .aboutContent {
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        max-width: 500px;
        margin: auto;
        margin-top: 12px;
        padding-bottom: 32px;
    }

    .aboutContent ul {
        margin-top: 4px;
    }

    .aboutGif {
        height: 250px;
        width: 100%;
        background-color: var(--bg-700);
        border-radius: 16px;
    }

    .textContainer {
        width: 100%;
    }

    .textContainer b {
        color: var(--hl-primary);
        font-weight: 600;
    }

    .textContainer h1 {
        font-size: 16px;
        font-weight: 600;
        color: var(--hl-primary);
        margin-block-start: 0.2em;
    }

    .textContainer a {
        color: var(--hl-primary);
        text-decoration: underline;
    }

    .caption {
        font-size: 12px;
        font-weight: 500;
        color: var(--p-primary);
        opacity: 0.6;
    }

    .caption a {
        color: var(--hl-primary);
        text-decoration: underline;
    }

    .keyboardContent {
        width: 100%;
        max-width: 400px;
        margin: auto;
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        width: 100%;
        padding-bottom: 32px;
    }

    .keyboardRow {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
    }

    .keyboardRow p {
        font-weight: 500;
        margin-block-start: 0.5em;
        margin-block-end: 0.5em;
    }

    .keyboardRow .action {
        margin: auto 0;
        display: flex;
        flex-direction: row;
        gap: 6px;
    }

    .keyboardRow .action .key {
        padding: 3px 1.5px 6px;
        border-radius: 6px;
        background-color: var(--bg-700);
    }

    .keyboardRow .action span {
        font-weight: 500;
        font-family: 'Spline Sans Mono', monospace;
        padding: 4px 6px;
        border-radius: 4px;
        background-color: var(--bg-300);
        color: var(--hl-primary);
    }

    .colophonContent {
        width: 100%;
        max-width: 400px;
        margin: auto;
        margin-top: 12px;
        display: flex;
        flex-direction: column;
        gap: 24px;
        width: 100%;
        padding-top: 12px;
        padding-bottom: 32px;
    }

    .colophonRow {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 8px;
    }

    .colophonRow p {
        margin-block-start: 0.1em;
        margin-block-end: 0.1em;
        font-size: 15px;
    }

    .colophonRow p:first-child {
        font-weight: 500;
        /* font-size: 13px; */
    }

    .colophonRow p a {
        color: var(--hl-primary);
        text-decoration: underline;
    }

    @media (max-width: 600px) {
        section {
            flex-direction: column-reverse;
        }
        #mobileTitle {
            display: flex;
        }

        .colophonRow {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
        }
    }
</style>

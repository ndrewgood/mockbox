<script>
    import '../styles.css';
</script>

<svelte:head>
    <title>Mockbox</title>
    <meta name="description" content="Mockbox is a drag-and-drop web tool for visualizing 3D box-shaped objects." />

    <!-- Viewport for responsive design -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- Character encoding -->
    <meta charset="UTF-8" />

    <!-- Open Graph tags for social media -->
    <meta property="og:title" content="Mockbox" />
    <meta property="og:description" content="Mockbox is a drag-and-drop web tool for visualizing 3D box-shaped objects." />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://mockbox.app" />
    <!-- Update with your actual URL -->
    <meta property="og:image" content="https://mockbox.app/og_image.png" />
    <!-- Add your OG image -->

    <!-- Favicon -->
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

<slot />

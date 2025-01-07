<script>
    // @ts-nocheck

    import { onMount } from 'svelte';
    import { globalData, geometryData, environmentData, materialData, exportData, animationData, bgImage } from './database';
    import { getGeoShape, mapNum } from './utils';

    import * as THREE from 'three';
    import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
    import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
    import { Wireframe } from 'three/addons/lines/Wireframe.js';
    import { WireframeGeometry2 } from 'three/addons/lines/WireframeGeometry2.js';
    import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';

    import placeholderBack from '$lib/images/placeholder_back.png';
    import placeholderBottom from '$lib/images/placeholder_bottom.png';
    import placeholderFront from '$lib/images/placeholder_front.png';
    import placeholderLeft from '$lib/images/placeholder_left.png';
    import placeholderRight from '$lib/images/placeholder_right.png';
    import placeholderTop from '$lib/images/placeholder_top.png';
    import bedroomEnv from '$lib/images/bedroom.hdr';
    import { exampleGroups, exampleTextures } from './exampleTextures';

    let canvasElement, canvasContainerElement;
    let handleDrop, handleMouseEvent, handleKeyDown;
    let lastMouseDown,
        intersected = null;
    let mouseDragStatus,
        mouseDownStatus = false;
    let animateNum = 0;
    let renderer;
    let loadEnvironmentMap;

    const faceData = [
        {
            label: 'right',
            normal: {
                x: 1,
                y: 0,
                z: 0,
            },
            placeholder: placeholderRight,
        },
        {
            label: 'left',
            normal: {
                x: -1,
                y: 0,
                z: 0,
            },
            placeholder: placeholderLeft,
        },
        {
            label: 'top',
            normal: {
                x: 0,
                y: 1,
                z: 0,
            },
            placeholder: placeholderTop,
        },
        {
            label: 'bottom',
            normal: {
                x: 0,
                y: -1,
                z: 0,
            },
            placeholder: placeholderBottom,
        },
        {
            label: 'front',
            normal: {
                x: 0,
                y: 0,
                z: 1,
            },
            placeholder: placeholderFront,
        },
        {
            label: 'back',
            normal: {
                x: 0,
                y: 0,
                z: -1,
            },
            placeholder: placeholderBack,
        },
    ];

    let randomTextureNum = Math.floor(Math.random() * exampleGroups.length);

    onMount(async () => {
        // Start of onMount
        performance.mark('three-mount-start');

        let camera, scene, cube, controls, loader, raycaster, testTex1, cubeMaterials, cubeTextures, selectedFace, matLine, envMap, directionalLight;
        let selectedPlanesDir = [];
        let selectedPlanesGroup, hoverPlanesGroup;
        let hoverPlaneMesh,
            hoverPlaneStatus = null;

        const mouse = new THREE.Vector2();

        let findFace = (face) => {
            return face.label == selectedFace.label;
        };

        let width = canvasContainerElement.clientWidth;
        let height = canvasContainerElement.clientHeight;

        const init = () => {
            // Start of init
            performance.mark('three-init-start');

            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 300);
            camera.position.z = 6;
            camera.position.x = 6;
            camera.position.y = 2;
            camera.fov = $environmentData.cameraFov.value;

            renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasElement });
            renderer.setSize(width, height);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.setClearColor(0x000000, 0);
            THREE.ColorManagement.enabled = true;

            raycaster = new THREE.Raycaster();

            let geometry = new THREE.BoxGeometry();
            geometry = geometry.toNonIndexed();

            // Before texture loading
            performance.mark('texture-load-start');

            loader = new THREE.TextureLoader();
            cubeTextures = [
                loader.load(placeholderRight),
                loader.load(placeholderLeft),
                loader.load(placeholderTop),
                loader.load(placeholderBottom),
                loader.load(placeholderFront),
                loader.load(placeholderBack),
            ];

            // After texture loading
            performance.mark('texture-load-end');
            performance.measure('Texture Loading', 'texture-load-start', 'texture-load-end');

            for (let i = 0; i < cubeTextures.length; i++) {
                cubeTextures[i].colorSpace = THREE.SRGBColorSpace;
            }

            cubeMaterials = [
                new THREE.MeshBasicMaterial({ map: cubeTextures[0] }), //right side
                new THREE.MeshBasicMaterial({ map: cubeTextures[1] }), //left side
                new THREE.MeshBasicMaterial({ map: cubeTextures[2] }), //top side
                new THREE.MeshBasicMaterial({ map: cubeTextures[3] }), //bottom side
                new THREE.MeshBasicMaterial({ map: cubeTextures[4] }), //front side
                new THREE.MeshBasicMaterial({ map: cubeTextures[5] }), //back side
            ];

            cube = new THREE.Mesh(geometry, cubeMaterials);

            directionalLight = new THREE.DirectionalLight(0xffffff, $environmentData.spotlightIntensity.value);
            directionalLight.position.set(4, 3, 3); // Top middle position
            scene.add(directionalLight);

            // Increase ambient light intensity
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
            scene.add(ambientLight);

            scene.add(cube);

            selectedPlanesGroup = new THREE.Group();
            scene.add(selectedPlanesGroup);

            hoverPlanesGroup = new THREE.Group();
            scene.add(hoverPlanesGroup);

            matLine = new LineMaterial({
                color: 0x4080ff,
                linewidth: 6, // in pixels
                //resolution:  // to be set by renderer, eventually
                dashed: false,
            });

            controls = new OrbitControls(camera, renderer.domElement);
            controls;
            controls.update();

            loadEnvironmentMap = async () => {
                // Load environment map in background
                try {
                    const texture = await new RGBELoader()
                        .setDataType(THREE.HalfFloatType) // Optimize memory usage
                        .loadAsync(bedroomEnv);

                    // Process in smaller chunks using requestAnimationFrame
                    requestAnimationFrame(() => {
                        texture.mapping = THREE.EquirectangularReflectionMapping;
                        renderer.toneMappingExposure = 2.5;
                        envMap = texture;

                        // Update materials gradually if needed
                        if ($environmentData.glossy.value) {
                            cubeMaterials.forEach((material, index) => {
                                requestAnimationFrame(() => {
                                    setCubeMaterialsGlossy(material);
                                });
                            });
                        }
                    });
                } catch (error) {
                    console.error('Error loading environment map:', error);
                }
            };

            // End of init
            performance.mark('three-init-end');
            performance.measure('Three.js Initialization', 'three-init-start', 'three-init-end');
        };

        let offsetGapHover = 0.01;

        let addPlane = (face, state) => {
            let plane, offsetGap;

            const geometry = new THREE.PlaneGeometry(1, 1);
            const material = new THREE.MeshBasicMaterial({
                color: 0x4080ff,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.4,
            });
            const wireframeGeometry = new WireframeGeometry2(geometry);

            if (state == 'selected') {
                offsetGap = offsetGapHover;
                selectedPlanesGroup.clear();
                selectedPlanesDir = [];
                plane = new Wireframe(wireframeGeometry, matLine);
                plane.computeLineDistances();
            }

            if (state == 'hover') {
                offsetGap = 0.001;
                if (hoverPlaneStatus !== null) {
                    hoverPlanesGroup.clear();
                    // scene.remove(hoverPlaneMesh);
                    // hoverPlaneMesh.geometry.dispose();
                    // hoverPlaneMesh.material.dispose();
                    // hoverPlaneMesh = null;
                }
                if ($exportData.hideCursorOverlay.value) {
                    material.opacity = 0;
                }
                plane = new THREE.Mesh(geometry, material);
            }

            plane.scale.set(1, 1, 1);

            let offset = 0.5 + offsetGap;

            if (face == 'front') {
                plane.position.z = offset;
            }
            if (face == 'back') {
                plane.position.z = -offset;
            }
            if (face == 'top') {
                plane.rotation.x = Math.PI / 2;
                plane.position.y = offset;
            }
            if (face == 'right') {
                plane.rotation.y = Math.PI / 2;
                plane.position.x = offset;
            }
            if (face == 'left') {
                plane.rotation.y = Math.PI / 2;
                plane.position.x = -offset;
            }
            if (face == 'bottom') {
                plane.rotation.x = Math.PI / 2;
                plane.position.y = -offset;
            }

            if (state == 'selected') {
                selectedPlanesDir.push(face);
                selectedPlanesGroup.add(plane);
            }

            if (state == 'hover') {
                hoverPlanesGroup.add(plane);
            }
        };

        let handlePlaneScaling = (plane, face, offsetGap) => {
            if (face == 'front') {
                plane.scale.set($geometryData.scale.value.width, $geometryData.scale.value.height, 0);
                plane.position.z = $geometryData.scale.value.depth / 2 + offsetGap;
            }
            if (face == 'back') {
                plane.scale.set($geometryData.scale.value.width, $geometryData.scale.value.height, 0);
                plane.position.z = -$geometryData.scale.value.depth / 2 - offsetGap;
            }
            if (face == 'top') {
                plane.scale.set($geometryData.scale.value.width, $geometryData.scale.value.depth, 0);
                plane.position.y = $geometryData.scale.value.height / 2 + offsetGap;
            }
            if (face == 'right') {
                plane.scale.set($geometryData.scale.value.depth, $geometryData.scale.value.height, 0);
                plane.position.x = $geometryData.scale.value.width / 2 + offsetGap;
            }
            if (face == 'left') {
                plane.scale.set($geometryData.scale.value.depth, $geometryData.scale.value.height, 0);
                plane.position.x = -$geometryData.scale.value.width / 2 - offsetGap;
            }
            if (face == 'bottom') {
                plane.scale.set($geometryData.scale.value.width, $geometryData.scale.value.depth, 0);
                plane.position.y = -$geometryData.scale.value.height / 2 - offsetGap;
            }
        };

        let updatePlanes = () => {
            for (let i = 0; i < selectedPlanesDir.length; i++) {
                let face = selectedPlanesDir[i];
                let plane = selectedPlanesGroup.children[i];
                handlePlaneScaling(plane, face, offsetGapHover);
            }
            if (hoverPlanesGroup.children.length > 0) {
                handlePlaneScaling(hoverPlanesGroup.children[0], hoverPlaneStatus, 0.001);
            }
        };

        function removeTexture(index) {
            for (let i = 0; i < selectedPlanesDir.length; i++) {
                $materialData[index].image = null;
                $materialData[index].mirrorHorizontal = false;
                $materialData[index].mirrorVertical = false;
                $materialData[index].rotation = 0;
                $materialData[index].scaleX = 0;
                $materialData[index].scaleY = 0;
                let placeholderTex = loader.load(faceData[index].placeholder);
                placeholderTex.minFilter = THREE.NearestFilter;
                placeholderTex.magFilter = THREE.NearestFilter;
                placeholderTex.colorSpace = THREE.SRGBColorSpace;
                cubeTextures[index] = placeholderTex;
                cubeMaterials[index].map = placeholderTex;
            }
        }

        function uploadTexture(textureData, label, randomTextureUpload = false) {
            if (!textureData || (!selectedFace && !randomTextureUpload)) return;

            const faceIndex = $materialData.findIndex((f) => f.label == label);
            if (faceIndex === -1) return;
            console.log('label: ' + label);

            if (textureData.type === 'url') {
                // Handle texture library images (direct URLs)

                console.log(textureData);

                const newTex = new THREE.TextureLoader().load(textureData.url);
                newTex.minFilter = THREE.NearestFilter;
                newTex.magFilter = THREE.NearestFilter;
                newTex.colorSpace = THREE.SRGBColorSpace;

                $materialData[faceIndex].scaleX = 0;
                $materialData[faceIndex].scaleY = 0;
                cubeTextures[faceIndex] = newTex;
                cubeMaterials[faceIndex].map = newTex;

                let img = new Image();
                img.src = textureData.url;
                $materialData[faceIndex].image = img;

                if (!randomTextureUpload) {
                    img.onload = function () {
                        let newShape = getGeoShape(
                            $materialData.find((f) => f.label == label),
                            $materialData,
                            $geometryData,
                            false
                        );
                        $geometryData.scale.value.width = newShape.width;
                        $geometryData.scale.value.height = newShape.height;
                        $geometryData.scale.value.depth = newShape.depth;
                    };
                }
            } else {
                // Handle file uploads

                var reader = new FileReader();

                reader.onload = function (event) {
                    var dataUrl = event.target.result;
                    var newTex = new THREE.TextureLoader().load(dataUrl);
                    newTex.minFilter = THREE.NearestFilter;
                    newTex.magFilter = THREE.NearestFilter;
                    newTex.colorSpace = THREE.SRGBColorSpace;

                    console.log(textureData);

                    $materialData[faceIndex].scaleX = 0;
                    $materialData[faceIndex].scaleY = 0;
                    cubeTextures[faceIndex] = newTex;
                    cubeMaterials[faceIndex].map = newTex;

                    let img = new Image();
                    img.src = dataUrl;
                    $materialData[faceIndex].image = img;
                };

                reader.onloadend = function () {
                    let newShape = getGeoShape(
                        $materialData.find((f) => f.label == label),
                        $materialData,
                        $geometryData,
                        false
                    );
                    $geometryData.scale.value.width = newShape.width;
                    $geometryData.scale.value.height = newShape.height;
                    $geometryData.scale.value.depth = newShape.depth;
                };

                reader.readAsDataURL(textureData);
            }
        }

        handleKeyDown = (e) => {
            // Delete = Remove texture
            if (e.keyCode == 8 && selectedPlanesDir.length !== 0 && e.target.nodeName == 'BODY') {
                for (let i = 0; i < selectedPlanesDir.length; i++) {
                    let index = faceData.findIndex((face) => face.label == selectedPlanesDir[i]);
                    removeTexture(index);
                }
            }
            // "A" = Play animation
            if (e.keyCode == 65) {
                $animationData.animate.value = !$animationData.animate.value;
            }

            // "D" = Download screenshot
            if (e.keyCode == 68) {
                $exportData.download = true;
            }

            // "C" = Expand/collapse panel
            if (e.keyCode == 67) {
                $globalData.panelTransitioning = true;
                $globalData.panelExpanded = !$globalData.panelExpanded;
                setTimeout(() => {
                    $globalData.panelTransitioning = false;
                }, 450);
            }

            // "R" = Reset camera
            if (e.keyCode == 82) {
                $animationData.cameraReset = true;
                if (!$animationData.animate.value) {
                    $animationData.animateReset = true;
                }
            }

            // "`" = Random mock up
            if (e.keyCode == 192) {
                assignRandomMock(exampleGroups[Math.floor(Math.random() * exampleGroups.length)]);
            }
        };

        const assignRandomMock = (group) => {
            let mockGroup = exampleTextures[randomTextureNum];

            const rightData = {
                type: 'url',
                url: mockGroup.right.url,
                width: mockGroup.right.width,
                height: mockGroup.right.height,
            };
            const leftData = {
                type: 'url',
                url: mockGroup.left.url,
                width: mockGroup.left.width,
                height: mockGroup.left.height,
            };
            const topData = {
                type: 'url',
                url: mockGroup.top.url,
                width: mockGroup.top.width,
                height: mockGroup.top.height,
            };
            const bottomData = {
                type: 'url',
                url: mockGroup.bottom.url,
                width: mockGroup.bottom.width,
                height: mockGroup.bottom.height,
            };
            const frontData = {
                type: 'url',
                url: mockGroup.front.url,
                width: mockGroup.front.width,
                height: mockGroup.front.height,
            };
            const backData = {
                type: 'url',
                url: mockGroup.back.url,
                width: mockGroup.back.width,
                height: mockGroup.back.height,
            };

            uploadTexture(rightData, 'right', true);
            $materialData[0].uploaded = rightData;
            uploadTexture(leftData, 'left', true);
            $materialData[1].uploaded = leftData;
            uploadTexture(topData, 'top', true);
            $materialData[2].uploaded = topData;
            uploadTexture(bottomData, 'bottom', true);
            $materialData[3].uploaded = bottomData;
            uploadTexture(frontData, 'front', true);
            $materialData[4].uploaded = frontData;
            uploadTexture(backData, 'back', true);
            $materialData[5].uploaded = backData;

            $environmentData.cameraFov.value = mockGroup.fov;

            $geometryData.scale.value.width = mockGroup.width;
            $geometryData.scale.value.height = mockGroup.height;
            $geometryData.scale.value.depth = mockGroup.depth;

            console.log(mockGroup);
            randomTextureNum == exampleGroups.length - 1 ? (randomTextureNum = 0) : randomTextureNum++;
        };

        const rotateX = (num) => {
            cube.rotation.x = num;
            if (selectedPlanesGroup) {
                selectedPlanesGroup.rotation.x = cube.rotation.x;
            }
            if (hoverPlanesGroup) {
                hoverPlanesGroup.rotation.x = cube.rotation.x;
            }
        };

        const rotateY = (num) => {
            cube.rotation.y = num;
            if (selectedPlanesGroup) {
                selectedPlanesGroup.rotation.y = cube.rotation.y;
            }
            if (hoverPlanesGroup) {
                hoverPlanesGroup.rotation.y = cube.rotation.y;
            }
        };

        const rotateZ = (num) => {
            cube.rotation.z = num;
            if (selectedPlanesGroup) {
                selectedPlanesGroup.rotation.z = cube.rotation.z;
            }
            if (hoverPlanesGroup) {
                hoverPlanesGroup.rotation.z = cube.rotation.z;
            }
        };

        materialData.subscribe((data) => {
            for (let i = 0; i < selectedPlanesDir.length; i++) {
                let index = faceData.findIndex((face) => face.label == selectedPlanesDir[i]);
                // Trash -> remove texture
                if (data[index].removed == true) {
                    removeTexture(index);
                    data[index].removed = false;
                }

                // upload texture
                if (data[index].uploaded !== null) {
                    uploadTexture(data[index].uploaded, data[index].label);
                    data[index].uploaded = null;
                }
            }
            // Reset camera
            if ($animationData.cameraReset) {
                console.log('heard!');
                controls.reset();
                $animationData.cameraReset = false;
            }
        });

        let lastSpotlight = $environmentData.spotlight.value;
        let lastGlossy = $environmentData.glossy.value;
        let lastCameraFov = $environmentData.cameraFov.value;
        let lastSpotlightAngle = $environmentData.spotlightAngle.value;
        let lastCameraDefaultPosition = $environmentData.cameraDefaultPosition.value;

        let setCubeMaterialsGlossy = (material) => {
            material.envMap = envMap;
            material.shininess = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 20);
            material.envMapIntensity = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 0.2);
            material.needsUpdate = true;
            material.reflectivity = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 0.2);
            material.combine = THREE.MixOperation;
        };

        let setCubeMaterialsNoGlossy = (material) => {
            material.envMap = null;
            material.shininess = 0;
            material.envMapIntensity = 0.2;
            material.needsUpdate = false;
            material.reflectivity = 0;
        };

        environmentData.subscribe((data) => {
            if ($environmentData.spotlight.value !== lastSpotlight) {
                if ($environmentData.spotlight.value) {
                    lastSpotlight = $environmentData.spotlight.value;
                    cubeMaterials = [
                        new THREE.MeshPhongMaterial({ map: cubeTextures[0] }), //right side
                        new THREE.MeshPhongMaterial({ map: cubeTextures[1] }), //left side
                        new THREE.MeshPhongMaterial({ map: cubeTextures[2] }), //top side
                        new THREE.MeshPhongMaterial({ map: cubeTextures[3] }), //bottom side
                        new THREE.MeshPhongMaterial({ map: cubeTextures[4] }), //front side
                        new THREE.MeshPhongMaterial({ map: cubeTextures[5] }), //back side
                    ];
                    if ($environmentData.glossy.value) {
                        cubeMaterials.forEach(setCubeMaterialsGlossy);
                    }
                    cube.material = cubeMaterials;
                } else {
                    lastSpotlight = $environmentData.spotlight.value;
                    cubeMaterials = [
                        new THREE.MeshBasicMaterial({ map: cubeTextures[0] }), //right side
                        new THREE.MeshBasicMaterial({ map: cubeTextures[1] }), //left side
                        new THREE.MeshBasicMaterial({ map: cubeTextures[2] }), //top side
                        new THREE.MeshBasicMaterial({ map: cubeTextures[3] }), //bottom side
                        new THREE.MeshBasicMaterial({ map: cubeTextures[4] }), //front side
                        new THREE.MeshBasicMaterial({ map: cubeTextures[5] }), //back side
                    ];
                    if ($environmentData.glossy.value) {
                        cubeMaterials.forEach(setCubeMaterialsGlossy);
                    }
                    cube.material = cubeMaterials;
                }
            }
            if ($environmentData.glossy.value !== lastGlossy) {
                loadEnvironmentMap();
                if ($environmentData.glossy.value) {
                    cubeMaterials.forEach(setCubeMaterialsGlossy);
                    cube.material = cubeMaterials;
                } else {
                    cubeMaterials.forEach(setCubeMaterialsNoGlossy);
                    cube.material = cubeMaterials;
                }
                lastGlossy = $environmentData.glossy.value;
            }
            if ($environmentData.spotlightAngle.value !== lastSpotlightAngle) {
                lastSpotlightAngle = $environmentData.spotlightAngle.value;
                if (lastSpotlightAngle == 'Top') {
                    directionalLight.position.set(0, 5, 0);
                }
                if (lastSpotlightAngle == 'Top Right') {
                    directionalLight.position.set(5, 5, 0);
                }
                if (lastSpotlightAngle == 'Right') {
                    directionalLight.position.set(5, 0, 0);
                }
                if (lastSpotlightAngle == 'Front') {
                    directionalLight.position.set(0, 0, 5);
                }
                if (lastSpotlightAngle == 'Top Front') {
                    directionalLight.position.set(0, 5, 5);
                }
            }
            if ($environmentData.cameraFov.value !== lastCameraFov) {
                lastCameraFov = $environmentData.cameraFov.value;

                // Use current values instead of fixed base values
                const currentFOV = camera.fov;
                const currentDist = camera.position.length();

                // Calculate scale based on current values
                const scale = Math.tan((currentFOV / 2) * (Math.PI / 180)) / Math.tan(($environmentData.cameraFov.value / 2) * (Math.PI / 180));

                // Store the current camera direction
                const dir = camera.position.clone().normalize();

                // Update camera position using current distance
                camera.position.copy(dir.multiplyScalar(currentDist * scale));

                // Update FOV
                camera.fov = $environmentData.cameraFov.value;
                camera.updateProjectionMatrix();

                // Reset controls target to origin and update
                controls.target.set(0, 0, 0);
                controls.update();
            }
            if ($environmentData.cameraDefaultPosition.value !== lastCameraDefaultPosition) {
                lastCameraDefaultPosition = $environmentData.cameraDefaultPosition.value;
                if (lastCameraDefaultPosition == '45° Top-Right') {
                    camera.position.set(6, 2, 6);
                    controls.saveState();
                }
                if (lastCameraDefaultPosition == '45° Top-Left') {
                    camera.position.set(-6, 2, 6);
                    controls.saveState();
                }
                if (lastCameraDefaultPosition == 'Front') {
                    camera.position.set(0, 0, 6);
                    controls.saveState();
                }
                if (lastCameraDefaultPosition == 'Top') {
                    camera.position.set(0, 6, 0);
                    controls.saveState();
                }
                if (lastCameraDefaultPosition == 'Top-Front') {
                    camera.position.set(0, 2, 6);
                    controls.saveState();
                }
            }
        });

        animationData.subscribe((data) => {
            // Reset camera

            if ($animationData.cameraReset) {
                // Store current distance from camera to target
                const currentDist = camera.position.length();

                // Reset controls (this will reset camera position to default)
                controls.reset();

                // Get the new camera direction after reset
                const dir = camera.position.clone().normalize();

                // Set camera position to maintain original distance
                camera.position.copy(dir.multiplyScalar(currentDist));

                controls.update();
                $animationData.cameraReset = false;
            }

            if ($animationData.animateReset) {
                rotateX(0);
                rotateY(0);
                rotateZ(0);
                animateNum = 0;
                $animationData.animateReset = false;
            }
        });

        handleDrop = (e) => {
            // Prevent default behavior (Prevent file from being opened)
            e.preventDefault();
            if (intersected !== null) {
                uploadTexture(e.dataTransfer.files[0], selectedFace.label);
            }
        };

        handleMouseEvent = (event, type) => {
            event.preventDefault();

            // Get canvas bounds and DPR-adjusted size
            const rect = canvasElement.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // Calculate mouse position using physical pixels
            mouse.x = (((event.clientX - rect.left) * dpr) / canvasElement.width) * 2 - 1;
            mouse.y = -(((event.clientY - rect.top) * dpr) / canvasElement.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObjects([cube]);

            if (intersects.length > 0) {
                intersected = intersects[0];

                const intersectedFace = intersected.face;
                selectedFace = faceData.find((face) => {
                    return face.normal.x == intersectedFace.normal.x && face.normal.y == intersectedFace.normal.y && face.normal.z == intersectedFace.normal.z;
                });

                if (type == 'drop' || type == 'click') {
                    console.log('selectedFace:' + selectedFace.label);

                    if ($materialData.find(findFace).selected == false) {
                        addPlane(selectedFace.label, 'selected');
                    }

                    for (const mat in $materialData) {
                        $materialData[mat].selected = false;
                    }

                    $materialData.find(findFace).selected = true;
                }
                if (type == 'move') {
                    if (hoverPlaneStatus !== selectedFace.label) {
                        addPlane(selectedFace.label, 'hover');
                        hoverPlaneStatus = selectedFace.label;
                    }
                }
            } else {
                intersected = null;
                if (hoverPlaneStatus !== null) {
                    console.log('clear');
                    hoverPlanesGroup.clear();
                    // scene.remove(hoverPlaneMesh);
                    // hoverPlaneMesh.geometry.dispose();
                    // hoverPlaneMesh.material.dispose();
                    hoverPlaneMesh = null;
                    hoverPlaneStatus = null;
                }
                if (type == 'click') {
                    for (const mat in $materialData) {
                        $materialData[mat].selected = false;
                    }
                    selectedPlanesGroup.clear();
                    selectedPlanesDir = [];
                }
            }
        };

        let previousWidth = window.innerWidth;

        function onResize() {
            // Check if element exists before accessing properties
            if (!canvasContainerElement) return;

            width = canvasContainerElement.clientWidth;
            height = canvasContainerElement.clientHeight;

            // Check if browser window width crosses 600px threshold
            const wasWider = previousWidth > 600;
            const isWider = window.innerWidth > 600;

            if (wasWider !== isWider) {
                $globalData.panelExpanded = true;
            }

            previousWidth = window.innerWidth;

            // Only update camera and renderer if they exist
            if (camera && renderer) {
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            }
        }
        window.addEventListener('resize', onResize);

        let previousPanelState = $globalData.panelExpanded;

        globalData.subscribe((data) => {
            if (canvasContainerElement && camera && renderer && previousPanelState !== data.panelExpanded) {
                console.log('called!');
                previousPanelState = data.panelExpanded;

                // Initial resize
                onResize();

                // Continue resizing during the transition
                let startTime = performance.now();
                const transitionDuration = 500; // 500ms = 0.5s

                function updateDuringTransition() {
                    const currentTime = performance.now();
                    const elapsed = currentTime - startTime;

                    if (elapsed < transitionDuration) {
                        onResize();
                        requestAnimationFrame(updateDuringTransition);
                        render();
                    } else {
                        // Final resize after transition
                        onResize();
                        render();
                    }
                }

                requestAnimationFrame(updateDuringTransition);
            }
        });

        const render = () => {
            renderer.clear();
            renderer.render(scene, camera);
        };

        let currentAnimateType = $animationData.animateType.value;
        let currentSpeedType = $animationData.speedType.value;
        animationData.subscribe((data) => {
            if ($animationData.animateType.value !== currentAnimateType) {
                currentAnimateType = $animationData.animateType.value;
                animateNum = 0;
                rotateX(0);
                rotateY(0);
                rotateZ(0);
            }
            if ($animationData.speedType.value !== currentSpeedType) {
                currentSpeedType = $animationData.speedType.value;
                animateNum = 0;
                rotateX(0);
                rotateY(0);
                rotateZ(0);
            }
        });

        const cubicBezier = (t, x1, y1, x2, y2) => {
            // Clip input to 0-1 range
            t = Math.max(0, Math.min(1, t));

            // Calculate coefficients
            const cx = 3 * x1;
            const bx = 3 * (x2 - x1) - cx;
            const ax = 1 - cx - bx;

            const cy = 3 * y1;
            const by = 3 * (y2 - y1) - cy;
            const ay = 1 - cy - by;

            // Calculate the position using the Bezier formula
            const tSquared = t * t;
            const tCubed = tSquared * t;

            return ay * tCubed + by * tSquared + cy * t;
        };

        const eased = (n, type) => {
            const linearRatio = 0.2;
            const easeRatio = 0.8; // Could also be calculated as (1 - linearRatio)

            if (type == 'Linear') {
                return n;
            }
            if (type == 'Sine') {
                return linearRatio * n + easeRatio * (-(Math.cos(Math.PI * n) - 1) / 2);
            }
            if (type == 'Quad') {
                return linearRatio * n + easeRatio * (n < 0.5 ? 2 * n * n : 1 - Math.pow(-2 * n + 2, 2) / 2);
            }
            if (type == 'Cubic') {
                return linearRatio * n + easeRatio * (n < 0.5 ? 4 * n * n * n : (n - 1) * (2 * n - 2) * (2 * n - 2) + 1);
            }
            if (type == 'Quint') {
                return linearRatio * n + easeRatio * (n < 0.5 ? 16 * n * n * n * n * n : 1 - Math.pow(-2 * n + 2, 5) / 2);
            }
            if (type == 'Expo') {
                return linearRatio * n + easeRatio * (n === 0 ? 0 : n === 1 ? 1 : n < 0.5 ? Math.pow(2, 20 * n - 10) / 2 : (2 - Math.pow(2, -20 * n + 10)) / 2);
            }
        };

        const animate = () => {
            requestAnimationFrame(animate);

            controls.update();
            cube.scale.set($geometryData.scale.value.width, $geometryData.scale.value.height, $geometryData.scale.value.depth);
            updatePlanes();

            directionalLight.intensity = $environmentData.spotlightIntensity.value;

            // Update reflectivity for all materials if glossy is enabled
            if ($environmentData.glossy.value) {
                cubeMaterials.forEach((material) => {
                    material.shininess = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 20);
                    material.envMapIntensity = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 0.2);
                    material.reflectivity = mapNum($environmentData.glossyIntensity.value, 0, 20, 0, 0.2);
                    material.needsUpdate = true;
                });
            }

            camera.updateProjectionMatrix();

            for (const mat in $materialData) {
                if ($materialData[mat].selected) {
                    let currentTexture = cubeTextures[faceData.findIndex((i) => i.label == $materialData[mat].label)];
                    currentTexture.center = new THREE.Vector2(0.5, 0.5);
                    currentTexture.wrapS = THREE.RepeatWrapping;

                    if ($materialData[mat].image !== null) {
                        currentTexture.repeat.x = 1 - $materialData[mat].scaleX;
                        currentTexture.repeat.y = 1 - $materialData[mat].scaleY;
                    }

                    if (($materialData[mat].mirrorHorizontal && currentTexture.repeat?.x > 0) || ($materialData[mat].mirrorVertical && currentTexture.repeat?.y > 0)) {
                        if ($materialData[mat].mirrorHorizontal) {
                            currentTexture.repeat.x *= -1;
                        }
                        if ($materialData[mat].mirrorVertical) {
                            currentTexture.repeat.y *= -1;
                        }
                    } else if ((!$materialData[mat].mirrorHorizontal && currentTexture.repeat?.x < 0) || (!$materialData[mat].mirrorVertical && currentTexture.repeat?.y < 0)) {
                        if ($materialData[mat].mirrorHorizontal) {
                            currentTexture.repeat.x *= -1;
                        }
                        if ($materialData[mat].mirrorVertical) {
                            currentTexture.repeat.y *= -1;
                        }
                    }

                    cubeMaterials[faceData.findIndex((i) => i.label == $materialData[mat].label)].map = currentTexture;

                    let rotation = $materialData[mat].rotation % 4;

                    if (
                        (rotation == 0 && currentTexture.rotation !== 0) ||
                        (rotation == 1 && currentTexture.rotation !== -Math.PI / 2) ||
                        (rotation == 2 && currentTexture.rotation !== -Math.PI) ||
                        (rotation == 3 && currentTexture.rotation !== -(Math.PI / 2) * 3)
                    ) {
                        console.log('rotated');
                        currentTexture.center = new THREE.Vector2(0.5, 0.5);
                        currentTexture.rotation = rotation * -(Math.PI / 2);
                        if (rotation == 1 || rotation == 3) {
                            let newShape = getGeoShape($materialData[mat], $materialData, $geometryData, true);
                            $geometryData.scale.value.width = newShape.width;
                            $geometryData.scale.value.height = newShape.height;
                            $geometryData.scale.value.depth = newShape.depth;
                        } else {
                            let newShape = getGeoShape($materialData[mat], $materialData, $geometryData, false);
                            $geometryData.scale.value.width = newShape.width;
                            $geometryData.scale.value.height = newShape.height;
                            $geometryData.scale.value.depth = newShape.depth;
                        }
                    }
                }
            }

            if ($animationData.animate.value) {
                // Get direction from speed sign
                const direction = Math.sign($animationData.speed.value);
                let frameAmt = 1 * (Math.abs($animationData.speed.value) / 5000);

                // Add or subtract based on direction
                animateNum = (animateNum + frameAmt * direction) % 1;

                // Handle negative wraparound
                if (animateNum < 0) animateNum = 1 + animateNum;

                let easedNum = eased(animateNum, $animationData.speedType.value);

                if ($animationData.animateType.value == 'Full rotate Y') {
                    rotateY(easedNum * (Math.PI * 2));
                }
                if ($animationData.animateType.value == 'Full rotate X') {
                    rotateX(easedNum * (Math.PI * 2));
                }
                if ($animationData.animateType.value == 'Full rotate Z') {
                    rotateZ(easedNum * (Math.PI * 2));
                }
                if ($animationData.animateType.value == 'Half rotate Y') {
                    rotateY(easedNum * (Math.PI * 2));
                    if (easedNum > 0.5) {
                        rotateY(Math.PI * 2 - easedNum * (Math.PI * 2));
                    }
                }
                if ($animationData.animateType.value == 'Half rotate X') {
                    rotateX(easedNum * (Math.PI * 2));
                    if (easedNum > 0.5) {
                        rotateX(Math.PI * 2 - easedNum * (Math.PI * 2));
                    }
                }
                if ($animationData.animateType.value == 'Half rotate Z') {
                    rotateZ(easedNum * (Math.PI * 2));
                    if (easedNum > 0.5) {
                        rotateZ(Math.PI * 2 - easedNum * (Math.PI * 2));
                    }
                }
                if ($animationData.animateType.value == 'All') {
                    rotateX(easedNum * (Math.PI * 2));
                    rotateY(-easedNum * (Math.PI * 2));
                    rotateZ(easedNum * (Math.PI * 2));
                }
            }

            matLine.resolution.set(width, height);

            render();
            return () => window.removeEventListener('resize', onResize);
        };

        let downloadCount = 0;

        const downloadCanvasImage = () => {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvasElement.width;
            tempCanvas.height = canvasElement.height;
            const tempCtx = tempCanvas.getContext('2d');

            const createDownloadLink = (imageData) => {
                const link = document.createElement('a');
                const extension = $exportData.fileType.value.toLowerCase();
                const filename = `${$exportData.fileName.value}${downloadCount ? '_' + String(downloadCount).padStart(2, '0') : ''}.${extension}`;
                downloadCount++;

                link.download = filename;
                link.href = imageData;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };

            if ($bgImage) {
                const bgImg = new Image();
                bgImg.onload = () => {
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);

                    // Draw background image according to bgImageMode
                    if ($globalData.bgImageMode.value === 'Tile') {
                        const pattern = tempCtx.createPattern(bgImg, 'repeat');
                        tempCtx.fillStyle = pattern;
                        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
                    } else if ($globalData.bgImageMode.value === 'Cover') {
                        const scale = Math.max(tempCanvas.width / bgImg.width, tempCanvas.height / bgImg.height);
                        const width = bgImg.width * scale;
                        const height = bgImg.height * scale;
                        tempCtx.drawImage(bgImg, (tempCanvas.width - width) / 2, (tempCanvas.height - height) / 2, width, height);
                    } else if ($globalData.bgImageMode.value === 'Stretch') {
                        tempCtx.drawImage(bgImg, 0, 0, tempCanvas.width, tempCanvas.height);
                    }

                    // Render scene and combine with background
                    renderer.setClearColor(0x000000, 0);
                    renderer.render(scene, camera);
                    tempCtx.globalCompositeOperation = 'source-over';
                    tempCtx.drawImage(canvasElement, 0, 0);

                    const mimeType = $exportData.fileType.value === 'PNG' ? 'image/png' : 'image/jpeg';
                    const quality = mimeType === 'image/jpeg' ? 0.9 : undefined; // JPEG quality setting
                    createDownloadLink(tempCanvas.toDataURL(mimeType, quality));
                    renderer.setClearColor(0x000000, 0);
                };
                bgImg.src = URL.createObjectURL($bgImage);
            } else {
                // Simple export without background image
                renderer.setClearColor($exportData.transparentBackground.value ? 0x000000 : $globalData.bgColor.value, $exportData.transparentBackground.value ? 0 : 1);
                renderer.render(scene, camera);
                const mimeType = $exportData.fileType.value === 'PNG' ? 'image/png' : 'image/jpeg';
                const quality = mimeType === 'image/jpeg' ? 0.9 : undefined; // JPEG quality setting
                createDownloadLink(canvasElement.toDataURL(mimeType, quality));
                renderer.setClearColor(0x000000, 0);
            }
        };

        let lastFileName = $exportData.fileName.value;
        exportData.subscribe((data) => {
            if (data.download) {
                $exportData.download = false;
                downloadCanvasImage();
            }
            if (data.fileName.value !== lastFileName) {
                lastFileName = data.fileName.value;
                downloadCount = 0;
            }
        });

        // Initialize core scene first
        init();
        animate();

        // End of onMount
        performance.mark('three-mount-end');
        performance.measure('Total Three.js Mount', 'three-mount-start', 'three-mount-end');
    });

    let hovered = false;
</script>

<div id="canvasContainer" class={$globalData.panelExpanded ? 'expanded' : 'collapsed'} style:transition-duration={$globalData.panelTransitioning ? '0.45s' : '0s'} bind:this={canvasContainerElement}>
    <canvas
        bind:this={canvasElement}
        class={$globalData.panelExpanded ? 'expanded' : 'collapsed'}
        on:mousemove={(e) => {
            handleMouseEvent(e, 'move');
            if (mouseDownStatus) {
                mouseDragStatus = true;
            }
        }}
        on:dragover={(e) => {
            handleMouseEvent(e, 'move');
        }}
        on:drop={(e) => {
            handleMouseEvent(e, 'drop');
            handleDrop(e);
            hovered = false;
        }}
        on:mousedown={(e) => {
            if (intersected == null) {
                mouseDragStatus = true;
            }
            mouseDownStatus = true;
            lastMouseDown = e;
        }}
        on:mouseup={() => {
            mouseDragStatus = false;
            mouseDownStatus = false;
        }}
        on:click={(e) => {
            if (e.clientX == lastMouseDown.clientX && e.clientY == lastMouseDown.clientY) {
                handleMouseEvent(e, 'click');
            }
        }}
        style:cursor={$exportData.hideCursorOverlay.value ? 'none' : mouseDragStatus ? 'move' : intersected !== null ? 'pointer' : 'default'}
        style:background-color={$bgImage == null ? $globalData.bgColor.value : null}
        style:background-image={$bgImage ? `url(${URL.createObjectURL($bgImage)})` : null}
        style:background-size={$globalData.bgImageMode.value == 'Tile'
            ? `${$globalData.bgImageWidth * ($globalData.bgImageScale.value / 100)}px`
            : $globalData.bgImageMode.value == 'Cover'
              ? 'cover'
              : $globalData.bgImageMode.value == 'Stretch'
                ? '100% 100%'
                : null}
        ondragover="return false"
    ></canvas>
</div>

<svelte:window on:keydown={handleKeyDown} />

<style>
    #canvasContainer {
        height: 100vh;
        overflow: hidden;
        width: 100%;
        background-color: var(--bg-primary);
    }

    canvas.expanded {
        width: calc(100vw - 350px);
        /* transform: scale(0.97); */
        border-radius: 32px;
        outline: 17px solid var(--bg-primary);
        outline-offset: -16px;
    }

    canvas.collapsed {
        width: calc(100vw - 64px);
        outline: 17px solid var(--bg-primary);
        border-radius: 16px 0 0 16px;
    }

    .expanded {
        --transition-timing: 0ms;
    }

    .collapsed {
        --transition-timing: 0ms;
    }

    canvas {
        display: flex;
        width: 100vw;
        height: 100vh;
        transition:
            border-radius 0.45s,
            transform 0.45s,
            outline-offset 0.45s;
        transition-timing-function: var(--layout-easing);
        /* transform: translate(-50%, -50%); */
        left: 50%;
        top: 50%;
        background-position: center;
        /* width: 100%;
        height: 100vh; */
    }

    @media (max-width: 600px) {
        #canvasContainer {
            height: 300px;
            transition-property: height;
            transition-timing-function: var(--layout-easing);
        }

        canvas {
            height: 300px;
        }

        #canvasContainer.collapsed {
            height: calc(100vh - 115px);
            width: 100%;
        }

        canvas.collapsed {
            height: calc(100vh - 115px);
            width: 100%;
            /* transform: scale(0.97); */
            border-radius: 32px;
            outline: 17px solid var(--bg-primary);
            outline-offset: -16px;
        }
    }
</style>

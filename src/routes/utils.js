// @ts-nocheck

import chroma from 'chroma-js';

export function getRatioSize(width, height, maxValue) {
    let previewWidth, previewHeight;

    if (width > height) {
        previewWidth = maxValue;
        previewHeight = (height / width) * maxValue;
    }

    if (width < height) {
        previewHeight = maxValue;
        previewWidth = (width / height) * maxValue;
    }

    if (width == height) {
        previewWidth = maxValue;
        previewHeight = maxValue;
    }

    return { width: previewWidth, height: previewHeight };
}

export function getGeoShape(selected, allFaces, geometryData, rotated) {
    // Return a promise that resolves when the image is loaded
    return new Promise((resolve) => {
        if (!selected.image) {
            resolve({
                width: geometryData.scale.value.width,
                height: geometryData.scale.value.height,
                depth: geometryData.scale.value.depth,
            });
            return;
        }

        // Check if image is already loaded
        if (selected.image.complete && selected.image.naturalWidth !== 0) {
            processGeoShape();
        } else {
            // Wait for image to load
            selected.image.onload = processGeoShape;
        }

        function processGeoShape() {
            let geo = {
                width: geometryData.scale.value.width,
                height: geometryData.scale.value.height,
                depth: geometryData.scale.value.depth,
            };
            let newGeo = geo;

            let getFace = (targetLabel) => {
                return allFaces.find((f) => {
                    return f.label == targetLabel;
                });
            };

            function getOpposite(sel) {
                if (sel.label == 'front') {
                    return getFace('back');
                }
                if (sel.label == 'back') {
                    return getFace('front');
                }
                if (sel.label == 'left') {
                    return getFace('right');
                }
                if (sel.label == 'right') {
                    return getFace('left');
                }
                if (sel.label == 'top') {
                    return getFace('bottom');
                }
                if (sel.label == 'bottom') {
                    return getFace('top');
                }
            }

            let opposite = getOpposite(selected);
            console.log('selected:', selected);
            console.log('selected.image', selected.image);
            console.log('selected.image.width', selected.image.width);

            let selectedRatio;
            if (rotated) {
                selectedRatio = getRatioSize(selected.image.height, selected.image.width, 1);
            } else {
                selectedRatio = getRatioSize(selected.image.width, selected.image.height, 1);
            }

            let faceHasImage = (target) => {
                return allFaces.find((f) => {
                    return f.label == target;
                }).image;
            };

            let override = false;

            if (selected.label == 'front' || selected.label == 'back') {
                // imgWidth = width, imgHeight = height
                if (opposite.image) {
                    return newGeo;
                } else {
                    if (faceHasImage('top') || faceHasImage('bottom')) {
                        if (faceHasImage('left') || faceHasImage('right')) {
                            // respect width
                        } else {
                            newGeo.height = (selectedRatio.height / selectedRatio.width) * newGeo.width;
                            override = true;
                        }
                    } else {
                        newGeo.width = selectedRatio.width;
                    }

                    if (faceHasImage('left') || faceHasImage('right')) {
                        if (faceHasImage('top') || faceHasImage('bottom')) {
                        } else {
                            // DO SOMETHING
                            newGeo.width = (selectedRatio.width / selectedRatio.height) * newGeo.height;
                        }
                    } else if (!override) {
                        newGeo.height = selectedRatio.height;
                    }
                }
            }

            if (selected.label == 'left' || selected.label == 'right') {
                // imgWidth = depth, imgHeight = height
                if (opposite.image) {
                    return newGeo;
                } else {
                    if (faceHasImage('top') || faceHasImage('bottom')) {
                        if (faceHasImage('front') || faceHasImage('back')) {
                            // respect depth
                        } else {
                            newGeo.height = (selectedRatio.height / selectedRatio.width) * newGeo.depth;
                            console.log('newGeo.height: ' + newGeo.height);
                            override = true;
                        }
                    } else {
                        newGeo.depth = selectedRatio.width;
                    }

                    if (faceHasImage('front') || faceHasImage('back')) {
                        if (faceHasImage('top') || faceHasImage('bottom')) {
                            // respect height
                        } else {
                            newGeo.depth = (selectedRatio.width / selectedRatio.height) * newGeo.height;
                            console.log('newGeo.depth: ' + newGeo.depth);
                        }
                    } else if (!override) {
                        newGeo.height = selectedRatio.height;
                    }
                }
            }

            if (selected.label == 'top' || selected.label == 'bottom') {
                // imgWidth = width, imgHeight = depth
                if (opposite.image) {
                    return newGeo;
                } else {
                    if (faceHasImage('front') || faceHasImage('back')) {
                        if (faceHasImage('left') || faceHasImage('right')) {
                            // respect width
                        } else {
                            newGeo.depth = (selectedRatio.height / selectedRatio.width) * newGeo.width;
                            override = true;
                        }
                    } else {
                        newGeo.width = selectedRatio.width;
                    }

                    if (faceHasImage('left') || faceHasImage('right')) {
                        if (faceHasImage('front') || faceHasImage('left')) {
                            // respect height
                        } else {
                            newGeo.width = (selectedRatio.width / selectedRatio.height) * newGeo.depth;
                        }
                    } else if (!override) {
                        newGeo.depth = selectedRatio.height;
                    }
                }
            }

            console.log(newGeo);
            resolve(newGeo);
        }
    });
}

export function calculateSecondaryColor(color) {
    const hsvColor = chroma(color).hsv();
    const value = hsvColor[2];
    return value < 0.5
        ? chroma(color)
              .set('hsv.v', Math.max(0.2, value + 0.14))
              .hex()
        : chroma(color)
              .set('hsv.v', Math.max(0.2, value - 0.14))
              .hex();
}

export function calculateTextPrimaryColor(color) {
    return chroma.contrast(color, '#000000') > 4.5 ? chroma(color).shade(0.75).hex() : chroma(color).tint(0.65).brighten(0.1).hex();
}

export function calculateTextSecondaryColor(bgColor, textColor) {
    const color = chroma(bgColor).mix(textColor, 0.6).hex();
    return chroma.contrast(color, '#000000') > 4.5 ? chroma(bgColor).mix(textColor, 0.5).hex() : chroma(bgColor).mix(textColor, 0.6).hex();
}

export function calculateSecondaryAltColor(color, amount) {
    const hsvColor = chroma(color).hsv();
    const value = hsvColor[2];
    return value < 0.5
        ? chroma(color)
              .brighten(amount > 0 ? Math.abs(amount) : 0)
              .darken(amount < 0 ? Math.abs(amount) : 0)
              .hex()
        : chroma(color)
              .darken(amount > 0 ? Math.abs(amount) : 0)
              .brighten(amount < 0 ? Math.abs(amount) : 0)
              .hex();
}

export function mapNum(value, inMin, inMax, outMin, outMax) {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

export const colorVars = [
    '--bg-primary',
    '--hl-primary',
    '--bg-200',
    '--bg-300',
    '--bg-400',
    '--bg-450',
    '--bg-550',
    '--bg-600',
    '--bg-700',
    '--bg-400-50',
    '--hl-400',
    '--hl-600',
    '--hl-700',
    '--hl-800',
    '--bg-primary-20',
    '--hl-primary-10',
    '--hl-primary-20',
    '--hl-primary-30',
    '--hl-primary-50',
    '--p-primary',
];

export const colorVarDefaults = [
    '#2f3138',
    '#d7dbee',
    '#4a4c59',
    '#41434e',
    '#383a43',
    '#33353d',
    '#2b2c33',
    '#26272c',
    '#1b1c22',
    'rgba(56, 58, 67, 0.5)',
    '#ebefff',
    '#cad3f2',
    '#bbc4e2',
    '#a8b0cc',
    'rgba(47, 49, 56, 0.2)',
    'rgba(215, 219, 238, 0.1)',
    'rgba(215, 219, 238, 0.2)',
    'rgba(215, 219, 238, 0.3)',
    'rgba(215, 219, 238, 0.5)',
    '#adb1bd',
];

export const setHue = (colorVar, hueVar) => {
    return chroma(colorVar).set('hsl.h', hueVar);
};

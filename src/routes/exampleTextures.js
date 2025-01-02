import book_back from '$lib/images/exampleTextures/book/book_back.png';
import book_front from '$lib/images/exampleTextures/book/book_front.png';
import book_left from '$lib/images/exampleTextures/book/book_left.png';
import book_right from '$lib/images/exampleTextures/book/book_right.png';
import book_top from '$lib/images/exampleTextures/book/book_top.png';
import book_bottom from '$lib/images/exampleTextures/book/book_bottom.png';
import crayons_back from '$lib/images/exampleTextures/crayons/crayons_back.png';
import crayons_front from '$lib/images/exampleTextures/crayons/crayons_front.png';
import crayons_left from '$lib/images/exampleTextures/crayons/crayons_left.png';
import crayons_right from '$lib/images/exampleTextures/crayons/crayons_right.png';
import crayons_top from '$lib/images/exampleTextures/crayons/crayons_top.png';
import crayons_bottom from '$lib/images/exampleTextures/crayons/crayons_bottom.png';
import milkbone_back from '$lib/images/exampleTextures/milkbone/milkbone_back.png';
import milkbone_front from '$lib/images/exampleTextures/milkbone/milkbone_front.png';
import milkbone_left from '$lib/images/exampleTextures/milkbone/milkbone_left.png';
import milkbone_right from '$lib/images/exampleTextures/milkbone/milkbone_right.png';
import milkbone_top from '$lib/images/exampleTextures/milkbone/milkbone_top.png';
import milkbone_bottom from '$lib/images/exampleTextures/milkbone/milkbone_bottom.png';
import pretzel_back from '$lib/images/exampleTextures/pretzel/pretzel_back.png';
import pretzel_front from '$lib/images/exampleTextures/pretzel/pretzel_front.png';
import pretzel_left from '$lib/images/exampleTextures/pretzel/pretzel_left.png';
import pretzel_right from '$lib/images/exampleTextures/pretzel/pretzel_right.png';
import pretzel_top from '$lib/images/exampleTextures/pretzel/pretzel_top.png';
import pretzel_bottom from '$lib/images/exampleTextures/pretzel/pretzel_bottom.png';
import ps_back from '$lib/images/exampleTextures/ps/ps_back.png';
import ps_front1 from '$lib/images/exampleTextures/ps/ps_front1.png';
import ps_front2 from '$lib/images/exampleTextures/ps/ps_front2.png';
import ps_front3 from '$lib/images/exampleTextures/ps/ps_front3.png';
import ps_left from '$lib/images/exampleTextures/ps/ps_left.png';
import ps_right from '$lib/images/exampleTextures/ps/ps_right.png';
import ps_top from '$lib/images/exampleTextures/ps/ps_top.png';
import ps_bottom from '$lib/images/exampleTextures/ps/ps_bottom.png';
import tile_back from '$lib/images/exampleTextures/tile/tile_back.png';
import tile_front from '$lib/images/exampleTextures/tile/tile_front.png';
import tile_left from '$lib/images/exampleTextures/tile/tile_left.png';
import tile_right from '$lib/images/exampleTextures/tile/tile_right.png';
import tile_top from '$lib/images/exampleTextures/tile/tile_top.png';
import tile_bottom from '$lib/images/exampleTextures/tile/tile_bottom.png';
import vinyl_back from '$lib/images/exampleTextures/vinyl/vinyl_back.png';
import vinyl_front from '$lib/images/exampleTextures/vinyl/vinyl_front.png';
import vinyl_left from '$lib/images/exampleTextures/vinyl/vinyl_left.png';
import vinyl_right from '$lib/images/exampleTextures/vinyl/vinyl_right.png';
import vinyl_top from '$lib/images/exampleTextures/vinyl/vinyl_top.png';
import vinyl_bottom from '$lib/images/exampleTextures/vinyl/vinyl_bottom.png';

export const exampleGroups = ['book', 'crayons', 'pretzel', 'ps', 'tile', 'vinyl', 'milkbone'];

export const exampleTextures = [
    {
        label: 'book',
        depth: 0.09880028228652082,
        height: 1,
        width: 0.6570218772053634,
        fov: 10,
        front: {
            url: book_front,
            width: 931,
            height: 1417,
        },
        back: {
            url: book_back,
            width: 931,
            height: 1417,
        },
        left: {
            url: book_left,
            width: 140,
            height: 1417,
        },
        right: {
            url: book_right,
            width: 140,
            height: 1417,
        },
        top: {
            url: book_top,
            width: 931,
            height: 140,
        },
        bottom: {
            url: book_bottom,
            width: 931,
            height: 140,
        },
    },
    {
        label: 'crayons',
        width: 1,
        height: 0.8764044943820225,
        depth: 0.09925093632958802,
        fov: 45,
        front: {
            url: crayons_front,
            width: 1068,
            height: 936,
        },
        back: {
            url: crayons_back,
            width: 1068,
            height: 936,
        },
        left: {
            url: crayons_left,
            width: 106,
            height: 936,
        },
        right: {
            url: crayons_right,
            width: 106,
            height: 936,
        },
        top: {
            url: crayons_top,
            width: 1068,
            height: 106,
        },
        bottom: {
            url: crayons_bottom,
            width: 1068,
            height: 106,
        },
    },
    {
        label: 'pretzel',
        width: 1,
        height: 0.5245775729646698,
        depth: 0.3671274961597542,
        fov: 80,
        front: {
            url: pretzel_front,
            width: 1302,
            height: 683,
        },
        back: {
            url: pretzel_back,
            width: 1302,
            height: 683,
        },
        left: {
            url: pretzel_left,
            width: 478,
            height: 683,
        },
        right: {
            url: pretzel_right,
            width: 478,
            height: 683,
        },
        top: {
            url: pretzel_top,
            width: 1302,
            height: 478,
        },
        bottom: {
            url: pretzel_bottom,
            width: 1302,
            height: 478,
        },
    },
    {
        label: 'ps',
        width: 1,
        height: 0.968944099378882,
        depth: 0.0970496894409938,
        fov: 90,
        front: {
            url: ps_front1,
            width: 1288,
            height: 1248,
        },
        back: {
            url: ps_back,
            width: 1288,
            height: 1248,
        },
        left: {
            url: ps_left,
            width: 125,
            height: 1248,
        },
        right: {
            url: ps_right,
            width: 125,
            height: 1248,
        },
        top: {
            url: ps_top,
            width: 1288,
            height: 127,
        },
        bottom: {
            url: ps_bottom,
            width: 1288,
            height: 127,
        },
    },
    {
        label: 'tile',
        width: 0.9855351976856316,
        height: 0.07827788649706457,
        depth: 1,
        fov: 20,
        front: {
            url: tile_front,
            width: 1022,
            height: 80,
        },
        back: {
            url: tile_back,
            width: 1022,
            height: 80,
        },
        left: {
            url: tile_left,
            width: 1022,
            height: 80,
        },
        right: {
            url: tile_right,
            width: 1022,
            height: 80,
        },
        top: {
            url: tile_top,
            width: 1022,
            height: 1037,
        },
        bottom: {
            url: tile_bottom,
            width: 1022,
            height: 1037,
        },
    },
    {
        label: 'vinyl',
        width: 1,
        height: 1,
        depth: 0.021114864864864864,
        fov: 90,
        front: {
            url: vinyl_front,
            width: 1184,
            height: 1184,
        },
        back: {
            url: vinyl_back,
            width: 1184,
            height: 1184,
        },
        left: {
            url: vinyl_left,
            width: 25,
            height: 1184,
        },
        right: {
            url: vinyl_right,
            width: 25,
            height: 1184,
        },
        top: {
            url: vinyl_top,
            width: 1184,
            height: 25,
        },
        bottom: {
            url: vinyl_bottom,
            width: 1184,
            height: 25,
        },
    },
    {
        label: 'milkbone',
        width: 0.7386904761904762,
        height: 1,
        depth: 0.28095238095238095,
        fov: 60,
        front: {
            url: milkbone_front,
            width: 1241,
            height: 1680,
        },
        back: {
            url: milkbone_back,
            width: 1241,
            height: 1680,
        },
        left: {
            url: milkbone_left,
            width: 472,
            height: 1680,
        },
        right: {
            url: milkbone_right,
            width: 472,
            height: 1680,
        },
        top: {
            url: milkbone_top,
            width: 1241,
            height: 472,
        },
        bottom: {
            url: milkbone_bottom,
            width: 1241,
            height: 472,
        },
    },
];

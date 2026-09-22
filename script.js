import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const COLORS = {
    background: 0xf6f8f7,

    green: 0x238b5a,
    greenDark: 0x145c3d,
    greenLight: 0x69b98a,

    fiber: 0xb69a70,
    fiberLight: 0xd9c8aa,

    wood: 0x95683f,
    woodLight: 0xc8955d,

    surface: 0xf0ede6,
    concrete: 0xd7ddd9,

    glass: 0x86b7b3
};

const MAT = {

    green: new THREE.MeshStandardMaterial({
        color: COLORS.green,
        roughness: 0.62
    }),

    greenDark: new THREE.MeshStandardMaterial({
        color: COLORS.greenDark,
        roughness: 0.65
    }),

    greenLight: new THREE.MeshStandardMaterial({
        color: COLORS.greenLight,
        roughness: 0.68
    }),

    fiber: new THREE.MeshStandardMaterial({
        color: COLORS.fiber,
        roughness: 0.93
    }),

    fiberLight: new THREE.MeshStandardMaterial({
        color: COLORS.fiberLight,
        roughness: 0.95
    }),

    wood: new THREE.MeshStandardMaterial({
        color: COLORS.wood,
        roughness: 0.84
    }),

    woodLight: new THREE.MeshStandardMaterial({
        color: COLORS.woodLight,
        roughness: 0.82
    }),

    surface: new THREE.MeshStandardMaterial({
        color: COLORS.surface,
        roughness: 0.78
    }),

    concrete: new THREE.MeshStandardMaterial({
        color: COLORS.concrete,
        roughness: 0.96
    }),

    glass: new THREE.MeshPhysicalMaterial({
        color: COLORS.glass,
        roughness: 0.12,
        transparent: true,
        opacity: 0.58
    })
};

function createBox(
    parent,
    w,
    h,
    d,
    material,
    x = 0,
    y = 0,
    z = 0
) {

    const geometry =
        new THREE.BoxGeometry(
            w,
            h,
            d
        );

    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );

    mesh.position.set(
        x,
        y,
        z
    );

    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}


function createBeam(
    parent,
    startArray,
    endArray,
    radius,
    material
) {

    const start =
        new THREE.Vector3(
            startArray[0],
            startArray[1],
            startArray[2]
        );

    const end =
        new THREE.Vector3(
            endArray[0],
            endArray[1],
            endArray[2]
        );

    const direction =
        new THREE.Vector3()
            .subVectors(
                end,
                start
            );

    const length =
        direction.length();

    const geometry =
        new THREE.CylinderGeometry(
            radius,
            radius,
            length,
            12
        );

    const beam =
        new THREE.Mesh(
            geometry,
            material
        );

    beam.position
        .copy(start)
        .add(end)
        .multiplyScalar(0.5);

    beam.quaternion.setFromUnitVectors(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        direction.normalize()
    );

    beam.castShadow = true;
    beam.receiveShadow = true;

    parent.add(beam);

    return beam;
}

function createScene(container) {

    const scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            COLORS.background
        );

    const camera =
        new THREE.OrthographicCamera(
            -5,
            5,
            5,
            -5,
            0.1,
            100
        );


    camera.position.set(
        8,
        8,
        8
    );


    camera.lookAt(
        0,
        1.5,
        0
    );

    const renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            2
        )
    );


    renderer.setSize(
        container.clientWidth,
        container.clientHeight
    );


    renderer.shadowMap.enabled =
        true;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.15;


    container.innerHTML = "";


    container.appendChild(
        renderer.domElement
    );

    const hemisphere =
        new THREE.HemisphereLight(
            0xffffff,
            0xdce6df,
            2.3
        );

    scene.add(
        hemisphere
    );


    const keyLight =
        new THREE.DirectionalLight(
            0xffffff,
            3.2
        );

    keyLight.position.set(
        7,
        12,
        8
    );

    keyLight.castShadow =
        true;


    keyLight.shadow.mapSize.width =
        2048;

    keyLight.shadow.mapSize.height =
        2048;


    scene.add(
        keyLight
    );


    const fillLight =
        new THREE.DirectionalLight(
            0xd8efdf,
            1.1
        );

    fillLight.position.set(
        -6,
        5,
        -6
    );

    scene.add(
        fillLight
    );

    const controls =
        new OrbitControls(
            camera,
            renderer.domElement
        );


    controls.enableDamping =
        true;


    controls.dampingFactor =
        0.06;


    controls.enablePan =
        false;


    controls.minZoom =
        0.7;


    controls.maxZoom =
        2.2;


    return {
        scene,
        camera,
        renderer,
        controls
    };
}

function fitIsometricCamera(
    camera,
    controls,
    object,
    padding = 1.25
) {

    const bounds =
        new THREE.Box3()
            .setFromObject(
                object
            );


    const size =
        new THREE.Vector3();


    const center =
        new THREE.Vector3();


    bounds.getSize(
        size
    );


    bounds.getCenter(
        center
    );


    const maxDimension =
        Math.max(
            size.x,
            size.y,
            size.z
        );


    const distance =
        maxDimension *
        padding;


    camera.left =
        -distance;

    camera.right =
        distance;

    camera.top =
        distance;

    camera.bottom =
        -distance;


    camera.near =
        0.1;

    camera.far =
        100;


    camera.updateProjectionMatrix();


    controls.target.copy(
        center
    );


    controls.update();


    camera.lookAt(
        center
    );
}


function resizeScene(
    container,
    camera,
    renderer
) {

    function resize() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;


        if (
            width === 0 ||
            height === 0
        ) {
            return;
        }


        const aspect =
            width / height;


        const frustum =
            camera.right -
            camera.left;


        const halfHeight =
            frustum / 2;


        const halfWidth =
            halfHeight *
            aspect;


        camera.left =
            -halfWidth;


        camera.right =
            halfWidth;


        camera.top =
            halfHeight;


        camera.bottom =
            -halfHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height,
            false
        );
    }


    window.addEventListener(
        "resize",
        resize
    );


    resize();
}


// ============================================================
// BIOENV THERM
// ============================================================

function createTherm() {

    const container =
        document.getElementById(
            "therm-container"
        );

    if (!container) {
        return;
    }


    const {
        scene,
        camera,
        renderer,
        controls
    } = createScene(
        container
    );


    const root =
        new THREE.Group();


    scene.add(
        root
    );

    const width = 4.0;
    const depth = 2.7;

    const levels = 3;

    const levelHeight = 0.24;

    for (
        let layer = 0;
        layer < levels;
        layer++
    ) {

        const y =
            0.35 +
            layer *
            levelHeight;


        for (
            let z = -1.05;
            z <= 1.05;
            z += 0.22
        ) {

            createBox(
                root,

                width,

                0.10,

                0.075,

                layer % 2 === 0
                    ? MAT.fiber
                    : MAT.fiberLight,

                0,
                y,
                z
            );

        }
    }


    for (
        let layer = 0;
        layer < levels;
        layer++
    ) {

        const y =
            0.35 +
            layer *
            levelHeight +
            0.11;


        for (
            let x = -1.82;
            x <= 1.82;
            x += 0.22
        ) {

            createBox(
                root,

                0.075,

                0.10,

                depth,

                layer % 2 === 0
                    ? MAT.fiberLight
                    : MAT.fiber,

                x,
                y,
                0
            );

        }
    }


    for (
        let x = -1.65;
        x <= 1.65;
        x += 0.55
    ) {

        for (
            let z = -0.9;
            z <= 0.9;
            z += 0.55
        ) {

            createBox(
                root,
                0.095,
                0.42,
                0.095,
                MAT.green,
                x,
                0.60,
                z
            );

        }
    }


    root.position.y =
        0.20;


    fitIsometricCamera(
        camera,
        controls,
        root,
        1.35
    );


    resizeScene(
        container,
        camera,
        renderer
    );


    animate(
        renderer,
        scene,
        camera,
        controls
    );
}


// ============================================================
// BIOENV FRAME
// ============================================================

function createFrame() {

    const container =
        document.getElementById(
            "frame-container"
        );

    if (!container) {
        return;
    }


    const {
        scene,
        camera,
        renderer,
        controls
    } = createScene(
        container
    );


    const root =
        new THREE.Group();


    scene.add(
        root
    );


    const W = 3.8;
    const D = 2.7;
    const H = 2.8;


    createBox(
        root,
        4.25,
        0.18,
        3.05,
        MAT.concrete,
        0,
        0.10,
        0
    );


    createBox(
        root,
        3.75,
        0.12,
        2.55,
        MAT.surface,
        0,
        0.28,
        0
    );


    const posts = [

        [-W / 2, -D / 2],
        [W / 2, -D / 2],

        [-W / 2, D / 2],
        [W / 2, D / 2]

    ];


    posts.forEach(
        ([x, z]) => {

            createBox(
                root,
                0.20,
                H,
                0.20,
                MAT.greenDark,
                x,
                0.28 + H / 2,
                z
            );

        }
    );


    createBox(
        root,
        W + 0.12,
        0.19,
        0.19,
        MAT.green,
        0,
        H + 0.36,
        -D / 2
    );


    createBox(
        root,
        W + 0.12,
        0.19,
        0.19,
        MAT.green,
        0,
        H + 0.36,
        D / 2
    );


    createBox(
        root,
        0.19,
        0.19,
        D,
        MAT.green,
        -W / 2,
        H + 0.36,
        0
    );


    createBox(
        root,
        0.19,
        0.19,
        D,
        MAT.green,
        W / 2,
        H + 0.36,
        0
    );


    createBeam(
        root,
        [-W / 2, 0.50, D / 2 + 0.01],
        [W / 2, H + 0.28, D / 2 + 0.01],
        0.035,
        MAT.greenLight
    );


    createBeam(
        root,
        [W / 2, 0.50, -D / 2 - 0.01],
        [-W / 2, H + 0.28, -D / 2 - 0.01],
        0.035,
        MAT.greenLight
    );

    const roofPeak =
        H + 1.32;


    createBeam(
        root,
        [-W / 2, H + 0.40, -D / 2],
        [0, roofPeak, 0],
        0.10,
        MAT.woodLight
    );


    createBeam(
        root,
        [W / 2, H + 0.40, -D / 2],
        [0, roofPeak, 0],
        0.10,
        MAT.woodLight
    );


    createBeam(
        root,
        [-W / 2, H + 0.40, D / 2],
        [0, roofPeak, 0],
        0.10,
        MAT.woodLight
    );


    createBeam(
        root,
        [W / 2, H + 0.40, D / 2],
        [0, roofPeak, 0],
        0.10,
        MAT.woodLight
    );

    createBox(
        root,
        0.75,
        0.75,
        0.75,
        MAT.greenLight,
        0.75,
        0.72,
        0.25
    );

    fitIsometricCamera(
        camera,
        controls,
        root,
        1.20
    );


    resizeScene(
        container,
        camera,
        renderer
    );


    animate(
        renderer,
        scene,
        camera,
        controls
    );
}

// ============================================================
// BIOENV BASE
// ============================================================

function createBase() {

    const container =
        document.getElementById(
            "base-container"
        );

    if (!container) {
        return;
    }


    const {
        scene,
        camera,
        renderer,
        controls
    } = createScene(
        container
    );


    const root =
        new THREE.Group();


    scene.add(
        root
    );


    const W = 4.0;
    const D = 2.7;


    createBox(
        root,
        W,
        0.16,
        D,
        MAT.wood,
        0,
        0.10,
        0
    );


    createBox(
        root,
        3.75,
        0.42,
        2.45,
        MAT.fiber,
        0,
        0.39,
        0
    );


    for (
        let x = -1.7;
        x <= 1.7;
        x += 0.25
    ) {

        createBox(
            root,
            0.065,
            0.34,
            2.22,
            MAT.fiberLight,
            x,
            0.39,
            0
        );

    }

    for (
        let z = -1.0;
        z <= 1.0;
        z += 0.25
    ) {

        createBox(
            root,
            3.30,
            0.065,
            0.065,
            MAT.fiberLight,
            0,
            0.40,
            z
        );

    }

    createBox(
        root,
        W,
        0.12,
        D,
        MAT.greenDark,
        0,
        0.70,
        0
    );

    createBox(
        root,
        W,
        0.14,
        D,
        MAT.surface,
        0,
        0.83,
        0
    );

    for (
        let x = -1.0;
        x <= 1.0;
        x += 0.50
    ) {

        createBox(
            root,
            0.015,
            0.012,
            2.20,
            MAT.greenLight,
            x,
            0.905,
            0
        );

    }


    for (
        let z = -1.00;
        z <= 1.00;
        z += 0.50
    ) {

        createBox(
            root,
            3.20,
            0.012,
            0.015,
            MAT.greenLight,
            0,
            0.906,
            z
        );

    }


    [
        [-1.55, -0.95],
        [1.55, -0.95],
        [-1.55, 0.95],
        [1.55, 0.95]
    ].forEach(
        ([x, z]) => {

            const geometry =
                new THREE.CylinderGeometry(
                    0.065,
                    0.065,
                    0.22,
                    20
                );


            const connector =
                new THREE.Mesh(
                    geometry,
                    MAT.green
                );


            connector.position.set(
                x,
                0.99,
                z
            );


            connector.castShadow =
                true;


            root.add(
                connector
            );

        }
    );


    fitIsometricCamera(
        camera,
        controls,
        root,
        1.20
    );


    resizeScene(
        container,
        camera,
        renderer
    );


    animate(
        renderer,
        scene,
        camera,
        controls
    );
}

function animate(
    renderer,
    scene,
    camera,
    controls
) {

    function render() {

        requestAnimationFrame(
            render
        );


        controls.update();


        renderer.render(
            scene,
            camera
        );

    }


    render();
}


createTherm();
createFrame();
createBase();

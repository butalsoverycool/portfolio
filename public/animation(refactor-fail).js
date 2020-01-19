
/*
* Noel Delgado - @pixelia_me
* Inspiration: https://dingundding.tumblr.com/post/99836716906
*/

/* https://threejs.org/examples/js/Detector.js */

//document.onclick = (e) => console.log('position', e.offsetX, e.offsetY);

let navExists = false;

animInit = () => {
    navExists = true;
    //console.log('threejs init...');

    const nav = document.querySelector('.Navigation');


    // globals
    const _size = () => {
        let landscape = window.innerWidth > window.innerHeight;
        let winW = window.innerWidth,
            winH = window.innerHeight,
            navH = nav.clientHeight;

        w = landscape
            ? winH
            : winW;

        h = navH;

        return { w, h };
    }
    // landscape: w: winH, h: winH / 2
    // portrait: w: winW, h: winW / 2


    // width: (100vw)
    // height: 50vw;
    // portrait: max-height: 300px;
    // landscape: max-height: 50vh;

    let GRID = 2, /* cols, rows */
        _width = _size().w,//window.innerWidth,
        _height = _size().h,
        /* _height = window.innerHeight, */
        PI = Math.PI,
        card_SIZE = 200,//setCardsize(), /* width, height */
        MAIN_COLOR = 0xffffff,
        SECONDARY_COLOR = 0x000,// 0x888888,
        navAnim = [],
        navCards = [],
        renderer = new THREE.WebGLRenderer(),
        camera = new THREE.PerspectiveCamera(30, 3/* _height */, 1, 10000),
        scene = new THREE.Scene(),
        group = new THREE.Object3D(),
        debug = false;

    /* function updateCam() {
        camera.setViewOffset(_width, _height, _width * 0, -_height / 100, _width, _height);
    } */

    //updateCam();

    let rangeConfig = {
        randomInRange: (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    };

    const random = (min, max) => {
        min = Math.ceil(min * 100);
        max = Math.floor(max * 100);
        return (Math.floor(Math.random() * (max - min + 1)) + min) / 100;
    }

    // Handle compatibility issues
    var Detector = {
        canvas: !!window.CanvasRenderingContext2D,
        webgl: (function () {
            try {
                var e = document.createElement("canvas");
                e.className = 'canvasNav'
                return (
                    !!window.WebGLRenderingContext &&
                    (e.getContext("webgl") || e.getContext("experimental-webgl"))
                );
            } catch (t) {
                return false;
            }
        })(),
        workers: !!window.Worker,
        fileapi: window.File && window.FileReader && window.FileList && window.Blob,
        getWebGLErrorMessage: function () {
            var e = document.createElement("div");
            e.id = "webgl-error-message";
            e.style.fontFamily = "monospace";
            e.style.fontSize = "13px";
            e.style.fontWeight = "normal";
            e.style.textAlign = "center";
            e.style.background = "#fff";
            e.style.color = "#000";
            e.style.padding = "1.5em";
            e.style.width = "400px";
            e.style.margin = "5em auto 0";
            if (!this.webgl) {
                e.innerHTML = window.WebGLRenderingContext
                    ? [
                        'Your graphics card does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br />',
                        'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                    ].join("\n")
                    : [
                        'Your browser does not seem to support <a href="http://khronos.org/webgl/wiki/Getting_a_WebGL_Implementation" style="color:#000">WebGL</a>.<br/>',
                        'Find out how to get it <a href="http://get.webgl.org/" style="color:#000">here</a>.'
                    ].join("\n");
            }
            return e;
        },
        addGetWebGLMessage: function (e) {
            var t, n, r;
            e = e || {};
            t = e.parent !== undefined ? e.parent : document.body;
            n = e.id !== undefined ? e.id : "oldie";
            r = Detector.getWebGLErrorMessage();
            r.id = n;
            t.appendChild(r);
        }
    }; // Detector

    if (!Detector.webgl) Detector.addGetWebGLMessage();


    function setCardsize() {
        let res = window.innerWidth / 3;
        // if ladnscape
        if (window.innerWidth > window.innerHeight && res > 200) {
            res = 200;
        }
        return 200;// res;
    }

    let TOTAL_navCards = GRID * GRID,
        WALL_SIZE = GRID * card_SIZE;
    let HALF_WALL_SIZE = WALL_SIZE / 2;

    // cam position
    const camXYZ = () => {
        let w = window.innerWidth,
            h = window.innerHeight,
            x = 0,
            y = 300,
            z = 1000;

        // portrait
        if (h > w) {
            switch (true) {
                case w < 350: // very narrow
                    y = 550;
                    z = 1800;
                    break;
                case w < 420: // narrow
                    y = 420;
                    z = 1500;
                    break;
                default:
                    z = 1200;
            }
        }
        // landscape
        else {
            y = 250;
        }
        z = 500;
        y = 0;
        return { x, y, z };
    }


    // shoot scene
    setupCamera(camXYZ().x, camXYZ().y, camXYZ().z);
    setupBox(group);
    setupFloor(group);
    setupNavCards(group);
    setupLights(group);
    group.position.y = 50;
    group.rotation.set(-60 * (PI / 180), 0, -45 * (PI / 180));
    scene.add(group);
    setupRenderer(document.querySelector('.Navigation'))




    /* -- -- */
    let fail = 0;
    if (debug) {
        try {
            if (fail < 1) render();
        }
        catch (err) {
            fail++;
            console.log('ERR 1', err)
        }

    }
    else {
        try {
            if (fail < 1) TweenMax.ticker.addEventListener("tick", render);
        }
        catch (err) {
            fail++;
            console.log('ERR 2', err)
        }
    }


    window.addEventListener("resize", resizeHandler, false);

    //document.querySelector('.NavToggle').addEventListener('click', waitForNavRise, false);

    function waitForNavRise() {
        // if nav will go down, bail
        if (nav.clientHeight > 0) {
            return;
        }

        // else repeat resizeHandler
        let navInter = setInterval(() => {
            console.log('tryin resize again');

            resizeHandler();

            // if nav is upp, clear interval
            if (nav.clientHeight > 0) {
                clearInterval(navInter);
                console.log('cleared inter');
                return;
            }
        }, 200);
    }

    /* -- -- */
    function resizeHandler() {
        //console.log('three resizehandler...');
        //updateOverlayPos();

        navH = nav.clientHeight;
        //console.log('navH', navH);

        //_width = window.innerWidth;
        //_height = window.innerHeight;

        //card_SIZE = setCardsize();
        setupCamera(camXYZ().x, camXYZ().y, camXYZ().z);
        renderer.setSize(_size().w, _size().h);
        camera.aspect = _size().w / _size().h;
        //camera.updateProjectionMatrix();

    }



    // cam
    function setupCamera(x, y, z) {
        camera.position.set(x, y, z);
        scene.add(camera);
    }

    // box
    function setupBox(parent) {
        var i, boxesArray, geometry, material;

        boxesArray = [];
        geometry = new THREE.BoxGeometry(WALL_SIZE, WALL_SIZE, 0.05);
        geometry.faces[8].color.setHex(SECONDARY_COLOR);
        geometry.faces[9].color.setHex(SECONDARY_COLOR);
        geometry.colorsNeedUpdate = true;
        material = new THREE.MeshBasicMaterial({
            color: MAIN_COLOR,
            vertexColors: THREE.FaceColors
        });

        for (i = 0; i < 5; i++) {
            boxesArray.push(new THREE.Mesh(geometry, material));
        }

        // back
        boxesArray[0].position.set(0, HALF_WALL_SIZE, -HALF_WALL_SIZE);
        boxesArray[0].rotation.x = 90 * (PI / 180);

        // right
        boxesArray[1].position.set(HALF_WALL_SIZE, 0, -HALF_WALL_SIZE);
        boxesArray[1].rotation.y = -90 * (PI / 180);

        // front
        boxesArray[2].position.set(0, -HALF_WALL_SIZE, -HALF_WALL_SIZE);
        boxesArray[2].rotation.x = -90 * (PI / 180);

        // left
        boxesArray[3].position.set(-HALF_WALL_SIZE, 0, -HALF_WALL_SIZE);
        boxesArray[3].rotation.y = 90 * (PI / 180);

        // bottom
        boxesArray[4].position.set(0, 0, -WALL_SIZE);

        boxesArray.forEach(function (box) {
            parent.add(box);
        });
    }

    // floor
    function setupFloor(parent) {
        var i, tilesArray, geometry, material;

        tilesArray = [];
        geometry = new THREE.PlaneBufferGeometry(WALL_SIZE, WALL_SIZE);
        material = new THREE.MeshLambertMaterial({
            color: MAIN_COLOR
        });

        for (i = 0; i < 8; i++) {
            tilesArray.push(new THREE.Mesh(geometry, material));
        }

        tilesArray[0].position.set(-WALL_SIZE, WALL_SIZE, 0);
        tilesArray[1].position.set(0, WALL_SIZE, 0);
        tilesArray[2].position.set(WALL_SIZE, WALL_SIZE, 0);
        tilesArray[3].position.set(-WALL_SIZE, 0, 0);
        tilesArray[4].position.set(WALL_SIZE, 0, 0);
        tilesArray[5].position.set(-WALL_SIZE, -WALL_SIZE, 0);
        tilesArray[6].position.set(0, -WALL_SIZE, 0);
        tilesArray[7].position.set(WALL_SIZE, -WALL_SIZE, 0);

        tilesArray.forEach(function (tile) {
            tile.receiveShadow = true;
            parent.add(tile);
        });
    }


    // navcards anim
    function animateNavCard(parent, elem, index = null, configParams = null) {
        console.log('elem', elem, 'parent', parent)
        //console.log('animation intro')
        let direction = index === 1 || index === 2 ? 'x' : 'y';

        let config = {
            ease: Elastic.easeInOut,
            delay: 3/* rangeConfig.randomInRange(minDelay, maxDelay)*/,
            repeat: -1,
            yoyo: true,
            [direction]: random(.01, .07),
            onComplete: () => {
                //console.log(`navcard-${index} anim stopped.`);
            }
        }

        // override config
        for (let option in configParams) {
            config[option] = configParams[option];
        }

        navAnim[index] = TweenMax.to(
            [elem.rotation],
            rangeConfig.randomInRange(2, 6),
            config
        );

        // for pausing on click
        const thisTween = navAnim[index];

        // pause when yoyo completed
        let yoyoComplete = true;

        // when global var loopAnim changes, pause on next loop-start
        navAnim[index].updateTo({
            onRepeat: function (thisTween) {
                yoyoComplete = !yoyoComplete;
                if (!elem.memo.loopAnim && yoyoComplete) {
                    //console.log('Killing');
                    this.pause();
                }
            }
        });

        parent.add(elem);
    }



    // navcards
    function setupNavCards(parent) {
        var x = 0,
            y = 0,
            row = 0,
            col = 0,
            minDuration = 2,
            maxDuration = 6,
            minDelay = .5,
            maxDelay = 10,
            attrOptions = ['x', 'y'],
            attr,
            direction,
            config;




        /* let material = [];
        let imgs = []; */



        const loadSrc = src => {
            // on load completed
            const callBack = img => {
                return img;
                /* imgs.push(img);
                awaitingLoad--;
                //console.log('image', img, 'loaded', awaitingLoad, 'loadings to go...', 'imgs length:', imgs.length);
                if (awaitingLoad === 0) {
                    //console.log('all imgs were loaded!');
                    applyTexture();
                } */
            }

            // create img loader
            const loader = new THREE.ImageLoader();

            loader.setCrossOrigin('anonymous');

            // load
            return loader.load(
                // resource URL
                src,
                // onLoad callback
                function (img) { return img; },
                // onProgress callback currently not supported
                undefined,
                // onError callback
                function () {
                    console.error('An error happened when loading img:', src);
                }
            );
        }

        /// await promise for all loads....

        const sources = [
            'media/Music_bg.png',
            'media/Work_bg.png',
            'media/Story_bg.png',
            'media/Contact_bg.png'
        ];
        console.log('sources', sources);

        const imgs = sources.map(src => loadSrc(src));
        console.log('imgs', imgs)

        const textures = sources.map(src => {
            let res = new THREE.Texture(src);

            //res.needsUpdate = true;

            return res;
        });
        console.log('textures', textures);

        const materials = textures.map(texture => new THREE.MeshBasicMaterial({ map: texture }));
        console.log('materials', materials);

        const geometry = new THREE.PlaneBufferGeometry(card_SIZE, card_SIZE, 1);

        const applySurface = (item, nth) => {
            const res = item;

            if (nth % GRID === 0) {
                col = 1;
                row++;
            } else col++;

            x = -(GRID * card_SIZE / 2 - card_SIZE * col + card_SIZE / 2);
            y = -(GRID * card_SIZE / 2 - card_SIZE * row + card_SIZE / 2);
            z = 0;

            res.FaceColors;

            // pos of flip-roofs
            res.position.set(x, y, 0); // 0 = on floor
            res.rotation.z = nth === 1 || nth === 2 ? Math.PI / 2 : 0 // set text orientation

            // save orig pos 
            res.memo = {};

            res.memo.positionX = x;
            res.memo.positionY = y;
            res.memo.rotationZ = res.rotation.z;

            res.memo.loopAnim = true;

            return res;
        }

        const applyShadow = (item) => {
            let res = item;
            res.castShadow = true;
            res.receiveShadow = true;

            return res;
        }

        const startAnim = (item, nth) => {
            if (debug) {
                res.rotation.x = 0;
            } else {
                // if on landing, do animation after title intro
                if (window.location.pathname === '/') {
                    document.querySelector('.Intro').addEventListener('ended', () => {
                        animateNavCard(parent, item, nth);
                    });
                }
                // else do anim
                else {
                    animateNavCard(parent, item, nth);
                }
            }
        }

        materials.map((material, nth) => {
            material.map.needsUpdate = false;
            let navCard =
                applyShadow(
                    applySurface(
                        new THREE.Mesh(geometry, material),
                        nth
                    )
                );
            navCard.map
            startAnim(navCard, nth);
        });
        //console.log('NAVCARDS', navCards);

        /* navCards.map((item, nth) => {
            startAnim(item, nth);
        }); */






        /* const imgSources = [
            'media/Music_bg.png',
            'media/Work_bg.png',
            'media/Story_bg.png',
            'media/Contact_bg.png'
        ]; */


        /////


        // instantiate a loader


        // load-counter
        /* let awaitingLoad = imgSources.length;
    
        // load a image resource
        imgSources.forEach((src, nth) => {
            const loader = new THREE.ImageLoader();
            loader.load(
                // resource URL
                src,
    
                // onLoad callback
                function (img) {
                    imgs.push(img);
                    awaitingLoad--;
                    //console.log('image', img, 'loaded', awaitingLoad, 'loadings to go...', 'imgs length:', imgs.length);
                    if (awaitingLoad === 0) {
                        //console.log('all imgs were loaded!');
                        applyTexture();
                    }
    
                    // use the image, e.g. draw part of it on a canvas
                    /* var canvas = document.createElement('canvas');
                    var context = canvas.getContext('2d');
                    context.drawImage(image, 100, 100); 
                },
    
                // onProgress callback currently not supported
                undefined,
    
                // onError callback
                function () {
                    //console.error('An error happened when loading img:', src);
                }
            );
            console.log('loader', nth, src);
        }); */

        //console.log('(after loading)', awaitingLoad, 'imgs left to load.');
        /////

        /* function applyTexture() {
    
            //console.log('(doing texture...)');
            let awaiting = imgSources.length;
            for (let nth = 0; nth < imgSources.length; nth++) {
                //imgs.push(document.createElement('img'));
                //imgs[nth].src = imgSources[nth];
                texture.push(new THREE.Texture(imgs[nth]));
                texture[nth].needsUpdate = true;
                material.push(new THREE.MeshBasicMaterial({ map: texture[nth] }));
                //console.log('created texture/material for img', nth, 'material:', material);
                awaiting--;
                if (awaiting === 0) {
                    applyGeometry();
                }
            }
        } */




        /* function applyGeometry() {
            //console.log('(doing geometry...)');
            let awaiting = imgSources.length;
            for (let i = 0; i < TOTAL_navCards; i++) {
                //material[i] = new THREE.MeshBasicMaterial({ map: textures[i] });
                navCards[i] = new THREE.Mesh(geometry, material[i]);
    
                //backsides.push(new THREE.Mesh(geometry, backsideMaterial[i]));
    
                if (i % GRID === 0) {
                    col = 1;
                    row++;
                } else col++;
    
                x = -(GRID * card_SIZE / 2 - card_SIZE * col + card_SIZE / 2);
                y = -(GRID * card_SIZE / 2 - card_SIZE * row + card_SIZE / 2);
                z = 0;
    
                navCards[i].FaceColors;
    
                // pos of flip-roofs
                navCards[i].position.set(x, y, 0); // 0 = on floor
                navCards[i].rotation.z = i === 1 || i === 2 ? Math.PI / 2 : 0 // set text orientation
    
    
                navCards[i].memo = {};
    
                navCards[i].memo.positionX = x;
                navCards[i].memo.positionY = y;
                navCards[i].memo.positionZ = z;
    
                navCards[i].memo.rotationZ = navCards[i].rotation.z;
    
                navCards[i].memo.loopAnim = true;
    
                awaiting--;
                if (awaiting === 0) {
                    applyShadow();
                }
            }
        } */

        //navCards.forEach(function (card, index = 0) {
        /* function applyShadow() {
            //console.log('(doing shadow...)');
            for (let nth = 0; nth < navCards.length; nth++) {
                //let index = navCards.indexOf(card);
                //var flipAnim = navAnim[index];
    
                navCards[nth].castShadow = true;
                navCards[nth].receiveShadow = true;
    
                if (debug) {
                    navCards[nth].rotation.x = 0;//Math.random() * 10;
                } else {
    
                    // if on landing, do animation after title intro
                    if (window.location.pathname === '/') {
                        document.querySelector('.Intro').addEventListener('ended', () => {
                            animateNavCard(parent, navCards[nth], nth);
                        });
                    }
                    // else do anim
                    else {
                        animateNavCard(parent, navCards[nth], nth);
                    }
                }
            }
        } */
    } // setupNavCards

    const animateCardClick = (parent, index, active, configParams = null) => {
        /* navCards.forEach((card, nth) => {
            // default config
            let config = {
                x: card.memo.positionX,
                y: card.memo.positionY,
                z: card.memo.positionZ,
                ease: Elastic.easeOut,
            };
     
            // override optional config
            for (let param in configParams) {
                config[param] = configParams[param];
            }
     
            // chosen nav-card
            if (nth === index) {
                navAnim[index] = TweenMax.to(
                    card.position,
                    1,
                    config
                );
                //parent.add(card)
            }
            // other nav-cards
            else {
                navAnim[index] = TweenMax.to(
                    card.position,
                    3,
                    {
                        z: -200,
                        ease: Elastic.easeOut,
                    }
                );
            }
        }); */

        //camera.translateZ(- 200);
        //setupCamera(0, 0, 0);

        /* navCardsToGo.forEach(card => {
            console.log('togo', card)
        }); */


        //elem.rotation.z = index === 1 || index === 2 ? Math.PI / 2 : 0 // set text orientation
        //let direction = index === 1 || index === 2 ? 'x' : 'y';


        //let power = Math.random();
        //config[direction] = .1;// power < .1 ? -.3 : -power / 10;
        //navCards[index].position.set(100, 0, 0);

    }

    // animate away nav
    const animateNavDrop = () => {
        /* const nav = document.querySelector('.Nav canvas');
        TweenMax.to(
            document.querySelector('.Nav canvas'),
            .5,
            {
                ease: SlowMo.easeOut,
                y: 100,
                opacity: 0
            }
        ); */
    }

    /* let activeSection = null; */


    const animateSection = (target, key) => {
        //console.log('key', key, 'id', target.id)
        /* const section = (() => {
            let res;
            document.querySelectorAll('main').forEach(elem => {
                if (Number(elem.dataset.key) === key) {
                    res = elem;
                }
            });
            return res;
        })();
     
        activeSection = section;
     
        let duration = 1;
     
        TweenMax.to(
            section,
            duration,
            {
                opacity: 1,
                visibility: 'unset',
                height: '100vh'
            }
        ); */

        /* TweenMax.to(
            document.querySelector('#mainTitle'),
            duration,
            {
                opacity: 0
            }
        ); */

        /* TweenMax.to(
            document.querySelector('#homeBtn'),
            duration,
            {
                opacity: 1,
                visibility: 'unset',
            }
        ); */
    }

    /* document.querySelector('#backToNav').addEventListener('click', (e) => {
        if (!activeSection) return;
     
        let duration = 2;
     
        TweenMax.to(
            activeSection,
            duration,
            {
                opacity: 0,
                /* visibility: 'hidden', *//*
height: 0
}
);

TweenMax.to(
document.querySelector('#mainTitle'),
duration,
{
opacity: 1
}
);

TweenMax.to(
document.querySelector('#backToNav'),
duration,
{
opacity: 0,
/* visibility: 'hidden', *//*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    const nav = document.querySelector('#canvasContainer canvas');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    TweenMax.to(
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    document.querySelector('#canvasContainer canvas'),
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    duration,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    ease: SlowMo.easeOut,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    y: 0,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    opacity: 1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    );
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    navAnim.forEach((anim, nth) => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    TweenMax.to(
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    anim,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    duration,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    y: navCards[nth].memo.positionY
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    )
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    })
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }); */





    //////
    const navClickHandler = (e) => {
        // get clicked key
        let key = Number(e.target.dataset.navKey);

        // check if already active
        let active = e.target.dataset.active === 'true' ? true : false;

        // make all other navs inactive
        let btns = document.querySelectorAll('.navBtn');
        btns.forEach(btn => {
            if (btn.dataset.navKey !== key) {
                btn.dataset.active = false;
            }
        })

        // toggle active in DOM
        e.target.dataset.active = String(!active);


        // pause clicked navAnim att next loop-start
        navCards[key].memo.loopAnim = false;

        // animate nav-cards disappear
        //animateCardClick(group, key, active);

        // animate nav disappear
        //animateNavDrop();

        // animate section appear
        //animateSection(e.target, key);

    } // clickHandler

    const navEnterHandler = (e) => {
        let key = Number(e.target.dataset.navKey);

        navCards.forEach((card, nth) => {
            // chosen nav-card
            if (nth === key) {
                navAnim[key] = TweenMax.to(
                    card.position,
                    1,
                    {
                        z: -20,
                        ease: Elastic.easeOut,
                    }
                );
                //parent.add(card);
            }
        });

    }

    const navLeaveHandler = (e) => {
        let key = Number(e.target.dataset.navKey);

        navCards.forEach((card, nth) => {
            // chosen nav-card
            if (nth === key) {
                navAnim[key] = TweenMax.to(
                    card.position,
                    1,
                    {
                        x: card.memo.positionX,
                        y: card.memo.positionY,
                        z: card.memo.positionZ,
                        ease: Elastic.easeOut
                    }
                );
            }
        });
    }


    // listen for click
    document.querySelectorAll('.HiddenNav .NavLink').forEach(btn => {
        //btn.addEventListener('click', navClickHandler);
        btn.addEventListener('mouseenter', navEnterHandler);
        btn.addEventListener('mouseleave', navLeaveHandler);
    });




    /* -- LIGHTS -- */
    function setupLights(parent) {
        var light, soft_light;

        light = new THREE.DirectionalLight(MAIN_COLOR, 1.25);
        soft_light = new THREE.DirectionalLight(MAIN_COLOR, 1.5);

        light.position.set(-WALL_SIZE * 1, -WALL_SIZE * 1, card_SIZE * GRID * 1);
        light.castShadow = true;
        light.shadowDarkness = 0;

        soft_light.position.set(WALL_SIZE, WALL_SIZE, card_SIZE * GRID);

        parent.add(light).add(soft_light);
    }

    /* -- RENDERER -- */
    function setupRenderer(parent) {
        renderer.setSize(_width, _height);
        renderer.setClearColor(MAIN_COLOR, 1.0);
        renderer.shadowMapEnabled = true;
        parent.appendChild(renderer.domElement);
    }

    function render() {
        if (fail < 1) renderer.render(scene, camera);
    }




}



window.addEventListener('DOMContentLoaded', () => {
    //console.log('doc fully loaded and parsed');
    animInit();

    /* const NavListener = () => {
        console.log('listening for nav...')
        document.querySelector('.HiddenNav').onclick = (e) => {
            console.log('going to page');
            setTimeout(HomeListener, 2000);
        }
    }

    const HomeListener = () => {
        console.log('listening for Home...')
        document.querySelector('.HomeBtn').onclick = (e) => {
            console.log('going home');
        }
    }

    document.querySelector('.App').onchange = () => {
        console.log('something changed!')
    }

    NavListener(); */

    /* document.documentElement.onclick = (e) => {
        if (window.location.pathname !== '/' && e.target.classList.contains('HomeBtn')) {
            const canvas = document.querySelector('canvas')
            canva s.parentElement.removeChild(canvas);
            

            const inter = setInterval(() => {
                if (!navExists) {
                    console.log('trying inter animInit()')
                    animInit()
                } else {
                    console.log('nav already exists clearing interval');
                    clearInterval(inter);
                }
            }, 200
            );


            //setTimeout(animInit, 1000);

            console.log('running anim init()')

        } else {
            navExists = false;
        }
    } */

});



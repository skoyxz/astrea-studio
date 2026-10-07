/* =========================================================
   ASTRÉA STUDIO
   ÉDITEUR DE ROMAN 3D
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let scene;
let camera;
let renderer;
let controls;

let bookGroup;
let pageMesh;
let frontCover;
let backCover;
let spine;

let pageCanvas;
let pageContext;
let pageTexture;

let currentPage = 0;

let writingMode = false;

let bookWidth = 4.6;
let bookHeight = 6.9;
let bookDepth = 0.55;


/*
   Les pages sont de vrais blocs HTML.

   Chaque élément peut être :
   - paragraphe
   - titre
   - image
*/

let pagesData = [
    {
        type: "interior",

        html: `
            <h1>Les Chroniques d'Astréa</h1>

            <p>
                Commence ton histoire ici...
            </p>
        `
    }
];


/* =========================================================
   DOM
========================================================= */

const bookViewer =
    document.getElementById("book-viewer");

const bookTitle =
    document.getElementById("book-title");

const topTitle =
    document.getElementById("top-title");

const bookFormat =
    document.getElementById("book-format");

const coverColor =
    document.getElementById("cover-color");

const btnWriting =
    document.getElementById("btn-writing");

const btnAddPage =
    document.getElementById("btn-add-page");

const btnPrev =
    document.getElementById("btn-prev");

const btnNext =
    document.getElementById("btn-next");

const canvasPrev =
    document.getElementById("canvas-prev");

const canvasNext =
    document.getElementById("canvas-next");

const pageNumber =
    document.getElementById("page-number");

const pageTotal =
    document.getElementById("page-total");

const editingStatus =
    document.getElementById("editing-status");

const pageEditorLayer =
    document.getElementById("page-editor-layer");

const pageEditor =
    document.getElementById("page-editor");

const fontSize =
    document.getElementById("font-size");

const textColor =
    document.getElementById("text-color");

const btnImage =
    document.getElementById("btn-image");

const imageInput =
    document.getElementById("image-input");

const btnFrontCover =
    document.getElementById("btn-front-cover");

const btnBackCover =
    document.getElementById("btn-back-cover");

const btnSpine =
    document.getElementById("btn-spine");

const btnNewPage =
    document.getElementById("btn-new-page");

const btnExport =
    document.getElementById("btn-export");


/* =========================================================
   INITIALISATION
========================================================= */

init();


function init() {

    createScene();

    createBook();

    createPageTexture();

    setupControls();

    setupEvents();

    updateBookTitle();

    updatePageInfo();

    renderCurrentPage();

    animate();
}


/* =========================================================
   SCENE
========================================================= */

function createScene() {

    scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(0x15121c);


    /* CAMERA */

    camera =
        new THREE.PerspectiveCamera(
            35,
            1,
            0.1,
            100
        );

    camera.position.set(
        8,
        5,
        10
    );


    /* RENDERER */

    renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    renderer.setSize(
        bookViewer.clientWidth,
        bookViewer.clientHeight
    );

    renderer.shadowMap.enabled = true;

    if (
        "outputEncoding" in renderer &&
        THREE.sRGBEncoding !== undefined
    ) {
        renderer.outputEncoding =
            THREE.sRGBEncoding;
    }

    bookViewer.innerHTML = "";

    bookViewer.appendChild(
        renderer.domElement
    );


    /* LUMIÈRES */

    const ambientLight =
        new THREE.AmbientLight(
            0xffffff,
            1.5
        );

    scene.add(
        ambientLight
    );


    const keyLight =
        new THREE.DirectionalLight(
            0xffffff,
            2
        );

    keyLight.position.set(
        5,
        8,
        10
    );

    keyLight.castShadow = true;

    scene.add(
        keyLight
    );


    const fillLight =
        new THREE.DirectionalLight(
            0xaabbff,
            0.6
        );

    fillLight.position.set(
        -5,
        3,
        5
    );

    scene.add(
        fillLight
    );


    updateRendererSize();

    window.addEventListener(
        "resize",
        updateRendererSize
    );
}


/* =========================================================
   CONTROLS 3D
========================================================= */

function setupControls() {

    if (
        typeof THREE.OrbitControls !==
        "function"
    ) {

        console.error(
            "OrbitControls non chargé."
        );

        return;
    }


    controls =
        new THREE.OrbitControls(
            camera,
            renderer.domElement
        );


    controls.enabled = true;

    controls.enableRotate = true;

    controls.enableZoom = true;

    controls.enablePan = true;

    controls.rotateSpeed = 0.8;

    controls.zoomSpeed = 0.8;

    controls.panSpeed = 0.5;

    controls.enableDamping = true;

    controls.dampingFactor = 0.08;

    controls.minDistance = 6;

    controls.maxDistance = 18;

    controls.target.set(
        0,
        0,
        0
    );

    controls.update();
}


/* =========================================================
   CRÉATION DU LIVRE
========================================================= */

function createBook() {

    bookGroup =
        new THREE.Group();

    scene.add(
        bookGroup
    );


    /* PAGES */

    const pageGeometry =
        new THREE.BoxGeometry(
            bookWidth,
            bookHeight,
            bookDepth
        );


    const pageMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xf4f0e5,
            roughness: 0.85,
            metalness: 0
        });


    pageMesh =
        new THREE.Mesh(
            pageGeometry,
            pageMaterial
        );

    pageMesh.castShadow = true;

    pageMesh.receiveShadow = true;

    bookGroup.add(
        pageMesh
    );


    /* COUVERTURE */

    const coverGeometry =
        new THREE.BoxGeometry(
            bookWidth + 0.18,
            bookHeight + 0.18,
            0.16
        );


    const coverMaterial =
        new THREE.MeshStandardMaterial({
            color:
                new THREE.Color(
                    coverColor.value
                ),

            roughness: 0.65,

            metalness: 0.05
        });


    /* AVANT */

    frontCover =
        new THREE.Mesh(
            coverGeometry,
            coverMaterial
        );

    frontCover.position.z =
        bookDepth / 2 + 0.08;

    frontCover.castShadow = true;

    frontCover.receiveShadow = true;

    bookGroup.add(
        frontCover
    );


    /* ARRIÈRE */

    backCover =
        new THREE.Mesh(
            coverGeometry,
            coverMaterial.clone()
        );

    backCover.position.z =
        -bookDepth / 2 - 0.08;

    backCover.castShadow = true;

    backCover.receiveShadow = true;

    bookGroup.add(
        backCover
    );


    /* DOS */

    const spineGeometry =
        new THREE.BoxGeometry(
            0.18,
            bookHeight + 0.18,
            bookDepth + 0.16
        );


    spine =
        new THREE.Mesh(
            spineGeometry,
            coverMaterial.clone()
        );

    spine.position.x =
        -bookWidth / 2 - 0.09;

    spine.castShadow = true;

    spine.receiveShadow = true;

    bookGroup.add(
        spine
    );


    bookGroup.rotation.y =
        -0.25;

    bookGroup.rotation.x =
        0.08;
}


/* =========================================================
   TEXTURE PAGE
========================================================= */

function createPageTexture() {

    pageCanvas =
        document.createElement(
            "canvas"
        );

    pageCanvas.width =
        1200;

    pageCanvas.height =
        1800;


    pageContext =
        pageCanvas.getContext(
            "2d"
        );


    pageContext.fillStyle =
        "#f4f0e5";

    pageContext.fillRect(
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
    );


    pageTexture =
        new THREE.CanvasTexture(
            pageCanvas
        );


    if (
        THREE.sRGBEncoding !== undefined
    ) {

        pageTexture.encoding =
            THREE.sRGBEncoding;
    }


    pageTexture.needsUpdate =
        true;


    pageMesh.material =
        new THREE.MeshStandardMaterial({
            map: pageTexture,

            color: 0xffffff,

            roughness: 0.9,

            metalness: 0
        });
}


/* =========================================================
   RENDU PAGE
========================================================= */

function renderCurrentPage() {

    if (
        !pageCanvas ||
        !pageContext
    ) {
        return;
    }


    if (writingMode) {

        clearCanvasForEditing();

        return;
    }


    const data =
        pagesData[currentPage];


    if (!data) {
        return;
    }


    drawPageToCanvas(
        data.html
    );


    pageTexture.needsUpdate =
        true;
}


/* =========================================================
   DESSIN TEXTE SUR LE LIVRE 3D
========================================================= */

function drawPageToCanvas(
    html
) {

    const ctx =
        pageContext;

    const width =
        pageCanvas.width;

    const height =
        pageCanvas.height;


    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    ctx.fillStyle =
        "#f4f0e5";

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    const margin = 105;

    const maxWidth =
        width -
        margin * 2;

    const temp =
        document.createElement(
            "div"
        );

    temp.innerHTML =
        html;


    let y = 115;


    function drawNode(node) {

        if (
            node.nodeType ===
            Node.TEXT_NODE
        ) {

            const text =
                node.textContent.trim();

            if (!text) {
                return;
            }


            ctx.font =
                "32px Georgia";

            ctx.fillStyle =
                "#171717";

            ctx.textAlign =
                "left";


            const words =
                text.split(
                    /\s+/
                );

            let line = "";


            for (
                let i = 0;
                i < words.length;
                i++
            ) {

                const test =
                    line +
                    words[i] +
                    " ";


                const metrics =
                    ctx.measureText(
                        test
                    );


                if (
                    metrics.width >
                        maxWidth &&
                    line !== ""
                ) {

                    ctx.fillText(
                        line,
                        margin,
                        y
                    );

                    line =
                        words[i] +
                        " ";

                    y += 48;

                } else {

                    line =
                        test;
                }
            }


            if (line) {

                ctx.fillText(
                    line,
                    margin,
                    y
                );

                y += 48;
            }


            y += 12;

            return;
        }


        if (
            node.nodeType !==
            Node.ELEMENT_NODE
        ) {
            return;
        }


        const tag =
            node.tagName.toLowerCase();


        if (tag === "h1") {

            ctx.font =
                "bold 58px Georgia";

            ctx.fillStyle =
                "#171717";

            ctx.textAlign =
                "center";


            ctx.fillText(
                node.textContent.trim(),
                width / 2,
                y
            );


            ctx.textAlign =
                "left";


            y += 100;

            return;
        }


        if (
            tag === "img"
        ) {

            /*
               Les images sont dessinées
               dans la version 3D.
            */

            return;
        }


        node.childNodes.forEach(
            drawNode
        );
    }


    temp.childNodes.forEach(
        drawNode
    );
}


/* =========================================================
   MODE ÉCRITURE
========================================================= */

function enterWritingMode() {

    if (writingMode) {
        return;
    }


    writingMode = true;


    document.body.classList.add(
        "editing"
    );


    editingStatus.textContent =
        "Mode écriture";


    btnWriting.innerHTML =
        '<i class="fa-solid fa-check"></i> Terminer';


    /* BLOQUE LE 3D */

    if (controls) {

        controls.enabled =
            false;

        controls.enableRotate =
            false;

        controls.enableZoom =
            false;

        controls.enablePan =
            false;
    }


    /* VUE FACE */

    bookGroup.rotation.set(
        0,
        0,
        0
    );


    camera.position.set(
        0,
        0,
        12
    );


    camera.lookAt(
        0,
        0,
        0
    );


    if (controls) {

        controls.target.set(
            0,
            0,
            0
        );

        controls.update();
    }


    loadCurrentPageIntoEditor();

    clearCanvasForEditing();

    updateEditorPosition();


    setTimeout(
        () => {

            pageEditor.focus();

            placeCursorAtEnd();

        },
        50
    );
}


/* =========================================================
   QUITTER ÉCRITURE
========================================================= */

function exitWritingMode() {

    if (!writingMode) {
        return;
    }


    saveEditor();


    writingMode = false;


    document.body.classList.remove(
        "editing"
    );


    editingStatus.textContent =
        "Mode lecture";


    btnWriting.innerHTML =
        '<i class="fa-solid fa-pen"></i> Écrire';


    if (controls) {

        controls.enabled =
            true;

        controls.enableRotate =
            true;

        controls.enableZoom =
            true;

        controls.enablePan =
            true;

        controls.rotateSpeed =
            0.8;

        controls.zoomSpeed =
            0.8;

        controls.panSpeed =
            0.5;
    }


    camera.position.set(
        8,
        5,
        10
    );


    camera.lookAt(
        0,
        0,
        0
    );


    bookGroup.rotation.set(
        0.08,
        -0.25,
        0
    );


    if (controls) {

        controls.target.set(
            0,
            0,
            0
        );

        controls.update();
    }


    renderCurrentPage();
}


/* =========================================================
   CHARGER PAGE
========================================================= */

function loadCurrentPageIntoEditor() {

    const page =
        pagesData[currentPage];


    if (!page) {
        return;
    }


    pageEditor.innerHTML =
        page.html;
}


/* =========================================================
   SAUVEGARDER
========================================================= */

function saveEditor() {

    if (!writingMode) {
        return;
    }


    pagesData[currentPage].html =
        pageEditor.innerHTML;


    /*
       Vérifie immédiatement si
       la page est trop pleine.
    */

    paginateCurrentPage();
}


/* =========================================================
   CURSEUR FIN
========================================================= */

function placeCursorAtEnd() {

    const selection =
        window.getSelection();

    const range =
        document.createRange();


    range.selectNodeContents(
        pageEditor
    );

    range.collapse(
        false
    );


    selection.removeAllRanges();

    selection.addRange(
        range
    );
}


/* =========================================================
   POSITION ÉDITEUR
========================================================= */

function updateEditorPosition() {

    if (!writingMode) {
        return;
    }


    const wrapper =
        document.getElementById(
            "book-wrapper"
        );


    const rect =
        wrapper.getBoundingClientRect();


    let editorWidth =
        Math.min(
            rect.width * 0.55,
            520
        );


    let editorHeight =
        editorWidth *
        (
            bookHeight /
            bookWidth
        );


    editorWidth =
        Math.max(
            280,
            editorWidth
        );


    editorHeight =
        Math.min(
            editorHeight,
            rect.height * 0.82
        );


    pageEditorLayer.style.width =
        editorWidth + "px";

    pageEditorLayer.style.height =
        editorHeight + "px";


    pageEditorLayer.style.left =
        (
            rect.width -
            editorWidth
        ) / 2 + "px";


    pageEditorLayer.style.top =
        (
            rect.height -
            editorHeight
        ) / 2 + "px";
}


/* =========================================================
   PAGINATION AUTOMATIQUE
========================================================= */

function paginateCurrentPage() {

    if (!writingMode) {
        return;
    }


    /*
       Petit délai pour laisser le navigateur
       recalculer les dimensions.
    */

    requestAnimationFrame(
        () => {

            const editor =
                pageEditor;


            /*
               Si tout tient :
               aucune action.
            */

            if (
                editor.scrollHeight <=
                editor.clientHeight + 2
            ) {

                updatePageInfo();

                return;
            }


            /*
               Récupère le dernier élément.
            */

            const children =
                Array.from(
                    editor.children
                );


            if (
                children.length === 0
            ) {

                updatePageInfo();

                return;
            }


            const overflowing =
                editor.scrollHeight >
                editor.clientHeight + 2;


            if (!overflowing) {
                return;
            }


            /*
               On prend le dernier bloc
               et on le déplace vers
               la page suivante.
            */

            const last =
                children[
                    children.length - 1
                ];


            /*
               Si même le dernier élément
               dépasse, on le déplace.
            */

            if (
                last.offsetTop +
                last.offsetHeight >
                editor.clientHeight
            ) {

                const html =
                    last.outerHTML;


                last.remove();


                createNextPageWithContent(
                    html
                );


                pagesData[currentPage].html =
                    editor.innerHTML;


                updatePageInfo();

                renderCurrentPage();
            }
        }
    );
}


/* =========================================================
   CRÉER PAGE SUIVANTE
========================================================= */

function createNextPageWithContent(
    html
) {

    const nextIndex =
        currentPage + 1;


    if (
        !pagesData[nextIndex]
    ) {

        pagesData.splice(
            nextIndex,
            0,
            {
                type: "interior",
                html: ""
            }
        );
    }


    pagesData[nextIndex].html =
        html +
        pagesData[nextIndex].html;


    /*
       On se déplace automatiquement
       sur la nouvelle page.
    */

    currentPage =
        nextIndex;


    loadCurrentPageIntoEditor();

    updatePageInfo();

    updateEditorPosition();

    placeCursorAtEnd();
}


/* =========================================================
   AJOUTER PAGE
========================================================= */

function addPage() {

    pagesData.splice(
        currentPage + 1,
        0,
        {
            type: "interior",
            html: "<p><br></p>"
        }
    );


    currentPage++;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

        updateEditorPosition();

        placeCursorAtEnd();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   PAGE SUIVANTE
========================================================= */

function nextPage() {

    if (
        currentPage >=
        pagesData.length - 1
    ) {
        return;
    }


    if (writingMode) {
        saveEditor();
    }


    currentPage++;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

        updateEditorPosition();

        placeCursorAtEnd();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   PAGE PRÉCÉDENTE
========================================================= */

function previousPage() {

    if (
        currentPage <= 0
    ) {
        return;
    }


    if (writingMode) {
        saveEditor();
    }


    currentPage--;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

        updateEditorPosition();

        placeCursorAtEnd();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   PAGE INFO
========================================================= */

function updatePageInfo() {

    pageNumber.textContent =
        currentPage + 1;

    pageTotal.textContent =
        pagesData.length;
}


/* =========================================================
   TITRE
========================================================= */

function updateBookTitle() {

    const title =
        bookTitle.value.trim();


    topTitle.textContent =
        title ||
        "Les Chroniques d'Astréa";
}


/* =========================================================
   COULEUR COUVERTURE
========================================================= */

function updateCoverColor() {

    const color =
        new THREE.Color(
            coverColor.value
        );


    if (frontCover) {

        frontCover.material.color =
            color;
    }


    if (backCover) {

        backCover.material.color =
            color;
    }


    if (spine) {

        spine.material.color =
            color;
    }
}


/* =========================================================
   FORMAT
========================================================= */

function updateBookFormat() {

    switch (
        bookFormat.value
    ) {

        case "standard":

            bookWidth = 4.6;
            bookHeight = 6.9;

            break;


        case "poche":

            bookWidth = 4.2;
            bookHeight = 6.8;

            break;


        case "grand":

            bookWidth = 5.2;
            bookHeight = 7.8;

            break;
    }


    rebuildBook();
}


/* =========================================================
   RECONSTRUIRE LIVRE
========================================================= */

function rebuildBook() {

    while (
        bookGroup.children.length
    ) {

        bookGroup.remove(
            bookGroup.children[0]
        );
    }


    createBook();

    createPageTexture();

    renderCurrentPage();

    updateEditorPosition();
}


/* =========================================================
   TAILLE DE POLICE
========================================================= */

function applyFontSize() {

    if (!writingMode) {
        return;
    }


    const size =
        parseInt(
            fontSize.value,
            10
        );


    if (
        isNaN(size) ||
        size < 6
    ) {
        return;
    }


    /*
       execCommand applique une taille
       temporaire que nous convertissons
       ensuite en pixels.
    */

    document.execCommand(
        "fontSize",
        false,
        "7"
    );


    const elements =
        pageEditor.querySelectorAll(
            'font[size="7"]'
        );


    elements.forEach(
        element => {

            element.removeAttribute(
                "size"
            );

            element.style.fontSize =
                size + "px";
        }
    );


    saveEditor();
}


/* =========================================================
   COULEUR TEXTE
========================================================= */

function applyTextColor() {

    if (!writingMode) {
        return;
    }


    document.execCommand(
        "foreColor",
        false,
        textColor.value
    );


    saveEditor();
}


/* =========================================================
   IMAGE
========================================================= */

function openImagePicker() {

    if (!writingMode) {

        enterWritingMode();

    }


    imageInput.click();
}


/* =========================================================
   INSÉRER IMAGE
========================================================= */

function insertImage(file) {

    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            const image =
                document.createElement(
                    "img"
                );


            image.src =
                event.target.result;


            /*
               Taille automatique.
               L'image ne dépassera jamais
               la largeur de la page.
            */

            image.style.maxWidth =
                "100%";


            image.style.height =
                "auto";


            image.style.display =
                "block";


            image.style.margin =
                "18px auto";


            /*
               On insère l'image à
               l'endroit du curseur.
            */

            const selection =
                window.getSelection();


            if (
                selection.rangeCount === 0
            ) {

                pageEditor.appendChild(
                    image
                );

            } else {

                const range =
                    selection.getRangeAt(0);


                range.deleteContents();


                range.insertNode(
                    image
                );


                range.setStartAfter(
                    image
                );

                range.collapse(
                    true
                );


                selection.removeAllRanges();

                selection.addRange(
                    range
                );
            }


            /*
               Sauvegarde puis pagination.
            */

            saveEditor();

            forceImagePagination(
                image
            );
        };


    reader.readAsDataURL(
        file
    );
}


/* =========================================================
   PAGINATION IMAGE
========================================================= */

function forceImagePagination(
    image
) {

    requestAnimationFrame(
        () => {

            /*
               Si l'image dépasse la page,
               on la déplace entièrement
               sur la page suivante.
            */

            const editorRect =
                pageEditor.getBoundingClientRect();


            const imageRect =
                image.getBoundingClientRect();


            const bottom =
                imageRect.bottom;


            const pageBottom =
                editorRect.bottom;


            if (
                bottom >
                pageBottom
            ) {

                const imageHTML =
                    image.outerHTML;


                image.remove();


                pagesData[currentPage].html =
                    pageEditor.innerHTML;


                createNextPageWithContent(
                    imageHTML
                );


                loadCurrentPageIntoEditor();


                updatePageInfo();


                setTimeout(
                    () => {

                        pageEditor.focus();

                        placeCursorAtEnd();

                    },
                    20
                );
            }


            saveEditor();
        }
    );
}


/* =========================================================
   COUVERTURE AUTOMATIQUE
========================================================= */

function createFrontCover() {

    /*
       On crée une page spéciale
       pour la couverture.
    */

    pagesData.unshift({
        type: "front-cover",

        html: `
            <div class="cover-page">
                <h1>${escapeHTML(
                    bookTitle.value
                )}</h1>

                <p>
                    Écrit par
                </p>
            </div>
        `
    });


    currentPage = 0;

    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   QUATRIÈME DE COUVERTURE
========================================================= */

function createBackCover() {

    pagesData.push({
        type: "back-cover",

        html: `
            <div class="cover-page">
                <h1>Les Chroniques d'Astréa</h1>

                <p>
                    Découvrez l'univers d'Astréa,
                    ses dragons, ses mystères
                    et ses anciennes civilisations.
                </p>
            </div>
        `
    });


    currentPage =
        pagesData.length - 1;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   DOS
========================================================= */

function createSpine() {

    pagesData.push({
        type: "spine",

        html: `
            <div class="cover-page">
                <h1>${escapeHTML(
                    bookTitle.value
                )}</h1>
            </div>
        `
    });


    currentPage =
        pagesData.length - 1;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   NOUVELLE PAGE INTÉRIEURE
========================================================= */

function createInteriorPage() {

    pagesData.splice(
        currentPage + 1,
        0,
        {
            type: "interior",

            html:
                "<p><br></p>"
        }
    );


    currentPage++;


    updatePageInfo();


    if (writingMode) {

        loadCurrentPageIntoEditor();

        updateEditorPosition();

        pageEditor.focus();

    } else {

        renderCurrentPage();
    }
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    text
) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        text;

    return div.innerHTML;
}


/* =========================================================
   EXPORT
========================================================= */

function exportPDF() {

    if (writingMode) {
        exitWritingMode();
    }


    setTimeout(
        () => {

            window.print();

        },
        200
    );
}


/* =========================================================
   RESIZE
========================================================= */

function updateRendererSize() {

    if (
        !renderer ||
        !camera
    ) {
        return;
    }


    const width =
        bookViewer.clientWidth;

    const height =
        bookViewer.clientHeight;


    if (
        width <= 0 ||
        height <= 0
    ) {
        return;
    }


    renderer.setSize(
        width,
        height,
        false
    );


    camera.aspect =
        width / height;


    camera.updateProjectionMatrix();


    updateEditorPosition();
}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* ÉCRIRE */

    btnWriting.addEventListener(
        "click",
        () => {

            if (writingMode) {

                exitWritingMode();

            } else {

                enterWritingMode();
            }
        }
    );


    /* PAGES */

    btnAddPage.addEventListener(
        "click",
        addPage
    );

    btnNewPage.addEventListener(
        "click",
        createInteriorPage
    );


    btnPrev.addEventListener(
        "click",
        previousPage
    );

    canvasPrev.addEventListener(
        "click",
        previousPage
    );


    btnNext.addEventListener(
        "click",
        nextPage
    );

    canvasNext.addEventListener(
        "click",
        nextPage
    );


    /* TITRE */

    bookTitle.addEventListener(
        "input",
        updateBookTitle
    );


    /* COULEUR */

    coverColor.addEventListener(
        "input",
        updateCoverColor
    );


    /* FORMAT */

    bookFormat.addEventListener(
        "change",
        updateBookFormat
    );


    /* TEXTE */

    pageEditor.addEventListener(
        "input",
        () => {

            saveEditor();

        }
    );


    /*
       Taille de police :
       l'utilisateur peut taper
       directement 13, 17, 24, 42...
    */

    fontSize.addEventListener(
        "change",
        applyFontSize
    );

    fontSize.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                applyFontSize();
            }
        }
    );


    /* COULEUR TEXTE */

    textColor.addEventListener(
        "input",
        applyTextColor
    );


    /* IMAGE */

    btnImage.addEventListener(
        "click",
        openImagePicker
    );


    imageInput.addEventListener(
        "change",
        event => {

            const file =
                event.target.files[0];


            if (file) {

                insertImage(file);

            }


            imageInput.value =
                "";
        }
    );


    /* COUVERTURES */

    btnFrontCover.addEventListener(
        "click",
        createFrontCover
    );

    btnBackCover.addEventListener(
        "click",
        createBackCover
    );

    btnSpine.addEventListener(
        "click",
        createSpine
    );


    /* EXPORT */

    btnExport.addEventListener(
        "click",
        exportPDF
    );


    /* RESIZE */

    window.addEventListener(
        "resize",
        updateEditorPosition
    );
}


/* =========================================================
   ANIMATION
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    if (
        controls &&
        controls.enabled
    ) {

        controls.update();
    }


    renderer.render(
        scene,
        camera
    );
}
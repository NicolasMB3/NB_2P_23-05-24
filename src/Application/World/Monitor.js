import Application from "../Application.js";
import { IFRAME_WIDTH, IFRAME_HEIGHT, URL_OS } from "../variables.js";
import { CSS3DObject } from "three/addons";
import * as THREE from "three";
import EventEmitter from '../Utils/EventEmitter.js';

export default class Monitor {
    constructor() {
        this.application = new Application();
        this.scene3D = this.application.scene3D;
        this.scene = this.application.scene;

        this.size = this.application.sizes;
        this.screenSize = new THREE.Vector2(IFRAME_WIDTH, IFRAME_HEIGHT);

        this.position = new THREE.Vector3(514, 2215, -3278);
        this.rotation = new THREE.Euler(6.25 * THREE.MathUtils.DEG2RAD, 0, 0);

        this.eventEmitter = new EventEmitter();

        this.createIframe();
        this.initRaycaster();
    }

    createIframe() {
        this.container = document.createElement('div');
        this.container.style.width = this.screenSize.width + 'px';
        this.container.style.height = this.screenSize.height + 'px';
        this.container.style.opacity = '1';
        this.container.style.background = '#1d2e2f';

        this.iframe = document.createElement('iframe');
        this.iframe.src = URL_OS;
        this.iframe.style.width = '100%';
        this.iframe.style.height =  '100%';
        this.iframe.style.boxSizing = 'border-box';
        this.iframe.style.opacity = '1';
        this.iframe.title = 'PrototypeOS';

        this.container.appendChild(this.iframe);

        this.blendingMesh(this.container);
    }

    blendingMesh(iframeContainer) {
        this.object = new CSS3DObject(iframeContainer);
        this.object.position.copy(this.position);
        this.object.rotation.copy(this.rotation);

        this.scene3D.add(this.object);
        this.blendingMeshMaterial(this.object);
        this.createMeshes(this.object);
    }

    blendingMeshMaterial(object) {
        this.material = new THREE.MeshLambertMaterial({
            opacity: 0,
            color: new THREE.Color(0x000000),
            blending: THREE.NoBlending,
            side: THREE.DoubleSide,
            transparent: false,
            depthWrite: false,
        });

        this.geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        this.mesh = new THREE.Mesh(this.geometry, this.material);

        this.mesh.position.copy(object.position);
        this.mesh.rotation.copy(object.rotation);
        this.mesh.scale.copy(object.scale);

        this.scene.add(this.mesh);
    }

    createMeshes(cssObject) {
        this.meshBlend = this.createBlendMesh(cssObject);
        this.scene.add(this.meshBlend);

        const fingerprintsTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/fingerprints.jpg', 0.04, 1);
        const shadowTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/shadow.png', 1, 2);
        const dustTextureMesh = this.createTextureMesh(cssObject, './textures/monitor/dust.jpg', 0.02, 3);

        this.scene.add(fingerprintsTextureMesh);
        this.scene.add(shadowTextureMesh);
        this.scene.add(dustTextureMesh);
    }

    createBlendMesh(cssObject) {
        const material = new THREE.MeshBasicMaterial({
            opacity: 0,
            color: new THREE.Color(0x000000),
            blending: THREE.NoBlending,
            side: THREE.DoubleSide,
            transparent: false,
            depthWrite: false,
        });
        const geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const meshBlend = new THREE.Mesh(geometry, material);

        meshBlend.position.copy(cssObject.position);
        meshBlend.rotation.copy(cssObject.rotation);
        meshBlend.scale.copy(cssObject.scale);

        return meshBlend;
    }

    createTextureMesh(cssObject, texturePath, opacity, zOffset) {
        const texture = new THREE.TextureLoader().load(texturePath);
        const material = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true,
            opacity: opacity
        });
        const geometry = new THREE.PlaneGeometry(IFRAME_WIDTH, IFRAME_HEIGHT);
        const textureMesh = new THREE.Mesh(geometry, material);

        textureMesh.position.copy(cssObject.position);
        textureMesh.rotation.copy(cssObject.rotation);
        textureMesh.scale.copy(cssObject.scale);

        textureMesh.position.z += zOffset;

        return textureMesh;
    }

    initRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        window.addEventListener('mousemove', (event) => {
            this.onMouseMove(event);
        });
    }

    onMouseMove(event) {

        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.application.camera.instance);

        const intersects = this.raycaster.intersectObject(this.mesh);

        if (intersects.length > 0) {
            this.eventEmitter.trigger('screen:mouseover');
        } else {
            this.eventEmitter.trigger('screen:mouseout');
        }
    }
}
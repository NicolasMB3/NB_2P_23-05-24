import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import EventEmitter from "./EventEmitter.js";

export default class Resources extends EventEmitter {
    constructor(sources, loadingManager) {
        super();
        this.sources = sources;

        this.items = {};
        this.toLoad = this.sources.length;
        this.loaded = 0;

        this.loadingManager = loadingManager;

        this.setLoaders();
        this.startLoading();
    }

    setLoaders() {
        this.loaders = {};

        // Create DRACOLoader instance and set the decoder path
        const dracoLoader = new DRACOLoader(this.loadingManager);
        dracoLoader.setDecoderPath('./draco/');

        // Create GLTFLoader instance and set DRACOLoader
        this.loaders.gltfLoader = new GLTFLoader(this.loadingManager);
        this.loaders.gltfLoader.setDRACOLoader(dracoLoader);

        this.loaders.textureLoader = new THREE.TextureLoader(this.loadingManager);
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader(this.loadingManager);
    }

    startLoading() {
        for(const source of this.sources) {
            if(source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    }
                );
            } else if(source.type === 'texture') {
                this.loaders.textureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    }
                );
            } else if(source.type === 'cubeTexture') {
                this.loaders.cubeTextureLoader.load(
                    source.path,
                    (file) => {
                        this.sourceLoaded(source, file);
                    }
                );
            }
        }
    }

    sourceLoaded(source, file) {
        this.items[source.name] = file;
        this.loaded++;

        if(this.loaded === this.toLoad) {
            this.trigger('ready');
        }
    }
}
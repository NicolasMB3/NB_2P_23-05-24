import Application from '../Application.js';

import Scene from "./Scene.js";
import DeskAndStuffs from "./DeskAndStuffs.js";
import Computer from "./Computer.js";
import Furnitures from "./Furnitures.js";
import Chocolate from "./Chocolate.js";

import Monitor from "./Monitor.js";
import EventEmitter from "../Utils/EventEmitter.js";

export default class World extends EventEmitter {
    constructor() {
        super();

        this.application = new Application();
        this.scene = this.application.scene;
        this.resources = this.application.resources;

        this.resources.on('ready', () => {
            this.scene = new Scene();
            this.computer = new Computer();
            this.deskAndStuffs = new DeskAndStuffs();
            this.furnitures = new Furnitures();
            this.chocolate = new Chocolate();
            this.monitor = new Monitor();
            this.trigger('monitorReady', [this.monitor]);
        });
    }

    update() {
        if (this.chocolate) this.chocolate.update();
    }
}

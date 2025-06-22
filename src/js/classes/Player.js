import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class Player {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.mesh = null;
        this.speed = 9; 
        this.bulletCooldown = 0;
        this.loadModel();
        this.setupControls();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            '/assets/models/Player_1.glb',
            (gltf) => {
                this.mesh = gltf.scene;
                this.mesh.position.set(0, -15, 0); 
                this.mesh.scale.set(0.5, 0.5, 1);
                this.mesh.userData = { type: 'player', parent: this };
                this.scene.add(this.mesh);

                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: new THREE.TextureLoader().load('/assets/textures/player.jpg'),
                            roughness: 0.5,
                            metalness: 0.2
                        });
                    }
                });
            },
            undefined,
            (error) => {
                console.error('Error loading Player_1.glb:', error);
            }
        );
    }

    setupControls() {
        this.keys = { a: false, d: false, space: false };
        window.addEventListener('keydown', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.keys.a = true;
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.keys.d = true;
            if (e.key === ' ' || e.key === 'Spacebar') this.keys.space = true;
        });
        window.addEventListener('keyup', (e) => {
            if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') this.keys.a = false;
            if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') this.keys.d = false;
            if (e.key === ' ' || e.key === 'Spacebar') this.keys.space = false;
        });
    }

    update(delta) {
        if (!this.mesh) return;

        if (this.keys.a && this.mesh.position.x > -20) {
            this.mesh.position.x -= this.speed * delta;
        }
        if (this.keys.d && this.mesh.position.x < 20) {
            this.mesh.position.x += this.speed * delta;
        }

        this.bulletCooldown -= delta;
        if (this.keys.space && this.bulletCooldown <= 0) {
            this.game.spawnPlayerBullet(this.mesh.position);
            this.bulletCooldown = 0.5; // Cooldown in seconds
        }

        console.log(this.mesh.position.x);
    }

    hit() {
        this.scene.remove(this.mesh);
        this.game.onPlayerDestroyed();
    }
}
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Explosion } from './Explosion.js';

export class Alien {
    constructor(scene, position, type, game) {
        this.scene = scene;
        this.position = position;
        this.type = type;
        this.game = game;
        this.mesh = null;
        this.lives = 4; // All aliens take 4 hits to die
        this.speed = 0.01;
        this.direction = 1;
        this.bulletCooldown = 0;
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            `/assets/models/${this.type}.glb`,
            (gltf) => {
                this.mesh = gltf.scene;
                this.mesh.position.copy(this.position);
                this.mesh.scale.set(0.5, 0.5, 0.5);
                this.mesh.userData = { type: 'alien', parent: this };

                this.scene.add(this.mesh);

                // Apply texture and set userData on all child meshes
                this.mesh.traverse((child) => {
                    let texturePath = [
                        '/assets/textures/Alien_1.jpg',
                        '/assets/textures/Alien_2.jpg',
                        '/assets/textures/Alien_3.jpg'
                    ];
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: new THREE.TextureLoader().load(texturePath[Math.random() * 3 | 0]),
                            roughness: 0.5,
                            metalness: 0.2
                        });
                        // Set userData on each mesh part for collision detection
                        child.userData.type = 'alien';
                        child.userData.parent = this;
                    }
                });
            },
            undefined,
            (error) => {
                console.error(`Error loading ${this.type}.glb:`, error);
            }
        );
    }

    update(delta) {
        if (!this.mesh) return;

        // Move side to side
        this.mesh.position.x += this.speed * this.direction * delta * 60;

        // Reverse direction if hitting boundaries
        if (Math.abs(this.mesh.position.x) > 20) {
            this.direction *= -1;
            this.mesh.position.y -= 2; // Move down when hitting boundary
        }

        // Randomly shoot bullets, but less frequently and staggered
        this.bulletCooldown -= delta;
        if (this.bulletCooldown <= 0 && Math.random() < 0.002) { // Lower probability (was 0.01)
            this.game.spawnAlienBullet(this.mesh.position);
            // Add random cooldown between 1.5 and 3.5 seconds
            this.bulletCooldown = 1.5 + Math.random() * 2;
        }
    }

    hit() {
        this.lives -= 1;
        console.log('Alien hit! Lives left:', this.lives);
        if (this.lives <= 0) {
            new Explosion(this.scene, this.mesh.position, 10, 1);
            this.scene.remove(this.mesh);
            this.game.onAlienDestroyed(this);
            return true; // Alien destroyed
        } else {
            // Visual feedback for hit
            this.mesh.rotation.x += (Math.random() - 0.5) * 0.3;
            new Explosion(this.scene, this.mesh.position, 5, 0.5); // Smaller explosion for hit
            return false;
        }
    }
}
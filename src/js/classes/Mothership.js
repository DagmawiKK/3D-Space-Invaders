import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Explosion } from './Explosion.js';

export class Mothership {
    constructor(scene, game) {
        this.scene = scene;
        this.game = game;
        this.mesh = null;
        this.lives = 5; // Mothership is tougher
        this.speed = 0.1;
        this.direction = Math.random() > 0.5 ? 1 : -1; // Random start direction
        this.bulletCooldown = 0;
        this.loadModel();
    }

    loadModel() {
        const loader = new GLTFLoader();
        loader.load(
            '/assets/models/Mothership.glb',
            (gltf) => {
                this.mesh = gltf.scene;
                this.mesh.position.set(this.direction * 20, 15, 0); // Start at edge
                this.mesh.scale.set(1, 1, 1); // Larger scale for mothership
                this.mesh.userData = { type: 'mothership', lives: this.lives, parent: this };
                this.scene.add(this.mesh);

                // Apply texture
                this.mesh.traverse((child) => {
                    if (child.isMesh) {
                        child.material = new THREE.MeshStandardMaterial({
                            map: new THREE.TextureLoader().load('/assets/textures/Mothership.jpg'),
                            roughness: 0.4,
                            metalness: 0.3
                        });
                    }
                });
            },
            undefined,
            (error) => {
                console.error('Error loading Mothership.glb:', error);
            }
        );
    }

    update(delta) {
        if (!this.mesh) return;

        // Move side to side
        this.mesh.position.x += this.speed * this.direction * delta * 60;

        // Reverse direction at boundaries
        if (Math.abs(this.mesh.position.x) > 20) {
            this.direction *= -1;
        }

        // Randomly shoot bullets
        this.bulletCooldown -= delta;
        if (this.bulletCooldown <= 0 && Math.random() < 0.02) {
            this.game.spawnAlienBullet(this.mesh.position);
            this.bulletCooldown = 1.5; // Shorter cooldown for mothership
        }
    }

    hit() {
        this.lives -= 1;
        if (this.lives <= 0) {
            new Explosion(this.scene, this.mesh.position, 20, 2); // Larger explosion
            this.scene.remove(this.mesh);
            this.game.onMothershipDestroyed(this);
            return true; // Mothership destroyed
        } else {
            // Visual feedback for hit
            this.mesh.rotation.z += (Math.random() - 0.5) * 0.25;
            new Explosion(this.scene, this.mesh.position, 10, 1); // Smaller explosion
            return false;
        }
    }
}
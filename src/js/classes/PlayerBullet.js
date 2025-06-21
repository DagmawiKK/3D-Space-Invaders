import * as THREE from 'three';

export class PlayerBullet {
    constructor(scene, position, game) {
        this.scene = scene;
        this.game = game;
        this.maxY = 120;
        this.offset = 2;
        this.bulletSpeed = 1.25;
        this.disposed = false;

        // Create bullet geometry and material
        const geometry = new THREE.BoxGeometry(0.5, 4, 1);
        const material = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load('/assets/textures/player.jpg'),
            roughness: 0.5,
            metalness: 0.2
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(position).add(new THREE.Vector3(0, this.offset, 0));
        this.mesh.userData = { type: 'playerbullet', parent: this };
        this.scene.add(this.mesh);
    }

    update(delta) {
        if (this.disposed) return;

        // Move bullet upward
        this.mesh.position.y += this.bulletSpeed * delta * 60;

        // Destroy if beyond maxY
        if (this.mesh.position.y > this.maxY) {
            this.destroyBullet();
        }

        // Collision detection is handled by Game.js via raycasting
    }

    handleCollision(collidedMesh) {
        if (!collidedMesh.userData || !collidedMesh.userData.type) {
            this.destroyBullet();
            return;
        }

        const collidedType = collidedMesh.userData.type;

        if (collidedType === 'alien' || collidedType === 'mothership') {
            // Trigger the hit() method on the parent object (Alien or Mothership)
            collidedMesh.userData.parent?.hit();

            // The explosion logic is now correctly handled in Game.js (`checkCollisions` for impact
            // and `onAlienDestroyed`/`onMothershipDestroyed` for destruction).
            // We removed the unmanaged `new Explosion(...)` calls from here.

            // You can still play a sound on impact if you wish.
            // this.game.playSound('alienExplosion');

            this.destroyBullet(); // Destroy the bullet after it hits something.

        } else if (collidedType === 'barrier') {
            this.game.onBarrierDestroyed(collidedMesh);
            this.destroyBullet();
        } else {
            // If it hits something else unexpected, just destroy the bullet.
            this.destroyBullet();
        }
    }

    destroyBullet() {
        if (this.mesh.parent) {
            this.scene.remove(this.mesh);
        }
        this.disposed = true;
    }
}
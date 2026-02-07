import { IsoUtils } from '../utils/IsoUtils.js';

export class Department {
    constructor(scene, config) {
        this.scene = scene;
        this.config = config;
        this.role = config.role;
        this.id = config.role.id;
        this.gridBounds = { x: config.x, y: config.y, width: config.width, height: config.height };
        this.agents = [];
        this.gameObjects = [];
        this.center = { x: 0, y: 0 };
        this.render();
    }

    render() {
        const { x, y, width, height, role } = this.config;
        const floorType = role.floorType || 'stone';
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

        // Floor
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                const iso = IsoUtils.gridToIso(x + dx, y + dy);
                const frame = ((dx + dy) % 3);
                const texKey = 'floor_' + floorType + '_' + frame;
                const useKey = this.scene.textures.exists(texKey) ? texKey : 'floor_' + floorType + '_0';

                if (this.scene.textures.exists(useKey)) {
                    this.gameObjects.push(this.scene.add.image(iso.x, iso.y, useKey).setDepth(iso.y - 50));
                }

                const overlay = this.scene.add.graphics();
                overlay.fillStyle(role.color, 0.12);
                overlay.beginPath();
                overlay.moveTo(iso.x, iso.y - IsoUtils.halfTH);
                overlay.lineTo(iso.x + IsoUtils.halfTW, iso.y);
                overlay.lineTo(iso.x, iso.y + IsoUtils.halfTH);
                overlay.lineTo(iso.x - IsoUtils.halfTW, iso.y);
                overlay.closePath(); overlay.fillPath();
                overlay.setDepth(iso.y - 49);
                this.gameObjects.push(overlay);

                minX = Math.min(minX, iso.x - IsoUtils.halfTW);
                maxX = Math.max(maxX, iso.x + IsoUtils.halfTW);
                minY = Math.min(minY, iso.y - IsoUtils.halfTH);
                maxY = Math.max(maxY, iso.y + IsoUtils.halfTH);
            }
        }

        // Walls
        this.addDepartmentWalls(x, y, width, height).forEach(w => this.gameObjects.push(w));

        // Label
        this.center.x = (minX + maxX) / 2;
        this.center.y = (minY + maxY) / 2;
        const labelY = minY - 30;

        const glow = this.scene.add.graphics();
        glow.fillStyle(role.color, 0.15).fillCircle(this.center.x, labelY + 5, 80).setDepth(9990);
        this.gameObjects.push(glow);

        const labelBg = this.scene.add.graphics();
        labelBg.fillStyle(0x1a1a3a, 0.95).fillRoundedRect(this.center.x - 70, labelY - 14, 140, 32, 8);
        labelBg.lineStyle(2, role.color, 0.9).strokeRoundedRect(this.center.x - 70, labelY - 14, 140, 32, 8).setDepth(9991);
        this.gameObjects.push(labelBg);

        const labelText = this.scene.add.text(this.center.x, labelY + 2, `${role.icon} ${role.name}`, {
            fontSize: '14px', fontFamily: 'Orbitron', color: role.colorHex
        }).setOrigin(0.5).setDepth(9992);
        this.gameObjects.push(labelText);
    }

    addDepartmentWalls(sx, sy, w, h) {
        const walls = [];
        for (let r = sy; r < sy + h; r++) {
            const iso = IsoUtils.gridToIso(sx, r);
            const wallX = iso.x - IsoUtils.halfTW / 2;
            const wallY = iso.y - IsoUtils.halfTH / 2;
            const useWindow = (r - sy) % 3 === 1;
            const texKey = useWindow ? 'wall_win_se_0' : 'wall_se_0';
            if (this.scene.textures.exists(texKey)) {
                walls.push(this.scene.add.image(wallX, wallY, texKey).setOrigin(0.5, 1.0).setDepth(iso.y + 10));
            }
        }
        for (let c = sx; c < sx + w; c++) {
            const iso = IsoUtils.gridToIso(c, sy);
            const wallX = iso.x + IsoUtils.halfTW / 2;
            const wallY = iso.y - IsoUtils.halfTH / 2;
            const useWindow = (c - sx) % 3 === 1;
            const texKey = useWindow ? 'wall_win_sw_0' : 'wall_sw_0';
            if (this.scene.textures.exists(texKey)) {
                walls.push(this.scene.add.image(wallX, wallY, texKey).setOrigin(0.5, 1.0).setDepth(iso.y + 10));
            }
        }
        return walls;
    }

    destroy() {
        this.gameObjects.forEach(o => o.destroy());
        this.agents.forEach(a => a.destroy());
    }
}

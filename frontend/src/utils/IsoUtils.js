export class IsoUtils {
    static get tileWidth() { return 128; }
    static get tileHeight() { return 64; }
    static get halfTW() { return 64; }
    static get halfTH() { return 32; }
    static get worldOffsetX() { return 1200; }
    static get worldOffsetY() { return 200; }

    static gridToIso(col, row) {
        return {
            x: (col - row) * this.halfTW + this.worldOffsetX,
            y: (col + row) * this.halfTH + this.worldOffsetY
        };
    }
}

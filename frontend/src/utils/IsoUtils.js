export class IsoUtils {
    static get tileWidth() { return 64; }
    static get tileHeight() { return 32; }
    static get halfTW() { return 32; }
    static get halfTH() { return 16; }
    static get worldOffsetX() { return 800; }
    static get worldOffsetY() { return 100; }

    static gridToIso(col, row) {
        return {
            x: (col - row) * this.halfTW + this.worldOffsetX,
            y: (col + row) * this.halfTH + this.worldOffsetY
        };
    }
}

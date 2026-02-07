const ASSET_BASE = '';
const FLOOR_BASE = ASSET_BASE + 'SBS - Isometric Floor Tiles - Small 128x64/Small 128x64/';
const WALL_BASE = ASSET_BASE + 'SBS - Isometric Wall Pack - Small/Small Wall Tiles/';
const OBJ_BASE = ASSET_BASE + 'SBS - Isometric Object Pack/';

export const TILE_ASSETS = {
    floor_grass:  { path: FLOOR_BASE + 'Exterior/Grass/Floor_Grass_01-128x64.png', fw: 128, fh: 64 },
    floor_wood:   { path: FLOOR_BASE + 'Interior/Wood/Floor_Wood_01-128x64.png', fw: 128, fh: 64 },
    floor_tile:   { path: FLOOR_BASE + 'Interior/Tile/Floor_Tile_01-128x64.png', fw: 128, fh: 64 },
    floor_stone:  { path: FLOOR_BASE + 'Interior/Stone/Floor_Stone_01-128x64.png', fw: 128, fh: 64 },
    floor_brick:  { path: FLOOR_BASE + 'Interior/Brick/Floor_Brick_01-128x64.png', fw: 128, fh: 64 },
    floor_metal:  { path: FLOOR_BASE + 'Interior/Metal/Floor_Metal_01-128x64.png', fw: 128, fh: 64 },
    wall_se:      { path: WALL_BASE + 'Flat 64x96/Flat_Stone_01-SE-64x96.png', fw: 64, fh: 96 },
    wall_sw:      { path: WALL_BASE + 'Flat 64x96/Flat_Stone_01-SW-64x96.png', fw: 64, fh: 96 },
    wall_win_se:  { path: WALL_BASE + 'Flat 64x96/Flat_Stone_01_WindowA-SE-64x96.png', fw: 64, fh: 96 },
    wall_win_sw:  { path: WALL_BASE + 'Flat 64x96/Flat_Stone_01_WindowA-SW-64x96.png', fw: 64, fh: 96 },
    crate:        { path: OBJ_BASE + 'Boxes/Crates - Wood 64x64.png', fw: 64, fh: 64 }
};

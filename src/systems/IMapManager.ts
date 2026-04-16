export interface IMapManager {
    isBuildable(x: number, y: number): boolean;
    getTileCenter(x: number, y: number): { x: number, y: number };
}

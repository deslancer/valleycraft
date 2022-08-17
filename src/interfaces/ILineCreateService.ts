import type BABYLON from "babylonjs";


export interface ILineCreateService {
    create(): object;
    update(): object;
    delete(): object;
    getPoints(): Array<BABYLON.Vector3>;
    isClosed(): boolean;
    removeLastPoint(): object;
    setLineColor(color: BABYLON.Color3): object;
    toggleGridSnap(state: boolean): void;
}
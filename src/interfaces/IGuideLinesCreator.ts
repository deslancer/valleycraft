import type GUI from "babylonjs-gui";

export interface IGuideLinesCreator{
    createX(): GUI.Line;
    createY(): GUI.Line;
    showX(): void;
    showY(): void;
    hideX(): void;
    hideY(): void;
    setPositionX(position): void;
    setPositionY(position): void;
    removeAll(): void;
    isGuidesExists(): boolean;
}

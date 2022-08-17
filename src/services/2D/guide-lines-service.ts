import * as GUI from 'babylonjs-gui';
import type { IGuideLinesCreator } from "../../interfaces/IGuideLinesCreator";

export class GuideLinesService implements IGuideLinesCreator{
    private advancedDynamicTexture;
    private lineWidth: number = 1.5;
    private guidelineX: GUI.Line;
    private guidelineY: GUI.Line;
    isExists: boolean = false;
    constructor(scene) {
        this.advancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
    }


    createX(): GUI.Line {
        const line = new GUI.Line();
        line.x1 = 500;
        line.y1 = 0;
        line.x2 = 500;
        line.y2 = 1000;
        line.lineWidth = this.lineWidth;
        line.color = "blue";
        line.isVisible = false;
        this.advancedDynamicTexture.addControl(line);
        this.guidelineX = line;
        this.isExists = true;
        return line;
    }

    createY(): GUI.Line {
        const line =  new GUI.Line();
        line.x1 = 0;
        line.y1 = 500;
        line.x2 = 3000;
        line.y2 = 500;
        line.lineWidth = this.lineWidth;
        line.isVisible = false;
        line.color = "red";
        this.advancedDynamicTexture.addControl(line);
        this.guidelineY = line;
        this.isExists = true;
        return line;
    }

    showX(): void {
        this.guidelineX.isVisible = true;
    }

    showY(): void {
        this.guidelineY.isVisible = true;
    }
    setPositionX(x:number): void{
        this.guidelineX.x1 = x;
        this.guidelineX.x2 = x;
    }
    setPositionY(y: number): void{
        this.guidelineY.y1 = y;
        this.guidelineY.y2 = y;
    }
    hideX(): void {
        this.guidelineX.isVisible = false;
    }

    hideY(): void {
        this.guidelineY.isVisible = false;
    }
    isGuidesExists(){
        return this.isExists;
    }
    removeAll() {
        this.guidelineY.dispose();
        this.guidelineX.dispose();
        this.isExists = false;
    }
}
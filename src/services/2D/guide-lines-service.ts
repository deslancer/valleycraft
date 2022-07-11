import * as GUI from 'babylonjs-gui';

export class GuideLinesService {
    private advancedDynamicTexture;
    private lineWidth: number = 1.5;
    private guidelineX: GUI.Line;
    private guidelineY: GUI.Line;
    constructor(scene) {
        this.advancedDynamicTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
        this.createGuideLineX();
        this.createGuideLineY();
    }
    createGuideLineX(){
        const line = new GUI.Line();
        line.x1 = 500;
        line.y1 = 0;
        line.x2 = 500;
        line.y2 = 1000;
        line.lineWidth = this.lineWidth;
        line.color = "blue";
        line.isVisible = false;
        this.advancedDynamicTexture.addControl(line);
        this.guidelineX = line
    }
    createGuideLineY(){
        const line =  new GUI.Line();
        line.x1 = 0;
        line.y1 = 500;
        line.x2 = 3000;
        line.y2 = 500;
        line.lineWidth = this.lineWidth;
        line.color = "red";
        line.isVisible = false;
        this.advancedDynamicTexture.addControl(line);
        this.guidelineY = line;
    }
    getLineX(){
        return this.guidelineX;
    }
    getLineY(){
        return this.guidelineY;
    }
}
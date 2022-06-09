import * as BABYLON from 'babylonjs';

export class LightService {
    private readonly scene;
    constructor(scene) {
        this.scene = scene;
    }

    createHemisphericLight(){
      return new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), this.scene);
    }

    createDirectionalLights() {
        const lights = [];
        const light = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(0.8, -0.55, 0.25), this.scene)
        light.position.x = -3.530;
        light.position.y = 5.098;
        light.position.z = -0.815;
        light.intensity = 1
        lights.push(light);
        const light2 = new BABYLON.DirectionalLight('light', new BABYLON.Vector3(0.8, -0.55, 0.25), this.scene)
        light2.position.x = 5.530;
        light2.position.y = 5.098;
        light2.position.z = 1.815;
        light2.intensity = 1;
        lights.push(light2)
        return lights
    }
}

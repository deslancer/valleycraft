<script lang="ts">
    import { onMount } from "svelte";
    import { createScene } from "./scene";
    import { BuildingCreatorService } from "./services/3D/building-creator-service";

    let el;
    let createdScene;
    let loading = true;
    onMount( () => {
        createScene( el ).then( ( result ) => {
            createdScene = result;
        } );
    } );
    const buildingCreator = new BuildingCreatorService();

    function createBuilding() {
        buildingCreator.build( createdScene );
        createdScene.setActiveCameraByName( 'perspective' )
    }
</script>
<style>
    canvas {
        color: black;
    }

    .btn {
        position: absolute;
        top: 20px;
        left: 20px;
    }
</style>
<button on:click={()=> createBuilding()} class="btn">Build House</button>
<canvas bind:this={el}></canvas>


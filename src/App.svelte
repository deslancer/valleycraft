<script lang="ts">
  import { onMount } from "svelte";
  import { createScene } from "./scene";

  let el;
  let createdScene;
  let loading = true;
  onMount(() => {
    createScene(el).then((result) => {
      createdScene = result;
    });
  });
</script>

<canvas bind:this={el} />


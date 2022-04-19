<template>
	<div class="home">
		<UnderConstruction msg="Welcome to Your Vue.js + TypeScript App" />
	</div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import UnderConstruction from '@/components/UnderConstruction.vue'; // @ is an alias to /src

@Options({
	components: {
		UnderConstruction,
	},
})
export default class HomeView extends Vue {}
</script>

<template>
	<div class="home">
		<UnderConstruction msg="Welcome to Your Vue.js + TypeScript App" />
		<Articles :articles="articles" />
	</div>
</template>

<script lang="js">
import UnderConstruction from '@/components/UnderConstruction.vue';
import Articles from '@/components/articles.vue';
import { defineComponent } from 'vue';
import axios from 'axios';

export default defineComponent({
	components: { UnderConstruction, Articles },
	data() {
		return {
			articles: [],
		};
	},
	mounted() {
		axios
			.get(`${process.env.VUE_APP_API_URL}/articles`, {
				headers: {},
			})
			.then((response) => (this.articles = response.data));
	},
});
</script>

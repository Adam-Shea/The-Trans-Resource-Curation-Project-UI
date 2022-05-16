<template>
	<section>
		<Article
			v-for="(article, index) in articles"
			:key="index"
			:title="article.title"
			:text="article.description"
			:date="article.createdAt"
		/>
	</section>
</template>

<script lang="js">
import { defineComponent } from 'vue';
import Article from './article.vue';

export default defineComponent({
	name: 'ArticleGroup',
	components: {
		Article,
	},
	props: ['articles'],
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
section {
	display: flex;
	justify-content: space-evenly;
	flex-wrap: wrap;
	width: 100%;
	margin-top: 20px;
}
</style>

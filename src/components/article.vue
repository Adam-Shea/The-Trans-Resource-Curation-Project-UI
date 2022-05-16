<template>
	<article>
		<h5>{{ title }}</h5>
		<h5>{{ text }}</h5>
		<h5>{{ date }}</h5>
	</article>
</template>

<script lang="js">
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'ArticleSingle',
	props: ['title', 'text', 'date'],
});
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
article {
	border: 1px solid black;
	padding: 5px;
}
@media (prefers-color-scheme: dark) {
	article {
		border: 1px solid white;
	}
}
</style>

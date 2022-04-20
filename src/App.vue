<template>
	<nav><router-link to="/">Home</router-link></nav>
	<router-view />
</template>

<style>
body {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	width: 100%;
	height: 100%;
}

nav {
	padding: 30px;
}

nav a {
	font-weight: bold;
	color: #2c3e50;
}

nav a.router-link-exact-active {
	color: black;
}
body {
	margin: 0px;
}
@media (prefers-color-scheme: dark) {
	body {
		background-color: rgb(7, 17, 17);
		color: white;
	}
}
</style>

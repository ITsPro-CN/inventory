<template>
	<NuxtLayout class="transition-colors ease-in duration-500">
		<NuxtPage />
	</NuxtLayout>
</template>

<script setup lang="ts">
	const colorMode = useColorMode();

	onMounted(() => {
		watchEffect(() => {
			if (colorMode.value === "dark") {
				document.documentElement.setAttribute("theme-mode", "dark");
				useHead({meta: [{name: "theme-color", content: "#242424"}]});
			} else {
				document.documentElement.removeAttribute("theme-mode");
				useHead({meta: [{name: "theme-color", content: "#fff"}]});
			}
		});
	});
</script>

<style>
	@import "tailwindcss";
	html {
		overflow: hidden;
	}
	*:focus-visible {
		outline: none;
	}
	.page-enter-active,
	.page-leave-active {
		transition: all 0.3s ease;
	}
	.page-enter-from,
	.page-leave-to {
		opacity: 0;
		filter: blur(1rem);
	}
</style>

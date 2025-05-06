export default defineEventHandler(async (event) => {
	const params = getQuery(event);
	if (!params?.keyword) return [];
	const response: String = await $fetch(`https://www.bing.com/images/search?q=${params.keyword}`);
	const images: String[] = Array.from(response.matchAll(/ src="(.*?)["\?]/g) ?? [])
		.map((m) => m[1])
		.filter((src) => !src.startsWith("data:") && !src.startsWith("https://r.bing.com") && !src.startsWith("/"));
	return images;
});

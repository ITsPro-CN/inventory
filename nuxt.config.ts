import tailwindcss from "@tailwindcss/vite";
import {UserScope} from "@logto/nuxt";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2024-11-01",
	devtools: {enabled: true},
	vite: {
		plugins: [tailwindcss()],
	},
	modules: ["@tdesign-vue-next/nuxt", "@logto/nuxt", "dayjs-nuxt", "@nuxtjs/color-mode", "@pinia/nuxt", "pinia-plugin-persistedstate/nuxt"],
	imports: {
		dirs: ["types"],
	},
	router: {
		options: {
			hashMode: true,
		},
	},
	app: {
		pageTransition: {name: "page", mode: "out-in"},
		layoutTransition: {name: "layout", mode: "out-in"},
		head: {
			title: "库存管理",
			meta: [
				{charset: "utf-8"},
				{name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"},
				{name: "apple-mobile-web-app-capable", content: "yes"},
				{name: "apple-mobile-web-app-status-bar-style", content: "black"},
				{name: "mobile-web-app-capable", content: "yes"},
				{name: "mobile-web-app-status-bar-style", content: "black"},
				{name: "theme-color", content: "#242424"},
			],
		},
	},
	runtimeConfig: {
		logto: {
			endpoint: process.env.NUXT_LOGTO_ENDPOINT,
			appId: process.env.NUXT_LOGTO_APP_ID,
			appSecret: process.env.NUXT_LOGTO_APP_SECRET,
			cookieEncryptionKey: process.env.NUXT_LOGTO_COOKIE_ENCRYPTION_KEY,
			scopes: [UserScope.CustomData],
			fetchUserInfo: true,
		},
		db: {
			host: process.env.DATABASE_HOST,
			port: Number(process.env.DATABASE_PORT),
			database: process.env.DATABASE_NAME,
			user: process.env.DATABASE_USER,
			password: process.env.DATABASE_PASSWORD,
		},
		ai: {
			endpoint: process.env.AI_ENDPOINT,
			key: process.env.AI_KEY,
			model: process.env.AI_MODEL,
		},
	},
	dayjs: {
		plugins: ["relativeTime", "timezone"],
		locales: ["zh-cn", "en"],
		defaultLocale: "zh-cn",
		defaultTimezone: "Asia/Shanghai",
	},
	colorMode: {
		preference: "system",
		fallback: "light",
		dataValue: "theme",
		classSuffix: "",
	},
	piniaPluginPersistedstate: {
		storage: "localStorage",
		key: "store_pinia_%id",
	},
});

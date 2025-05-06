interface Config {
	entityTheme: Number;
	isDisplaySubContainer: boolean;
	isDisplayEntityInSubContainer: boolean;
}
export type {Config};
export const useConfig = defineStore("appConfig", {
	state: () => ({
		entityTheme: 1,
		isDisplaySubContainer: true,
		isDisplayEntityInSubContainer: false,
	}),
	persist: import.meta.client && {
		storage: piniaPluginPersistedstate.localStorage(),
	},
});

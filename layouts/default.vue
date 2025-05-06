<template>
	<t-layout class="h-screen overflow-hidden">
		<t-header :class="['flex justify-between items-center px-4 max-sm:!h-auto max-sm:py-2 border-b-1 border-gray-400', {'!pt-0': isStandAlone}]">
			<div><b>库存管理</b></div>
			<t-dropdown trigger="click" v-if="Boolean(user)">
				<div class="flex items-center cursor-pointer">
					<t-avatar :image="user.picture" :hide-on-load-failed="false">{{ (user.name || user.username || "ITsPro用户")[0].toUpperCase() }}</t-avatar>
					<div class="ml-2">{{ user.name || user.username || "ITsPro用户" }}</div>
				</div>
				<t-dropdown-menu>
					<t-dropdown-item divider @click="async () => await navigateTo('/setting', {replace: false})">
						<template #prefixIcon><t-icon name="setting" /></template>
						设置
					</t-dropdown-item>
					<t-dropdown-item theme="error" @click="async () => await navigateTo('/sign-out', {external: true})">
						<template #prefixIcon><t-icon name="logout"></t-icon></template>
						注销
					</t-dropdown-item>
				</t-dropdown-menu>
			</t-dropdown>
			<t-button href="/sign-in" v-else>登录</t-button>
		</t-header>
		<t-content class="flex-1 h-0">
			<slot v-if="Boolean(user)"></slot>
			<div class="w-full h-full flex items-center justify-center" v-else>请先登录</div>
		</t-content>
		<t-footer class="flex justify-between items-center !px-4 !py-3 border-t-1 border-gray-400">
			<div class="flex items-center" v-if="Boolean(user)">
				<NuxtLink to="/" :replace="false" v-if="$route.path !== '/'">
					<t-icon name="chevron-left"></t-icon>
					返回主页
				</NuxtLink>
			</div>
			<div>Copyright &copy; ITsPro.cn</div>
		</t-footer>
	</t-layout>
</template>

<script setup lang="ts">
	const user = useLogtoUser();
	// Standalone模式下去除顶部Padding
	const isStandAlone = ref<boolean>(Boolean((navigator as any)?.standalone));
</script>

<style>
	/* 以下样式是对t-message显示问题的修复，已向tdesign-vue-next提交PR[#5409]：https://github.com/Tencent/tdesign-vue-next/pull/5409 */
	.t-message__list {
		left: 24px !important;
		right: 24px !important;
		transform: none !important;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>

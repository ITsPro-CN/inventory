<template>
	<div>
		<div class="p-4 select-none">
			<t-form labelAlign="left">
				<t-row :gutter="[16, 16]">
					<t-col :span="12" :md="6" :lg="4">
						<t-card title="通用" header-bordered>
							<t-form-item label="主题" name="colorMode" initial-data="system">
								<OptionSwitch
									v-model:value="$colorMode.preference"
									:options="[
										{icon: 'mode-light', label: '浅色', value: 'light'},
										{icon: 'mode-dark', label: '深色', value: 'dark'},
										{icon: 'brightness-1', label: '系统', value: 'system'},
									]" />
							</t-form-item>
						</t-card>
					</t-col>
					<t-col :span="12" :md="6" :lg="4">
						<t-card title="显示" header-bordered>
							<t-form-item label="物品样式" name="entityTheme" initial-data="system">
								<OptionSwitch
									v-model:value="config.$state.entityTheme"
									:options="[
										{icon: 'terminal-window', label: '详细', value: 0},
										{icon: 'panorama-horizontal', label: '标准', value: 1},
										{icon: 'image', label: '简单', value: 2},
									]" />
							</t-form-item>
							<div class="relative w-full flex text-gray-500 -top-2">
								<small>提示：图标模式下，单击操作物品，双击进入目录</small>
							</div>
							<t-form-item label="物品窗口中显示下级目录" name="isDisplaySubContainer" initial-data="true">
								<t-switch size="large" v-model="config.$state.isDisplaySubContainer"></t-switch>
							</t-form-item>
							<t-form-item label="物品窗口中显示下级目录中的物品" name="isDisplayEntityInSubContainer" initial-data="false">
								<t-switch size="large" v-model="config.$state.isDisplayEntityInSubContainer"></t-switch>
							</t-form-item>
						</t-card>
					</t-col>
				</t-row>
			</t-form>
		</div>
	</div>
</template>

<script setup lang="ts">
	const config = useConfig();
</script>

<style scoped>
	:deep(.t-card__body) {
		padding-right: 12px;
	}
	.t-form__item {
		margin-bottom: 12px;
	}
	:deep(.t-form__controls-content) {
		justify-content: flex-end;
	}
</style>

<template>
	<div class="entity-card" :data-theme="theme">
		<t-dropdown placement="right" :popupProps="{attach: `EntityCard-${item.id}`}" maxColumnWidth="200px" v-if="theme == 2">
			<t-card :id="`EntityCard-${item.id}`" :class="['cursor-pointer overflow-hidden', className]" @dblclick="item.is_container && $emit('setCurrentLocation', item.id)">
				<div class="flex flex-col items-center select-none">
					<t-avatar
						:image="item?.image?.startsWith('http') ? item.image : undefined"
						shape="round"
						class="!w-[min(100%,96px)] aspect-square !mb-2"
						size="100%"
						hideOnLoadFailed
						:imageProps="{fit: 'cover', referrerpolicy: 'same-origin', loading: '加载中'}">
						<template #icon v-if="!item.id.startsWith('http')"><t-icon :name="item.image || (item.is_container ? 'folder' : 'help')"></t-icon></template>
					</t-avatar>
					<div class="-mx-2 text-center line-clamp-1">{{ item.name }}</div>
					<div class="-mx-2 text-gray-500">
						<small v-if="!item.is_container"><t-icon name="close"></t-icon>{{ item.quantity }}{{ item.unit }}</small>
						<small v-else-if="subItem.length">{{ subItem.length }}件物品</small>
						<small v-else-if="item.children.length">{{ item.children.length }}个子目录</small>
						<small v-else>空置</small>
					</div>
				</div>
				<div
					:class="[
						'relative top-1 p-0.5 -mx-2 text-xs text-center text-white',
						$dayjs(item.expiry).diff($dayjs(), 'hour') <= 0
							? 'bg-red-800 animate-pulse'
							: $dayjs(item.expiry).diff($dayjs(), 'hour') <= 168
							? 'bg-red-500 animate-pulse'
							: $dayjs(item.expiry).diff($dayjs(), 'day') <= 30
							? 'bg-orange-400'
							: 'bg-green-600 dark:bg-green-900',
					]"
					v-if="item.expiry">
					{{ $dayjs(item.expiry).from($dayjs().startOf("day")) }}过期
				</div>
			</t-card>
			<t-dropdown-menu>
				<t-dropdown-item divider @click="$emit('setCurrentLocation', item.id)" v-if="item.is_container">
					<template #prefixIcon><t-icon name="login" /></template>
					进入
				</t-dropdown-item>
				<t-dropdown-item divider @click="$emit('edit')" v-if="instance?.vnode?.props?.onEdit">
					<template #prefixIcon><t-icon name="edit" /></template>
					编辑
				</t-dropdown-item>
				<slot name="moreActions"></slot>
				<!-- <component :is="node" v-for="node in $slots.moreActions?.()" /> -->
			</t-dropdown-menu>
		</t-dropdown>
		<t-card :class="['cursor-pointer', className]" @click="item.is_container && $emit('setCurrentLocation', item.id)" v-else>
			<t-space class="absolute top-0 right-0 p-1.5">
				<t-tag size="small" variant="outline" color="#888" v-if="item.prop && item.prop['创建者'] === 'AI'">AI</t-tag>
				<t-tag size="small" variant="outline" theme="primary" v-if="item.note">备注</t-tag>
			</t-space>
			<t-comment :author="item.name">
				<template #avatar v-if="item.image">
					<t-avatar
						:image="item.image.startsWith('http') ? item.image : undefined"
						shape="round"
						size="72px"
						hideOnLoadFailed
						:imageProps="{fit: 'cover', referrerpolicy: 'same-origin', loading: '加载中'}">
						<template #icon v-if="!item.id.startsWith('http')"><t-icon :name="item.image || 'folder'"></t-icon></template>
					</t-avatar>
					<div class="absolute bottom-0 left-0 text-xs text-gray-500 m-3">#{{ (item.id.startsWith("_") ? item.id : item.id.slice(-8)).toUpperCase() }}</div>
				</template>
				<template #datetime v-if="!item.is_container"><t-icon name="close"></t-icon>{{ item.quantity }}{{ item.unit }}</template>
				<template #content>
					<div class="flex">
						<div class="flex-shrink-0">位置：</div>
						<t-breadcrumb class="flex-wrap" @click.stop="">
							<t-breadcrumb-item :max-item-width="'150'" v-if="!item?.parent">
								{{ item.owner === user.sub ? (item.is_container ? `${user.name || user.username || "我"}的库存` : "未归位") : "共享" }}
							</t-breadcrumb-item>
							<t-breadcrumb-item :max-item-width="'150'" v-for="id in item.path" @click="$emit('setCurrentLocation', id)">
								{{ entity[id].name }}
							</t-breadcrumb-item>
							<!-- :max-items="5" :items-before-collapse="2" :items-after-collapse="3"
							<template #ellipsis="{items, separator}">
								<t-dropdown trigger="click">
									<t-button variant="outline" size="small" shape="square">
										<t-icon name="ellipsis" />
									</t-button>
									<t-dropdown-menu>
										<t-dropdown-item :value="item" v-for="item in items" @click="$emit('update:currentLocationID', item.id)">
											<template #prefixIcon><t-icon :name="item.image ?? 'folder'" /></template>
											{{ item.content }}
										</t-dropdown-item>
									</t-dropdown-menu>
								</t-dropdown>
							</template> -->
						</t-breadcrumb>
					</div>
					<div class="flex" v-if="!item.is_container">
						<span class="flex-shrink-0">过期：</span>
						<span class="text-gray-300" v-if="item.expiry">
							<span class="mr-2">{{ $dayjs(item.expiry).format("YYYY-MM-DD ddd") }}</span>
							<template v-if="$dayjs().from">
								<t-tag class="animate-pulse" size="small" shape="round" theme="danger" v-if="$dayjs(item.expiry).diff($dayjs(), 'hour') <= 168">
									{{ $dayjs(item.expiry).from($dayjs().startOf("day")) }}过期
								</t-tag>
								<t-tag size="small" shape="round" theme="warning" v-else-if="$dayjs(item.expiry).diff($dayjs(), 'day') <= 30">
									{{ $dayjs(item.expiry).from($dayjs().startOf("day")) }}过期
								</t-tag>
								<t-tag size="small" shape="round" v-else>
									{{ $dayjs(item.expiry).from($dayjs().startOf("day")) }}
								</t-tag>
							</template>
						</span>
						<span class="text-gray-300" v-else>永不</span>
					</div>
					<div class="flex" v-else-if="subItem.length || item.children.length">
						<span class="flex-shrink-0">包含：</span>
						<span class="text-gray-300">
							<template v-if="item.children.length">{{ item.children.length }}个子目录，</template>
							{{ subItem.length }}件物品
						</span>
					</div>
					<div class="flex" v-else>
						<span class="flex-shrink-0">状态：</span>
						<span class="text-gray-300">空置</span>
					</div>
					<template v-if="theme === 0">
						<div class="flex" v-for="(value, prop) in item.prop">
							<span class="flex-shrink-0">{{ prop }}：</span>
							<span class="text-gray-400">{{ value }}</span>
						</div>
						<div class="flex" v-if="item.note">
							<span class="flex-shrink-0">备注：</span>
							<span class="text-gray-400 line-clamp-2">{{ item.note }}</span>
						</div>
					</template>
				</template>
				<template #actions>
					<t-space class="select-none" @click.stop="$emit('edit')" v-if="instance?.vnode?.props?.onEdit">
						<div class="flex items-center"><t-icon name="edit" class="mr-1" /><span>编辑</span></div>
					</t-space>
					<t-dropdown trigger="click" maxColumnWidth="200px" v-if="$slots.moreActions">
						<t-space @click.stop="">
							<div class="flex items-center"><t-icon name="ellipsis" class="mr-1" /><span>更多</span></div>
						</t-space>
						<t-dropdown-menu>
							<slot name="moreActions"></slot>
						</t-dropdown-menu>
					</t-dropdown>
				</template>
			</t-comment>
		</t-card>
	</div>
</template>

<script setup lang="ts">
	const user = useLogtoUser();
	const prop = defineProps({
		theme: {type: Number, default: 1},
		entity: {type: Object as PropType<{[key: string]: EntityType}>, default: {}},
		item: {type: Object as PropType<EntityType>, default: undefined},
		className: {default: ""},
	});
	const subItem = ref<EntityType[]>([]);
	const emit = defineEmits(["update:entity", "update:item", "setCurrentLocation", "edit"]);
	const calcSubEntity = () => {
		if (!prop.item || !prop.item?.id || !prop.item?.is_container) return;
		subItem.value = Object.values(prop.entity).filter((e: EntityType) => e.active && !e.is_container && e.path.includes(prop.item?.id ?? ""));
	};
	calcSubEntity();
	watch([() => prop.item, () => prop.entity], ([item, entity]) => {
		calcSubEntity();
	});

	const instance = getCurrentInstance();
</script>

<style scoped>
	.entity-card[data-theme="2"] :deep(.t-card__body) {
		padding: 12px 16px;
	}
</style>

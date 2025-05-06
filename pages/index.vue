<template>
	<div class="h-full w-full">
		<t-layout class="h-full w-full relative">
			<!-- <div class="sm:hidden absolute top-0 bottom-0 left-0 right-0 bg-[#0008] z-1" v-if="showMenu" @click="showMenu = false"></div> -->
			<t-aside id="aside" class="h-full max-sm:absolute max-sm:!w-screen max-sm:z-100 sm:border-r-1 border-gray-400 shrink-0 flex flex-col" width="324px" v-if="showMenu">
				<div class="flex-1 overflow-y-scroll !p-4 user-select-none">
					<t-tree
						ref="tree"
						:data="tree_location"
						:keys="{value: 'id', label: 'name'}"
						activable
						:actived="[currentLocationID]"
						hover
						:transition="false"
						:expandAll="true"
						line
						:filter="(node:TreeNodeModel) => node.data.active"
						draggable
						@click="({node}:{'node':TreeNodeModel}) => (currentLocationID = node.data.id)"
						:allowDrop="isAllowDrop"
						@dragEnd="onTreeDrag">
						<template #empty>
							<t-button theme="default" variant="dashed" block @click="form.updateFormData({is_container: true})">创建一个位置</t-button>
						</template>
						<template #icon="{node}">
							<t-icon :name="node.data.id ? node.data.image || 'folder' : 'user-1'" />
						</template>
						<template #operations="{node}">
							<t-dropdown trigger="click" maxColumnWidth="200px">
								<t-space class="select-none ml-3" size="small" @click.stop="">
									<t-icon class="animate-pulse !text-red-500" name="folder-move" v-if="movingEntity.has(node.data)"></t-icon>
									<div class="text-gray-400">
										{{ (Object.values(entity) as EntityType[]).filter((e: EntityType) => e.active && !e.is_container && e.parent === node.data.id).length || "" }}
									</div>
									<t-icon name="more"></t-icon>
								</t-space>
								<t-dropdown-menu>
									<t-dropdown-item divider disabled>
										<template #prefixIcon><t-icon :name="node.data.id ? node.data.image || 'folder' : 'user-1'" /></template>
										{{ node.data.name }}
									</t-dropdown-item>
									<template v-if="node.data.id">
										<t-dropdown-item @click="form.updateFormData(entity[node.data.id], true)">
											<template #prefixIcon><t-icon name="edit" /></template>
											编辑
										</t-dropdown-item>
										<t-dropdown-item divider @click="form.updateFormData({...node.data, id: undefined}, true)">
											<template #prefixIcon><t-icon name="copy" /></template>
											复制
										</t-dropdown-item>
										<t-dropdown-item @click="form.updateFormData({is_container: true, parent: node.data.parent})">
											<template #prefixIcon><t-icon name="folder-add" /></template>
											创建同级位置
										</t-dropdown-item>
									</template>
									<t-dropdown-item divider @click="form.updateFormData({is_container: true, parent: node.data.id})">
										<template #prefixIcon><t-icon name="folder-add" /></template>
										创建子位置
									</t-dropdown-item>
									<t-dropdown-item @click="onMoveAllEntity(node.data.id, (node: EntityType) => node.is_container)" v-if="node.data.id">
										<template #prefixIcon><t-icon name="folder-move" /></template>
										移动子目录
									</t-dropdown-item>
									<t-dropdown-item :divider="movingEntity.size > 0" @click="onMoveAllEntity(node.data.id, (node: EntityType) => !node.is_container)">
										<template #prefixIcon><t-icon name="arrow-right-circle" /></template>
										移动直属物品
									</t-dropdown-item>
									<t-dropdown-item :divider="Boolean(node.data.id)" @click="onPasteEntity(node.data.id)" v-if="movingEntity.size > 0">
										<template #prefixIcon><t-icon name="paste" /></template>
										粘贴内容
									</t-dropdown-item>
									<template v-if="node.data.id">
										<t-dropdown-item divider @click="onEntityPrint(node.data)">
											<template #prefixIcon><t-icon name="print" /></template>
											打印
										</t-dropdown-item>
										<t-dropdown-item theme="error" @click="onEntityDelete(node.data.id)" v-if="node.data.active">
											<template #prefixIcon><t-icon name="delete"></t-icon></template>
											删除
										</t-dropdown-item>
										<t-dropdown-item theme="error" @click="onEntityRecover(node.data.id)" v-else>
											<template #prefixIcon><t-icon name="rollback"></t-icon></template>
											恢复
										</t-dropdown-item>
									</template>
								</t-dropdown-menu>
							</t-dropdown>
						</template>
					</t-tree>
					<t-button class="!mt-3" theme="primary" variant="outline" block @click="form.updateFormData({is_container: true, parent: ''})">创建目录</t-button>
				</div>
				<div class="border-t-1 border-gray-400 px-4 py-2">
					<t-row :gutter="[4, 4]">
						<template v-for="f in reservedFolder">
							<t-col :span="4" v-if="!f.active">
								<t-button class="!justify-start !px-2" theme="default" variant="text" block @click="currentLocationID = f.id">
									<template #icon><t-icon :name="f.image"></t-icon></template>
									{{ f.name }}
								</t-button>
							</t-col>
						</template>
					</t-row>
				</div>
				<div class="border-t-1 border-gray-400 px-4 py-2 sm:hidden">
					<t-button class="!justify-start !px-2" theme="default" variant="text" block @click="showMenu = false">
						<template #icon><t-icon name="menu-fold"></t-icon></template>
						关闭菜单
					</t-button>
				</div>
			</t-aside>
			<t-content class="relative h-full flex flex-col">
				<div class="w-full p-2 border-b-1 border-gray-400 flex items-center">
					<t-button class="sm:!hidden mr-3" shape="square" theme="default" variant="text" @click="showMenu = true">
						<template #icon><t-icon name="menu-fold"></t-icon></template>
					</t-button>
					<t-breadcrumb class="flex-1 overflow-x-scroll" :max-item-width="'150'">
						<t-breadcrumb-item @click="currentLocationID = ''" v-if="currentLocationID">
							<template #icon><t-icon name="home" /></template>
							{{ user.name || user.username || "我" }}的库存
						</t-breadcrumb-item>
						<t-breadcrumb-item @click="currentLocationID = id" v-for="id in entity?.[currentLocationID]?.path">
							<template #icon><t-icon :name="entity?.[id]?.image || 'folder'" /></template>
							{{ entity?.[id]?.name }}
						</t-breadcrumb-item>
						<t-breadcrumb-item>
							<template #icon><t-icon :name="entity?.[currentLocationID]?.image || 'folder'" /></template>
							{{ entity?.[currentLocationID]?.name }}
						</t-breadcrumb-item>
					</t-breadcrumb>
					<div class="ml-3" v-if="movingEntity.size > 0">已选中({{ movingEntity.size }})</div>
					<t-button
						class="!ml-3"
						:theme="isMultiSelect ? 'danger' : 'default'"
						variant="outline"
						@click="
							isMultiSelect = !isMultiSelect;
							!isMultiSelect && movingEntity.clear();
						">
						<template #icon><t-icon name="check-rectangle"></t-icon></template>
						{{ isMultiSelect ? "退出多选" : "多选" }}
					</t-button>
				</div>
				<ClientOnly fallback-tag="span" fallback="加载中">
					<div class="w-full h-full flex justify-center items-center select-none" v-if="entityFiltered.length === 0">
						<t-empty title="这里没有物品" size="large" />
					</div>
					<t-row id="items" :gutter="[16, 16]" class="!p-4 flex-1 overflow-y-scroll content-start" v-else>
						<template v-for="item in entityFiltered">
							<t-col :="config.$state.entityTheme === 2 ? {span: 4, md: 3, lg: 2, xxl: 1} : {span: 12, md: 6, xl: 4, xxl: 3}">
								<EntityCard
									:key="item.id"
									:theme="config.$state.entityTheme"
									:className="movingEntity.has(item) ? '!border-red-500 !bg-orange-50 dark:!bg-stone-700 animate-pulse' : ''"
									v-model:entity="entity"
									v-model:item="entity[item.id]"
									@setCurrentLocation="currentLocationID = $event"
									@edit="form.updateFormData(item, true)"
									@click="isMultiSelect && movingEntity[movingEntity.has(item) ? 'delete' : 'add'](item)">
									<template #moreActions>
										<t-dropdown-item divider @click="form.updateFormData({...item, id: undefined}, true)">
											<template #prefixIcon><t-icon name="copy" /></template>
											复制
										</t-dropdown-item>
										<t-dropdown-item divider @click="onEntityPrint(item)">
											<template #prefixIcon><t-icon name="print" /></template>
											打印
										</t-dropdown-item>
										<t-dropdown-item theme="error" @click="onEntityDelete(item.id)" v-if="item.active">
											<template #prefixIcon><t-icon name="delete"></t-icon></template>
											删除
										</t-dropdown-item>
										<t-dropdown-item theme="error" @click="onEntityRecover(item.id)" v-else>
											<template #prefixIcon><t-icon name="rollback"></t-icon></template>
											恢复
										</t-dropdown-item>
									</template>
								</EntityCard>
							</t-col>
						</template>
					</t-row>
				</ClientOnly>
				<t-button class="!absolute bottom-4 right-4" theme="primary" variant="outline" size="large" shape="circle" @click="form.updateFormData({parent: currentLocationID})">
					<template #icon>
						<t-icon name="add" size="24" />
					</template>
				</t-button>
			</t-content>
		</t-layout>
		<ClientOnly>
			<EntityForm ref="form" :entity="entity" :tree_location="tree_location" v-model:visible="isEntityDrawerVisible" @entityUpdate="onEntityUpdate"></EntityForm>
		</ClientOnly>
	</div>
</template>

<script setup lang="ts">
	import dayjs from "dayjs";
	import type {TreeProps, TreeNodeModel} from "tdesign-vue-next";
	const user = useLogtoUser();
	const config = useConfig();
	const showMenu = ref(true);
	const isMultiSelect = ref(false);
	const tree = ref();
	const form = ref();
	const {data: entity_raw} = await useFetch<EntityData[]>("/api/entity");
	const reservedFolder: (EntityData & {id: string; name: string; filter: (e: EntityType) => boolean})[] = [
		{id: "", name: `${user.name || user.username || "我"}的库存`, image: "user", active: true, filter: (e: EntityType) => !e.parent && (!e.is_container || config.$state.isDisplaySubContainer)},
		{id: "_bin", name: "回收站", image: "delete", filter: (e: EntityType) => !e.active},
		{id: "_uncategory", name: "未归位", image: "link-unlink", filter: (e: EntityType) => !e.parent && !e.is_container},
		{id: "_share", name: "共享", image: "share", filter: (e: EntityType) => e.owner !== user.sub},
		{id: "_expired", name: "已过期", image: "delete-time", filter: (e: EntityType) => Boolean(e.active && e.expiry && dayjs(e.expiry).diff(dayjs(), "hour") <= 0)},
		{
			id: "_tobeExpired",
			name: "即将过期",
			image: "time",
			filter: (e: EntityType) => Boolean(e.active && e.expiry && dayjs(e.expiry).diff(dayjs(), "hour") > 0 && dayjs(e.expiry).diff(dayjs(), "day") <= 30),
		},
	];
	const folder = computed(() => Object.fromEntries(reservedFolder.map((i) => [i.id, i])));
	const entity = ref<Record<string, EntityType>>({
		...Object.fromEntries(entity_raw.value?.map((i) => [i.id, new Entity(i)]) ?? []),
		...Object.fromEntries(reservedFolder?.map((i) => [i.id, new Entity({is_container: true, active: false, ...i})])),
	});
	Object.values(entity.value).forEach((e) => {
		e.generateRelation(entity.value);
	});
	const tree_location = ref<{id: string; name: string; children: EntityType[]}[]>([]);
	const updateLocationTree = () => {
		tree_location.value = [{...entity.value[""], children: Object.values(entity.value).filter((e) => e.is_container && e.active && !e.parent && e.id && !e.id.startsWith("_"))}];
	};
	updateLocationTree();
	const currentLocationID = ref<string>("");
	watch(currentLocationID, () => {
		if (document.body.clientWidth < 768) showMenu.value = false;
	});
	const entityFiltered = computed(() =>
		Object.values(entity.value)
			.filter((e) =>
				e.id && !e.id.startsWith("_") && folder.value?.[currentLocationID.value]
					? folder.value[currentLocationID.value].filter(e)
					: e.active &&
					  (!e.is_container || config.$state.isDisplaySubContainer) &&
					  (config.$state.isDisplayEntityInSubContainer ? e.path.includes(currentLocationID.value) : currentLocationID.value === e.parent)
			)
			.sort((a: EntityType, b: EntityType) => {
				if (a.sort !== b.sort) return a.sort - b.sort;
				if (a.is_container && !b.is_container) return -1;
				if (!a.is_container && b.is_container) return 1;
				const expiry = new Date(a?.expiry ?? "9999-12-31").getTime() - new Date(b?.expiry ?? "9999-12-31").getTime();
				return expiry || a?.name?.localeCompare(b?.name, "zh-CN");
			})
	);
	const isEntityDrawerVisible = ref(false);
	const onEntityPrint = async (item: EntityType) => {
		const printer = user?.custom_data?.device?.printer;
		const preference = printer?.preference ?? 0;
		const printers = printer?.list ?? [];
		const options = printers.map((d: DeviceData, i: number) => `<option label="${d.name} (${d.id})" value="${i}" ${preference === i ? "selected" : ""} />`);
		const dialog = DialogPlugin({
			header: "选择打印设备",
			body: (h) => h("div", {innerHTML: `打印到：<select id="printDeviceID"><option label="系统打印机" />${options}</select>`}),
			confirmBtn: "确定",
			cancelBtn: "取消",
			destroyOnClose: true,
			onConfirm: async () => {
				const ele = document.getElementById("printDeviceID") as HTMLSelectElement;
				if (ele.value === "") {
					const printWindow = window.open(`/label/item?id=${item.id}&name=${item.name}&location=${item.path.map((i) => entity.value[i].name).join("/")}`, "_blank", "popup=yes");
					if (!printWindow) {
						alert("弹窗被浏览器拦截，请允许弹窗后重试！");
						return;
					}
					printWindow.addEventListener("load", () => {
						setTimeout(() => {
							printWindow.addEventListener("afterprint", () => printWindow.close());
							printWindow.print();
						}, 500);
					});
					return;
				}
				let device = printers[ele.value];
				let type: {params: Record<string, string>} = printer.type[device.type];
				device = {...type, ...device, ...Object.fromEntries(Object.entries(type.params).map(([k, v]) => [k, device[v]]))};
				dialog.setConfirmLoading(true);
				try {
					const data = await $fetch<string>("/api/print", {
						method: "POST",
						retry: false,
						body: {
							...device,
							id: item.id,
							name: item.name,
							location: item.path.map((i) => entity.value[i].name).join("/"),
						},
					});
					MessagePlugin.success(data);
					dialog.destroy();
				} catch (e: any) {
					MessagePlugin.error(e?.data?.message || "错误");
					dialog.setConfirmLoading(false);
				}
			},
		});
	};
	const onEntityUpdate = async (formData: EntityData & {propArray?: [string, any][]}) => {
		try {
			if (formData?.propArray) formData.prop = Object.fromEntries(formData.propArray.filter(([key, value]) => key || value));
			const data = await $fetch<{id: string; rowCount: number}>("/api/entity", {method: "PUT", retry: false, body: formData});
			if (formData.id) {
				if (entity.value[data.id].parent) {
					let p = entity.value[entity.value[data.id].parent as string];
					if (p.children.includes(entity.value[data.id])) p.children.splice(p.children.indexOf(entity.value[data.id]), 1);
				}
				entity.value[data.id].update(formData as EntityData);
				entity.value[data.id].generateRelation(entity.value);
				MessagePlugin.success("修改成功");
			} else {
				entity.value[data.id] = new Entity({
					...formData,
					id: data.id,
				} as EntityData);
				entity.value[data.id].generateRelation(entity.value);
				MessagePlugin.success("创建成功");
			}
			updateLocationTree();
			isEntityDrawerVisible.value = false;
		} catch (e: any) {
			MessagePlugin.error(e?.data?.message || "错误");
		}
	};
	const onEntityDelete = async (id: string) => {
		const confirmDia = DialogPlugin({
			theme: "danger",
			header: "提示",
			body: `确认要删除<${entity.value[id].name}>吗？`,
			confirmBtn: "确认",
			cancelBtn: "取消",
			destroyOnClose: true,
			onConfirm: async () => {
				try {
					const data = await $fetch<{id: string; rowCount: number}>("/api/entity", {method: "DELETE", retry: false, body: {id, active: false}});
					entity.value[data.id].active = false;
					updateLocationTree();
					MessagePlugin.success("删除成功");
				} catch (e: any) {
					MessagePlugin.error(e?.data?.message || "错误");
				}
				confirmDia.destroy();
			},
		});
	};
	const onEntityRecover = async (id: string) => {
		try {
			await $fetch<{id: string; rowCount: number}>("/api/entity", {method: "PATCH", retry: false, body: {id, active: true}});
			entity.value[id].active = true;
			updateLocationTree();
			MessagePlugin.success("恢复成功");
		} catch (e: any) {
			MessagePlugin.error(e?.data?.message || "错误");
		}
	};
	const isAllowDrop = ({dragNode, dropNode, dropPosition}: {dragNode: TreeNodeModel; dropNode: TreeNodeModel; dropPosition: number}) => {
		return dropNode.data.id || dropPosition >= 0;
	};
	const onTreeDrag: TreeProps["onDragEnd"] = async ({node}) => {
		const parent: TreeNodeModel = tree.value.getParent(node.data.id);
		if ((node.data.parent ?? "") === parent.data.id) return;
		try {
			await $fetch<{id: string; rowCount: number}>("/api/entity", {method: "PATCH", retry: false, body: {id: node.data.id, parent: parent.data.id || null}});
			entity.value[node.data.id].parent = parent.data.id ?? null;
			MessagePlugin.success("移动成功");
			const children: TreeNodeModel[] = node.getSiblings();
			if (children.length > 1) {
				await $fetch("/api/entity.sort", {
					method: "POST",
					retry: false,
					body: {
						parent: parent.data.id,
						children: children.reverse().map((node, i) => [node.data.id, i + 1]),
					},
				});
			}
		} catch (e: any) {
			MessagePlugin.error(e?.data?.message || "错误");
		}
	};
	const movingEntity = ref<Set<EntityType>>(new Set<EntityType>());
	const onMoveAllEntity = async (id: string, filter?: Function = undefined) => {
		movingEntity.value = new Set(Object.values(entity.value).filter((e: EntityType) => e.parent === id && (!filter || filter(e))));
		MessagePlugin.success("请选择目标文件夹并粘贴");
	};
	const onPasteEntity = async (id: string) => {
		try {
			await moveEntity([...movingEntity.value], id);
			MessagePlugin.success("移动成功");
			movingEntity.value.clear();
		} catch (e: any) {
			MessagePlugin.error(e?.data?.message || "错误");
		}
	};
	const moveEntity = async (entityToMove: EntityType[], to: string | undefined) => {
		if (to) {
			entityToMove.forEach((e: EntityType) => {
				if (e.path.includes(to) || e.id === to) {
					MessagePlugin.error("不能移动到自身或子文件夹中");
					throw new Error("不能移动到自身或子文件夹中");
				}
			});
		}
		await $fetch("/api/entity.move", {method: "POST", retry: false, body: {id: entityToMove.map((e: EntityType) => e.id), to}});
		entityToMove.forEach((e: EntityType) => {
			if (entity.value[e.id].parent) {
				let p = entity.value[entity.value[e.id].parent as string];
				if (p.children.includes(entity.value[e.id])) p.children.splice(p.children.indexOf(entity.value[e.id]), 1);
			}
			entity.value[e.id].parent = to;
			entity.value[e.id].generateRelation(entity.value);
		});
		updateLocationTree();
	};
</script>

<style>
	::-webkit-scrollbar {
		display: none;
	}
</style>

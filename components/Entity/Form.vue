<template>
	<div v-show="visible">
		<t-drawer id="entityForm" size="400px" :footer="false" :close-btn="true" visible @overlay-click="$emit('update:visible', false)" @close-btn-click="$emit('update:visible', false)">
			<template #header>{{ formData.id ? "修改" : "添加" }}{{ formData.is_container ? "位置" : "物品" }}</template>
			<t-tabs class="!-mt-4" v-model="currentTab">
				<t-tab-panel class="mt-4" :value="0" label="普通模式">
					<t-form ref="form" :rules="formRule" :data="formData" @submit="onSubmitItem">
						<t-form-item label="名称" name="name">
							<t-input placeholder="请输入" v-model.trim="formData.name"> </t-input>
						</t-form-item>
						<t-form-item label="位置" name="parent">
							<t-tree-select
								:data="tree_location"
								:keys="{value: 'id', label: 'name'}"
								v-model="formData.parent"
								placeholder="请选择"
								:tree-props="{
									checkStrictly: true,
									expandAll: true,
								}" />
						</t-form-item>
						<t-form-item label="是否容器" name="location" v-show="false">
							<t-switch v-model="formData.is_container"></t-switch>
						</t-form-item>
						<t-form-item label="数量" name="quantity" v-if="!formData.is_container">
							<t-input-number class="!w-2/3" :min="0" :max="99999999.99" :allowInputOverLimit="false" :decimalPlaces="2" v-model="formData.quantity" />
							<t-select class="!w-1/3 pl-3" v-model="formData.unit" placeholder="单位" filterable creatable clearable :options="unitOptions"></t-select>
						</t-form-item>
						<t-form-item label="过期时间" name="expiry" v-if="!formData.is_container">
							<t-date-picker class="w-full" v-model="formData.expiry" type="date" placeholder="请选择" clearable />
						</t-form-item>
						<t-form-item label="备注" name="note">
							<t-textarea placeholder="请输入" v-model.trim="formData.note" :autosize="{minRows: 3, maxRows: 10}"></t-textarea>
						</t-form-item>
						<t-form-item label="图片" name="image" v-if="!formData.is_container">
							<div class="w-full">
								<t-input :placeholder="formData.name || '请输入'" tips="黏贴图片链接，或输入关键词搜索图片" v-model.trim="formData.image" @keydown.enter.capture.prevent="searchImage">
									<template #suffixIcon>
										<t-icon class="cursor-pointer" name="search" @click.capture="searchImage"></t-icon>
									</template>
								</t-input>
								<t-row class="w-full !mt-8" :gutter="[8, 8]" v-if="imageRaw || images">
									<template v-for="image in new Set([imageRaw, ...(images ?? [])])">
										<t-col :span="4" v-if="image">
											<t-image
												:class="['aspect-square border-4 border-gray-300 cursor-pointer', {'border-purple-500': formData.image === image}]"
												:src="image"
												shape="round"
												fit="cover"
												@click="formData.image = formData.image === image ? '' : image"></t-image>
										</t-col>
									</template>
								</t-row>
							</div>
						</t-form-item>
						<t-form-item label="图标" name="image" v-else>
							<t-row class="w-full" :gutter="[8, 8]">
								<template v-for="(name, icon) in folderIcons">
									<t-col :span="2">
										<div class="flex flex-col w-full items-center">
											<t-icon
												:class="['p-1 border-2 border-gray-300 cursor-pointer', {'border-purple-500': formData.image === icon}]"
												:name="icon"
												size="40px"
												@click="formData.image = formData.image === icon ? '' : icon" />
											<span :class="['text-xs mt-1', {'text-gray-400': formData.image !== icon}]">{{ name }}</span>
										</div>
									</t-col>
								</template>
							</t-row>
						</t-form-item>
						<t-form-item :name="key" v-for="([key, prop], i) in formData.propArray">
							<template #label>
								<t-input placeholder="属性" v-model.trim="formData.propArray[i][0]"></t-input>
							</template>
							<t-input placeholder="请输入" v-model.trim="formData.propArray[i][1]"></t-input>
							<t-icon name="delete" class="text-gray-300 cursor-pointer ml-3" size="20px" @click="formData.propArray.splice(i, 1)"></t-icon>
						</t-form-item>
						<t-form-item>
							<t-space class="mt-4">
								<t-button theme="primary" type="submit">提交</t-button>
								<t-button theme="default" variant="outline" @click="formData.propArray.push(['', ''])">添加属性</t-button>
							</t-space>
						</t-form-item>
					</t-form>
				</t-tab-panel>
				<t-tab-panel class="mt-4" :value="1" label="AI模式">
					<t-space class="w-full" direction="vertical">
						<div class="flex w-full justify-between items-center">
							<t-button :theme="isRecognizing ? 'danger' : 'primary'" variant="outline" @click="recognize">
								<template #icon><t-icon :name="isRecognizing ? 'stop-circle' : 'microphone-1'" /></template>
								{{ isRecognizing ? "关闭麦克风" : "打开麦克风" }}
							</t-button>
							<div class="text-gray-400">
								<t-icon name="error-triangle"></t-icon>
								建议使用系统语音输入
							</div>
						</div>
						<template v-if="!formData.id">
							<div class="flex">
								<div class="flex-shrink-0">物品将添加到：</div>
								<t-breadcrumb class="flex-wrap" :max-item-width="'150'">
									<t-breadcrumb-item :max-item-width="'150'" v-for="id in entity?.[formData.parent ?? '']?.path">
										<template #icon><t-icon :name="entity[id].image ?? 'folder'" /></template>
										{{ entity[id].name }}
									</t-breadcrumb-item>
									<t-breadcrumb-item :max-item-width="'150'">
										<template #icon><t-icon :name="entity[formData.parent || ''].image ?? 'folder'" /></template>
										{{ entity[formData.parent || ""].name }}
									</t-breadcrumb-item>
								</t-breadcrumb>
							</div>
						</template>
						<t-textarea placeholder="请输入" v-model="promptItem" autofocus :autosize="{minRows: 5, maxRows: 10}"></t-textarea>
						<t-button theme="primary" @click="aiGenerateItem">
							<template #icon><t-icon name="animation-1" /></template>
							解析文字
						</t-button>
						<template v-if="promptItemResult.length > 0">
							<div class="my-1" v-for="item in promptItemResult">
								<EntityCard :entity="entity" :item="new Entity(item)"></EntityCard>
							</div>
							<t-button theme="primary" @click="aiGenerateItemApply" v-if="formData.id">
								<template #icon><t-icon name="edit" /></template>
								应用到当前物品
							</t-button>
							<t-button theme="primary" @click="aiGenerateItemCreate" v-else>
								<template #icon><t-icon name="add" /></template>
								创建物品
							</t-button>
						</template>
					</t-space>
				</t-tab-panel>
			</t-tabs>
			<div class="py-8"></div>
		</t-drawer>
	</div>
</template>

<script setup lang="ts">
	import type {FormProps, CustomValidator} from "tdesign-vue-next";
	const prop = defineProps({
		entity: {type: Object, default: {}},
		tree_location: {type: Array<EntityType | {id: any; name: string; children: EntityType[]}>, default: []},
		visible: {type: Boolean, default: false},
	});
	const emit = defineEmits(["update:visible", "entityUpdate"]);
	watch(
		() => prop.visible,
		(visible) => {
			if (!visible) {
				images.value = null;
				resetFormData();
			}
		}
	);
	const folderIcons: Record<string, string> = {
		folder: "默认",
		home: "建筑",
		"scroll-bar": "房间",
		"movie-clapper": "箱子",
		"table-1": "橱柜",
		data: "抽屉",
		"map-grid": "地面",
		"lock-on": "保险箱",
		tab: "架子",
	};
	const imageRaw = ref<string | undefined>();
	const formDataDefault: EntityData & {propArray: [string, any][]} = {
		id: undefined,
		name: "",
		parent: "",
		is_container: false,
		image: "",
		note: "",
		quantity: 0,
		unit: "",
		expiry: undefined,
		owner: undefined,
		active: true,
		prop: {},
		propArray: [],
	};
	let formData = ref({...formDataDefault});
	const resetFormData = () => {
		formData.value = {...formDataDefault};
		imageRaw.value = "";
		currentTab.value = 0;
		promptItem.value = "";
		promptItemResult.value = [];
	};
	const updateFormData = (data: Record<string, any>, replaceAll = false) => {
		formData.value = {...(replaceAll ? formData.value : {}), ...data, ...{propArray: Object.entries(data?.prop ?? formData.value.prop)}};
		if (data.image) imageRaw.value = data.image;
		emit("update:visible", true);
	};
	defineExpose({updateFormData, resetFormData});
	const unitOptions = ["个", "袋", "盒", "瓶", "箱", "克", "千克"].map((v) => ({label: v, value: v}));
	const parentValidator: CustomValidator = (id: string | undefined) => {
		if (id && formData.value.id) {
			if (id === formData.value.id) return {result: false, message: "不可以将位置设置为自身"};
			if (prop.entity[id].path.includes(formData.value.id)) return {result: false, message: "不可以将位置设置为下级目录"};
		}
		return {result: true, message: ""};
	};
	const formRule = {
		name: [{required: true, message: "必填"}],
		parent: [{validator: parentValidator}],
	};
	const keyword = ref("纸箱");
	const {data: images} = await useFetch<string[]>("/api/image", {immediate: false, key: keyword.value, query: {keyword}});
	const searchImage = () => {
		if (!formData.value.image && !formData.value.name) {
			MessagePlugin.warning("请先输入关键词或物品名称");
			return;
		}
		keyword.value = formData.value.image && !formData.value.image.startsWith("http") ? formData.value.image : formData.value.name ?? "";
	};
	const onSubmitItem: FormProps["onSubmit"] = async ({validateResult, firstError, e}) => {
		e?.preventDefault();
		if (validateResult !== true) {
			MessagePlugin.warning(firstError ?? "请检查输入内容");
			return;
		}
		emit("entityUpdate", formData.value);
	};
	const currentTab = ref(0);
	const promptItem = ref("");
	const promptItemResult = ref<EntityData[]>([]);
	const aiGenerateItem = async () => {
		if (promptItem.value) {
			const loading = LoadingPlugin({fullscreen: true, content: "AI生成中"});
			try {
				const result = await $fetch<EntityData[]>("/api/ai/item.generate", {
					method: "POST",
					retry: false,
					body: {
						item: formData.value.id ? formData.value : {parent: formData.value.parent},
						message: promptItem.value,
					},
				});
				if (formData.value.id) {
					promptItemResult.value = [{...formData.value, ...result[0]}];
				} else {
					promptItemResult.value = result;
				}
				MessagePlugin.success("生成成功");
			} catch (e: any) {
				MessagePlugin.error(e.data.message);
			}
			loading.hide();
		}
	};
	const aiGenerateItemApply = async () => {
		formData.value = {...formData.value, ...promptItemResult.value[0]};
		currentTab.value = 0;
	};
	const aiGenerateItemCreate = async () => {
		promptItemResult.value.forEach(async (item) => {
			if (!item.prop) item.prop = {};
			item.prop["创建者"] = "AI";
			emit("entityUpdate", item);
		});
		promptItem.value = "";
		promptItemResult.value = [];
	};
	const isSupportRecognition = (window as any)?.SpeechRecognition || (window as any)?.webkitSpeechRecognition || null;
	const recognition = isSupportRecognition ? new isSupportRecognition() : undefined;
	const isRecognizing = ref(false);
	if (recognition) {
		recognition.lang = "zh-CN";
		recognition.continuous = true;
		// recognition.interimResults = true;
		recognition.onresult = function (event: any) {
			promptItem.value += event.results[event.results.length - 1][0].transcript;
		};
		recognition.onstart = function () {
			isRecognizing.value = true;
		};
		recognition.onend = function () {
			isRecognizing.value = false;
		};
		recognition.onerror = function (event: any) {
			if (event.error === "not-allowed") {
				MessagePlugin.error("请允许使用麦克风");
			} else {
				MessagePlugin.error("语音识别错误：" + event.error);
			}
		};
	}
	const recognize = async () => {
		if (!recognition) {
			MessagePlugin.error("浏览器不支持使用语音识别");
			return;
		}
		if (!isRecognizing.value) {
			promptItem.value = "";
			const status = await navigator.permissions.query({name: "microphone"});
			if (status.state === "denied") {
				MessagePlugin.error("请允许使用麦克风");
			} else {
				recognition.start();
			}
		} else {
			recognition.stop();
		}
	};
</script>

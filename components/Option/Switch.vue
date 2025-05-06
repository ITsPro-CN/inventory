<template>
	<div class="absolute h-200% flex p-1.5 bg-(--td-bg-color-secondarycontainer) rounded-full">
		<div
			:class="[
				'flex flex-nowrap justify-center items-center px-3 py-1 cursor-pointer rounded-full transition-colors ease-in-out duration-500',
				value === option.value ? 'bg-(--td-brand-color) text-(--td-text-color-anti)' : 'bg-(--td-bg-color)',
			]"
			@click="$emit('update:value', option.value)"
			v-for="option in options">
			<t-icon class="mr-1" :name="option?.icon" v-if="option?.icon" />
			<div class="line-clamp-1">{{ option.label }}</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	interface optionType {
		label: string;
		value: any;
		icon?: string;
	}
	defineProps({
		value: {type: [String, Number, Object, Array], default: null},
		options: {type: Array<optionType>, default: []},
	});
	const emit = defineEmits(["update:value"]);
</script>

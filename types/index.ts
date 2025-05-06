interface EntityData {
	id?: string | undefined;
	name?: string;
	parent?: string | undefined;
	owner?: string | undefined;
	is_container?: boolean;
	active?: boolean;
	image?: string | undefined;
	note?: string;
	quantity?: number;
	unit?: string;
	expiry?: Date | undefined;
	prop?: Record<string, any>;
	sort?: number;
}

class Entity implements EntityData {
	public id: string;
	public name: string;
	public parent: string | undefined;
	public owner: string | undefined;
	public is_container: boolean;
	public active: boolean;
	public image: string | undefined;
	public note: string;
	public quantity: number;
	public unit: string;
	public expiry: Date | undefined;
	public prop: Record<string, any>;
	public sort: number;

	public children: Entity[];
	public path: string[];

	constructor(data: EntityData) {
		this.id = data.id ?? "";
		this.update(data);
		this.children = [];
		this.path = [];
	}
	update(data: EntityData) {
		this.name = data?.name ?? "";
		this.parent = data?.parent;
		this.owner = data.owner;
		this.is_container = data.is_container ?? false;
		this.active = data.active ?? true;
		this.image = data.image ?? "";
		this.note = data.note ?? "";
		this.quantity = parseFloat((data?.quantity ?? 0).toString());
		this.unit = data?.unit ?? "";
		this.expiry = data?.expiry;
		this.prop = data?.prop ?? {};
		this.sort = data?.sort ?? 0;
	}
	public generateRelation(parents: Record<string, Entity>) {
		this.path = [];
		if (this.parent && parents[this.parent]) {
			let parent: Entity | undefined = parents[this.parent];
			if (this.is_container) parent.children = [...parent.children, this].sort((a, b) => a.sort - b.sort);
			while (parent) {
				this.path.unshift(parent.id);
				parent = parent.parent ? parents[parent.parent] : undefined;
			}
		}
	}
}

export type {EntityData};
export type EntityType = InstanceType<typeof Entity>;
export {Entity};

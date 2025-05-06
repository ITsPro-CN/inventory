import {v7 as uuid} from "uuid";

export default defineEventHandler(async (event) => {
	const params = JSON.parse((await readRawBody(event)) ?? "{}");
	const data = [
		event.context.logtoUser.sub,
		params.id,
		params.name || "未命名物品",
		params.parent || null,
		params.is_container ?? false,
		params.image || "",
		params.note || "",
		params.quantity || 0,
		params.unit || "",
		params.expiry || null,
		params.prop || "{}",
	];
	if (params.id) {
		const result = await db.query("UPDATE entity SET name=$3,parent=$4,is_container=$5,image=$6,note=$7,quantity=$8,unit=$9,expiry=$10,prop=$11 WHERE owner=$1 AND id=$2", data);
		return {id: params.id, rowCount: result.rowCount};
	} else {
		data[1] = uuid();
		const result = await db.query("INSERT INTO entity (owner,id,name,parent,is_container,image,note,quantity,unit,expiry,prop) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", data);
		return {id: data[1], rowCount: result.rowCount};
	}
});

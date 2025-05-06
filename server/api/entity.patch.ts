const keys = ["name", "parent", "is_container", "active", "image", "note", "quantity", "unit", "expiry", "prop"];

export default defineEventHandler(async (event) => {
	const params: Record<string, any> = JSON.parse((await readRawBody(event)) ?? "{}");
	if (!params?.id) throw createError({statusCode: 412, message: "必要参数缺失"});
	const key = keys.filter((key) => params.hasOwnProperty(key));
	if (key.length === 0) throw createError({statusCode: 412, message: "未找到更新数据"});
	const field = key.map((k, i) => `${k}=$${i + 3}`).join(",");
	const data = [event.context.logtoUser.sub, params.id, ...key.map((k) => params[k])];
	const result = await db.query(`UPDATE entity SET ${field} WHERE owner=$1 AND id=$2`, data);
	return {id: params.id, rowCount: result.rowCount};
});

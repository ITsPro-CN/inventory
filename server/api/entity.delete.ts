export default defineEventHandler(async (event) => {
	const params = JSON.parse((await readRawBody(event)) ?? "{}");
	if (!params?.id) throw createError({statusCode: 412, message: "必要参数缺失"});
	const data = [event.context.logtoUser.sub, params.id];
	const entity = await db.query("SELECT COUNT(*)::int AS cnt FROM entity WHERE owner=$1 AND parent=$2", data);
	if (entity.rows[0].cnt > 0) throw createError({statusCode: 412, message: "该目录下仍有物品或子目录"});
	const result = await db.query("UPDATE entity SET active=false WHERE owner=$1 AND id=$2", data);
	return {id: params.id, rowCount: result.rowCount};
});

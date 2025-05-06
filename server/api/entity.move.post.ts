export default defineEventHandler(async (event) => {
	const params: Record<string, any> = JSON.parse((await readRawBody(event)) ?? "{}");
	if (!params?.id) throw createError({statusCode: 412, message: "必要参数缺失"});
	const data = [event.context.logtoUser.sub, params?.to || null, ...params.id];
	const placeholder = params.id.map((id: string, i: number) => `$${i + 3}`).join(",");
	const result = await db.query(`UPDATE entity SET parent=$2 WHERE owner=$1 AND id IN (${placeholder})`, data);
	return {id: params.id, rowCount: result.rowCount};
});

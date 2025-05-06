export default defineEventHandler(async (event) => {
	const params: Record<string, any> = JSON.parse((await readRawBody(event)) ?? "{}");
	if (!params?.children || !Array.isArray(params.children)) throw createError({statusCode: 412, message: "必要参数缺失"});
	const field = params.children.map(([id, sort]: [string, number]) => `WHEN '${id}' THEN ${sort}`).join(" ");
	const data = [event.context.logtoUser.sub, params?.parent || null];
	const result = await db.query(`UPDATE entity SET sort=CASE id ${field} ELSE 0 END WHERE owner=$1 AND parent=$2`, data);
	return {id: params.id, rowCount: result.rowCount};
});

export default defineEventHandler(async (event) => {
	const entity = await db.query("SELECT * FROM entity WHERE owner=$1", [event.context.logtoUser.sub]);
	return entity.rows;
});

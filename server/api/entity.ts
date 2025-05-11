export default defineEventHandler(async (event) => {
	const entity = await db.query(
		`
		WITH RECURSIVE cte AS (
			SELECT id,name,parent,owner,is_container,active,image,note,quantity,unit,expiry,prop,sort 
			FROM entity 
			WHERE share_user ? $1
			UNION ALL 
			SELECT e.id,e.name,e.parent,e.owner,e.is_container,e.active,e.image,e.note,e.quantity,e.unit,e.expiry,e.prop,e.sort 
			FROM entity e 
			JOIN cte ON e.parent = cte.id 
		)
		SELECT *,null AS share_user FROM cte 
		UNION ALL 
		SELECT id,name,parent,owner,is_container,active,image,note,quantity,unit,expiry,prop,sort,share_user 
		FROM entity 
		WHERE owner=$1`,
		[event.context.logtoUser.sub]
	);
	return entity.rows;
});

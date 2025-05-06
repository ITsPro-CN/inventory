export default defineEventHandler(async (event) => {
	const host = `http://${event.node.req.headers.host}`;
	const params: {type?: string; id: string; name: string; location?: string} = getQuery(event);
	if (!params?.id) createError({status: 412, statusText: "Invalid"});
	const l = Math.max(params.name.length, 6);
	return `<!DOCTYPE html>
    <html lang="cn">
        <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
            @media print { @page { margin:0;padding:64px; } }
            .t1,.t2 {display:block;width:100%;text-align:center}
            .t1 {font-size:${params?.type !== "memobird" ? (100 * Math.ceil(l / 15)) / l + "vw" : "48px"}}
            .t2 {font-size:${params?.type !== "memobird" ? "5vw" : "24px"};margin:8px 0}
            </style>
        </head>
        <body>
            <b class="t2">#${params.id.slice(-8).toUpperCase()}</b>
            <img style="width:100%" src="${host}/utils/qrcode?id=${params.id}">
            ${params?.name ? `<b class="t1">${params.name}</b>` : ""}
            ${params?.location ? `<b class="t2">${params.location}</b>` : ""}
        </body>
    </html>`;
});

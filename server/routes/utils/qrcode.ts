import QRCode from "qrcode";

export default defineEventHandler(async (event) => {
	const host = `http://${event.node.req.headers.host}`;
	const params = getQuery(event);
	if (!params?.id) createError({status: 412, statusText: "Missing required parameter"});
	const qrBuffer = await QRCode.toBuffer(`${host}/item/${params.id}`, {
		width: 256,
		color: {
			dark: "#000000", // 前景色
			light: "#ffffff", // 背景色
		},
		margin: 0,
		errorCorrectionLevel: "H",
	});
	switch (params?.type) {
		case "raw":
			const qrBase64 = qrBuffer.toString("base64");
			return qrBase64;
		default:
			setResponseHeader(event, "Access-Control-Allow-Origin", "*");
			setResponseHeader(event, "Content-Type", "image/png");
			return qrBuffer;
	}
});

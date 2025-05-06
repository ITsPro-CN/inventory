import dayjs from "dayjs";

export default defineEventHandler(async (event) => {
	const params = JSON.parse((await readRawBody(event)) ?? "{}");
	const host = `http://${event.node.req.headers.host}`;
	const body = {
		userID: params.userID,
		memobirdID: params.memobirdID,
		ak: params.ak,
		timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
		printUrl: `${host}/label/item?type=${params?.type}&id=${params?.id}&name=${params?.name}&location=${params?.location}`,
	};
	const data = await $fetch("http://open.memobird.cn/home/printpaperFromUrl", {
		method: "POST",
		body,
	});
	return "打印成功";
	// const host = `http://${event.node.req.headers.host}`;
	// const params = getQuery(event);
	// if (!params?.id) createError({status: 412, statusText: "Missing required parameter"});
	// const qrBuffer = await QRCode.toBuffer(`${host}/item/${params.id}`, {
	// 	width: 256,
	// 	color: {
	// 		dark: "#000000", // 前景色
	// 		light: "#ffffff", // 背景色
	// 	},
	// 	errorCorrectionLevel: "H",
	// });
	// const qrcodeBase64 = qrBuffer.toString("base64");
	// const dataQrCode = await $fetch<{result: string}>("http://open.memobird.cn/home/getSignalBase64Pic", {
	// 	method: "POST",
	// 	body: {
	// 		ak: "7d1e4dab840d431bb28c972570a6e639",
	// 		imgBase64String: qrcodeBase64,
	// 	},
	// });
	// const qrcodeSingleBase64: string = dataQrCode.result;
	// const textBase64 = iconv.encode(params?.name as string, "gbk").toString("base64");
	// const printcontent = `T:${textBase64}|P:${qrcodeSingleBase64}`;
	// const data = await $fetch("http://open.memobird.cn/home/printpaper", {
	// 	method: "POST",
	// 	body: {
	// 		userID: "90560",
	// 		memobirdID: "387bd3c90bf8a437",
	// 		ak: "7d1e4dab840d431bb28c972570a6e639",
	// 		timestamp: dayjs().format("YYYY-MM-DD HH:mm:ss"),
	// 		printcontent,
	// 	},
	// });
	// return data;
});

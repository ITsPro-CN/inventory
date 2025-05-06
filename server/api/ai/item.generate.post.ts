import OpenAI from "openai";
import type {EntityData} from "~/types/index";

export default defineEventHandler(async (event) => {
	const params: Record<string, any> = JSON.parse((await readRawBody(event)) ?? "{}");
	if (!params?.item || !params?.message) throw createError({statusCode: 412, message: "必要参数缺失"});
	const env = useRuntimeConfig();
	const client = new OpenAI({
		baseURL: env.ai.endpoint,
		apiKey: env.ai.key,
	});
	const completion = await client.chat.completions.create({
		model: env.ai.model,
		messages: [
			{
				role: "system",
				content: `在生成物品信息时，请严格按照以下数据格式。现在是${new Date().toLocaleString()}，时区为Asia/Shanghai，expiry请返回日期字符串(yyyy-mm-dd)或null（未指定过期时间），请注意生成时间的时区。
				{id:null,name?:string;parent?:string|null;note?:string;quantity?:number;unit?:string;expiry?:Date|null;prop?:Record<string,any>;}
				接下来请按照提示生成json数据，然后直接返回无格式的json数据（包含一个或多个物品的数组），保证返回的字符串能够直接使用JSON.parse解析。已经解析到对应属性中的内容不需要再出现在note中。
				${params?.item ? "请注意，用户正在修改一个物品，因此以下内容均为描述同一个物品的。" : "请注意，可能会有多个物品。id和owner为null；sort为0"}
				请在以下内容的基础上修改：${JSON.stringify(params.item)}。`,
			},
			{
				role: "user",
				content: params.message,
			},
		],
	});
	if (!completion?.choices?.[0]?.message?.content) throw createError({statusCode: 500, message: "生成失败"});
	const data: EntityData[] = JSON.parse(completion.choices[0].message.content ?? "[]");

	return data;
});

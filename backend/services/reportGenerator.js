import GoogleGenerativeAI from "@google/generative-ai";

const genIa = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genIa.getGenetaiveModel({ model: "gemini-1.5-flash" });

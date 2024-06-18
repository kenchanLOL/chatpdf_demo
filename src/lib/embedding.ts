import {OpenAIApi, Configuration} from 'openai-edge'

const config = new Configuration({
    apiKey: process.env.OPEN_AI_API_KEY,
})

const openai = new OpenAIApi(config)

export async function getEmbeddings(text: string){
    console.log()
    try{
        const response = await openai.createEmbedding({
            model: "text-embedding-3-small",
            input: text?.replace("/\n/g", "")
        })

        const result = await response.json()

        if (result && result.data && result.data[0] && result.data[0].embedding) {
            return result.data[0].embedding as number[];
        } else {
            console.log("Unexpected response structure:", result);
            throw new Error("Unexpected response structure");
        }
        // return result.data[0].embedding as number[]
    } catch (error) {
        console.log("error in calling openai embedding api ", error)
        throw error
    }
}
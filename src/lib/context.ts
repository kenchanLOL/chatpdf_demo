import {Pinecone} from '@pinecone-database/pinecone'
import {getEmbeddings} from "./embedding";

export async function getMatchesFromEmbeddings(embeddings: number[], file_key: string){
    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    })

    const index = await pinecone.index('chatpdf')
    try{
        const namespace = file_key.replace(/[^\x00-\x7F]/g, "") // discard non-ascii char
        const queryResult = await index.namespace(namespace).query({
            topK: 5,
            vector: embeddings,
            includeMetadata: true,
        })
        return queryResult.matches || []

    } catch (error) {
        console.log("Error in getting Pinecone Embedding Matches", error)
    }

}

export async function getContext(query: string, file_key: string){
    // console.log(query)
    const queryEmbedding = await getEmbeddings(query)
    const matched_docs = await getMatchesFromEmbeddings(queryEmbedding, file_key)
    // const matched_docs = matches.filter(
    //     (match) => match.score && match.score > 0.7
    // )
    console.log(matched_docs)
    type Metadata = {
        text: string,
        pageNumber: number
    }
    let docs = matched_docs.map( (match) => (match.metadata as Metadata).text)
    return docs.join("\n").substring(0, 3000)
}

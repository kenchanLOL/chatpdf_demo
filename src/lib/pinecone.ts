import {Pinecone, PineconeRecord} from '@pinecone-database/pinecone'
import {downloadFromS3} from "@/lib/s3-server";
import md5 from 'md5'
import {PDFLoader} from "@langchain/community/document_loaders/fs/pdf";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import {Document} from "@langchain/core/documents";
import {getEmbeddings} from "@/lib/embedding";

let pinecone: Pinecone  | null = null;

export const getPineconeClient = async() => {
    if (!pinecone){
        pinecone = new Pinecone ({
            apiKey: process.env.PINECONE_API_KEY!
        })
        return pinecone
    }
}

type PDFPage = {
    pageContent: string
    metadata: {
        loc: {pageNumber: number}
    }
}

export async function loadS3IntoPincone(file_key:string) {
    const file_name = await downloadFromS3(file_key)
    if (!file_name){
        throw new Error("Fail to download PDF from S3")
    }
    // @ts-ignore
    const loader = new PDFLoader(file_name)
    const pages = (await loader.load()) as PDFPage[]
    // console.log("prepare documents")
    const documents = await Promise.all(pages.map(prepareDocument));
    // console.log("embed documents")
    const vectors = await Promise.all(documents.flat().map(embedDocument));
    // console.log("get pinecone client")
    const client = await getPineconeClient()
    const pineconeIndex = await client!.index("chatpdf")
    const namespace = pineconeIndex.namespace(file_key.replace(/[^\x00-\x7F]/g, "")) // discard non-ascii char

    await namespace.upsert(vectors)
    return documents[0]

}

async function embedDocument(doc: Document){
    try{
        const embeddings = await getEmbeddings(doc.pageContent)
        const hash = md5(doc.pageContent)
        return {
            id: hash,
            values: embeddings,
            metadata: {
                text: doc.metadata.text,
                pageNumber: doc.metadata.pageNumber
            }
        } as PineconeRecord
    } catch (error){
      console.log("error while embedding document", error)
      throw error
    }
}
export const truncatePage = (str: string, byte:number) => {
    const enc = new TextEncoder()
    return new TextDecoder("utf-8").decode(enc.encode(str).slice(0,byte))
}
async function prepareDocument(page:PDFPage){
    let {pageContent, metadata} = page
    pageContent = pageContent.replace(/\n/g, '')
    const splitter = new RecursiveCharacterTextSplitter()
    const docs = await splitter.splitDocuments([
        new Document({
            pageContent: pageContent,
            metadata: {
                pageNumber: metadata.loc.pageNumber,
                text: truncatePage(pageContent, 36000)
            }
        })
    ])
    return docs
}

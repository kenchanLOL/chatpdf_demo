import {NextResponse} from "next/server";
import {loadS3IntoPincone} from "@/lib/pinecone";
import {db} from "@/lib/db";
import {chats} from "@/lib/db/schema";
import {getS3Url} from "@/lib/s3";
import {auth} from "@clerk/nextjs/server";

export async function POST(req: Request, res:Response) {
    const {userId} = await auth()
    if (!userId){
        return NextResponse.json(
        {error: 'unauthorized user'},
        {status: 401}
        )
    }
    try{
        const body = await req.json()
        const {file_key, file_name} = body
        await loadS3IntoPincone(file_key)

        const chat_id = await db
            .insert(chats)
            .values({
                fileKey: file_key,
                pdfName: file_name,
                pdfUrl: getS3Url(file_key),
                createdAt: new Date(),
                userId: userId,
            })
            .returning({
                insertedId: chats.id,
            });
        return NextResponse.json({
            chat_id: chat_id[0].insertedId
        })
    } catch (error) {
        console.log(error)
        return NextResponse.json(
        {error: 'internal server error'},
        {status: 500}
        )
    }
}
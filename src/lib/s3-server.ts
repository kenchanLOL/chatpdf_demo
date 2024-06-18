import { S3 } from "@aws-sdk/client-s3";
import fs from "fs";

export async function downloadFromS3(file_key:string) {
    const folderPath = "./tmp"
    if (!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath, {recursive: true})
    }

    return new Promise(async (resolve, reject) =>{
        try{
            const s3 = new S3({
                region: "us-east-2",
                credentials: {
                  accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY_ID!,
                  secretAccessKey: process.env.NEXT_PUBLIC_S3_SECRET_ACCESS_KEY!,
                },
            })
            const params = {
                Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
                Key: file_key,
            }

            const obj = await s3.getObject(params)
            const file_name=  `./tmp/pdf_${Date.now()}.pdf`
            if (obj.Body instanceof require("stream").Readable) {
                const file = fs.createWriteStream(file_name);
                file.on('open', function (fd) {
                    // @ts-ignore
                    obj.Body?.pipe(file)
                        .on('finish', () => {return resolve(file_name)})
                        .on('error', (error: Error) => reject(error));
                });
            }
        } catch (error) {
            console.error(error);
            reject(error);
            return null;
        }
    })
}
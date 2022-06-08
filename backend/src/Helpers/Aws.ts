
import path from "path";

import aws from "aws-sdk";
import { v4 as uuid } from 'uuid'


// https://www.phmu.de/blog/how-to-upload-direkt-aus-dem-frontend-einer-vue-app-in-ein-aws-bucket-mit-signedurls/

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: 'eu-central-1' // frankfurt
})


export interface GeneratedUrl {
    uploadUrl: string,
    path: string,
    fileNameWithExt: string
    fileName : string
}


export class Aws {

    private s3: aws.S3;


    private inputBucket: string = 'ganghorseinput'
    private inputFolder: string = 'inputs'

    private publicBucket: string = 'ganghorse'
    constructor() {
        this.s3 = new aws.S3()
    }


    createSingleFileUrl(feifId: string, fileType: string, fileExtention: string): GeneratedUrl {
        const fileName = uuid()

        const fileNameWithExt = `${fileName}.${fileExtention.replace('.', '')}`

        const fullPath = `${this.inputFolder}/${feifId}/${fileNameWithExt}`

        const params = {
            Bucket: this.inputBucket,
            Key: fullPath,
            Expires: 10 * 60, // 10 minuts
            ContentType: fileType
        }
        const url = this.s3.getSignedUrl('putObject', params)

        return {
            path: fullPath,
            uploadUrl: url,
            fileNameWithExt: fileNameWithExt,
            fileName
        }
    }


    async deleteVideo(feifId: string, videoId: string): Promise<boolean> {
        const key = `public/${feifId}/${videoId}/`
        console.log('delete video key ', key)
        try {
            const deletedFiles = await this.deleteBucketData(this.s3, this.publicBucket, key)
            return deletedFiles > 0;
        } catch (error) {
            console.error(`failure to delete '${key}' from bucket ${this.publicBucket}`);
            return false;
        }
    }

    async deleteInputVideo(inputFile: string): Promise<boolean> {
        // incomming string : s3://ganghorseinput/inputs/DK2010200936/3095ac97-c9f8-4ec3-9efb-449b75dbba89.mp4
        const dir = inputFile.replace(`s3://${this.inputBucket}/`, '')

        try {
            const deletedFiles = await this.deleteBucketData(this.s3, this.inputBucket, dir)
            return deletedFiles > 0;
        } catch (error) {
            console.error(`failure to delete ${inputFile} from bucket ${this.inputBucket}`, error);
            return false;
        }
    }




    async copyVideo(feifId: string, videoFileName: string): Promise<string | undefined> {

        try {
            const videoFileBaseName = path.basename(videoFileName);
            const targetFileKey = `public/${feifId}/${videoFileBaseName}/${videoFileName}`

            console.log(`attem,pt to copy ${videoFileName} to ${targetFileKey}`)

            const result = await this.s3.copyObject({
                Bucket: this.publicBucket, // destinatino bucket
                CopySource: videoFileName,
                Key: targetFileKey,
                ACL: 'public-read-write'

            }).promise()

            console.log('copyObject result: ', result);

            return `s3://${this.publicBucket}/${targetFileKey}`
        } catch (error) {
            console.error('error during copyVideo', error)
            return undefined
        }
    }



    private async deleteBucketData(s3: AWS.S3, bucket: string, dir: string): Promise<number> {
        let count: number = 0;

        while (true) {
            // list objects
            const listedObjects = await s3.listObjectsV2({ Bucket: bucket, Prefix: dir }).promise();

            if (listedObjects.Contents === undefined) {
                return 0;
            }
            if (listedObjects.Contents.length !== 0) {
                // prepare delete request
                const deleteParams = {
                    Bucket: bucket,
                    Delete: {
                        Objects: listedObjects.Contents.map(obj => ({
                            Key: obj.Key as string
                        }))
                    }
                };
                // listedObjects.Contents.forEach(({ Key }) => {
                //     deleteParams.Delete.Objects.push({ Key as string });
                // });
                const deleteOutput = await s3.deleteObjects(deleteParams).promise();
                // count or list
                count += (deleteOutput.Deleted as AWS.S3.DeletedObjects).length;
            }
            if (!listedObjects.IsTruncated) {
                console.log('deletedFiles', count)
                return count;
            }
        }
    }
}
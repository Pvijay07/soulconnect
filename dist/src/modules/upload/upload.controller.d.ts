export declare class UploadController {
    uploadFile(file: Express.Multer.File): {
        url: string;
        mimetype: string;
        size: number;
    };
}

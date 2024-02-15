import path from 'path';
import { Request, Response } from 'express';
import fs from 'fs';
import User from '../model/data'

function generateHTMLTemplate(htmlContent: string) {
    const htmlWord = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Document</title>
        </head>
        <body>
            ${htmlContent}
        </body>
        </html>`;

    return htmlWord;
}

const mainController = {
    async createNewToDo(req: Request, res: Response) {
        try {
            let combinedData: any = {};

            // Handling file uploads
            if (req.files && req.files.length !== 0) {
                const files: any = req.files;
                combinedData = {
                    files: files.map((file: any) => file.originalname).filter((filename: any) => filename !== ''),
                };
            }
            const finalData = JSON.parse(req.body.finalData);
            const updatedTextEditorValue = await Promise.all(finalData.textEditorValue.map(async (htmlContent: string) => {
                if (htmlContent) {
                    const fileName = Date.now().toString();
                    const htmlFilePath = path.join(__dirname, "../uploads", `${fileName}.html`);
                    const fullHTML = generateHTMLTemplate(htmlContent);

                    fs.writeFileSync(htmlFilePath, fullHTML);

                    return `${fileName}.html`;
                } else {
                    return '';
                }
            }));

            const updatedTextEditorValueFiltered = updatedTextEditorValue.filter(value => value !== '');

            combinedData = {
                ...combinedData,
                textEditorValue: updatedTextEditorValueFiltered,
                step: finalData.step,
                name: finalData.name
            };
            // Create a new user document
            const newUser = new User(combinedData);

            // Save the new user
            await newUser.save();

            res.status(200).json({
                success: true,
                message: 'Successfully processed the data',

            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },

    async getList(req: Request, res: Response) {
        try {
            const users = await User.find();

            const extractedData = users.map((user: any) => ({
                id: user._id,
                step: user.step,
                name: user.name,
                files: user.files.map((fileName: string) => {
                    return `/uploads/${fileName}`;
                }),
                textEditorValue: user.textEditorValue.map((fileName: string) => {
                    return `/uploads/${fileName}`;
                }),
            }));

            res.status(200).json({
                success: true,
                message: 'Data fetched successfully',
                data: extractedData
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },

    async findById(req: Request, res: Response) {
        try {
            const userId = req.query.id;
            const user = await User.findOne({ _id: userId });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            const data = {
                files: [
                    ...user.files.map((fileName: string) => `/uploads/${fileName}`),
                    ...user.textEditorValue.map((fileName: string) => `/uploads/${fileName}`)
                ]
            };

            res.status(200).json({
                success: true,
                message: 'Data fetched successfully',
                data: data
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },


    async delete(req: Request, res: Response) {
        try {
            const { id } = req.body;

            const user = await User.findById(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                });
            }

            const { textEditorValue, files } = user;

            await deleteFiles(textEditorValue);

            await deleteFiles(files);

            await User.findByIdAndDelete(id);

            res.status(200).json({
                success: true,
                message: 'Data Deleted Successfully',
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error',
            });
        }
    }



};

async function deleteFiles(files: any) {
    // Delete each file from the filesystem
    await Promise.all(files.map(async (fileName: any) => {
        const filePath = path.join(__dirname, "../uploads", fileName);
        try {
            await fs.promises.unlink(filePath);
            console.log(`Deleted file: ${filePath}`);
        } catch (error) {
            console.error(`Error deleting file: ${filePath}`, error);
        }
    }));
}


export default mainController;

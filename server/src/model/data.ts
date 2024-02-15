import mongoose, { Document } from 'mongoose';

interface UserInterface extends Document {
    files: string[];
    textEditorValue: string[];
    step: string;
    name: string;
}

const UserSchema = new mongoose.Schema<UserInterface>({
    files: {
        type: [String],
        required: true
    },
    textEditorValue: {
        type: [String],
        required: true,
        unique: true
    },
    step: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });


export default mongoose.model<UserInterface>('User', UserSchema, 'UserData');

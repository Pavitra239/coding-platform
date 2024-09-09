import mongoose from 'mongoose';
const { Schema } = mongoose;

const contestSchema = new Schema({
  name: { type: String, required: [true, 'Name is required'] },
  description: { type: String, required: [true, 'Description is required'] },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
  },
  problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
});

export default mongoose.model('Contest', contestSchema);

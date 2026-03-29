import mongoose from "mongoose";

const CollegeSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, 
  name: { type: String, required: true },             
  aliases: [{ type: String }], 
  country: { type: String }
});

export default mongoose.model("College", CollegeSchema);
import mongoose from "mongoose";
import College from "../models/College.js";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../.env")
});

const MONGO_URI = process.env.MONGO_URI;

const colleges = [

  // IITs
  { id: "iit-delhi", name: "Indian Institute of Technology Delhi", aliases: ["iit delhi", "iitd"] },
  { id: "iit-bombay", name: "Indian Institute of Technology Bombay", aliases: ["iit bombay", "iitb"] },
  { id: "iit-madras", name: "Indian Institute of Technology Madras", aliases: ["iit madras", "iitm"] },
  { id: "iit-kanpur", name: "Indian Institute of Technology Kanpur", aliases: ["iit kanpur", "iitk"] },
  { id: "iit-kharagpur", name: "Indian Institute of Technology Kharagpur", aliases: ["iit kharagpur", "iitkgp"] },
  { id: "iit-roorkee", name: "Indian Institute of Technology Roorkee", aliases: ["iitr"] },
  { id: "iit-guwahati", name: "Indian Institute of Technology Guwahati", aliases: ["iitg"] },
  { id: "iit-hyderabad", name: "Indian Institute of Technology Hyderabad", aliases: ["iith"] },
  { id: "iit-indore", name: "Indian Institute of Technology Indore", aliases: ["iiti"] },
  { id: "iit-patna", name: "Indian Institute of Technology Patna", aliases: ["iitp"] },
  { id: "iit-bhu", name: "Indian Institute of Technology BHU Varanasi", aliases: ["iit bhu"] },
  { id: "iit-dhanbad", name: "Indian Institute of Technology Dhanbad", aliases: ["iit dhanbad", "ism dhanbad"] },
  { id: "iit-ropar", name: "Indian Institute of Technology Ropar", aliases: ["iit ropar"] },
  { id: "iit-mandi", name: "Indian Institute of Technology Mandi", aliases: ["iit mandi"] },
  { id: "iit-jodhpur", name: "Indian Institute of Technology Jodhpur", aliases: ["iit jodhpur"] },
  { id: "iit-gandhinagar", name: "Indian Institute of Technology Gandhinagar", aliases: ["iit gandhinagar"] },
  { id: "iit-bhubaneswar", name: "Indian Institute of Technology Bhubaneswar", aliases: ["iit bhubaneswar"] },
  { id: "iit-goa", name: "Indian Institute of Technology Goa", aliases: ["iit goa"] },
  { id: "iit-palakkad", name: "Indian Institute of Technology Palakkad", aliases: ["iit palakkad"] },
  { id: "iit-tirupati", name: "Indian Institute of Technology Tirupati", aliases: ["iit tirupati"] },
  { id: "iit-bhilai", name: "Indian Institute of Technology Bhilai", aliases: ["iit bhilai"] },
  { id: "iit-jammu", name: "Indian Institute of Technology Jammu", aliases: ["iit jammu"] },
  { id: "iit-dharwad", name: "Indian Institute of Technology Dharwad", aliases: ["iit dharwad"] },

  // NITs
  { id: "nit-warangal", name: "National Institute of Technology Warangal", aliases: ["nit warangal", "nitw"] },
  { id: "nit-trichy", name: "National Institute of Technology Tiruchirappalli", aliases: ["nit trichy", "nitt"] },
  { id: "nit-surathkal", name: "National Institute of Technology Karnataka", aliases: ["nitk", "surathkal"] },
  { id: "nit-delhi", name: "National Institute of Technology Delhi", aliases: ["nit delhi"] },
  { id: "nit-allahabad", name: "Motilal Nehru National Institute of Technology Allahabad", aliases: ["mnnit"] },
  { id: "nit-jaipur", name: "Malaviya National Institute of Technology Jaipur", aliases: ["mnit"] },
  { id: "nit-calicut", name: "National Institute of Technology Calicut", aliases: ["nit calicut"] },
  { id: "nit-nagpur", name: "Visvesvaraya National Institute of Technology Nagpur", aliases: ["vnit"] },
  { id: "nit-kurukshetra", name: "National Institute of Technology Kurukshetra", aliases: ["nit kurukshetra"] },
  { id: "nit-rourkela", name: "National Institute of Technology Rourkela", aliases: ["nit rourkela"] },
  { id: "nit-bhopal", name: "Maulana Azad National Institute of Technology Bhopal", aliases: ["manit"] },
  { id: "nit-surat", name: "Sardar Vallabhbhai National Institute of Technology Surat", aliases: ["svnit"] },
  { id: "nit-jalandhar", name: "Dr B R Ambedkar National Institute of Technology Jalandhar", aliases: ["nit jalandhar"] },
  { id: "nit-durgapur", name: "National Institute of Technology Durgapur", aliases: ["nit durgapur"] },
  { id: "nit-goa", name: "National Institute of Technology Goa", aliases: ["nit goa"] },
  { id: "nit-jamshedpur", name: "National Institute of Technology Jamshedpur", aliases: ["nit jamshedpur"] },
  { id: "nit-puducherry", name: "National Institute of Technology Puducherry", aliases: ["nit puducherry"] },
  { id: "nit-hamirpur", name: "National Institute of Technology Hamirpur", aliases: ["nit hamirpur"] },
  { id: "nit-raipur", name: "National Institute of Technology Raipur", aliases: ["nit raipur"] },
  { id: "nit-uttarakhand", name: "National Institute of Technology Uttarakhand", aliases: ["nit uk"] },
  { id: "nit-patna", name: "National Institute of Technology Patna", aliases: ["nit patna"] },
  { id: "nit-silchar", name: "National Institute of Technology Silchar", aliases: ["nit silchar"] },
  { id: "nit-agartala", name: "National Institute of Technology Agartala", aliases: ["nit agartala"] },
  { id: "nit-arunachal", name: "National Institute of Technology Arunachal Pradesh", aliases: ["nit arunachal"] },
  { id: "nit-srinagar", name: "National Institute of Technology Srinagar", aliases: ["nit srinagar"] },
  { id: "nit-sikkim", name: "National Institute of Technology Sikkim", aliases: ["nit sikkim"] },
  { id: "nit-manipur", name: "National Institute of Technology Manipur", aliases: ["nit manipur"] },
  { id: "nit-meghalaya", name: "National Institute of Technology Meghalaya", aliases: ["nit meghalaya"] },

  // IIITs
  { id: "iiit-hyderabad", name: "International Institute of Information Technology Hyderabad", aliases: ["iiith", "iiit hyd"] },
  { id: "iiit-bangalore", name: "International Institute of Information Technology Bangalore", aliases: ["iiitb"] },
  { id: "iiit-delhi", name: "Indraprastha Institute of Information Technology Delhi", aliases: ["iiitd"] },
  { id: "iiit-allahabad", name: "Indian Institute of Information Technology Allahabad", aliases: ["iiita"] },
  { id: "iiitm-gwalior", name: "Atal Bihari Vajpayee Indian Institute of Information Technology and Management Gwalior", aliases: ["iiitm gwalior"] },
  { id: "iiitdm-jabalpur", name: "Indian Institute of Information Technology Design and Manufacturing Jabalpur", aliases: ["iiitdm jabalpur"] },
  { id: "iiitdm-kancheepuram", name: "Indian Institute of Information Technology Design and Manufacturing Kancheepuram", aliases: ["iiitdm kancheepuram"] },
  { id: "iiitdm-kurnool", name: "Indian Institute of Information Technology Design and Manufacturing Kurnool", aliases: ["iiitdm kurnool"] },
  { id: "iiit-sri-city", name: "Indian Institute of Information Technology Sri City", aliases: ["iiit sri city"] },
  { id: "iiit-guwahati", name: "Indian Institute of Information Technology Guwahati", aliases: ["iiit guwahati"] },
  { id: "iiit-kalyani", name: "Indian Institute of Information Technology Kalyani", aliases: ["iiit kalyani"] },
  { id: "iiit-lucknow", name: "Indian Institute of Information Technology Lucknow", aliases: ["iiit lucknow"] },
  { id: "iiit-pune", name: "Indian Institute of Information Technology Pune", aliases: ["iiit pune"] },
  { id: "iiit-nagpur", name: "Indian Institute of Information Technology Nagpur", aliases: ["iiit nagpur"] },
  { id: "iiit-ranchi", name: "Indian Institute of Information Technology Ranchi", aliases: ["iiit ranchi"] },
  { id: "iiit-surat", name: "Indian Institute of Information Technology Surat", aliases: ["iiit surat"] },
  { id: "iiit-vadodara", name: "Indian Institute of Information Technology Vadodara", aliases: ["iiit vadodara"] },
  { id: "iiit-kota", name: "Indian Institute of Information Technology Kota", aliases: ["iiit kota"] },
  { id: "iiit-sonepat", name: "Indian Institute of Information Technology Sonepat", aliases: ["iiit sonepat"] },
  { id: "iiit-dharwad", name: "Indian Institute of Information Technology Dharwad", aliases: ["iiit dharwad"] },
  { id: "iiit-bhagalpur", name: "Indian Institute of Information Technology Bhagalpur", aliases: ["iiit bhagalpur"] },
  { id: "iiit-bhopal", name: "Indian Institute of Information Technology Bhopal", aliases: ["iiit bhopal"] },
  { id: "iiit-agartala", name: "Indian Institute of Information Technology Agartala", aliases: ["iiit agartala"] },
  { id: "iiit-kurnool", name: "Indian Institute of Information Technology Kurnool", aliases: ["iiit kurnool"] },
  { id: "iiit-manipur", name: "Indian Institute of Information Technology Manipur", aliases: ["iiit manipur"] },
  { id: "iiit-raichur", name: "Indian Institute of Information Technology Raichur", aliases: ["iiit raichur"] },
  { id: "iiit-diu", name: "Indian Institute of Information Technology Diu", aliases: ["iiit diu"] }
];

const seed = async () => {
  await mongoose.connect(MONGO_URI);

  await College.deleteMany(); // optional
  await College.insertMany(colleges);

  console.log("✅ Colleges seeded");
  process.exit();
};

seed();
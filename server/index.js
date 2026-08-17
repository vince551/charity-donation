import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import {z} from 'zod';

const app=express();
const port=process.env.PORT||4000;
app.use(helmet());
app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5173'}));
app.use(express.json({limit:'1mb'}));
app.use(morgan('tiny'));

const donations=[];
const campaigns=[
 {id:1,title:'Keep a child in school',category:'Education',goal:300000,raised:182500,status:'active'},
 {id:2,title:'A clinic for the community',category:'Healthcare',goal:500000,raised:412000,status:'active'},
 {id:3,title:'Meals for 500 families',category:'Food',goal:150000,raised:97500,status:'active'}
];
app.get('/api/health',(req,res)=>res.json({ok:true,service:'KVD API',version:'1.0.0'}));
app.get('/api/campaigns',(req,res)=>res.json({data:campaigns}));
app.get('/api/campaigns/:id',(req,res)=>{const item=campaigns.find(c=>c.id===Number(req.params.id));if(!item)return res.status(404).json({error:'Campaign not found'});res.json({data:item})});
const donationSchema=z.object({campaignId:z.number().int().positive(),amount:z.number().min(10),donorName:z.string().min(2).max(100),phone:z.string().min(9).max(15),reference:z.string().min(3).max(80).optional()});
app.post('/api/donations',async(req,res)=>{const parsed=donationSchema.safeParse(req.body);if(!parsed.success)return res.status(400).json({error:'Invalid donation details'});const donation={id:crypto.randomUUID(),...parsed.data,status:'pending',currency:'KES',createdAt:new Date().toISOString()};donations.push(donation);res.status(201).json({data:donation,message:'Donation created. Payment verification is required before funds are counted.'})});
app.get('/api/donations',(req,res)=>res.json({data:donations.map(({phone,...d})=>d)}));
app.get('/api/config/public',(req,res)=>res.json({brand:'KVD — Kindred Vince Donations',currency:'KES',payment:{provider:'mpesa',mode:process.env.MPESA_MODE||'manual'}}));
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'})});
app.listen(port,()=>console.log(`KVD API running on port ${port}`));

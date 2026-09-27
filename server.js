import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import {validate,contactEmailHtml} from './src/contact.js';

const app = express();
app.disable('x-powered-by');
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Cache-Control','no-store');next();});
const allowed = (process.env.ALLOWED_ORIGIN || '').replace(/\/$/,'');
app.use((req,res,next)=>{
  const origin = req.get('Origin');
  if (origin && origin === allowed) {
    res.set('Access-Control-Allow-Origin',allowed);
    res.set('Vary','Origin');
    res.set('Access-Control-Allow-Methods','POST, OPTIONS');
    res.set('Access-Control-Allow-Headers','Content-Type');
  }
  if (req.path === '/contact' && origin && origin !== allowed) return res.status(403).json({success:false,message:'Origin not allowed.'});
  if (req.path === '/contact' && req.method === 'OPTIONS') return res.status(origin === allowed ? 204 : 403).end();
  next();
});
app.get('/health',(req,res)=>res.json({ok:true}));
app.use(express.static('public'));
const upload = multer({storage:multer.memoryStorage(),limits:{fieldSize:6000,fields:8,parts:9}});
const parseForm = (req,res,next)=>{
  if (req.is('multipart/form-data')) return upload.none()(req,res,next);
  if (req.is('application/x-www-form-urlencoded')) return express.urlencoded({extended:false,limit:'15kb'})(req,res,next);
  if (req.is('application/json')) return express.json({limit:'15kb'})(req,res,next);
  return res.status(415).json({success:false,message:'Unsupported form content type.'});
};
app.post('/contact',parseForm,async(req,res)=>{
  const {fields,error} = validate(req.body);
  if (error) return res.status(422).json({success:false,message:error});
  if (req.body.website) return res.json({success:true,message:'Message received.'}); // honeypot
  const {RESEND_API_KEY,FROM_EMAIL,TO_EMAIL} = process.env;
  if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL || !allowed) return res.status(500).json({success:false,message:'Email configuration is incomplete.'});
  try {
    const upstream = await fetch('https://api.resend.com/emails',{
      method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({from:FROM_EMAIL,to:[TO_EMAIL],reply_to:fields.email,subject:`Contact form: ${fields.subject || 'New inquiry'}`,html:contactEmailHtml(fields)}),
      signal:AbortSignal.timeout(15000)
    });
    if (!upstream.ok) { console.error('Resend API error:',upstream.status); return res.status(502).json({success:false,message:'Email could not be sent. Please try again later.'}); }
    return res.json({success:true,message:'Your message has been sent successfully.'});
  } catch(e) {console.error('Resend request failed:',e.name);return res.status(502).json({success:false,message:'Email could not be sent. Please try again later.'});}
});
app.use((err,req,res,next)=>{console.error('Request error:',err.message);res.status(err instanceof multer.MulterError || err.type === 'entity.too.large' ? 413 : 400).json({success:false,message:'Invalid or oversized form submission.'});});
const port = Number(process.env.PORT) || 10000;
app.listen(port,'0.0.0.0',()=>console.log(`Contact API listening on port ${port}`));

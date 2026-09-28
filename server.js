// import 'dotenv/config';
// import express from 'express';
// import multer from 'multer';
// import {validate,contactEmailHtml} from './src/contact.js';

// const app = express();
// app.disable('x-powered-by');
// app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Cache-Control','no-store');next();});
// const allowed = (process.env.ALLOWED_ORIGIN || '').replace(/\/$/,'');
// app.use((req,res,next)=>{
//   const origin = req.get('Origin');
//   if (origin && origin === allowed) {
//     res.set('Access-Control-Allow-Origin',allowed);
//     res.set('Vary','Origin');
//     res.set('Access-Control-Allow-Methods','POST, OPTIONS');
//     res.set('Access-Control-Allow-Headers','Content-Type');
//   }
//   if (req.path === '/contact' && origin && origin !== allowed) return res.status(403).json({success:false,message:'Origin not allowed.'});
//   if (req.path === '/contact' && req.method === 'OPTIONS') return res.status(origin === allowed ? 204 : 403).end();
//   next();
// });
// app.get('/health',(req,res)=>res.json({ok:true}));
// app.use(express.static('public'));
// const upload = multer({storage:multer.memoryStorage(),limits:{fieldSize:6000,fields:8,parts:9}});
// const parseForm = (req,res,next)=>{
//   if (req.is('multipart/form-data')) return upload.none()(req,res,next);
//   if (req.is('application/x-www-form-urlencoded')) return express.urlencoded({extended:false,limit:'15kb'})(req,res,next);
//   if (req.is('application/json')) return express.json({limit:'15kb'})(req,res,next);
//   return res.status(415).json({success:false,message:'Unsupported form content type.'});
// };
// app.post('/contact',parseForm,async(req,res)=>{
//   const {fields,error} = validate(req.body);
//   if (error) return res.status(422).json({success:false,message:error});
//   if (req.body.website) return res.json({success:true,message:'Message received.'}); // honeypot
//   const {RESEND_API_KEY,FROM_EMAIL,TO_EMAIL} = process.env;
//   if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL || !allowed) return res.status(500).json({success:false,message:'Email configuration is incomplete.'});
//   try {
//     const upstream = await fetch('https://api.resend.com/emails',{
//       method:'POST',headers:{Authorization:`Bearer ${RESEND_API_KEY}`,'Content-Type':'application/json'},
//       body:JSON.stringify({from:FROM_EMAIL,to:[TO_EMAIL],reply_to:fields.email,subject:`Contact form: ${fields.subject || 'New inquiry'}`,html:contactEmailHtml(fields)}),
//       signal:AbortSignal.timeout(15000)
//     });
//     if (!upstream.ok) { console.error('Resend API error:',upstream.status); return res.status(502).json({success:false,message:'Email could not be sent. Please try again later.'}); }
//     return res.json({success:true,message:'Your message has been sent successfully.'});
//   } catch(e) {console.error('Resend request failed:',e.name);return res.status(502).json({success:false,message:'Email could not be sent. Please try again later.'});}
// });
// app.use((err,req,res,next)=>{console.error('Request error:',err.message);res.status(err instanceof multer.MulterError || err.type === 'entity.too.large' ? 413 : 400).json({success:false,message:'Invalid or oversized form submission.'});});
// const port = Number(process.env.PORT) || 10000;
// app.listen(port,'0.0.0.0',()=>console.log(`Contact API listening on port ${port}`));


import "dotenv/config"
import express from "express"
import multer from "multer"
import { validate, contactEmailHtml } from "./src/contact.js"

const app = express()

app.disable("x-powered-by")

// Environment configuration
const PORT = Number(process.env.PORT) || 10000

const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim()
const FROM_EMAIL = process.env.FROM_EMAIL?.trim()
const TO_EMAIL = process.env.TO_EMAIL?.trim()

const ALLOWED_ORIGIN = (
    process.env.ALLOWED_ORIGIN?.trim() ||
    "https://erithrobotics.framer.website"
).replace(/\/$/, "")

// Check configuration without exposing secrets
console.log("Email configuration:", {
    RESEND_API_KEY: Boolean(RESEND_API_KEY),
    FROM_EMAIL: Boolean(FROM_EMAIL),
    TO_EMAIL: Boolean(TO_EMAIL),
    ALLOWED_ORIGIN,
})

// Security headers
app.use((req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff")
    res.set("Cache-Control", "no-store")
    next()
})

// CORS
app.use((req, res, next) => {
    const origin = req.get("Origin")

    if (origin === ALLOWED_ORIGIN) {
        res.set("Access-Control-Allow-Origin", origin)
        res.set("Vary", "Origin")
        res.set("Access-Control-Allow-Methods", "POST, OPTIONS")
        res.set("Access-Control-Allow-Headers", "Content-Type")
    }

    if (req.path === "/contact") {
        if (origin && origin !== ALLOWED_ORIGIN) {
            return res.status(403).json({
                success: false,
                message: "Origin not allowed.",
            })
        }

        if (req.method === "OPTIONS") {
            return res
                .status(origin === ALLOWED_ORIGIN ? 204 : 403)
                .end()
        }
    }

    next()
})

// Health endpoint
app.get("/health", (req, res) => {
    res.json({ ok: true })
})

// Static files
app.use(express.static("public"))

// Form parsing
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fieldSize: 6000,
        fields: 8,
        parts: 9,
    },
})

function parseForm(req, res, next) {
    if (req.is("multipart/form-data")) {
        return upload.none()(req, res, next)
    }

    if (req.is("application/x-www-form-urlencoded")) {
        return express.urlencoded({
            extended: false,
            limit: "15kb",
        })(req, res, next)
    }

    if (req.is("application/json")) {
        return express.json({
            limit: "15kb",
        })(req, res, next)
    }

    return res.status(415).json({
        success: false,
        message: "Unsupported form content type.",
    })
}

// Contact endpoint
app.post("/contact", parseForm, async (req, res) => {
    const { fields, error } = validate(req.body)

    if (error) {
        return res.status(422).json({
            success: false,
            message: error,
        })
    }

    // Honeypot protection
    if (req.body.website) {
        return res.json({
            success: true,
            message: "Message received.",
        })
    }

    // Verify email configuration
    if (!RESEND_API_KEY || !FROM_EMAIL || !TO_EMAIL) {
        console.error("Missing email configuration:", {
            RESEND_API_KEY: !RESEND_API_KEY,
            FROM_EMAIL: !FROM_EMAIL,
            TO_EMAIL: !TO_EMAIL,
        })

        return res.status(500).json({
            success: false,
            message: "Email configuration is incomplete.",
        })
    }

    try {
        const upstream = await fetch(
            "https://api.resend.com/emails",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${RESEND_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: FROM_EMAIL,
                    to: [TO_EMAIL],
                    reply_to: fields.email,
                    subject: `Contact form: ${
                        fields.subject || "New inquiry"
                    }`,
                    html: contactEmailHtml(fields),
                }),
                signal: AbortSignal.timeout(15000),
            }
        )

        if (!upstream.ok) {
            let details = {}

            try {
                details = await upstream.json()
            } catch {
                details = {
                    message: "Unknown Resend API error",
                }
            }

            console.error("Resend API error:", {
                status: upstream.status,
                name: details.name,
                message: details.message,
            })

            return res.status(502).json({
                success: false,
                message:
                    "Email could not be sent. Please try again later.",
            })
        }

        return res.json({
            success: true,
            message: "Your message has been sent successfully.",
        })
    } catch (error) {
        console.error("Resend request failed:", error.name)

        return res.status(502).json({
            success: false,
            message:
                "Email could not be sent. Please try again later.",
        })
    }
})

// Error handler
app.use((err, req, res, next) => {
    console.error("Request error:", err.message)

    const oversized =
        err instanceof multer.MulterError ||
        err.type === "entity.too.large"

    return res.status(oversized ? 413 : 400).json({
        success: false,
        message: "Invalid or oversized form submission.",
    })
})

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Contact API listening on port ${PORT}`)
})

/*
https://docs.nestjs.com/controllers#controllers
*/

import { All, Controller, Get, Next, Param, Post, Redirect, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import * as dotenv from 'dotenv';
import { createProxyServer} from "http-proxy"
dotenv.config({ path: './.env' });

@Controller("/demo")
export class DemoController {
    @Get(["/pclink/*path","/pclink"])
    async getPclink(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PCLINK);
    }
    @Get(["/paymybuddy/*path","/paymybuddy"])
    getPaymybuddy(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PAYMYBUDDY);
        //this.newProxyRequest(path, res,req,"http://localhost:"+process.env.PAYMYBUDDY);
    }
    @Post(["/paymybuddy","/paymybuddy/*path"])
    postPaymybuddy(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PAYMYBUDDY);
    }
    @Get(["/patientManagerMicroservices","/patientManagerMicroservices/*path"])
    getPatientManager(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PATIENTMANAGERMICROSERVICES);
    }
    @Get(["/simpleHTMLCSSintegration","/simpleHTMLCSSintegration/*path"])
    getBooki(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        res.redirect("https://airwin17.github.io/simpleHTMLCSSintegration")
    }
    @Get(["/bookingNotationReactAppExp","/bookingNotationReactAppExp/*path"])
    getKasa(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request){
        /* this.proxyRequest(path, res,req,"http://localhost:"+process.env.KASA); */
        const localHost=req.host;

        res.redirect(req.protocol+"://"+localHost+":"+process.env.KASA+"/Accueil")
    }
    @Get(["/architectportfolio","/architectportfolio/*path"])
    getArchitectPortfolio(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.ARCHITECTPORTFOLIO);
    }
    @Post(["/architectportfolio","/architectportfolio/*path"])
    postArchitectPortfolio(@Param("path") path: string|string[], @Res() res: Response, @Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.ARCHITECTPORTFOLIO);
    }
    async proxyRequest(path: string|string[], res: Response,req: Request,targetHost : string) {
        //generate the target server URL based on the path parameter
        const localHost=req.host;
        const targetPath = Array.isArray(path)?path.join("/"):path;
        const localPath=req.url.replace("/"+targetPath,"");
        let targetUrl:string = targetHost;
        
        if(Array.isArray(path)){
            for(let i=0;i<path.length;i++){
                targetUrl+="/"+path[i];
            }
        }else if(path)
            targetUrl+="/"+path;
        let response: globalThis.Response | undefined;
        if(req.body){
            const options: { headers: { [key: string]: string }, method: string,credentials: RequestCredentials,redirect:RequestRedirect, body: null|FormData|URLSearchParams|string } = {
                headers: {
                    'content-type': req.headers['content-type'] as string,
                },
                method: req.method,
                redirect: 'manual' as RequestRedirect,
                credentials: 'include' as RequestCredentials,
                body:null
            };
            if (options.headers['content-type'] === 'application/json') {
                options.body = JSON.stringify(req.body);
            } else if (options.headers['content-type'] === 'application/x-www-form-urlencoded') {
                let params : URLSearchParams= new URLSearchParams();
                for (const key in req.body) {
                    params.append(key, req.body[key]);
                }
                options.body = params;
            } else if (options.headers['content-type']?.startsWith('multipart/form-data')) {
                const formData = new FormData();
                for (const key in req.body) {
                    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
                        formData.append(key, req.body[key]);
                    }
                }
                options.body = formData;
            }
            for(let key in req.headers) {
                options.headers[key] = req.headers[key] as string;
            }
            try {
                response = await fetch(targetUrl, options);
                const location=response.headers.get("location") as string;
            if(location){
                const cookies = response.headers.get("set-cookie");
                const redirectHeader = new Headers(response.headers);
                redirectHeader.set("location",req.protocol+"://"+location.replace(targetHost,localHost+localPath));
                console.log(redirectHeader)
                res.setHeaders(redirectHeader);
                res.status(response.status);
                res.send();
                return;
            }
            } catch (error) {
                res.send(error)
                return;
            }
            
        }else{
            if(req.headers["cookie"]){
                const headers: Record<string, string> = {};
                for (const key in req.headers) {
                    headers[key] = req.headers[key] as string;
                }
                try {
                    response = await fetch(targetUrl, {
                        headers:headers,
                        credentials: 'include' as RequestCredentials,
                    });
                } catch (error) {
                    res.send(error);
                    return;
                }
            }else{
                try {
                    response = await fetch(targetUrl,{redirect: 'manual' });
                    if(response.headers.get("location")){
                        const cookies = response.headers.get("set-cookie");
                        const headers: Record<string, string> = {};
                        if (cookies) {
                            headers.cookie = cookies;
                        }
                        response = await fetch(response.headers.get("location") as string, {
                            headers,
                            credentials: 'include' as RequestCredentials,
                        });
                    }
                } catch (error) {
                    res.send(error)
                    return;
                }
            }
            
            
        }
            
        if (response) {
            const contentType = response.headers.get("content-type") as string;
            const status = response.status;
            const ContentDisposition= response.headers.get("content-disposition") as string;
            //copy the headers from the fetched response to return to the client
            response.headers.forEach((value,key)=>{
                if(key==="location"){
                    value=value.replace(targetHost,localPath);
                }
                res.setHeader(key,value);
            })
            const headers= res.getHeaders();
            let data:null | string | Uint8Array= null;
            if(contentType&&(contentType.includes("image/webp")||contentType.includes("image/png")||contentType.includes("image/jpeg")||contentType.includes("image/jpg"))){
                data = await response.bytes();
            }else if(contentType){
                data = await response.text() as string;
            }
            res.status(status);
            if(data){
                res.send(data);
            }else{
                res.send();
            }
        }
    }
    
}

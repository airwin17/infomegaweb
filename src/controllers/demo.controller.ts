/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Header, Param, Post, Req, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller("/demo")
export class DemoController {
    @Get(["/pclink/*path","/pclink"])
    async getPclink(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PCLINK);
    }
    @Get(["/paymybuddy/*path","/paymybuddy"])
    getPaymybuddy(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.PAYMYBUDDY);
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
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.BOOKI);
    }
    @Get(["/bookingNotationReactAppExp","/bookingNotationReactAppExp/*path"])
    getKasa(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request){
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.KASA);
    }
    @Get(["/architectportfolio","/architectportfolio/*path"])
    getArchitectPortfolio(@Param("path") path: string|string[], @Res() res: Response,@Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.ARCHITECTPORTFOLIO);
    }
    @Post(["/architectportfolio","/architectportfolio/*path"])
    postArchitectPortfolio(@Param("path") path: string|string[], @Res() res: Response, @Req() req: Request) {
        this.proxyRequest(path, res,req,"http://localhost:"+process.env.ARCHITECTPORTFOLIO);
    }
    async proxyRequest(path: string|string[], res: Response,req: Request,host : string) {
        //generate the target server URL based on the path parameter
        let targetUrl:string = host
        if(Array.isArray(path)){
            for(let i=0;i<path.length;i++){
                targetUrl+="/"+path[i];
            }
        }else if(path)
            targetUrl+="/"+path;
        
        let response: globalThis.Response;
        //add authorization header if it exists
        const Authorization = req.headers["Authorization"] as string;
        if(Authorization)
            res.setHeader('Authorization', Authorization);
        //copy body to the request if it exists
        if(req.body){
            console.log("text",req);
            const options = {
                headers: {
                    'content-type': req.headers['content-type'] as string,
                },
                method: req.method,
                body: JSON.stringify(req.body),
            };
            response = await fetch(targetUrl, options);
            while(response.status === 302) {
                const location = response.headers.get("location") as string;
                console.log("location",location);
                if (location) {
                    response = await fetch(location);
                } else {
                    break;
                }
            }
        }else{
            console.log(targetUrl);
            response = await fetch(targetUrl);
            while(response.status === 302) {
                const location = response.headers.get("location") as string;
                if (location) {
                    response = await fetch(location);
                } else {
                    break;
                }
            }
        }
            
        if (response) {
            const contentType = response.headers.get("content-type") as string;
            const status = response.status;
            const ContentDisposition= response.headers.get("content-disposition") as string;
            const location = response.headers.get("location") as string;
            let data: string | Uint8Array;
            if(contentType&&(contentType.includes("image/webp")||contentType.includes("image/png")||contentType.includes("image/jpeg")||contentType.includes("image/jpg"))){
                data = await response.bytes();
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
            }else if(contentType){
                //set type of res to contentType
                res.setHeader('Content-Type', contentType);
                console.log(res.getHeaders());
                data = await response.text() as string;
            }else{
                //res.setHeader('Content-Type', 'image/png');
                data = await response.bytes() as Uint8Array;
            }
            res.status(status);
            if(ContentDisposition){
                console.log("Content-Disposition",ContentDisposition);
                res.setHeader('content-disposition', ContentDisposition);
            }
            if(location){
                res.location(location);
            }
            //res.setHeader('Content-Type', "text/html");
            res.send(data);
        }
    }
}

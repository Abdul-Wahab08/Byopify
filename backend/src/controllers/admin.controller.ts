import ImageKit from "@imagekit/nodejs";
import { NextFunction, Request, Response } from "express";

function getImagekitAuthParameters(_req: Request, res: Response, next: NextFunction) {
    try {
      const client = new ImageKit({
        privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      })  

      const authParameters = client.helper.getAuthenticationParameters();

      res.json({
       ...authParameters,
       publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
       urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
      });
    } catch (error) {
        next(error)
    }
}

export {
    getImagekitAuthParameters
}
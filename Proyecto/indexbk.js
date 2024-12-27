'use strict'

const express = require('express');
const iconv = require('iconv-lite');
const axios = require('axios');
const api = express.Router();
const fsPromise = require("fs").promises;
const fs = require("fs");
const { mkdir } = require('fs');
var DecompressZip = require('decompress-zip');
//const atob = require('atob');
//const btoa = require('btoa');
//const jsonPackGzip = require('json-pack-gzip');
//var zlib = require('zlib');
var Buffer = require('buffer').Buffer;
var multipart = require('connect-multiparty');
var fileZip = multipart({uploadDir: './apiFile-clima'});


console.log("---------Backend API clima-----------");

api.get('/clima-mexico',fileZip,climaMexico);


/**
 *
 * @param {*} req 
 * @param {*} res 
 */
async function climaMexico(req,res){

    let tag = "climaMexico";

    let buffer = "";
    let dir = "";

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://smn.conagua.gob.mx/tools/GUI/webservices/?method=1',
        headers: { 
          'Cookie': 'HttpOnly; incap_ses_1061_2707069=YwQDU0kV3yunLCBEG2+5DkBgXWUAAAAAlqK6Y+gXTT4hBBcE5G9lEw==; nlbi_2707069=qqn/L4Iy2ggnpb0mByjSLwAAAAChsPNgINtmwGDFywgNFDkb; visid_incap_2707069=/RXTxtCFQhqo8G07wHmfs0BgXWUAAAAAQUIPAAAAAABzu0IqwxiHlADPpxva8kQK; HttpOnly; 6d97cdd4f899b737880dffe8a4fef2bc=8t4add638u6j9d86hs8t3cocmg'
        },
      };

    let jsonClima = await axios.request(config)
    .then(function(response){
        //console.log(JSON.stringify(response.data));
        return response;
    })
    .catch((error) => {
        console.log(`${tag} Error al consumir la api de clima: `,error);
    });

    //let jsonClima = await axios.get(config).catch(error=>console.log(tag,error));
    //console.log(`${tag} Archivo B64: `,jsonClima);

    const obj=JSON.parse(JSON.stringify(jsonClima.headers));
    console.log(`${tag} obj `,obj);

    //const mime_type= obj['content-type'];
    //const typeFile=mime_type.split('/')[1];

    //console.log(`${tag} mime_type `,mime_type);
    //console.log(`${tag} typeFile `,typeFile);

    let contentTypeResponse = jsonClima.headers.get('content-type');
    console.log(`${tag} contentTypeResponse `,contentTypeResponse);

    let arrayBuffer = new Array;
    if(jsonClima.data){
        //buffer=jsonClima.data.toString('utf-8');
        //console.log(`${tag} buffer `,buffer);

        buffer = iconv.decode(new Buffer.from(jsonClima.data), 'binary').toString();
        //console.log(`${tag} buffer `,buffer);
    }

    let fecha = new Date();
    let filename='clima-' + fecha.getTime() + '.zip';
    console.log(tag,filename)
    /*let media={
      mimetype:mime_type,
      data:buffer,
      filename:filename,
      caption: encodeURIComponent(filename)
    }*/
    
    dir=`${__dirname}/apiFile-clima`+ '/' + filename;
    let dir2 = `${__dirname}/apiFile-clima`;
    console.log(tag+" dirección: ", dir)
    fs.writeFileSync(dir,jsonClima.data,'base64');

    fs.createReadStream(dir);

    console.log(filename);
    res.status(200).send();
}

module.exports = api;
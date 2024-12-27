'use strict'

const express = require('express');
const axios = require('axios');
const api = express.Router();
const fs = require("fs");
const zlib = require('zlib');
//const { promises } = require('dns');
//const { rejects } = require('assert');

console.log("---------Backend API clima-----------");

api.get('/clima-mexico',climaMexico);
api.get('/municipios-estado',municipiosxEstado);
api.get('/data-string', dataString);


/**
 *
 * @param {*} req 
 * @param {*} res 
 */
async function climaMexico(req,res){

    let tag = "climaMexico";

    let filtro = {};

    if(req.query.id_es != undefined && req.query.id_mun != undefined ){
      filtro.id_es = req.query.id_es;
      filtro.id_mun = req.query.id_mun;
    }else{
      return res.status(400).send({"Error":"Falta informar id_es o id_mun"});
    }
  
    let dir = "";
    let dir2 = "";
  
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://smn.conagua.gob.mx/tools/GUI/webservices/?method=1',
        headers: { 
          'Cookie': 'HttpOnly; incap_ses_1061_2707069=YwQDU0kV3yunLCBEG2+5DkBgXWUAAAAAlqK6Y+gXTT4hBBcE5G9lEw==; nlbi_2707069=qqn/L4Iy2ggnpb0mByjSLwAAAAChsPNgINtmwGDFywgNFDkb; visid_incap_2707069=/RXTxtCFQhqo8G07wHmfs0BgXWUAAAAAQUIPAAAAAABzu0IqwxiHlADPpxva8kQK; HttpOnly; 6d97cdd4f899b737880dffe8a4fef2bc=8t4add638u6j9d86hs8t3cocmg'
        },
        responseType:"arraybuffer"
      };
  
    let jsonClima = await axios.request(config)
    .then(function(response){
        return response;
    })
    .catch((error) => {
        console.log(`${tag} Error al consumir la api de clima: `,error);
    });
  
    let filename='clima-mexico.gz';
    console.log(tag,filename)
  
    
    dir=`${__dirname}\\apiFile-clima`+ '\\' + filename;
    dir2 = `${__dirname}\\apiFile-clima\\DailyForecast_MX`;
  
    try{
      fs.writeFileSync(dir,jsonClima.data,'base64');
    }catch(e){
      return res.status(400).send({"error":"error al consumir servicio"});
    }
  
    let JSON_data = await descomprimirArchivoGZ(filename,dir2,filtro);
    //console.log(`${tag} Municipíos: `,JSON_data);  
    
    return res.status(200).send({"municipio_clima":JSON_data});
}

/**
 *
 * @param {*} req 
 * @param {*} res 
 */
async function municipiosxEstado(req,res){

  let tag = "municipiosxEstado";

  //console.log(`${tag} req `,req.query.id_es);

  let filtro = {};

  if(req.query.id_es != ""){
    filtro.id_es = req.query.id_es;
  }else{
    return res.status(400).send({"Error":"Falta informar id_es"});
  }

  let dir = "";
  let dir2 = "";

  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://smn.conagua.gob.mx/tools/GUI/webservices/?method=1',
      headers: { 
        'Cookie': 'HttpOnly; incap_ses_1061_2707069=YwQDU0kV3yunLCBEG2+5DkBgXWUAAAAAlqK6Y+gXTT4hBBcE5G9lEw==; nlbi_2707069=qqn/L4Iy2ggnpb0mByjSLwAAAAChsPNgINtmwGDFywgNFDkb; visid_incap_2707069=/RXTxtCFQhqo8G07wHmfs0BgXWUAAAAAQUIPAAAAAABzu0IqwxiHlADPpxva8kQK; HttpOnly; 6d97cdd4f899b737880dffe8a4fef2bc=8t4add638u6j9d86hs8t3cocmg'
      },
      responseType:"arraybuffer"
    };

  let jsonClima = await axios.request(config)
  .then(function(response){
      return response;
  })
  .catch((error) => {
      console.log(`${tag} Error al consumir la api de clima: `,error);
  });

  let filename='clima-mexico.gz';
  console.log(tag,filename)

  
  dir=`${__dirname}\\apiFile-clima`+ '\\' + filename;
  dir2 = `${__dirname}\\apiFile-clima\\DailyForecast_MX`;

  try{
    fs.writeFileSync(dir,jsonClima.data,'base64');
  }catch(e){
    return res.status(400).send({"error":"error al consumir servicio"});
  }

  let JSON_data = await descomprimirArchivoGZ(filename,dir2,filtro);
  //console.log(`${tag} Municipíos: `,JSON_data);  
  
  return res.status(200).send({"municipios":JSON_data});
}


//Funcion que descomprime el archivo GZ del api del clima
async function descomprimirArchivoGZ(fileName,dir,filtro){
  let tag = "descomprimirArchivoGZ: ";

  let contenidoArchivo = "";
  let string_contenidoArchivo = "";
  let JSON_contenidoArchivo = "";
  let JSON_clima = "";
  let bandera = filtro.type || "";

  let rutaArchivo = `${__dirname}\\apiFile-clima\\` + fileName;
  let rutaDestino = `${__dirname}\\apiFile-clima\\DailyForecast_MX`;
  
  let streamLectura = fs.createReadStream(rutaArchivo);
  let streamEscitura = fs.createWriteStream(rutaDestino);

  let descompresor = zlib.createGunzip();

  
  streamLectura.pipe(descompresor).pipe(streamEscitura);

  let ArchivoCargado = await new Promise((resolve,reject) => {
    streamEscitura.on('finish',function (){
      console.log(tag + "Archivo descomprimido");
      contenidoArchivo = fs.readFileSync(dir);
      console.log(`${tag} contenidoArchivo: `,contenidoArchivo.length);
      string_contenidoArchivo = contenidoArchivo.toString();
      if (bandera == "all"){
        resolve (string_contenidoArchivo);
      }
      JSON_contenidoArchivo = JSON.parse(string_contenidoArchivo);
  
      JSON_clima = filtroClima(JSON_contenidoArchivo,filtro);
      resolve(JSON_clima);
    });
    
  });

  return ArchivoCargado;
}

//Funcion que filtra por id estado o por id municipio
function filtroClima(data,filtro){

  let tag = "filtroClima: ";

  let id_es = filtro.id_es || "";
  let id_mun = filtro.id_mun || "";

  let JSON_data = data || "";

  console.log(`${tag} id_es`,id_es);
  console.log(`${tag} id_mun`,id_mun);

  if(id_es != "" && id_mun != ""){
    console.log(`${tag} Solicita informacion del estado y municipio`);
    let municipio_clima = JSON_data.filter(data_clima => 
      data_clima.ides == id_es && data_clima.idmun == id_mun
    );

    return municipio_clima;
  }else if(id_es != ""){
    console.log(`${tag} Solicita informacion de los municipios`);

    let municipios_clima = JSON_data.filter(data_clima => 
      data_clima.ides == id_es && data_clima.ndia == 0

    );

    console.log(`${tag} municipios encontrados: `,municipios_clima.length);

    let municipios = municipios_clima.map(function(mun){
      return {
        "nmun":mun.nmun,
        "idmun":mun.idmun
      };
    });

    return municipios;
  }

}

/**
 *
 * @param {*} req 
 * @param {*} res 
 */
async function dataString(req,res){

  let tag = "dataString";
  let filtro = {
    type : "all"
  }
  
  let dir = "";
  let dir2 = "";

  let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: 'https://smn.conagua.gob.mx/tools/GUI/webservices/?method=1',
      headers: { 
        'Cookie': 'HttpOnly; incap_ses_1061_2707069=YwQDU0kV3yunLCBEG2+5DkBgXWUAAAAAlqK6Y+gXTT4hBBcE5G9lEw==; nlbi_2707069=qqn/L4Iy2ggnpb0mByjSLwAAAAChsPNgINtmwGDFywgNFDkb; visid_incap_2707069=/RXTxtCFQhqo8G07wHmfs0BgXWUAAAAAQUIPAAAAAABzu0IqwxiHlADPpxva8kQK; HttpOnly; 6d97cdd4f899b737880dffe8a4fef2bc=8t4add638u6j9d86hs8t3cocmg'
      },
      responseType:"arraybuffer"
    };

  let jsonClima = await axios.request(config)
  .then(function(response){
      return response;
  })
  .catch((error) => {
      console.log(`${tag} Error al consumir la api de clima: `,error);
  });

  let filename='clima-mexico.gz';
  console.log(tag,filename)

  
  dir=`${__dirname}\\apiFile-clima`+ '\\' + filename;
  dir2 = `${__dirname}\\apiFile-clima\\DailyForecast_MX`;

  try{
    fs.writeFileSync(dir,jsonClima.data,'base64');
  }catch(e){
    return res.status(400).send({"error":"error al consumir servicio"});
  }

  let JSON_data = await descomprimirArchivoGZ(filename,dir2,filtro);
  //console.log(`${tag} Municipíos: `,JSON_data);  
  
  return res.status(200).send({"clima":JSON_data});
}

module.exports = api;
const fetch = require("node-fetch");
const fs = require('fs');


// https://github.com/datasets/geo-countries/blob/master/data/countries.geojson
const url = "https://datahub.io/core/geo-countries/r/countries.geojson";

const localFileName = 'countries.geojson'

const getData = async url => {
    let geoData = {}



    try {

        if (fs.existsSync(localFileName)) {
            console.log("file exists, start reading it from disk")
            geoData = JSON.parse(fs.readFileSync(localFileName))
        }
        else {
            console.log("file does not exists, start downloading it from web")
            const response = await fetch(url);
            geoData = await response.json();
            fs.writeFileSync(localFileName, JSON.stringify(geoData))
        }

        const dirName = "countries/"

        // console.log(geoData.features[0])
        fs.rmdirSync(dirName, { recursive: true })
        fs.mkdirSync(dirName)
        for (const feature of geoData.features) {
            var countries = ['Austria', 'Denmark', 'Germany', 'Sweden', 'Switzerland']
            if (/[A-Z]{3}/.test(feature.properties.ISO_A3) && countries.includes(feature.properties.ADMIN)) {

                let data = JSON.stringify(feature, null, 4);
                fs.writeFileSync(dirName + feature.properties.ISO_A3 + '.json', data);
            }
        }


    } catch (error) {
        console.log(error);
    }
};

getData(url);
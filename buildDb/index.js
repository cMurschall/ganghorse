const fetch = require('node-fetch');
const fs = require('fs');
const url = require("url");
const path = require("path");


const anzip = require('anzip');
const { Client, Pool } = require('pg')
const copyFrom = require('pg-copy-streams').from;


const fileUrls = [
    "http://download.geonames.org/export/dump/allCountries.zip",
    "http://download.geonames.org/export/dump/alternateNames.zip",
    "http://download.geonames.org/export/dump/countryInfo.txt",
    "http://download.geonames.org/export/dump/admin1CodesASCII.txt",
    "http://download.geonames.org/export/dump/admin2Codes.txt",
    "http://download.geonames.org/export/dump/hierarchy.zip",
    "http://download.geonames.org/export/dump/featureCodes_en.txt"
]

const zipFiles = [
    "allCountries.zip",
    "alternateNames.zip",
    "hierarchy.zip",
]
const txtFiles = [
    "countryInfo.txt",
    "admin1CodesASCII.txt",
    "admin2Codes.txt",
    "featureCodes_en.txt"
]

const postalCodeCountries = [
    "DE", "DK", "SE", "AT", "CH"
]

const client = new Client({
    user: 'user',
    host: 'localhost',
    database: 'iceHorseFair',
    password: '',
    port: 5432,
})





const downloadFile = (async (url, path) => {

    const res = await fetch(url);
    const fileStream = fs.createWriteStream(path);
    await new Promise((resolve, reject) => {
        res.body.pipe(fileStream);
        res.body.on("error", (err) => {
            reject(err);
        });
        fileStream.on("finish", function () {
            resolve();
        });
    });
});



const copyFileToTable = (client, copyString, filePath) => {
    //

    var stream = client.query(copyFrom(copyString));
    var fileStream = fs.createReadStream(filePath)

    return new Promise((resolve, reject) => {
        fileStream.on('error', error => reject(error));
        stream.on('error', error => reject(error));
        stream.on('end', () => {
            console.log("stream ended")
            resolve()
        });
        fileStream.pipe(stream);
    });
}



(async () => {
    try {

        if (true) {
            // download and extract all files
            await Promise.all(zipFiles.concat(txtFiles).map(async filename => {
                var fileurl = "http://download.geonames.org/export/dump/" + filename
                var parsed = url.parse(fileurl);
                var targetFilePath = path.join(__dirname, path.basename(parsed.pathname));
                if (!fs.existsSync(targetFilePath)) {
                    console.log(`start downloading ${parsed.href}`)
                    await downloadFile(parsed.href, targetFilePath)

                    // unzip if zip file
                    if (targetFilePath.includes(".zip")) {
                        await anzip(targetFilePath);
                    }

                } else {
                    console.log(`File '${path.basename(parsed.pathname)}' already downloaded`)
                }
            }))

            await Promise.all(postalCodeCountries.map(async filename => {
                // http://download.geonames.org/export/zip/SE.zip
                var fileurl = "http://download.geonames.org/export/zip/" + filename + ".zip"
                var parsed = url.parse(fileurl);
                var targetFilePath = path.join(__dirname, path.basename(parsed.pathname));
                if (!fs.existsSync(targetFilePath)) {
                    console.log(`start downloading ${parsed.href}`)
                    await downloadFile(parsed.href, targetFilePath)
                    // unzip if zip file
                    await anzip(targetFilePath);
                } else {
                    console.log(`File '${path.basename(parsed.pathname)}' already downloaded`)
                }
            }))
        }

        // we need to delete all coments from 'countryInfo' since we cannot copy those lines to postgres.
        await new Promise((resolve, reject) => {
            var filename = path.join(__dirname, 'countryInfo.txt');
            fs.readFile(filename, 'utf8', (err, data) => {
                if (err) {
                    console.error(err)
                    reject(err)
                } else {
                    var wantedLines = data
                        .split("\n")
                        .filter(line => !line.startsWith('#'))
                        .join('\n');
                    fs.writeFile(filename, wantedLines, (err, data) => {
                        if (err) {
                            console.error(err)
                            reject(err)
                        } else {
                            resolve()
                        }
                    });
                }
            });
        });


        console.log("connect to database");

        await client.connect()

        console.log("connected", client);

        await client.query("DROP TABLE IF EXISTS geoname CASCADE;");
        // await client.query(`CREATE TABLE geoname (
        //     geonameid   int,
        //     name varchar(200),
        //     asciiname varchar(200),
        //     alternatenames text,
        //     latitude float,
        //     longitude float,
        //     fclass char(1),
        //     fcode varchar(10),
        //     country varchar(2),
        //     cc2 varchar(200),
        //     admin1 varchar(20),
        //     admin2 varchar(80),
        //     admin3 varchar(20),
        //     admin4 varchar(20),
        //     population bigint,
        //     elevation int,
        //     gtopo30 int,
        //     timezone varchar(40),
        //     moddate date
        //     );`);

        await client.query("DROP TABLE IF EXISTS alternatename;");
        // await client.query(`CREATE TABLE alternatename (
        //     alternatenameId int,
        //     geonameid int,
        //     isoLanguage varchar(7),
        //     alternateName varchar(200),
        //     isPreferredName boolean,
        //     isShortName boolean,
        //     isColloquial boolean,
        //     isHistoric boolean
        //     );`);

        await client.query("DROP TABLE IF EXISTS countryinfo;");
        // await client.query(`CREATE TABLE  countryinfo (
        //     iso_alpha2 char(2),
        //     iso_alpha3 char(3),
        //     iso_numeric integer,
        //     fips_code varchar(3),
        //     name varchar(200),
        //     capital varchar(200),
        //     areainsqkm double precision,
        //     population integer,
        //     continent varchar(2),
        //     tld varchar(10),
        //     currencycode varchar(3),
        //     currencyname varchar(20),
        //     phone varchar(20),
        //     postalcode varchar(100),
        //     postalcoderegex varchar(200),
        //     languages varchar(200),
        //     geonameId int,
        //     neighbors varchar(50),
        //     equivfipscode varchar(3)
        //     );`);


        // await client.query("DROP TABLE IF EXISTS postalcodes;");
        // await client.query(`CREATE TABLE postalcodes (
        //     id SERIAL NOT NULL,
        //     countrycode character(2) NOT NULL,
        //     postalcode varchar(20) NOT NULL,
        //     placename varchar(180) NOT NULL,
        //     admin1name varchar(100),
        //     admin1code varchar(20),
        //     admin2name varchar(100),
        //     admin2code varchar(20),
        //     admin3name varchar(100),
        //     admin3code varchar(20),
        //     latitude double precision NOT NULL,
        //     longitude double precision NOT NULL,
        //     accuracy smallint,
        //     PRIMARY KEY (id)
        // );`);


        // var copyStringGeoname = `copy geoname (geonameid,name,asciiname,alternatenames,latitude,longitude,fclass,fcode,country,cc2,admin1,admin2,admin3,admin4,population,elevation,gtopo30,timezone,moddate) from STDIN null as '';`
        // await copyFileToTable(client, copyStringGeoname, path.join(__dirname, 'allCountries.txt'))

        // var copyStringAlternatename = `copy alternatename (alternatenameid,geonameid,isolanguage,alternatename,ispreferredname,isshortname,iscolloquial,ishistoric) from STDIN null as '';`
        // await copyFileToTable(client, copyStringAlternatename, path.join(__dirname, 'alternateNames.txt'))

        // var copyStringCountryinfo = `copy countryinfo (iso_alpha2,iso_alpha3,iso_numeric,fips_code,name,capital,areainsqkm,population,continent,tld,currencycode,currencyname,phone,postalcode,postalcoderegex,languages,geonameid,neighbors,equivfipscode) from STDIN null as '';`
        // await copyFileToTable(client, copyStringCountryinfo, path.join(__dirname, 'countryInfo.txt'))

        console.log("start copy postalcodes to database")
        postalCodeCountries.map(async postalCode => {

            console.log("copy postalcode: " + postalCode)

            var copyStringCountryinfo = `copy postalcodes (countrycode,postalcode,placename,admin1name,admin1code,admin2name,admin2code,admin3name,admin3code,latitude,longitude,accuracy) from STDIN null as '';`
            await copyFileToTable(client, copyStringCountryinfo, path.join(__dirname, `${postalCode}.txt`))
        })
        // await client.query(`SELECT AddGeometryColumn ('public','postalcodes','the_geom',4326,'POINT',2);`)
        await client.query(`UPDATE postalcodes SET coordinate = ST_PointFromText('POINT(' || longitude || ' ' || latitude || ')', 4326);`)
        await client.query(`--UPDATE postalcodes SET coordinate = ST_SetSRID(ST_Point(longitude,latitude),4326);`)

        await client.query(`CREATE INDEX IF NOT EXISTS idx_postalcodes ON postalcodes USING gist(coordinate);`)
        // await client.query(`ALTER TABLE postalcodes ALTER COLUMN coordinate SET NOT NULL;`)
        await client.query(`CLUSTER idx_postalcodes ON postalcodes;`)

        // // Now is time to create the primary-keys and the foreign-keys
        // await client.query(`ALTER TABLE ONLY alternatename ADD CONSTRAINT pk_alternatenameid PRIMARY KEY (alternatenameid);`)
        // await client.query(`ALTER TABLE ONLY geoname ADD CONSTRAINT pk_geonameid PRIMARY KEY (geonameid);`)
        // await client.query(`ALTER TABLE ONLY countryinfo ADD CONSTRAINT pk_iso_alpha2 PRIMARY KEY (iso_alpha2);`)
        // await client.query(`ALTER TABLE ONLY countryinfo ADD CONSTRAINT fk_geonameid FOREIGN KEY (geonameid) REFERENCES geoname(geonameid);`)
        // await client.query(`ALTER TABLE ONLY alternatename ADD CONSTRAINT fk_geonameid FOREIGN KEY (geonameid) REFERENCES geoname(geonameid);`)


        // // and finally you have to generate the Postgis points
        // await client.query(`SELECT AddGeometryColumn ('public', 'geoname','the_geom',4326,'POINT',2);`)
        // await client.query(`UPDATE geoname SET the_geom = ST_PointFromText('POINT(' || longitude || ' ' || latitude || ')', 4326);`)
        // await client.query(`CREATE INDEX idx_geoname_the_geom ON public.geoname USING gist(the_geom);`)



        // await client.query(`CREATE INDEX idx_geoname ON geoname USING gist(the_geom);`)
        // await client.query(`ALTER TABLE geoname ALTER COLUMN the_geom SET not null;`)
        // await client.query(`CLUSTER idx_geoname ON geoname;`)
        // await client.query(`CREATE INDEX idx_postalcodes ON postalcodes USING gist(the_geom);`)
        // await client.query(`ALTER TABLE postalcodes ALTER COLUMN the_geom SET not null;`)
        // await client.query(`CLUSTER idx_postalcodes ON postalcodes;`)


        // await client.query('SELECT DISTINCT country         FROM public.geoname         ORDER BY country')
        // await client.query(`DELETE FROM geoname WHERE country NOT IN ('DK', 'DK')`)

        await client.end()


    } catch (e) {
        console.log("error occored")
        console.error(e)
    }
})();




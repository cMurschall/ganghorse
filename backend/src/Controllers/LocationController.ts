import { JsonController, Post, Body, BodyParam } from "routing-controllers";
import { Service } from "typedi";
import { Repository, Like, Brackets } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";

import { Location } from "../Models/LocationEntity";



interface LocationPostalInput {
    postalCode: string,
    countryCode: string
}


interface LocationCoordinateInput {
    longitude: string,
    latitude: string
}


@JsonController('/location')
@Service()
export class LocationController {

    constructor(
        @InjectRepository(Location)
        private repository: Repository<Location>
    ) { }



    @Post("/findById")
    findById(@BodyParam("id") id: number): Promise<Location | undefined> {
        return this.repository.findOne(id);
    }


    @Post("/findByPostalcode")
    findByPostalcode(@Body() input: LocationPostalInput) {

        // console.log(input)

        let { postalCode, countryCode } = input;

        let capitalize = (value: string) => {
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
        }

        return this.repository.find({
            where: [
                {
                    postalcode: Like(`${postalCode}%`),
                    countrycode: countryCode.toUpperCase()
                },
                // or
                {
                    placename: Like(`${capitalize(postalCode)}%`),
                    countrycode: countryCode.toUpperCase()
                }
            ]

        });
    }


    @Post("/findByCoordinate")
    findByCoordinate(@Body() input: LocationCoordinateInput) {

        const { longitude, latitude } = input;

        const [query, parameters] = this.repository.manager.connection.driver.escapeQueryWithParameters(
            "SELECT * FROM postalcodes ORDER BY coordinate <-> ST_SetSRID(ST_Point(:longitude, :latitude), 4326) LIMIT 1;",
            { longitude, latitude }, {}
        );

        return this.repository.query(query, parameters)
    }
}
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
@Entity("postalcodes", { synchronize: false })
export class Location {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("character", { length: 2 })
    countrycode: string;


    @Column("character varying", { length: 20 })
    postalcode: string;


    @Column("character varying", { length: 180 })
    placename: string;


    @Column("character varying", { length: 100 })
    admin1name: string;


    @Column("character varying", { length: 20 })
    admin1code: string;


    @Column("character varying", { length: 100 })
    admin2name: string;


    @Column("character varying", { length: 20 })
    admin2code: string;


    @Column("character varying", { length: 100 })
    admin3name: string;


    @Column("character varying", { length: 20 })
    admin3code: string;


    @Column("double precision")
    latitude: number;


    @Column("double precision")
    longitude: number;

    @Column("smallint")
    accuracy: number;
}
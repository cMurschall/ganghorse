
import { Column } from "typeorm";
import { EntityBase } from "./EntityBase";

// Stores the currently-being-typechecked object for error messages.
export class WorldFengurInfo extends EntityBase {

    @Column({ type: "varchar", length: 15, nullable: false })
    feifId: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    firstName: string;


    @Column({ type: "varchar", length: 20, nullable: true })
    prefix: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    origin: string;

    sexInWorldfengur: number;

    @Column({ type: "int", nullable: true })
    yearOfBirth: number;


    @Column({ type: "varchar", length: 15, nullable: true })
    fatherid: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    fathername: string;



    @Column({ type: "varchar", length: 15, nullable: true })
    fathersfatherid: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    fathersfathername: string;

    @Column({ type: "varchar", length: 15, nullable: true })
    fathersmotherid: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    fathersmothername: string;


    @Column({ type: "varchar", length: 15, nullable: true })
    motherid: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    mothername: string;


    @Column({ type: "varchar", length: 15, nullable: true })
    mothersfatherid: string;


    @Column({ type: "varchar", length: 200, nullable: true })
    mothersfathername: string;


    @Column({ type: "varchar", length: 15, nullable: true })
    mothersmotherid: string;

    @Column({ type: "varchar", length: 200, nullable: true })
    mothersmothername: string;

    public updateFromJson(data: any) {
        this.feifId = data.horseid;
        this.firstName = data.name;
        this.prefix = data.prefix;
        this.origin = data.origin;
        this.sexInWorldfengur = data.sex;
        this.yearOfBirth = data.birthyear;
        this.fatherid = data.fatherid;
        this.fathername = data.fathername;
        this.fathersfatherid = data.fathersfatherid;
        this.fathersfathername = data.fathersfathername;
        this.fathersmotherid = data.fathersmotherid;
        this.fathersmothername = data.fathersmothername;
        this.motherid = data.motherid;
        this.mothername = data.mothername;
        this.mothersfatherid = data.mothersfatherid;
        this.mothersfathername = data.mothersfathername;
        this.mothersmotherid = data.mothersmotherid;
        this.mothersmothername = data.mothersmothername;
    }
}

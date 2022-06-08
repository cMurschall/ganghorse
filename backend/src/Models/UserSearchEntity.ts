import { Entity, Column } from "typeorm";
import { EntityBase } from "./EntityBase";
import { SeachOptions } from "../Controllers/HorseController";



@Entity("userSearches")
export class UserSearch extends EntityBase {

    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    userId: string;

    @Column({ type: "varchar", length: 300, nullable: true, default: "" })
    label: string;

    @Column({ type: "json", nullable: true, default: new SeachOptions() })
    value: SeachOptions;
}
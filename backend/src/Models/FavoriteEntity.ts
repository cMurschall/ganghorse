import { Entity, Column } from "typeorm";
import { EntityBase } from "./EntityBase";




@Entity("favorites")
export class Favorite extends EntityBase {

    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    userId: string;

    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    horseId: string;
}
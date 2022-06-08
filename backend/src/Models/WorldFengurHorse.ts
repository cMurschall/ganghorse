
import { Column, Entity } from "typeorm";
import { EntityBase } from "./EntityBase";

@Entity("anitarHorses")
export class WorldFengurHorse extends EntityBase {

    @Column({ type: "varchar", length: 15, nullable: false, unique: true })
    feifId: string;


    @Column({ type: "varchar", length: 5000, nullable: true })
    data: string;
   
}

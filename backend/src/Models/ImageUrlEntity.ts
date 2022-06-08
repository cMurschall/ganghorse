import { Entity, Column, ManyToOne } from "typeorm";
import { Horse } from "./HorseEntity";
import { EntityBase } from "./EntityBase";
import { Exclude } from "class-transformer";

@Entity("imageurls")
export class ImageUrl extends EntityBase {

    @Column({ type: "varchar", length: 400 })
    url: string;
    @Column({ type: "varchar", length: 450, nullable: true })
    thumbUrl?: string;

    @Exclude()
    @Column({ type: "varchar", length: 400 })
    internalPath: string;

    @Column({ type: "varchar", length: 400, default: 'some Filename' })
    originalFileName: string;

    @Column({ type: "int", default: 0 })
    showIndex: number

    @ManyToOne(() => Horse, { onDelete: 'CASCADE', cascade: true })
    horse: Horse

    @Exclude()
    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    ownerId: string;
}



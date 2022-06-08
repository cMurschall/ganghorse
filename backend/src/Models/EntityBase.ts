import { CreateDateColumn, UpdateDateColumn, PrimaryColumn, BeforeInsert, VersionColumn } from "typeorm";
import { v4 as uuid } from 'uuid'

export abstract class EntityBase {


    // @PrimaryGeneratedColumn('uuid')
    // id: string;


    @PrimaryColumn()
    id: string;

    // @PrimaryColumn({ nullable: false, unique: true, default: () => uuid() })
    // id: string;


    @BeforeInsert()
    // @ts-ignore
    private beforeInsert() {
        // console.log('generate PrimaryColumn uuid')
        this.id = uuid();
    }

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @VersionColumn({ default: 1, nullable: true })
    version: number;

}
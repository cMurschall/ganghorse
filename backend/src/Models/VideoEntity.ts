import { Entity, Column, ManyToOne } from "typeorm";
import { EntityBase } from "./EntityBase";
import { Exclude } from "class-transformer";
import { Horse } from "./HorseEntity";


export enum VideoStatus {
    Unknown = 0,
    UrlCreated,
    Uploaded,
    Converted,
    Error
}



@Entity("videos")
export class VideoUrl extends EntityBase {


    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    awsFileName: string;

    @Column({ type: "varchar", length: 400, nullable: true, default: "" })
    videoUrlDash: string;

    @Column({ type: "varchar", length: 400, nullable: true, default: "" })
    videoUrlMp4: string;

    @Column({ type: "varchar", length: 400, nullable: true, default: "" })
    youtubeLink: string;

    @Column({ type: "varchar", length: 400, nullable: true, default: "" })
    posterUrl: string;

    @Column({ type: "varchar", length: 400, default: 'some Filename' })
    originalFileName: string;

    @Column({ type: "int", nullable: true, default: 0 })
    durationInMs?: number

    @Column({ type: "int", nullable: true, default: 0 })
    showIndex: number

    @ManyToOne(() => Horse, { onDelete: 'CASCADE', cascade: true })
    horse: Horse

    @Exclude()
    @Column({ type: "varchar", length: 50, nullable: true, default: "" })
    ownerId: string

    @Column({ type: "int", nullable: true, default: VideoStatus.Unknown })
    status?: VideoStatus

    @Column({ type: "varchar", length: 600, nullable: true, default: "" })
    awsErrorMessage: string;
}
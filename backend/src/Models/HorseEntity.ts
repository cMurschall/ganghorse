import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./UserEntity";
import { Location } from "./LocationEntity"
import { WorldFengurInfo } from "./WorldFengurInfo";
import { ImageUrl } from "./ImageUrlEntity";
import { Expose } from "class-transformer";
import { Money } from "./../Helpers/CurencyConverter";
import { VideoUrl } from "./VideoEntity";


export enum Gender {
    Mare = 0,
    Gelding,
    Stallion
}

export enum Currency {
    EUR = 0,
    DKK,
    SEK,
    CHF
}

export enum Color {
    Brauner,
    Dunkelbrauner,
    Braunschecke,
    Braunfalbe,
    Erdfarben,
    Perlino,


    Rappe,
    Rappschecke,
    Graufalbe,
    Leuchtrappe,
    SmokeyCream,


    Fuchs,
    Dunkelfuchs,
    Rotfuchs,
    Fuchsschecke,
    Rotfalbe,
    Isabell,
    Cremello,


    Schimmel,
    Grauschimmel,
    Schimmelschecke,

    Rappwindfarben,
    Braunwindfarben,
    Windfarbschecke,

    Helmschecke,

    Farbwechsler,
    Farbwechslerschecke,

    ScheckeAndere,
}


export interface PriceRange {
    priceMin: Money,
    priceMax: Money
}


export enum Status {
    Published,
    Draft,
    Deleted
}


@Entity("horses")
export class Horse extends WorldFengurInfo {

    @Expose()
    @Column({ type: "int", nullable: true })
    status?: Status

    @Expose()
    get name(): string {
        return `${this.firstName} ${this.prefix} ${this.origin}`
    }

    @Expose()
    @Column({ type: "int", nullable: true })
    gender?: Gender

    @Expose()
    @Column({ type: "float", nullable: true })
    height?: number

    @Expose()
    @Column({ type: "int", nullable: true })
    color?: Color;

    @Expose()
    @Column({ type: "varchar", length: 400, nullable: true, default: "" })
    tagline?: string;

    @Expose()
    @Column({ type: "varchar", length: 4000, nullable: true, default: "" })
    description?: string;

    @Expose()
    @ManyToOne(() => User, { eager: true })
    owner?: User;

    @Expose()
    @ManyToOne(() => Location, { eager: true })
    location?: Location;

    /**
     * @deprecated use priceMin and PriceMax instead
     */
    @Expose()
    @Column({ type: "int", nullable: true })
    price?: number;

    @Expose()
    @Column({ type: "int", nullable: true })
    priceMin?: number;

    @Expose()
    @Column({ type: "int", nullable: true })
    priceMax?: number;

    @Expose()
    @Column({ type: "int", nullable: true, default: Currency.EUR })
    currency?: Currency

    @Expose()
    @Column({ nullable: true, default: null })
    hasEczema?: boolean

    @Expose()
    @OneToMany(() => ImageUrl, (i: ImageUrl) => i.horse, { eager: true })
    imageUrls: ImageUrl[];


    @Expose()
    @OneToMany(() => VideoUrl, (i: VideoUrl) => i.horse, { eager: true })
    videoUrls: VideoUrl[];

    static isFeifId(feifId: string) {
        return /^[a-zA-Z]{2}[0-9]{10}$/gm.test(feifId);
    }

    @Expose()
    otherPrices: PriceRange[] = [];

    @Expose()
    messageCount: number = 0
}


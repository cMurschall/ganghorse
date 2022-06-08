import { Entity, Column, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { Horse } from "./HorseEntity";
import { EntityBase } from "./EntityBase";
import { IsEmail } from "class-validator";
import { Exclude, Expose } from "class-transformer";
import { ConversationSocket } from "@src/Sockets/ConversationSocket";
import { Conversation } from "./ConversationEntity";


@Entity("users")
export class User extends EntityBase {

    @Expose({ groups: ["user", "everyone"] })
    @Column("character varying", { length: 100, nullable: true })
    name?: string;

    @Expose({ groups: ["user"] })
    @Column("character varying", { length: 200, nullable: false, unique: true })
    @IsEmail()
    email: string;

    @Exclude()
    @Column("character varying", { length: 100, nullable: true })
    authenticationProvider?: string;

    @Exclude()
    @Column("character varying", { length: 100, nullable: true })
    authenticationProviderId?: string;

    @Exclude()
    @Column("character varying", { length: 100, nullable: true })
    passwordHash?: string;

    @Expose({ groups: ["user", "everyone"] })
    @Column("character varying", { length: 300, nullable: true })
    avatarUrl: string;

    @Expose({ groups: ["user", "everyone"] })
    @OneToMany(() => Horse, (horse: Horse) => horse.owner, { onDelete: 'CASCADE' })
    horses: Horse[];


    @Expose({ groups: ["user", "everyone"] })
    @Column("character varying", { length: 4000, nullable: true, default: '' })
    publicDescription?: string;


    @Exclude()
    @Column({ nullable: true, default: false })
    isConfirmed: boolean


    @Expose({ groups: ["user"] })
    @Column({ nullable: true, default: true })
    canNotify: boolean


    // @Expose({ groups: ["user"] })
    // @ManyToMany(() => Conversation, conversation => conversation.members)
    // conversations: Conversation []



}
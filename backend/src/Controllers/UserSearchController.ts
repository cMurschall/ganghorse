import { User } from "./../Models/UserEntity";
import { UserSearch } from "../Models/UserSearchEntity";
import { SeachOptions } from "./HorseController";

import { Service } from "typedi";
import { JsonController, Get, CurrentUser, Body, Post, Delete, BodyParam } from "routing-controllers";

import { InjectRepository } from "typeorm-typedi-extensions";
import { Repository } from "typeorm";



interface LabeledUserSeach {
    label: string;
    value: SeachOptions
}


@Service()
@JsonController('/userSearch')
export class UserSearchController {


    constructor(
        @InjectRepository(UserSearch)
        private repository: Repository<UserSearch>,

    ) { }


    @Get("/all")
    async all(@CurrentUser() user: User): Promise<LabeledUserSeach[]> {
        const seaches = await this.repository.find({
            userId: user.id
        })

        return seaches.map(x => {
            return <LabeledUserSeach>{
                label: x.label,
                value: x.value
            }
        })
    }

    @Post("/add")
    async add(@Body() userSearch: LabeledUserSeach, @CurrentUser() user: User): Promise<boolean> {
        console.log("add user seach", userSearch)

        const search = new UserSearch();
        search.label = userSearch.label;
        search.value = userSearch.value;
        search.userId = user.id;

        var saved = await this.repository.save(search);

        return saved !== undefined;
    }

    @Post("/remove")
    async remove(@BodyParam("label") label: string, @CurrentUser() user: User): Promise<boolean> {

        console.log("remove seach with label", label)
        const searches = await this.repository.find({
            where: {
                userId: user.id,
                label
            }

        })
        for await (const element of searches) {
            await this.repository.delete({
                userId: user.id,
                label: element.label
            })
        }

        return searches.length > 0
    }
}
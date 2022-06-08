import { JsonController, Get, Session, Body, Post, Res, CurrentUser, BadRequestError, ResponseClassTransformOptions, BodyParam, Delete, Req, Authorized } from "routing-controllers";
import { Service, Inject } from "typedi";
import { Logger } from "pino";
import { InjectRepository } from "typeorm-typedi-extensions";
import bcrypt from "bcryptjs";
import { Response, Request } from "express";
import { Repository } from "typeorm";
import { v4 as uuid } from 'uuid'

import { User } from "./../Models/UserEntity";
import { Horse, Status } from "./../Models/HorseEntity";
import { redis } from "./../Helpers/Redis";
import { IMailer } from "./../Helpers/Mailer/IMailer";
import { registrationMessages, forgotPasswordMessages, alreadyExistingUserRegistration } from "./../Helpers/Messages"
import { appUrl } from "./../Helpers/Misc";
import { ISession } from "./../Helpers/Authentication";





interface RegisterUser {
    username: string,
    email: string;
    password: string,
    locale?: string
}


interface LoginUser {
    email: string,
    password: string
}


interface ValidateUser {
    token: string,
}

interface UserEmail {
    email: string,
    locale?: string
}

interface UserUpdate {
    name?: string,
    publicDescription?: string,
    canNotify?: boolean,
}

interface UpdateForgottenPassword {
    token: string,
    newpassword: string
}

interface UpdatePassword {
    oldpassword: string,
    newpassword: string
}

interface UpdateResult {
    success: boolean,
    updatedUser: User | undefined
}

@Service()
@JsonController('/user')
export class UserController {

    constructor(
        @Inject("logger") private logger: Logger,

        @InjectRepository(User)
        private repository: Repository<User>,

        @Inject("mailer") private mailer: IMailer
    ) { }


    // @Authorized()
    // @Get("/isAuth")
    // isAuth() {
    //     return "you are authenifcated"
    // }

    // @Get("/isCurrentUser")
    // isCurrentUser(@CurrentUser({required : true}) user: User, ) {
    //     if (user) {
    //         return "you are current User"
    //     } else {
    //         return "you are NOT current User"
    //     }
    // }
    @ResponseClassTransformOptions({
        groups: ['user']
    })
    @Get("/whoAmI")
    async whoAmI(@Session() session: ISession) {

        if (!session.userId) return '';
        const user = await this.repository.findOne({ id: session.userId });
        return user
    }


    @Authorized()
    @ResponseClassTransformOptions({
        groups: ['everyone']
    })
    @Post("/userInfo")
    async userInfo(@BodyParam("userId") userId: string) {

        this.logger.trace('userInfo');
        const user = await this.repository.findOne({ id: userId })
        return user;
    }


    // @Authorized()
    // @ResponseClassTransformOptions({
    //     groups: ['everyone']
    // })
    // @Post("/findUsersByName")
    // async findUsersByName(@BodyParam("userName") userName: string) {

    //     this.logger.trace('findUsersByName');
    //     const users = await this.repository
    //         .createQueryBuilder()
    //         .select("user")
    //         .from(User, "user")
    //         .where("user.name ILIKE %:userName%", { userName }) // might be slow on larger data sets
    //         .getMany()
    //     return users;
    // }




    @Post("/register")
    async register(@Body() newUser: RegisterUser, @Req() request: Request): Promise<User> {
        this.logger.info('register');
        let { username, email, password } = newUser;


        if (password.length < 6) {

            console.log('am about to thorw')
            throw new BadRequestError("password too short"); // message is optional
        }

        var alreadyExistUser = await this.repository.findOne({ email })
        if (alreadyExistUser) {
            if (alreadyExistUser.isConfirmed) {
                this.logger.info(`Error: confirmed user with email ${alreadyExistUser.email} already exists`)

                var locale = request?.acceptsLanguages("de") || 'en'
                await this.mailer.sendMail({ email, name: "Gang Horse" }, {
                    subject: alreadyExistingUserRegistration[locale].subject,
                    text: alreadyExistingUserRegistration[locale].text(email),
                    html: alreadyExistingUserRegistration[locale].html(email),
                })

                throw new BadRequestError("email exists"); // message is optional
            } else {
                this.logger.info(`Non confirmed user with email ${alreadyExistUser.email} already exists, try to delete user in db`)
                await this.repository.delete({
                    email
                })
            }
        }


        const hashedPassword = await bcrypt.hash(password, 12);

        var user = new User();
        user.authenticationProvider = "local";
        user.email = email.toLowerCase();
        user.name = username || '';
        user.passwordHash = hashedPassword;
        try {
            var dbUser = await this.repository.save(user);

            this.logger.info(`Successfullty created user : ${username} ${email} ${password}`)

            let userToken = uuid();

            await redis.set(userToken, dbUser.id, 'ex', 60 * 60 * 24 * 2) // 2 day expiration time

            const validationUrl = `${appUrl}/userValidate/${userToken}`

            var locale = request?.acceptsLanguages("de") || 'en'
            await this.mailer.sendMail({ email, name: "Gang Horse" }, {
                subject: registrationMessages[locale].subject,
                text: registrationMessages[locale].text(validationUrl),
                html: registrationMessages[locale].html(validationUrl),
            })


            this.logger.info(`Validate token at ${validationUrl}`)
            return dbUser
        } catch (error) {
            throw new BadRequestError(error); // message is optional
        }
    }

    @Post("/confirmUser")
    async confirmUser(@Body() data: ValidateUser, @Session() session: ISession) {

        let { token } = data;
        var userId = await redis.get(token)
        if (!userId)
            return false;

        var updateResult = await this.repository
            .createQueryBuilder()
            .update(User)
            .set({ isConfirmed: true })
            .where("id = :id", { id: userId })
            .execute();

        console.log('updateResult', updateResult)
        if (updateResult.affected && updateResult.affected > 0) {
            await redis.del(token)

            // log user in
            session.userId = userId;
            return true;
        }
        return false;
    }




    @ResponseClassTransformOptions({
        groups: ['user']
    })
    @Post("/updateUser")
    async updateUser(@Body() data: UserUpdate, @CurrentUser() user: User) {
        this.logger.trace('updateUser');
        let { name, publicDescription, canNotify } = data;

        var result: UpdateResult = {
            success: false,
            updatedUser: undefined
        };
        var dbUser = await this.repository
            .createQueryBuilder()
            .update(User)
            .set({ name, publicDescription, canNotify })
            .where("id = :id", { id: user.id })
            .execute();

        result.success = dbUser.affected && dbUser.affected > 0 || false

        result.updatedUser = await this.repository.findOne({ id: user.id });;

        return result
    }



    @ResponseClassTransformOptions({
        groups: ['user']
    })
    @Post("/login")
    async login(@Body() loginUser: LoginUser, @Session() session: ISession) {
        this.logger.info('login');
        let { email, password } = loginUser;

        const user = await this.repository.findOne({
            where: {
                email: email.toLowerCase()
            }
        })

        if (!user) {
            this.logger.info(`could not log in user : ${email}`)
            return '';
        }

        // if(!user.isConfirmed){
        //     this.logger.info(`could not log in user : ${email} due no confirmation `)
        //     return null;
        // }

        const valid = await bcrypt.compare(password, user.passwordHash || '');

        if (!valid) {
            this.logger.info(`could not login user  : ${user.id}, ${user.name} due to password mismatch.`)
            return '';
        }


        session.userId = user.id;
        session.user = user

        this.logger.info(`successfully login user : ${user?.id}, ${user?.name}`)

        return user
    }


    @Post("/logout")
    logout(@Session() session: any, @Res() response: Response) {
        this.logger.trace('logout');

        if (session.destroy) {
            let id = session.userId;
            return new Promise((resolve, reject) =>
                session!.destroy((err: any) => {
                    if (err) {
                        this.logger.error(err);
                        return reject(false);
                    }

                    response.clearCookie("sessionId");
                    this.logger.info(`successfully logges out user : ${id}`)
                    return resolve(true);
                })
            );

        } else {
            return null
        }
    }

    @Post("/forgotPassword")
    async forgotPassword(@Body() data: UserEmail) {
        this.logger.trace('forgotPassword');
        let { email } = data;

        const user = await this.repository.findOne({ where: { email } })

        if (!user)
            return true;

        const token = uuid();
        await redis.set(token, user.id, 'ex', 60 * 60 * 24) // 1 day


        const validationUrl = `${appUrl}/forgottenPassword/${token}`

        var locale = data.locale || 'en'
        await this.mailer.sendMail({ email, name: "Gang Horse" }, {
            subject: forgotPasswordMessages[locale].subject,
            text: forgotPasswordMessages[locale].text(validationUrl),
            html: forgotPasswordMessages[locale].html(validationUrl)
        })


        this.logger.info(`Validate token at ${validationUrl}`)

        return true;
    }

    @Post("/changeForgotPassword")
    async changeforgotPassword(@Body() data: UpdateForgottenPassword, @Session() session: ISession) {
        this.logger.trace('forgotPassword');
        let { token, newpassword } = data;


        if (newpassword.length < 6) {
            console.log('am about to thorw')
            return false;
        }

        const userId = await redis.get(token)

        if (!userId) {
            return false;
        }

        const passwordHash = await bcrypt.hash(newpassword, 12);

        let result = await this.repository.createQueryBuilder()
            .update(User)
            .set({
                passwordHash
            })
            .where({ id: userId })
            .execute();

        if (result.affected && result.affected > 0) {
            // log user in
            session.userId = userId;
            await redis.del(token)
            return true;
        }


        return false;
    }



    @Post("/changePassword")
    async changePassword(@Body() data: UpdatePassword, @CurrentUser({ required: true }) user: User) {
        this.logger.trace('changePassword');
        let { oldpassword, newpassword } = data;
        console.log({ oldpassword, newpassword })



        if (newpassword.length < 6) {
            console.log('new passowrd too short')
            return false;
        }
        const oldPasswordValid = await bcrypt.compare(oldpassword, user.passwordHash || '');

        if (!oldPasswordValid) {
            console.log('invalid old password')
            return false
        }
        const newPasswordHash = await bcrypt.hash(newpassword, 12);

        let result = await this.repository.createQueryBuilder()
            .update(User)
            .set({
                passwordHash: newPasswordHash
            })
            .where({ id: user.id })
            .execute();

        return result.affected && result.affected > 0;
    }



    @Delete("/delete")
    async delete(@Session() session: any, @Res() response: Response) {
        this.logger.trace('delete');

        var user = await this.repository.findOne({ id: session.userId })

        if (user) {
            await this.repository.manager.createQueryBuilder()
                .update(Horse)
                .set({ status: Status.Deleted })
                .whereInIds(user.horses.map(x => x.id))
                .execute()

            await this.repository.remove(user)

            if (session.destroy) {
                return new Promise((resolve, reject) =>
                    session!.destroy((err: any) => {
                        if (err) {
                            this.logger.error(err);
                            return reject(false);
                        }

                        response.clearCookie("sessionId");
                        return resolve(true);
                    })
                );

            }
        }

    }
}
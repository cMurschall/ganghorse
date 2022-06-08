import Express from 'express';
import { Strategy as GithubStrategy, Profile as GProfile } from "passport-github";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Service, Inject } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import passport from 'passport';
import pino from "pino";
import { User } from '../Models/UserEntity';


interface GitHubUserProfile extends GProfile {
    _json: {
        [key: string]: string;
    };
}
const providers = {
    github: {
        clientID: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_SECRET as string,
        callbackURL: "https://localhost:4000/auth/githubcb"
    },
    facebook: {
        clientID: process.env.FACEBOOK_CLIENT_ID as string,
        clientSecret: process.env.FACEBOOK_SECRET as string,
        callbackURL: "https://localhost:4000/auth/facebookcb"
    },
    google: {
        clientID: process.env.FACEBOOK_CLIENT_ID as string,
        clientSecret: process.env.FACEBOOK_SECRET as string,
        callbackURL: "https://localhost:4000/auth/googlecb"
    }
};



export interface ISession {
    userId?: string
    user?: User
}


@Service()
export class AuthentificationCreator {

    constructor(
        @InjectRepository(User) private repository: Repository<User>,
        @Inject("logger") private logger: pino.Logger
    ) { }


    private get localStrategy(): LocalStrategy {
        return new LocalStrategy({
            passReqToCallback: true,
            session: true
        }, (req, username, password, done) => {

            var body = req.body
            console.log({ body, username, password })

            return done(null, true)
        })
    }



    private get githubStrategy(): GithubStrategy.Strategy {
        return new GithubStrategy.Strategy({
            clientID: providers.github.clientID,
            clientSecret: providers.github.clientSecret,
            callbackURL: providers.github.callbackURL,
            passReqToCallback: false,
            scope: ['user:email']
        }, async (accessToken, refreshToken, _profile, done) => {

            const profile = _profile as GitHubUserProfile
            let user = await this.repository.findOne({
                where:
                {
                    authenticationProvider: profile.provider,
                    authenticationProviderId: profile.id
                }
            });

            if (!user) {
                this.logger.info('create new github user:', _profile)
                user = new User();
                user.authenticationProvider = profile.provider;
                user.authenticationProviderId = profile.id;
                user.name = profile.displayName || profile.username || 'unknown user';
                user.avatarUrl = profile._json.avatar_url;
                user.email = profile.emails?.find((x: any) => x.primary)?.value || "unknown email adress"

                await this.repository.save(user);
            } else {
                this.logger.info(`Found user ${user.name} in database`);
            }

            done(null, {
                user,
                accessToken,
                refreshToken,
            })
        });
    }

    private get facebookStrategy(): FacebookStrategy {
        return new FacebookStrategy({
            clientID: providers.facebook.clientID,
            clientSecret: providers.facebook.clientSecret,
            callbackURL: providers.facebook.callbackURL,
            enableProof: true,
            profileFields: ['displayName', 'picture.type(large)', 'emails'] // 'picture.type(large)' // will return a jif image.
        }, async (accessToken, refreshToken, profile, done) => {
            let user = await this.repository.findOne({
                where:
                {
                    authenticationProvider: profile.provider,
                    authenticationProviderId: profile.id
                }
            });

            if (!user) {
                this.logger.info('create new facebook user:', profile)
                user = new User();
                user.authenticationProvider = profile.provider;
                user.authenticationProviderId = profile.id;
                user.name = profile.displayName || profile.username || 'unknown user';
                // user.avatarUrl = profile._json.picture.data.url;
                user.avatarUrl = `https://graph.facebook.com/${profile.id}/picture?type=large`
                user.email = profile._json.email || "unknown email adress"

                await this.repository.save(user);
            } else {
                this.logger.info(`Found user ${user.name} in database`);
            }

            done(null, {
                user,
                accessToken,
                refreshToken,
            })
        });
    }


    // private get googleStrategy(): GoogleStrategy {

    //     return new GoogleStrategy({

    //         clientID: config.providers.google.clientID,
    //         clientSecret: config.providers.google.clientSecret,
    //         callbackURL: config.providers.google.callbackURL,

    //     }, (accessToken, refreshToken, profile, done) => {

    //         console.log({ accessToken, refreshToken, profile })

    //         done(null, {
    //             profile,
    //             accessToken,
    //             refreshToken,
    //         })
    //     });

    // }

    public createLoginRoutes = (app: Express.Express): void => {
        const redirectRoute = "http://localhost:8080/#/"

        const redirectRouteFailure = "http://localhost:8080/#/loginFailed"

        // persistent login sessions (recommended).
        passport.serializeUser((user, done) => done(null, user));
        passport.deserializeUser((user, done) => done(null, user));


        app.use(passport.initialize());

        const router = Express.Router();

        passport.use(this.githubStrategy);
        router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));
        router.get('/githubcb', passport.authenticate('github', { failureRedirect: redirectRouteFailure }), (req: any, res: any) => {
            if (req.user.user.id && req.session) {
                req.session.userId = req.user.user.id;
                req.session.accessToken = req.user.accessToken;
                req.session.refreshToken = req.user.refreshToken;
            }
            res.redirect(redirectRoute)
        });

        passport.use(this.facebookStrategy);
        router.get('/facebook', passport.authenticate('facebook', { session: false, scope: ['email'] }));
        router.get('/facebookcb', passport.authenticate('facebook', { failureRedirect: redirectRouteFailure }), (req: any, res: any) => {
            if (req.user.user.id && req.session) {
                req.session.userId = req.user.user.id;
                req.session.accessToken = req.user.accessToken;
                req.session.refreshToken = req.user.refreshToken;
            }
            res.redirect(redirectRoute)
        });


        passport.use(this.localStrategy)
        router.get('/local', passport.authenticate('local', { failureRedirect: redirectRouteFailure }, (req: any, res: any) => {
            if (req.user.user.id && req.session) {
                req.session.userId = req.user.user.id;
                req.session.accessToken = req.user.accessToken;
                req.session.refreshToken = req.user.refreshToken;
            }
            res.redirect(redirectRoute)
        }))

        router.get('/logout', (req, res) => {
            req.logout();
            res.redirect(redirectRoute);
        });

        app.use('/auth', router);

    };

}


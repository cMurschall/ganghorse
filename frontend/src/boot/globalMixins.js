const { gitVersion } = require('./../gitVersion')

const colorMap = [
    { index: 0, value: (i18n) => i18n.t('general.furColor.bay') },                  //  Brauner,
    { index: 1, value: (i18n) => i18n.t('general.furColor.mediumDarkBay') },        //  Dunkelbrauner,
    { index: 2, value: (i18n) => i18n.t('general.furColor.bayPinto') },             //  Braunschecke,
    { index: 3, value: (i18n) => i18n.t('general.furColor.baydun') },               //  Braunfalbe,
    { index: 4, value: (i18n) => i18n.t('general.furColor.buckskin') },             //  Erdfarben,
    { index: 5, value: (i18n) => i18n.t('general.furColor.perlino') },              //  Perlino,


    { index: 6, value: (i18n) => i18n.t('general.furColor.black') },                //  Rappe,
    { index: 7, value: (i18n) => i18n.t('general.furColor.piebald') },              //  Rappschecke,
    { index: 8, value: (i18n) => i18n.t('general.furColor.greyDun') },              //  Graufalbe,
    { index: 9, value: (i18n) => i18n.t('general.furColor.smokeyBlack') },          //  Leuchtrappe,
    { index: 10, value: (i18n) => i18n.t('general.furColor.smokeyCream') },         //  SmokeyCream,


    { index: 11, value: (i18n) => i18n.t('general.furColor.chestnut ') },           //  Fuchs,
    { index: 12, value: (i18n) => i18n.t('general.furColor.chestnutDark') },        //  Dunkelfuchs,
    { index: 13, value: (i18n) => i18n.t('general.furColor.lightChestnut') },       //  Hellfuchs
    { index: 14, value: (i18n) => i18n.t('general.furColor.chestnutPinto') },        //  Fuchsschecke
    { index: 15, value: (i18n) => i18n.t('general.furColor.darkRedDun') },          //  Rotfalbe
    { index: 16, value: (i18n) => i18n.t('general.furColor.palomino') },            //  Isabell
    { index: 17, value: (i18n) => i18n.t('general.furColor.cremello') },            //  Cremello


    { index: 18, value: (i18n) => i18n.t('general.furColor.gray') },                //  Schimmel
    { index: 19, value: (i18n) => i18n.t('general.furColor.grayFleabitten') },       //  Grauschimmel
    { index: 20, value: (i18n) => i18n.t('general.furColor.grayPinto') },           //  Schimmelschecke

    { index: 21, value: (i18n) => i18n.t('general.furColor.silverDappleBlack') },   //  Rappwindfarben
    { index: 22, value: (i18n) => i18n.t('general.furColor.silverDappleBay') },     //  Braunwindfarben
    { index: 23, value: (i18n) => i18n.t('general.furColor.silverDapplePinto') },    //  Windfarbschecke

    { index: 24, value: (i18n) => i18n.t('general.furColor.splashedWhite') },       //  Helmschecke

    { index: 25, value: (i18n) => i18n.t('general.furColor.roan') },                //  Farbwechsler
    { index: 26, value: (i18n) => i18n.t('general.furColor.roanPinto') },            //  Farbwechslerschecke

    { index: 27, value: (i18n) => i18n.t('general.furColor.pintoOthers') },         //  Schecke-andere
]

const genderMap = [
    { index: 0, value: (i18n) => i18n.tc('general.mare', 0) },
    { index: 1, value: (i18n) => i18n.tc('general.gelding', 0) },
    { index: 2, value: (i18n) => i18n.tc('general.stallion', 0) },
]


const currencyMap = [
    { index: 0, value: () => "EUR" },
    { index: 1, value: () => "DKK" },
    { index: 2, value: () => "SEK" },
    { index: 3, value: () => "CHF" },
]


const statusMap = [
    { index: 0, value: (i18n) => i18n.t('general.statusPublic') },
    { index: 1, value: (i18n) => i18n.t('general.statusDraft') }
]

let uuid = 0;

export default function ({ app, Vue }) {


    const getValueFromMap = function (map, indexCode) {
        if (indexCode == null || indexCode == undefined) return ''

        let element = map.find(x => x.index == parseInt(indexCode))
        if (element) {

            return element.value(app.i18n)
        }
        return indexCode;
    }

    const getMap = function (map) {
        return map.map(x => {
            return {
                index: x.index,
                value: x.value(app.i18n)
            }
        });
    }


    Vue.mixin({
        methods: {
            getFurColor: x => getValueFromMap(colorMap, x),
            getColorMap: () => getMap(colorMap),

            getGender: x => getValueFromMap(genderMap, x),
            getGenderMap: () => getMap(genderMap),

            getCurrency: x => getValueFromMap(currencyMap, x),
            getCurrencyMap: () => getMap(currencyMap),

            getStatus: x => getValueFromMap(statusMap, x),
            getStatusMap: () => getMap(statusMap),

            countryCodes: () => ["DE", "CH", "AT", "DK", "SE"],

            gitVersion: () => `${gitVersion.gitTag} - ${gitVersion.gitHash}`,
            editorToolbar: () => [
                ['bold', 'italic', 'strike', 'underline'],
                [{
                    label: 'Fontsize',
                    icon: 'height',
                    fixedLabel: true,
                    fixedIcon: true,
                    list: 'no-icons',
                    options: [
                        'size-3',
                        'size-4',
                        'size-5'
                    ]
                }],
                ['unordered', 'ordered'],
                ['undo', 'redo'],
                ['viewsource'],
                ['showCharCount'],
            ],

            isEmailValid(email) {
                // see https://www.w3resource.com/javascript/form/email-validation.php for this regex
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
            },
            carouselRatio: () => 4 / 3,
            pageTitle: () => "Gang Horse - " + app.i18n.t('general.pageClaim'),
            pageDescription: () => app.i18n.t('general.pageDescription'),
            // pageKeywords: () => ["Islandpferde", "Anzeigen"],
            pageImage: () => "https://gang.horse/logoSquare.png",
            pageLocale: () => app.i18n.locale,
            pageUrl: () => `https://gang.horse/${app.router.currentRoute.path}`,
            objectsEqual: (a, b) => object_equals(a, b),
            formatLocation: (location, short = false) => {
                if (short) {
                    switch (location.countrycode) {
                        case "DE":
                            return `${location.admin3name}, ${location.admin1code}`
                        case "AT":
                            return `${location.placename}, ${location.admin1name}`
                        case "CH":
                            return `${location.admin2name}, ${location.admin1name}`
                        case "DK":
                            return `${location.admin2name}, ${location.admin1name}`
                        case "SE":
                            if (location.admin2name) {
                                return `${location.admin2name}, ${location.admin1name}`
                            } else if (location.admin2name == location.admin1name) {
                                return `${location.admin1name}`
                            }
                            return `${location.admin1name}`
                        default:
                            break;
                    }
                }
                else {
                    return `${location.postalcode} ${location.placename} - ${location.admin1name} (${location.countrycode})`
                }

                return ""
            },
            toAwsUrl(url) {
                console.log("toAwsUrl", url);
                if (url && url.length) {

                    const regex = /s3:\/\/(?<bucket>.*?)\/(?<object>.*)/gm;
                    const { bucket, object } = regex.exec(url).groups;

                    return `https://${bucket}.s3.eu-central-1.amazonaws.com/${object}`;
                }
                return ''
            },
            // Shorten a string to less than maxLen characters without truncating words.
            shortenSentence(string, maxLength, separator = " ") {
                if (!string) return ""
                if (string.length <= maxLength) return string;
                return string.substr(0, string.lastIndexOf(separator, maxLength));
            },
            stripHtml(html) {
                if (process.env.MODE === "spa") {
                    var doc = new DOMParser().parseFromString(html, "text/html");
                    return doc.body.textContent || "";
                }
                else {
                    return html.replace(/<[^>]*>?/gm, '');
                }
            },
            // createMetaName(name){

            // }
            createMetaTitle(title) {
                return {
                    ogTitle: { property: "og:title", content: title },
                    twitterTitle: { name: "twitter:title", content: title },
                }
            },
            createMetaUrl() {
                return {
                    url: { name: "url", content: `https://gang.horse${app.router.currentRoute.path}` },
                    ogUrl: { property: "og:url", content: `https://gang.horse${app.router.currentRoute.path}` },
                }
            },
            createSpecificMetaUrl(path) {
                return {
                    url: { name: "url", content: `https://gang.horse/${path}` },
                    ogUrl: { property: "og:url", content: `https://gang.horse/${path}` },
                }
            },
            createMetaDescription(description) {
                return {
                    description: { name: "description", content: description },
                    descriptionItem: { itemProp: "description", content: description },
                    ogDescription: {
                        property: "og:description",
                        content: description,
                    },
                    twitterDescription: {
                        name: "twitter:description",
                        content: description,
                    },
                }
            },
            createMetaImage(imageUrl) {
                // if (Array.isArray(imageUrl)) {

                // }
                return {
                    image: { name: "image", content: imageUrl },
                    imageItem: { itemProp: "image", content: imageUrl },
                    ogImage: { property: "og:image", content: imageUrl },
                    twitterImage: { name: "twitter:image", content: imageUrl },
                }
            }
        },

        beforeCreate() {
            this.uuid = uuid.toString();
            uuid += 1;
        },
    })
}



function object_equals(x, y) {
    if (x === y) return true;
    // if both x and y are null or undefined and exactly the same

    if (!(x instanceof Object) || !(y instanceof Object)) return false;
    // if they are not strictly equal, they both need to be Objects

    if (x.constructor !== y.constructor) return false;
    // they must have the exact same prototype chain, the closest we can do is
    // test there constructor.

    for (var p in x) {
        if (!x.hasOwnProperty(p)) continue;
        // other properties were tested using x.constructor === y.constructor

        if (!y.hasOwnProperty(p)) return false;
        // allows to compare x[ p ] and y[ p ] when set to undefined

        if (x[p] === y[p]) continue;
        // if they have the same strict value or identity then they are equal

        if (typeof (x[p]) !== "object") return false;
        // Numbers, Strings, Functions, Booleans must be strictly equal

        if (!object_equals(x[p], y[p])) return false;
        // Objects and Arrays must be tested recursively
    }

    for (p in y)
        if (y.hasOwnProperty(p) && !x.hasOwnProperty(p))
            return false;
    // allows x[ p ] to be set to undefined

    return true;
}

export default ({ Vue, app }) => {
    Vue.filter('toCurrency', (value, currency = "EUR") => {
        if (!value) return ''

        let ammount = parseInt(value)
        if (ammount) {
            const formatter = new Intl.NumberFormat(app.i18n.locale, {
                currency,
                style: 'currency',
                minimumFractionDigits: 0
            });

            return formatter.format(ammount)
        }
        return value;
    });

    Vue.filter('toCurrencyNoSymbol', (value,) => {
        if (!value) return ''

        let ammount = parseInt(value)
        if (ammount) {
            const formatter = new Intl.NumberFormat(app.i18n.locale, {
                useGrouping: true,
                minimumFractionDigits: 0
            });

            return formatter.format(ammount)
        }
        return value;
    });
    // Vue.filter('toFoarColor', value => {

    //     if (value == null || value == undefined) return ''

    //     let colorElement = colorMap.find(x => x.index == parseInt(value))
    //     if (colorElement) {
    //         return colorElement.value
    //     }
    //     return value;
    // });
}

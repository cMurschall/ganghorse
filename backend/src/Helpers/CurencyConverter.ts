import nodeFetch from "node-fetch";
import fs from 'fs';

import { Currency } from "./../Models/HorseEntity";

interface ExchangeRate {
    currency: Currency,
    exchangeRate: number
}

interface ExchangeRates {
    base: Currency,
    date: Date,
    rates: ExchangeRate[]
}


export interface Money {
    currency: Currency,
    amount: number
}

export class CurrencyConverter {

    private rates: ExchangeRates[] = []


    public get lastUpdate(): Date {
        if (this.rates.length > 0)
            return new Date(Math.max.apply(null, this.rates.map(x => x.date)));

        return new Date(0)
    }


    async update() {
        // clear our existing rates
        this.rates = []


        var currencies: string[] = Object.keys(Currency).filter(key => isNaN(Number(key)))
        for (let currency in currencies) {
            try {
                var url = `https://api.apilayer.com/exchangerates_data/latest?base=${Currency[Number(currency)]}`;
                var headers = {
                    apikey: String(process.env.EXCHANGE_RATES_DATA_API_KEY)
                  }
        
                var exchangerateResult = await nodeFetch(url, {method: "GET", headers});
                var rate = await exchangerateResult.json()

                if(rate.success){
                    let parts = rate.date.split('-').map(Number);


                    let exchangeRate: ExchangeRates = {
                        base: this.mapCurrencyToEnum(currency),
                        date: new Date(`${parts[0]},${parts[1] + 1},${parts[2]}`),
                        rates: currencies.filter(x => x !== this.mapCurrencyToEnum(currency).toString()).map(x => {
                            return <ExchangeRate>{
                                currency: this.mapCurrencyToEnum(x),
                                exchangeRate: Number(rate.rates[x])
                            }
                        })
                    }
                    await this.storeToDisk(currency, exchangeRate);
    
                    this.rates.push(exchangeRate)
                }


            } catch (error) {
                console.error(error)
                const rate = await this.fetchFromDisk(currency);
                if (rate) {
                    console.log(`restored ${this.mapCurrencyToEnum(currency)} from disk`)
                    this.rates.push(rate)
                }
            }
        }
    }

    private storeToDisk(currency: string, rate: ExchangeRates): Promise<void> {
        return new Promise((resolve, reject) => {
            fs.writeFile(`rate_${currency}`, JSON.stringify(rate), {
                encoding: 'utf8'
            }, error => {
                if (error) reject(error)
                else resolve();
            });
        });
    }

    private fetchFromDisk(currency: string): Promise<ExchangeRates | undefined> {
        const fileName = `rate_${currency}`;
        return new Promise((resolve, reject) => {
            if (fs.existsSync(fileName)) {

                fs.readFile(fileName, {
                    encoding: 'utf8'
                }, (error, data) => {
                    if (error) reject(error);

                    const rate: ExchangeRates = JSON.parse(data)
                    resolve(rate)
                });
            }
            // file not found
            resolve(undefined)
        });
    }


    convert(base: Money, target: Currency): Money | undefined {

        if (base.currency == target) {
            // nothing to do
            return base
        }

        var baseRate = this.rates.find(x => this.mapCurrencyToEnum(x.base.toString()) == base.currency)
        var rate = baseRate?.rates.find(x => x.currency == target)


        return rate ? {
            amount: base.amount * rate.exchangeRate,
            currency: target
        } : undefined;
    }


    private mapCurrencyToEnum(value: string): Currency {
        return (<any>Currency)[value]
    }

}
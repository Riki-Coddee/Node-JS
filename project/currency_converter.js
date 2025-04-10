import axios from "axios";
import readline from "readline";

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function getUser() {
    try {
        const response = await axios.get('https://api.currencyapi.com/v3/latest?apikey=cur_live_bYKCmIPRjWAmQRPXfDEneJh0CiY3Gu4gjiuOcXXT');
        const data = response.data.data;  // Corrected path to access rates
        
        r1.question("Enter the amount in USD: ", (amount) => {
            r1.question("Enter the target currency (e.g. INR, EUR, NPR): ", (currency) => {
                const currencyCode = currency.toUpperCase();
                if (data[currencyCode]) {
                    const rate = data[currencyCode].value;
                    const convertedAmount = (parseFloat(amount) * rate).toFixed(2);
                    console.log(`${amount} USD is approximately ${convertedAmount} ${currencyCode}.`);
                } else {
                    console.log("Invalid Currency Code.");
                }
                r1.close();
            });
        });

    } catch (error) {
        console.error("Error fetching currency data:", error.message);
    }
}

getUser();

import axios from 'axios';
import chalk from 'chalk';
axios.get('https://sv443.net/jokeapi/v2/joke/Any')
.then((response) => {
    const joke = response.data; // Axios automatically parses JSON, data is in response.data
    
    if (joke.type === 'twopart') {
        console.log(`Here is a random ${joke.category} joke.`);
      console.log(chalk.red(joke.setup));
      console.log(chalk.green.bgRed.bold(joke.delivery));
    } else if (joke.type === 'single') {
      console.log(joke.joke);
    }
  })
  .catch((error) =>{
    // handle error
    console.log(error);
  });

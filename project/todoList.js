import readline from "readline";

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const todo = [];

const showMenu = () => {
    console.log("\n1: Add a task");
    console.log("2: View Taks");
    console.log("3:Exit");
    r1.question("Choose an option:", handleInput)
}
const handleInput = (option) => {
    if (option === '1') {
        r1.question("Enter the task:", (task) => {
            todo.push(task);
            console.log("Task Added:", task);
            showMenu();
        })
    } else if (option === '2') {
        console.log("\nYour TODO lists:");

        todo.forEach((task, index) => {
            console.log(`${index + 1}: ${task}`);
            showMenu();
        })
    }
    else if (option === '3') {
        console.log("Good Bye.");
        r1.close();
    }
    else {
        console.log("Invalid Option. Please try again later.");
        showMenu();
    }
}
showMenu();
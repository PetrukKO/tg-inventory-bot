import {pool} from "./pool.js";


async function createTableLocations(){
    await pool.query("CREATE TABLE IF NOT EXISTS locations(id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, whereabouts VARCHAR(255))")
}

async function createTableItems(){
    await pool.query("CREATE TABLE IF NOT EXISTS items (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);")
}

async function initDB(){
    await createTableLocations();
    await createTableItems();
}

initDB().then(()=>{
    console.log("база данных создана")
}).catch(err=>{
    console.error(err);
});
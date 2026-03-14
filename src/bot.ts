import { Telegraf, Markup } from 'telegraf';
import { pool } from './pool.js';
import 'dotenv/config';

import { addLocation } from './commands/locations/addLocation.js';
import { getLocations } from './commands/locations/getLocations.js';
import { findLocation } from './commands/locations/findLocation.js';
import { deleteLocation } from './commands/locations/deleteLocation.js';
import { safeDeleteLocation } from './commands/locations/safeDeleteLocation.js';

import { addItem } from './commands/items/addItem.js';
import { getItems } from './commands/items/getItems.js';
import { findItem } from './commands/items/findItem.js';
import { moveItem } from './commands/items/moveItem.js';
import { deleteItem } from './commands/items/deleteItem.js';

import { viewloc } from './actions/locations/viewloc.js';
import { delloc } from './actions/locations/delloc.js';
import { moveto } from './actions/locations/moveto.js';
import { safedeloc } from './actions/locations/safedeloc.js';
import { safedel_exec } from './actions/locations/safedel_exec.js';

import { saveto } from './actions/items/saveto.js';
import { pickitem } from './actions/items/pickitem.js';
import { delitem } from './actions/items/delitem.js';

 
const bot = new Telegraf(process.env.BOT_TOKEN!);
const USER_ID = Number(process.env.USER_ID!);
//const pendingItems = new Map<number, string>();
let pendingItems: string | null = null;

bot.use(async (ctx, next) => {
    if (ctx.from?.id !== USER_ID) {
        console.log(`${USER_ID} пытался подключиться`);
        return;
    }
    return next();
});

bot.start((ctx) => {
    console.log("💬 Получена команда /start");
    ctx.reply('о, привет!', { parse_mode: 'Markdown' });
});


bot.command('add_location', async (ctx) => {
    await addLocation(ctx, pool);
});

bot.command('add_item', async (ctx) => {
    const result = await addItem(ctx, pool);
    if (result) {
        pendingItems = result;
    }
});

bot.command('get_locations', async (ctx)=>{
    getLocations(ctx, pool);
})

bot.command('get_items', async (ctx)=>{
    getItems(ctx, pool);
})

bot.command('delete_location', async (ctx)=>{
    deleteLocation(ctx, pool);
})

bot.command('safe_delloc', (ctx) => {
    safeDeleteLocation(ctx, pool)
});

bot.command('find_item', async (ctx)=> {
    findItem(ctx, pool);
})

bot.command('delete_item', async (ctx)=>{
    deleteItem(ctx, pool);
})

bot.command('move_item', (ctx)=>{
    moveItem(ctx, pool);
})

bot.command('find_location', (ctx) => {
    findLocation(ctx, pool)
});

bot.action(/^saveto_(\d+)$/, async (ctx) => {
    const locationId = ctx.match[1];
    if(!locationId) return;
    await saveto(ctx, locationId, pendingItems, pool);
    pendingItems = null;

});

bot.action(/^viewloc_(\d+)$/, async (ctx) => {
    const locationId = ctx.match[1];
    if(!locationId) return;
    await viewloc(ctx, pool, locationId);
});

bot.action(/^delitem_(\d+)$/, async (ctx)=>{
    const itemId = ctx.match[1];
    if(!itemId) return;
    await delitem(ctx, pool, itemId);
})

bot.action(/^delloc_(\d+)$/, async (ctx)=>{
    const locationId = ctx.match[1];
    if(!locationId) return;
    await delloc(ctx, pool, locationId);
})

bot.action(/^pickitem_(\d+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    if(!itemId) return;
    await pickitem(ctx, pool, itemId);
});

bot.action(/^moveto_(\d+)_(\d+)$/, async (ctx) => {
    const itemId = ctx.match[1];
    const newLocId = ctx.match[2];
    if(!itemId || !newLocId) return;
    await moveto(ctx, pool, itemId, newLocId);
});

bot.action(/^safedel_src_(\d+)$/, async (ctx) => {
    const sourceId = ctx.match[1];
    if(!sourceId) return;
    await safedeloc(ctx, pool, sourceId);
});

bot.action(/^safedel_dest_(\d+)_(\d+)$/, async (ctx) => {
    const sourceId = ctx.match[1];
    const destId = ctx.match[2];
    if(!sourceId || !destId) return;
    await safedel_exec(ctx, pool, sourceId, destId);
});

bot.action(/^itempage_(\d+)$/, async (ctx) => {
    if(!ctx.match[1]) return;
    const page = parseInt(ctx.match[1], 10);
    await getItems(ctx, pool, page);
});

bot.telegram.setMyCommands([
    { command: 'add_item', description: 'добавить вещь' },
    { command: 'add_location', description: 'создать локацию' },
    { command: 'get_locations', description: 'посмотреть локации' },
    { command: 'get_items', description: 'посмотреть вещи' },
    { command: 'delete_location', description: 'удалить локацию (с вещами внутри)' },
    { command: 'delete_item', description: 'удалить предмет' },
    { command: 'find_item', description: 'найти предмет по названию'},
    { command: 'find_location', description: 'найти локацию по названию'},
    { command: 'move_item', description: 'переместить предмет в другую бд'},
    { command: 'safe_delloc', description: 'удалить локацию и переместить содержимое'},
]);

//должен быть в самом низу
bot.on('text', (ctx) => {
    const userMessage = ctx.message.text;
    console.log(`получено сообщение: ${userMessage}`);
    
    ctx.reply(`привет!!!`);
});

bot.launch().then(() => console.log('bot launched')).catch(err => console.error(err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
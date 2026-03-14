import {Context, Markup} from "telegraf";
import {Pool} from "pg";

const PAGE_SIZE = 20;

export async function getItems(ctx: Context, pool: Pool, page: number = 0) {
    try {
        const countRes = await pool.query('SELECT COUNT(*) FROM items');
        const totalItems = parseInt(countRes.rows[0].count, 10);

        if (totalItems === 0) {
            if (ctx.callbackQuery) return ctx.answerCbQuery('нема вещей', { show_alert: true });
            return ctx.reply('нема вещей');
        }

        const offset = page * PAGE_SIZE;

        const query = `
            SELECT 
                items.name AS item_name, 
                locations.name AS loc_name, 
                locations.whereabouts 
            FROM items 
            JOIN locations ON items.location_id = locations.id 
            ORDER BY items.id DESC
            LIMIT $1 OFFSET $2
        `;
        
        const res = await pool.query(query, [PAGE_SIZE, offset]);

        let replyText = `вещи (страница ${page + 1}):\n\n`;
        
        res.rows.forEach((row, index) => {
            const globalIndex = offset + index + 1; 
            const item = row.item_name;
            const loc = row.loc_name;
            const desc = row.whereabouts ? `(${row.whereabouts})` : '';
            
            replyText += `${globalIndex}. ${item}: ${loc}${desc}\n`;
        });

        const paginationButtons = [];
        
        if (page > 0) {
            paginationButtons.push(Markup.button.callback('<==', `itempage_${page - 1}`));
        }
        
        if (offset + PAGE_SIZE < totalItems) {
            paginationButtons.push(Markup.button.callback('==>', `itempage_${page + 1}`));
        }

        const keyboard = paginationButtons.length > 0 ? Markup.inlineKeyboard([paginationButtons]) : undefined;

        if (ctx.callbackQuery) {
            await ctx.editMessageText(replyText, keyboard);
        } else {
            await ctx.reply(replyText, keyboard);
        }

    } catch (error) {
        console.error('ошибка при получении списка предметов', error);
        if (ctx.callbackQuery) {
            ctx.answerCbQuery('ошибка бд');
        } else {
            ctx.reply('ошибка бд');
        }
    }
}
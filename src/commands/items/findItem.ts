import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function findItem(ctx: Context, pool: Pool) {
    if (!ctx.message || !('text' in ctx.message)) return;
    const searchQuery = ctx.message.text.replace('/find_item', '').trim();
    if (!searchQuery) {
        return ctx.reply('правильный формат: /find_item предмет', { parse_mode: 'HTML' });
    }
    try {
        const query = `
            SELECT 
                items.name AS item_name, 
                locations.name AS loc_name, 
                locations.whereabouts 
            FROM items 
            JOIN locations ON items.location_id = locations.id 
            WHERE items.name ILIKE $1
            ORDER BY items.id DESC
        `;
        const res = await pool.query(query, [`%${searchQuery}%`]);
        if (res.rows.length === 0) {
            return ctx.reply(`не найдено`);
        }
        let replyText = `поиск по ${searchQuery}: `;
        
        res.rows.forEach((row) => {
            const item = row.item_name;
            const location = row.loc_name;
            const whereabouts = row.whereabouts ? `${row.whereabouts}` : '';
            
            replyText += `\n${item}: ${location} (${whereabouts})`;
        });

        await ctx.reply(replyText, { parse_mode: 'HTML' });

    } catch (error) {
        console.error('ошибка при поиске вещи:', error);
        ctx.reply('ошибка бд при поиске');
    }
}
import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function deleteItem(ctx: Context, pool: Pool) {
    if (!ctx.message || !('text' in ctx.message)) return;
    const searchQuery = ctx.message.text.replace('/delete_item', '').trim();
    if (!searchQuery) {
        return ctx.reply('что именно удаляем?', { parse_mode: 'HTML' });
    }
    try {
        const query = `
            SELECT 
                items.id, 
                items.name AS item_name, 
                locations.name AS loc_name 
            FROM items 
            JOIN locations ON items.location_id = locations.id 
            WHERE items.name ILIKE $1
            ORDER BY items.id DESC
        `;
        const res = await pool.query(query, [`%${searchQuery}%`]);
        if (res.rows.length === 0) {
            return ctx.reply(`по запросу *${searchQuery}* удалять нечего`);
        }

        const buttons = res.rows.map(row => {
            const btnText = `${row.item_name} (${row.loc_name})`;
            return Markup.button.callback(btnText, `delitem_${row.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

        await ctx.reply(`выбери вещь для удаления`, { 
            ...keyboard,
        });

    } catch (error) {
        console.error('ошибка при поиске вещи на удаления', error);
        ctx.reply('ошибка бд при поиске вещи на удаления');
    }
}
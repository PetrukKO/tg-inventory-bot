import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function moveItem(ctx: Context, pool: Pool){
    if(!ctx.message || !('text' in ctx.message)) return;
    const searchQuery = ctx.message.text.replace('/move_item', "").trim();
    if(!searchQuery){
        return ctx.reply('правильный формат: /move_item предмет');
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
            return ctx.reply(`${searchQuery} не найдено`);
        }

        const buttons = res.rows.map(row => {
            const btnText = `📦 ${row.item_name} (сейчас в: ${row.loc_name})`;
            return Markup.button.callback(btnText, `pickitem_${row.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
        await ctx.reply('какой предмет перемещаем?', keyboard);

    } catch (error){
        console.error('ошибка при перемещении вещи', error);
        ctx.reply('ошибка бд при поиске');
    }
}
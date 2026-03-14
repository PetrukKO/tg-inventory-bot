import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function getLocations(ctx: Context, pool: Pool) {
    try {
        const res = await pool.query('SELECT id, name, whereabouts FROM locations ORDER BY id ASC');
        if (res.rows.length === 0) {
            return ctx.reply('локаций нет');
        }

        
        const buttons = res.rows.map(loc => {
            const btnText = loc.whereabouts ? `${loc.name} (${loc.whereabouts})` : loc.name;
            return Markup.button.callback(btnText, `viewloc_${loc.id}`);
            
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
        await ctx.reply('выбери локацию, чтобы посмотреть содержимое', keyboard);

    } catch (error) {
        console.error('ошибка при получении локаций:', error);
        ctx.reply('ошибка при запросе к базе данных');
    }
}
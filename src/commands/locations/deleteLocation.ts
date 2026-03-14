import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function deleteLocation(ctx: Context, pool: Pool){
    try {
        const res = await pool.query('SELECT id, name, whereabouts FROM locations ORDER BY id ASC');
        if (res.rows.length === 0) {
            return ctx.reply('локаций нема');
        }

        const buttons = res.rows.map(loc => {
            const btnText = loc.whereabouts ? `${loc.name} (${loc.whereabouts})` : `${loc.name}`;
            return Markup.button.callback(btnText, `delloc_${loc.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });
        await ctx.reply('выбери локацию для удаления.\n\n ВСЕ вещи внутри тоже будут удалены', {
            ...keyboard
        });

    } catch (error) {
        console.error('ошибка при выводе локаций для удаления:', error);
        ctx.reply('ошибка бд');
    }
}
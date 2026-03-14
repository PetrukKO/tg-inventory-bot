import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function safedeloc(ctx: Context, pool: Pool, sourceLocId: string) {
    try {
        const locRes = await pool.query('SELECT name FROM locations WHERE id = $1', [sourceLocId]);
        if (locRes.rows.length === 0) return ctx.answerCbQuery('уже удалено', { show_alert: true });
        const sourceLocName = locRes.rows[0].name;

        const itemsRes = await pool.query('SELECT COUNT(*) FROM items WHERE location_id = $1', [sourceLocId]);
        const itemsCount = parseInt(itemsRes.rows[0].count, 10);
        if (itemsCount === 0) {
            await pool.query('DELETE FROM locations WHERE id = $1', [sourceLocId]);
            await ctx.editMessageText(`локация ${sourceLocName} пустая и удалена`);
            return ctx.answerCbQuery('удалено');
        }
        const destRes = await pool.query('SELECT id, name FROM locations WHERE id != $1 ORDER BY id ASC', [sourceLocId]);
        
        if (destRes.rows.length === 0) {
            return ctx.answerCbQuery('нет других локаций для перемещения вещей', { show_alert: true });
        }

        const buttons = destRes.rows.map(loc => {
            return Markup.button.callback(`${loc.name}`, `safedel_dest_${sourceLocId}_${loc.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 1 });

        await ctx.editMessageText(
            `в локации ${sourceLocName} лежат вещи (${itemsCount} шт.) куда перенести?`, 
            { ...keyboard}
        );

    } catch (error) {
        console.error('ошибка при выборе места для переноса', error);
        if (ctx.callbackQuery) await ctx.answerCbQuery('ошибка бд', { show_alert: true });
    }
}
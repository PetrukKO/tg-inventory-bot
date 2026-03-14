import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function pickitem(ctx: Context, pool: Pool, itemId: string) {
    try {
        const itemRes = await pool.query('SELECT name FROM items WHERE id = $1', [itemId]);
        if (itemRes.rows.length === 0) {
            return ctx.answerCbQuery('предмет уже удален', { show_alert: true });
        }
        const itemName = itemRes.rows[0].name;
        const locRes = await pool.query('SELECT id, name FROM locations ORDER BY id ASC');
        if (locRes.rows.length === 0) {
            return ctx.answerCbQuery('локаций нет', { show_alert: true });
        }

        const buttons = locRes.rows.map(loc => {
            return Markup.button.callback(loc.name, `moveto_${itemId}_${loc.id}`);
        });

        const keyboard = Markup.inlineKeyboard(buttons, { columns: 2 });
        
        await ctx.editMessageText(`куда переносим ${itemName}?`, {
            ...keyboard,
        });

    } catch (error) {
        console.error('ошибка при выборе новой локации', error);
        if (ctx.callbackQuery) await ctx.answerCbQuery('ошибка', { show_alert: true });
    }
}
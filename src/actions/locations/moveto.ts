import {Context, Markup} from "telegraf";
import {Pool} from "pg";

export async function moveto(ctx: Context, pool: Pool, itemId: string, newLocId: string) {
    try {
        const updateRes = await pool.query(`
            UPDATE items SET location_id = $1 WHERE id = $2 RETURNING name
        `, [newLocId, itemId]);

        if (updateRes.rows.length === 0) {
            return ctx.answerCbQuery('нет предмета для перемещения', { show_alert: true });
        }
        const locRes = await pool.query('SELECT name FROM locations WHERE id = $1', [newLocId]);
        const locName = locRes.rows[0]?.name || 'неизвестная локация';

        await ctx.editMessageText(`${updateRes.rows[0].name} перенесен в ${locName}`, {
        });

    } catch (error) {
        console.error('ошибка при обновлении БД', error);
        if (ctx.callbackQuery) await ctx.answerCbQuery('ошибка при перемещении', { show_alert: true });
    }
}